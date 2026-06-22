"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  CheckCircle,
  Loader2,
  CreditCard,
  ArrowRight,
  Shield,
  Smartphone,
  QrCode,
  Banknote,
  X,
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

export function BillingClient({ user, subscription }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const isPremium = user.subscriptionPlan !== "FREE";

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    try {
      // Create order
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

      // Open Razorpay checkout
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
        theme: {
          color: "#4f46e5",
        },
        handler: async (response: any) => {
          // Payment successful — verify on server
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
              toast.success("Payment successful! Premium activated 🎉");
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
      rzp.on("payment.failed", (response: any) => {
        toast.error("Payment failed. Please try again.");
        setLoading(null);
      });
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
      setLoading(null);
    }
  }

  const plans = [
    {
      id: "FREE",
      name: "Free",
      price: "₹0",
      period: "",
      description: "Perfect for getting started",
      features: [
        "1 active resume",
        "3 standard templates",
        "Watermarked PDF download",
        "3 mock interview questions",
        "Basic ATS scan suggestions",
      ],
      popular: false,
      color: "border-slate-200",
    },
    {
      id: "STUDENT_MONTHLY",
      name: "Student",
      price: "₹5",
      period: "/month",
      description: "Full premium access for students",
      features: [
        "Unlimited active resumes",
        "All premium templates",
        "Unwatermarked PDF & Excel",
        "Unlimited AI optimizations",
        "Unlimited mock interviews",
      ],
      popular: true,
      color: "border-primary shadow-xl shadow-primary/10",
    },
    {
      id: "BUDGET_MONTHLY",
      name: "Budget Friendly",
      price: "₹10",
      period: "/month",
      description: "Essential AI features on a budget",
      features: [
        "Up to 3 active resumes",
        "All premium templates",
        "Unwatermarked PDF download",
        "10 AI enhancements/month",
        "Standard interview coaching",
      ],
      popular: false,
      color: "border-slate-200",
    },
    {
      id: "ANNUAL",
      name: "Annual Value",
      price: "₹99",
      period: "/year",
      description: "Best long-term value for career growth",
      features: [
        "All premium features",
        "Save 50%+ vs monthly",
        "1-on-1 resume review",
        "VIP priority support",
        "Early access to new templates",
      ],
      popular: false,
      color: "border-slate-200",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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
                Payment successful!
              </p>
              <p className="text-sm text-green-600">
                Your premium features are now active.
              </p>
            </div>
          </motion.div>
        )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="mt-1 text-muted-foreground">
          {isPremium
            ? "You're on a Premium plan. Manage your subscription below."
            : "Upgrade to Premium and unlock all features."}
        </p>
      </motion.div>

      {/* Current Plan */}
      {isPremium && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="mb-1">
                    <Sparkles className="h-3 w-3 mr-1" /> Active
                  </Badge>
                  <span className="text-lg font-semibold capitalize">
                    {subscription.plan.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.currentPeriodEnd && (
                    <>
                      Next billing:{" "}
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString("en-IN")}
                    </>
                  )}
                </p>
              </div>
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
          <CardContent className="p-4 flex items-center gap-4">
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
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-800">
                Pay with UPI, Cards, or Net Banking
              </p>
              <p className="text-xs text-slate-500">
                Google Pay, PhonePe, Paytm, BHIM, RuPay, Visa, Mastercard &
                more
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Powered by Razorpay
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative h-full border-2 ${plan.color}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-4 py-1 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <Separator className="my-4" />
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.id === "FREE" ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    {user.subscriptionPlan === "FREE"
                      ? "Current Plan"
                      : "Downgrade"}
                  </Button>
                ) : user.subscriptionPlan === plan.id ||
                  (plan.id === "STUDENT_MONTHLY" &&
                    user.subscriptionPlan === "PREMIUM_MONTHLY") ? (
                  <Button className="w-full" variant="outline" size="lg" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay {plan.price}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* UPI QR Code Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-semibold">Or pay directly via UPI QR</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select a plan below, then scan the QR code with any UPI app
            </p>

            {/* Plan selector for QR */}
            <div className="flex justify-center gap-2 mb-4">
              {[
                { id: "STUDENT_MONTHLY", label: "₹5", amount: 5 },
                { id: "BUDGET_MONTHLY", label: "₹10", amount: 10 },
                { id: "ANNUAL", label: "₹99", amount: 99 },
              ].map((p) => (
                <Button
                  key={p.id}
                  variant={showQR === p.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowQR(showQR === p.id ? null : p.id)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* QR Code display */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200"
              >
                <QRCodeSVG
                  value={`upi://pay?pa=roshan.kr.hit2@ybl&pn=CareerForge+AI&am=${showQR === "STUDENT_MONTHLY" ? "5" : showQR === "BUDGET_MONTHLY" ? "10" : "99"}&cu=INR&tn=${encodeURIComponent(showQR === "STUDENT_MONTHLY" ? "Student Plan - Monthly" : showQR === "BUDGET_MONTHLY" ? "Budget Plan - Monthly" : "Annual Plan - Yearly")}`}
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
                    ₹{showQR === "STUDENT_MONTHLY" ? "5" : showQR === "BUDGET_MONTHLY" ? "10" : "99"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    After paying, contact support with screenshot
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
        transition={{ delay: 0.6 }}
        className="mt-6 text-center"
      >
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> 256-bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Banknote className="h-4 w-4" /> RBI Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Cancel Anytime
          </span>
        </div>
      </motion.div>
    </div>
  );
}
