import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    // Payment verified — update user subscription
    const subscriptionPlan =
      planId === "ANNUAL"
        ? "PREMIUM_ANNUAL"
        : "PREMIUM_MONTHLY";

    await prisma.user.update({
      where: { id: session.id },
      data: {
        subscriptionPlan: subscriptionPlan,
        subscriptionStatus: "ACTIVE",
      },
    });

    // Create subscription record
    await prisma.subscription.upsert({
      where: { userId: session.id },
      update: {
        plan: subscriptionPlan,
        status: "ACTIVE",
        currentPeriodEnd: new Date(
          Date.now() +
            (planId === "ANNUAL" ? 365 : 30) * 24 * 60 * 60 * 1000
        ),
      },
      create: {
        userId: session.id,
        plan: subscriptionPlan,
        status: "ACTIVE",
        currentPeriodEnd: new Date(
          Date.now() +
            (planId === "ANNUAL" ? 365 : 30) * 24 * 60 * 60 * 1000
        ),
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
