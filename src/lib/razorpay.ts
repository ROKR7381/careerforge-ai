import Razorpay from "razorpay";

export function getRazorpay(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      `Razorpay not configured. KEY_ID=${keyId ? "set" : "missing"}, SECRET=${keySecret ? "set" : "missing"}`
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Plan configuration — amounts in paise (₹1 = 100 paise)
export const RAZORPAY_PLANS = {
  STUDENT_MONTHLY: {
    planId: process.env.RAZORPAY_STUDENT_PLAN_ID || "",
    amount: 500, // ₹5
    name: "Student Plan",
    description: "Full premium access for students",
    period: "monthly",
  },
  BUDGET_MONTHLY: {
    planId: process.env.RAZORPAY_BUDGET_PLAN_ID || "",
    amount: 1000, // ₹10
    name: "Budget Friendly",
    description: "Essential AI features on a budget",
    period: "monthly",
  },
  ANNUAL: {
    planId: process.env.RAZORPAY_ANNUAL_PLAN_ID || "",
    amount: 9900, // ₹99
    name: "Annual Value",
    description: "Best long-term value for career growth",
    period: "yearly",
  },
};
