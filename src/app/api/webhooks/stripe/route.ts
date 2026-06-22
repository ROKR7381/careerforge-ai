import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event;
    try {
      event = getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const planMeta = session.metadata?.plan;
        const plan = planMeta === "PREMIUM_ANNUAL" ? "PREMIUM_ANNUAL" : "PREMIUM_MONTHLY";

        if (userId && session.subscription) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: plan,
              subscriptionStatus: "ACTIVE",
            },
          });
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: plan,
              status: "ACTIVE",
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
              currentPeriodStart: new Date(session.created * 1000),
              currentPeriodEnd: new Date(
                (session.created + (plan === "PREMIUM_ANNUAL" ? 365 : 30) * 24 * 60 * 60) * 1000
              ),
            },
            create: {
              userId,
              plan: plan,
              status: "ACTIVE",
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
              currentPeriodStart: new Date(session.created * 1000),
              currentPeriodEnd: new Date(
                (session.created + (plan === "PREMIUM_ANNUAL" ? 365 : 30) * 24 * 60 * 60) * 1000
              ),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (user) {
          const status = subscription.status === "active" ? "ACTIVE" : "CANCELED";
          
          let plan = "FREE";
          if (status === "ACTIVE") {
            const stripePlan = subscription.items?.data?.[0]?.plan;
            const isAnnual = stripePlan?.interval === "year";
            plan = isAnnual ? "PREMIUM_ANNUAL" : "PREMIUM_MONTHLY";
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: plan as any,
              subscriptionStatus: status as any,
            },
          });

          await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              plan: plan as any,
              status: status as any,
              currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : undefined,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const custId = invoice.customer;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: custId },
        });
        if (user && invoice.subscription) {
          const sub = await getStripe().subscriptions.retrieve(invoice.subscription);
          const subData = sub as any;
          await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              status: "ACTIVE",
              currentPeriodStart: new Date(subData.current_period_start * 1000),
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
