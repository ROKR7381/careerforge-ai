import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RAZORPAY_PLANS, resolveSubscriptionPlan } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const userId = payment.notes?.userId;
        const planId = payment.notes?.planId as keyof typeof RAZORPAY_PLANS | undefined;

        if (userId && planId && planId in RAZORPAY_PLANS) {
          const plan = RAZORPAY_PLANS[planId];
          const subscriptionPlan = resolveSubscriptionPlan(planId);
          const periodEnd = new Date(
            Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
          );

          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan,
              subscriptionStatus: "ACTIVE",
              subscriptionEnd: periodEnd,
            },
          });

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: subscriptionPlan,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: plan.period === "trial",
            },
            create: {
              userId,
              plan: subscriptionPlan,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: plan.period === "trial",
            },
          });
        }
        break;
      }

      case "payment.failed": {
        console.error("Payment failed:", event.payload.payment.entity);
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: "FREE",
              subscriptionStatus: "EXPIRED",
              subscriptionEnd: new Date(),
            },
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
