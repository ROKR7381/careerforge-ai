"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  ArrowRight,
  Shield,
  Smartphone,
  QrCode,
  Banknote,
  Zap,
  Crown,
  Gift,
  Briefcase,
  FileText,
  Search,
  Mic,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface BillingClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string | null;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Plan metadata rendered on /billing. Kept in sync with `RAZORPAY_PLANS` in
 * `lib/razorpay.ts` — the source of truth for amounts lives there. This file
 * owns UI-only copy, feature lists, and badges.
 *
 * Pricing (June 2026):
 *   Free    ₹0        — Build & preview, downloads locked
 *   Trial   ₹249 / 7d — Full Pro access, one-shot
 *   Monthly ₹349 / mo — Full Pro, billed monthly
 *   Yearly  ₹1,499/yr — Full Pro, billed yearly, save 64%
 */
const PLANS = [
  {
    id: "FREE" as const,
    name: "Free",
    icon: Gift,
    price: "₹0",
    priceSubtext: "forever",
    period: null,
    description: "Build your resume and explore the platform",
    features: [
      { text: "1 active resume", included: true },
      { text: "All templates (preview only)", included: true },
      { text: "ATS quick scan — top 3 issues", included: true },
      { text: "1 mock interview (3 questions)", included: true },
      { text: "Browse the job board", included: true },
      { text: "PDF / Word / Excel download", included: false },
      { text: "LinkedIn profile import", included: false },
      { text: "Smart Job Search & save jobs", included: false },
    ],
    cta: "Current Plan",
    highlight: false,
    accent: "border-slate-200",
  },
  {
    id: "TRIAL" as const,
    name: "7-Day Pro Trial",
    icon: Zap,
    price: "₹249",
    priceSubtext: "one-time · 7 full days",
    period: null,
    description: "Every Pro feature unlocked — risk-free, no auto-renewal",
    features: [
      { text: "Everything in Pro, for 7 days", included: true },
      { text: "Unlimited resumes & downloads (no watermark)", included: true },
      { text: "LinkedIn profile import", included: true },
      { text: "Full ATS score + detailed fixes", included: true },
      { text: "Smart Job Search — save unlimited jobs", included: true },
      { text: "Unlimited mock interviews", included: true },
      { text: "Unlimited AI cover letters", included: true },
      { text: "No auto-charge — pay once", included: true },
    ],
    cta: "Start 7-Day Trial",
    highlight: true,
    badge: "🔥 Most Popular",
    accent: "border-primary shadow-xl shadow-primary/20",
  },
  {
    id: "MONTHLY" as const,
    name: "Pro Monthly",
    icon: Crown,
    price: "₹349",
    priceSubtext: "per month",
    period: "/month",
    description: "Full Pro access, billed every month, cancel anytime",
    features: [
      { text: "Unlimited active resumes", included: true },
      { text: "All premium templates (no watermark)", included: true },
      { text: "PDF, Word, Excel export", included: true },
      { text: "LinkedIn profile import", included: true },
      { text: "Full ATS score + recommendations", included: true },
      { text: "Smart Job Search — save unlimited jobs", included: true },
      { text: "Unlimited mock interviews", included: true },
      { text: "Unlimited AI cover letters", included: true },
    ],
    cta: "Subscribe Monthly",
    highlight: false,
    accent: "border-indigo-300",
  },
  {
    id: "ANNUAL" as const,
    name: "Pro Yearly",
    icon: Sparkles,
    price: "₹1,499",
    priceSubtext: "per year",
    period: "/year",
    description: "Everything in Monthly — save 64%",
    features: [
      { text: "Everything in Pro Monthly", included: true },
      { text: "Save ₹2,689 vs paying monthly", included: true },
      { text: "Quarterly 1-on-1 resume review", included: true },
      { text: "VIP priority email support", included: true },
      { text: "Early access to new templates", included: true },
      { text: "Featured on recruiters' dashboard*", included: true },
      { text: "LinkedIn import", included: true },
      { text: "Smart Job Search", included: true },
    ],
    cta: "Subscribe Yearly",
    highlight: false,
    badge: "💎 Best Value · Save 64%",
    accent: "border-emerald-300",
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

export function BillingClient({ user, subscription }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<PlanId | null>(null);

  const isPremium = user.subscriptionPlan !== "FREE";
  const isOnTrial = user.subscriptionPlan === "PREMIUM_TRIAL";

  async function handleSubscribe(planId: string) {
    if (planId === "FREE") return;
    setLoading(planId);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create order");
        setLoading(null);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "CareerForge AI",
        description: `${data.planName} — ${data.planDescription}`,
        order_id: data.orderId,
        prefill: {
          name: data.customerName || user.name || "",
          email: data.customerEmail,
        },
        theme: { color: "#4f46e5" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success(
                planId === "TRIAL"
                  ? "Trial activated — enjoy 7 days of Pro! 🎉"
                  : "Payment successful! Premium activated 🎉"
              );
              window.location.href = "/billing?success=true";
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch {
            toast.error("Verification failed. Please contact support.");
          }
          setLoading(null);
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(null);
      });
      rzp.open();
    } catch {
      toast.error("Failed to initiate payment");
      setLoading(null);
    }
  }

  const currentPlanId: PlanId | null = (() => {
    if (user.subscriptionPlan === "PREMIUM_TRIAL") return "TRIAL";
    if (user.subscriptionPlan === "PREMIUM_MONTHLY") return "MONTHLY";
    if (user.subscriptionPlan === "PREMIUM_ANNUAL") return "ANNUAL";
    return "FREE";
  })();

  // UPI QR amount for each paid plan (in INR).
  const QR_AMOUNTS: Record<Exclude<PlanId, "FREE">, number> = {
    TRIAL: 249,
    MONTHLY: 349,
    ANNUAL: 1499,
  };
  const QR_NOTES: Record<Exclude<PlanId, "FREE">, string> = {
    TRIAL: "7-Day Pro Trial",
    MONTHLY: "Pro Monthly",
    ANNUAL: "Pro Yearly",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Success Banner */}
      {typeof window !== "undefined" &&
        window.location.search.includes("success=true") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">
                {isOnTrial
                  ? "Your 7-day Pro trial is now active!"
                  : "Payment successful!"}
              </p>
              <p className="text-sm text-green-600">
                {isOnTrial
                  ? "All Pro features unlocked until your trial ends."
                  : "Your premium features are now active."}
              </p>
            </div>
          </motion.div>
        )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <Badge variant="outline" className="mb-3 px-4 py-1.5">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Build for free.{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Pay only when you download.
          </span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Try every feature for 7 days at just ₹249 — no commitment, no
          auto-charge. Or unlock everything forever from ₹349/month.
        </p>
      </motion.div>

      {/* Current Plan banner */}
      {isPremium && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={isOnTrial ? "default" : "success"}
                    className="mb-1"
                  >
                    {isOnTrial ? (
                      <>
                        <Zap className="h-3 w-3 mr-1" /> Trial Active
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" /> Pro Active
                      </>
                    )}
                  </Badge>
                  <span className="text-lg font-semibold capitalize">
                    {subscription.plan.replace("PREMIUM_", "").replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.currentPeriodEnd && (
                    <>
                      {isOnTrial ? "Trial ends" : "Next billing"}:{" "}
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </>
                  )}
                </p>
              </div>
              {isOnTrial && (
                <Button
                  variant="default"
                  onClick={() => handleSubscribe("MONTHLY")}
                  disabled={loading !== null}
                >
                  {loading === "MONTHLY" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="mr-2 h-4 w-4" />
                  )}
                  Upgrade to Monthly before trial ends
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment Methods Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <CardContent className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex -space-x-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-white">
                <QrCode className="h-5 w-5 text-green-600" />
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="font-semibold text-sm text-slate-800">
                Pay with UPI, Cards, or Net Banking
              </p>
              <p className="text-xs text-slate-500">
                Google Pay, PhonePe, Paytm, BHIM, RuPay, Visa, Mastercard & more
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Powered by Razorpay
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan, i) => {
          const isCurrent = currentPlanId === plan.id;
          const isFree = plan.id === "FREE";
          const Icon = plan.icon;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`relative h-full border-2 ${plan.accent} ${
                  plan.highlight ? "scale-[1.02]" : ""
                }`}
              >
                {(plan as any).badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-3 py-1 text-xs shadow-md whitespace-nowrap">
                      {(plan as any).badge}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        plan.highlight
                          ? "bg-primary text-primary-foreground"
                          : isFree
                          ? "bg-slate-100 text-slate-700"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                  </div>

                  <div className="mt-3">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.priceSubtext}
                    </p>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground min-h-[40px]">
                    {plan.description}
                  </p>

                  <Separator className="my-4" />

                  <ul className="space-y-2.5 mb-6 flex-grow">
                    {plan.features.map((f) => (
                      <li
                        key={f.text}
                        className={`flex items-start gap-2 text-sm ${
                          !f.included ? "text-muted-foreground/60" : ""
                        }`}
                      >
                        {f.included ? (
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span className={!f.included ? "line-through" : ""}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isFree ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      size="lg"
                      disabled
                    >
                      {isCurrent ? "Your Current Plan" : "Default"}
                    </Button>
                  ) : isCurrent ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      size="lg"
                      disabled
                    >
                      ✓ Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.highlight ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading !== null}
                    >
                      {loading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature comparison strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10"
      >
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Why upgrade from Free to Pro?
            </CardTitle>
            <CardDescription>
              Free is genuinely useful — but Pro unlocks the features that
              actually land interviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureIcon
              icon={FileText}
              title="Unlimited downloads"
              text="Export PDF, Word & Excel with no watermark."
            />
            <FeatureIcon
              icon={UserCircle2}
              title="LinkedIn → resume"
              text="Import your profile in one click."
            />
            <FeatureIcon
              icon={Search}
              title="Smart Job Search"
              text="AI-matched jobs from Naukri, LinkedIn, Indeed."
            />
            <FeatureIcon
              icon={Mic}
              title="Unlimited mock interviews"
              text="Practice with AI — full sessions, scored feedback."
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* UPI QR Code Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-semibold">Or pay directly via UPI QR</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select a plan below, then scan the QR with any UPI app. After
              paying, share the screenshot on WhatsApp for instant activation.
            </p>

            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {(Object.keys(QR_AMOUNTS) as Array<keyof typeof QR_AMOUNTS>).map(
                (id) => (
                  <Button
                    key={id}
                    variant={showQR === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowQR(showQR === id ? null : id)}
                  >
                    ₹{QR_AMOUNTS[id]} — {QR_NOTES[id]}
                  </Button>
                )
              )}
            </div>

            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200"
              >
                <QRCodeSVG
                  value={(() => {
                    // Narrow showQR to a paid plan id so the lookup is type-safe.
                    const id = showQR as Exclude<PlanId, "FREE">;
                    return `upi://pay?pa=roshan.kr.hit2@ybl&pn=CareerForge+AI&am=${QR_AMOUNTS[id]}&cu=INR&tn=${encodeURIComponent(
                      "CareerForge " + QR_NOTES[id]
                    )}`;
                  })()}
                  size={160}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  imageSettings={{
                    src: "",
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                />
                <div className="text-left">
                  <p className="text-xs text-slate-500">UPI ID</p>
                  <p className="font-mono text-sm font-semibold">
                    roshan.kr.hit2@ybl
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Alternate UPI</p>
                  <p className="font-mono text-sm font-semibold">
                    6206194628@kotak
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Amount</p>
                  <p className="text-lg font-bold text-primary">
                    ₹{QR_AMOUNTS[showQR as Exclude<PlanId, "FREE">]}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 max-w-[200px]">
                    After paying, share the screenshot on WhatsApp +91-6206194628
                    for instant activation.
                  </p>
                </div>
              </motion.div>
            )}

            {!showQR && (
              <div className="h-32 w-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 mx-auto">
                <div className="text-center">
                  <QrCode className="h-12 w-12 text-slate-300 mx-auto mb-1" />
                  <p className="text-[9px] text-slate-400">
                    Select a plan above
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> 256-bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Banknote className="h-4 w-4" /> RBI Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Cancel Anytime
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" /> Built for Indian job market
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureIcon({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm text-slate-900">{title}</p>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
