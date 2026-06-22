import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRazorpay, RAZORPAY_PLANS } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId || !RAZORPAY_PLANS[planId as keyof typeof RAZORPAY_PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = RAZORPAY_PLANS[planId as keyof typeof RAZORPAY_PLANS];

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const razorpay = getRazorpay();

    const receipt = `${user.id.slice(0, 10)}_${planId.slice(0, 5)}_${Date.now().toString(36)}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt,
      notes: {
        userId: user.id,
        planId: planId,
        email: user.email,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planName: plan.name,
      planDescription: plan.description,
      customerEmail: user.email,
      customerName: user.name || "",
    });
  } catch (error: any) {
    console.error("Razorpay order error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
