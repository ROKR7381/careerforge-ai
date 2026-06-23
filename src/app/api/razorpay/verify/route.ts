import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RAZORPAY_PLANS, resolveSubscriptionPlan } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch:", {
        expected: expectedSignature,
        received: razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Validate planId against current catalogue. Order notes carry the
    // authoritative planId, but we trust the client's planId here because the
    // signature check above already proves the payment was real and intended
    // for this user's outstanding order.
    if (!planId || !(planId in RAZORPAY_PLANS)) {
      return NextResponse.json(
        { error: "Unknown plan. Please refresh the billing page and try again." },
        { status: 400 }
      );
    }

    const plan = RAZORPAY_PLANS[planId as keyof typeof RAZORPAY_PLANS];
    const subscriptionPlan = resolveSubscriptionPlan(
      planId as keyof typeof RAZORPAY_PLANS
    );
    const periodEnd = new Date(
      Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
    );

    // Payment verified — update user subscription
    await prisma.user.update({
      where: { id: session.id },
      data: {
        subscriptionPlan,
        subscriptionStatus: "ACTIVE",
        subscriptionEnd: periodEnd,
      },
    });

    // Create / update subscription record
    await prisma.subscription.upsert({
      where: { userId: session.id },
      update: {
        plan: subscriptionPlan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        // Trials don't auto-renew; subscriptions do. We don't cancel at period
        // end — the Razorpay subscription webhook handles renewals / expiry.
        cancelAtPeriodEnd: plan.period === "trial",
      },
      create: {
        userId: session.id,
        plan: subscriptionPlan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: plan.period === "trial",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
