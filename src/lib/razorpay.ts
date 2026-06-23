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

// -----------------------------------------------------------------------------
// Plan catalogue
// -----------------------------------------------------------------------------
// Pricing strategy (June 2026, India market):
//   Free     ₹0/mo    Build & preview resumes with watermark. Paid feature gate:
//                      PDF/Word/Excel downloads, LinkedIn import, full ATS
//                      report, and Smart Job Search require a paid plan.
//   Trial    ₹249     Full premium access for 7 days. Single-shot, does not
//                      auto-renew. Designed to convert free users into a
//                      monthly subscriber before the trial expires.
//   Monthly  ₹349/mo  Full premium access, billed monthly.
//                      Effective ₹349/mo.
//   Yearly   ₹1,499/yr Full premium access, billed annually.
//                      Effective ₹124.92/mo — saves 64% vs monthly billing
//                      (₹4,188 → ₹1,499). Anchored against:
//                        • International:  Rezi $96/yr  (~₹8,000)
//                                          Resume.io $83/yr (~₹6,900)
//                                          Enhancv $270/yr (~₹22,500)
//                        • Indian market:  Resumai ₹999/yr, JobsForHer ₹999/yr
//                      ₹1,499 sits in the sweet spot — premium-quality product
//                      priced accessibly for Indian SaaS buyers.
//
// Amounts are stored in paise (₹1 = 100 paise).
// -----------------------------------------------------------------------------

export type RazorpayPlanId =
  | "TRIAL"
  | "MONTHLY"
  | "ANNUAL";

export const RAZORPAY_PLANS: Record<
  RazorpayPlanId,
  {
    planId: string;
    amount: number;
    name: string;
    description: string;
    period: "trial" | "monthly" | "yearly";
    durationDays: number;
    /** Quasi-billing cycle label shown on the UI. */
    displayPeriod: string;
    /** Original-price-per-month for "you save X%" anchoring on annual plan. */
    monthlyEquivalent: number;
    /** Tag shown in the billing UI — e.g. "Most Popular", "Best Value". */
    badge?: string;
  }
> = {
  TRIAL: {
    planId: process.env.RAZORPAY_TRIAL_PLAN_ID || "",
    amount: 24_900, // ₹249
    name: "7-Day Pro Trial",
    description: "Try every premium feature for 7 days — risk-free",
    period: "trial",
    durationDays: 7,
    displayPeriod: "7 days",
    monthlyEquivalent: 1_070, // ₹249 / 7 × 30 ≈ ₹1,070/mo if extended — anchors yearly
  },
  MONTHLY: {
    planId: process.env.RAZORPAY_MONTHLY_PLAN_ID || "",
    amount: 34_900, // ₹349
    name: "Pro Monthly",
    description: "Full premium access, billed every month",
    period: "monthly",
    durationDays: 30,
    displayPeriod: "month",
    monthlyEquivalent: 349,
  },
  ANNUAL: {
    planId: process.env.RAZORPAY_ANNUAL_PLAN_ID || "",
    amount: 1_49_900, // ₹1,499
    name: "Pro Yearly",
    description: "Full premium access, billed once a year — save 64%",
    period: "yearly",
    durationDays: 365,
    displayPeriod: "year",
    monthlyEquivalent: 125,
    badge: "Best Value · Save ₹2,689",
  },
};

/**
 * Maps a Razorpay-facing plan ID (TRIAL / MONTHLY / ANNUAL) to the
 * canonical SubscriptionPlan enum stored on the User row.
 */
export function resolveSubscriptionPlan(
  planId: RazorpayPlanId
): "PREMIUM_TRIAL" | "PREMIUM_MONTHLY" | "PREMIUM_ANNUAL" {
  switch (planId) {
    case "TRIAL":
      return "PREMIUM_TRIAL";
    case "MONTHLY":
      return "PREMIUM_MONTHLY";
    case "ANNUAL":
      return "PREMIUM_ANNUAL";
    default: {
      // Exhaustiveness check — TypeScript will fail to compile if a new
      // RazorpayPlanId is added without a matching enum value.
      const _exhaustive: never = planId;
      return _exhaustive;
    }
  }
}

/** Total savings vs paying monthly for a year, in paise. */
export const ANNUAL_SAVINGS_PAISE = 4_18_800 - 1_49_900; // ₹4,188 - ₹1,499 = ₹2,689
