import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        const planId = payment.notes?.planId;

        if (userId) {
          const subscriptionPlan =
            planId === "ANNUAL" ? "PREMIUM_ANNUAL" : "PREMIUM_MONTHLY";

          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: subscriptionPlan,
              subscriptionStatus: "ACTIVE",
            },
          });

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: subscriptionPlan,
              status: "ACTIVE",
              currentPeriodEnd: new Date(
                Date.now() +
                  (planId === "ANNUAL" ? 365 : 30) * 24 * 60 * 60 * 1000
              ),
            },
            create: {
              userId,
              plan: subscriptionPlan,
              status: "ACTIVE",
              currentPeriodEnd: new Date(
                Date.now() +
                  (planId === "ANNUAL" ? 365 : 30) * 24 * 60 * 60 * 1000
              ),
            },
          });
        }
        break;
      }

      case "payment.failed": {
        console.error("Payment failed:", event.payload.payment.entity);
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: "FREE",
              subscriptionStatus: "CANCELED",
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
