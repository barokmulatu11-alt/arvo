// Force Hot Reload
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  CreditCard, Check, Loader2, X, AlertCircle, Upload,
  Clock, CheckCircle2, XCircle, Copy, Smartphone, Building2,
  ChevronRight, ImageIcon
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  subscription: {
    plan: "FREE" | "PRO";
    status: string;
    aiUsageCount: number;
  };
}

interface PaymentRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  method: string;
  adminNote?: string;
  createdAt: string;
}

const PAYMENT_METHODS = [
  {
    id: "TELEBIRR",
    label: "Telebirr",
    icon: Smartphone,
    account: "0935 008 069",
    holder: "Barok Mulatu",
    color: "bg-violet-50 border-violet-200",
    activeColor: "bg-violet-900 border-violet-900",
  },
  {
    id: "CBE",
    label: "CBE Birr",
    icon: Building2,
    account: "1000 750 283 784",
    holder: "Barok Mulatu",
    color: "bg-blue-50 border-blue-200",
    activeColor: "bg-blue-900 border-blue-900",
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  // Billing cycle state
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Checkout modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"TELEBIRR" | "CBE">("TELEBIRR");
  const [screenshot, setScreenshot] = useState<{ base64: string; type: string; preview: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/auth/me");
      const profileData = await profileRes.json();
      if (!profileRes.ok || !profileData.user) {
        router.push("/login");
        return;
      }
      setUser(profileData.user);
    } catch {
      toast("Failed to load profile", "error");
    } finally {
      setIsLoading(false);
    }

    // Load payment request separately — failures here should NOT cause a redirect
    try {
      const requestRes = await fetch("/api/subscription/payment-request");
      if (requestRes.ok) {
        const requestData = await requestRes.json();
        if (requestData.request) setPaymentRequest(requestData.request);
      }
    } catch {
      // Non-critical — page still works without this data
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "warning");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Screenshot must be under 5MB", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // Extract base64 part
      const base64 = result.split(",")[1];
      setScreenshot({ base64, type: file.type, preview: result });
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast(`${label} copied!`, "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) { toast("Please upload your payment screenshot", "warning"); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subscription/payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: selectedMethod,
          screenshotBase64: screenshot.base64,
          screenshotType: screenshot.type,
          billingCycle: billingCycle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      toast("Payment screenshot submitted! We'll review it shortly.", "success");
      setShowModal(false);
      setScreenshot(null);
      fetchData();
    } catch (err: any) {
      toast(err.message || "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
      </div>
    );
  }

  const isPro = user?.subscription?.plan === "PRO";
  const aiUsage = user?.subscription?.aiUsageCount || 0;
  const maxFreeGenerations = 5;
  const selectedMethodInfo = PAYMENT_METHODS.find(m => m.id === selectedMethod)!;

  const statusBanner = () => {
    if (!paymentRequest || paymentRequest.status === "APPROVED") return null;
    if (paymentRequest.status === "PENDING") {
      return (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[6px]">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900">Payment Under Review</p>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
              Your {paymentRequest.method} payment screenshot was submitted on{" "}
              {new Date(paymentRequest.createdAt).toLocaleDateString()}. We'll upgrade your account within 24 hours.
            </p>
          </div>
        </div>
      );
    }
    if (paymentRequest.status === "REJECTED") {
      return (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-[6px]">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-900">Payment Not Verified</p>
            <p className="text-[11px] text-red-700 mt-0.5 font-medium">
              {paymentRequest.adminNote || "Your screenshot could not be verified. Please resubmit with a clear screenshot."}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-[11px] font-bold text-red-900 underline underline-offset-2"
            >
              Resubmit Screenshot →
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 max-w-4xl w-full mx-auto animate-fade-in bg-white">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Subscription Plan</h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium">Manage your plan and upgrade to unlock all features.</p>
      </div>

      {/* Status Banner */}
      {statusBanner()}

      {/* Subscription Summary */}
      <section className="bg-white border border-neutral-200 rounded-[6px] p-5 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-50 text-neutral-900 border border-neutral-100 rounded-[4px] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-800 text-xs sm:text-sm">Subscription Summary</h2>
              <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                Active plan: <span className="font-bold text-neutral-900">{isPro ? "PRO" : "FREE"}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-800 uppercase tracking-wider">
            {isPro ? "Pro Tier" : "Free Tier"}
          </span>
        </div>

        <div className="border-t border-neutral-100 pt-5 space-y-3">
          <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            <span>AI Usage Limits</span>
            <span>{isPro ? aiUsage : `${aiUsage} / ${maxFreeGenerations}`}</span>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${aiUsage >= maxFreeGenerations && !isPro ? "bg-red-500" : "bg-neutral-900"}`}
              style={{ width: isPro ? `${Math.min((aiUsage / 20) * 100, 100)}%` : `${Math.min((aiUsage / maxFreeGenerations) * 100, 100)}%` }}
            />
          </div>
          {!isPro && (
            <p className="text-[10px] text-neutral-500 font-semibold">
              {aiUsage >= maxFreeGenerations
                ? "⚠️ You've reached your free AI limit. Upgrade to Pro to continue."
                : `${maxFreeGenerations - aiUsage} free AI requests remaining.`}
            </p>
          )}
        </div>
      </section>

      {/* Pricing Matrix */}
      <section className="space-y-6">
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-100 p-1 rounded-[8px] flex items-center border border-neutral-200">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-[6px] text-xs font-bold transition-all ${
                billingCycle === "monthly" 
                  ? "bg-white shadow-sm text-neutral-900" 
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-[6px] text-xs font-bold transition-all flex items-center gap-2 ${
                billingCycle === "yearly" 
                  ? "bg-white shadow-sm text-neutral-900" 
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black tracking-wider">
                SAVE 80%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="bg-white border border-neutral-200 rounded-[6px] p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-neutral-800 text-xs sm:text-sm">Free Plan</h3>
              <p className="text-neutral-400 text-[10px] mt-0.5">Explore template designs</p>
            </div>
            <div className="text-xl font-black text-neutral-900">ETB 0</div>
            <ul className="space-y-2.5 pt-2">
              {["1 active resume layout", "5 AI requests total", "5 standard templates"].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 py-2 rounded-[4px] text-xs font-semibold text-center text-neutral-500 bg-neutral-50 border border-neutral-200">
            {isPro ? "Basic Plan" : "Current Plan"}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-white border-2 border-neutral-900 rounded-[6px] p-5 flex flex-col justify-between relative shadow-sm">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {isPro ? "Your Plan" : "Upgrade"}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-neutral-800 text-xs sm:text-sm">Pro Plan</h3>
              <p className="text-neutral-400 text-[10px] mt-0.5">Accelerate your career search</p>
            </div>
            <div className="text-xl font-black text-neutral-900">
              ETB {billingCycle === "yearly" ? "499" : "199"}{" "}
              <span className="text-[10px] font-semibold text-neutral-400">
                / {billingCycle === "yearly" ? "year" : "month"}
              </span>
            </div>
            <ul className="space-y-2.5 pt-2">
              {[
                "Unlimited active resumes",
                "Unlimited AI tailoring requests",
                "All 20+ premium templates",
                "Clean PDF exports (no watermarks)",
                "Priority support",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          {isPro ? (
            <div className="mt-6 py-2.5 rounded-[4px] text-xs font-semibold text-center text-white bg-neutral-900 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Plan
            </div>
          ) : paymentRequest?.status === "PENDING" ? (
            <div className="mt-6 py-2.5 rounded-[4px] text-xs font-semibold text-center text-amber-800 bg-amber-50 border border-amber-200 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Review Pending
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-[4px] text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors"
            >
              Upgrade to Pro <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/30 backdrop-blur-[2px]">
          <div className="bg-white border border-neutral-200 rounded-[10px] max-w-md w-full shadow-xl animate-fade-in relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Upgrade to Pro ({billingCycle === "yearly" ? "Yearly" : "Monthly"})</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Pay via Telebirr or CBE then upload your receipt</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setScreenshot(null); }}
                disabled={isSubmitting}
                className="p-1.5 hover:bg-neutral-100 rounded-[6px] text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Step 1: Choose method */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  1. Choose Payment Method
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const isActive = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as "TELEBIRR" | "CBE")}
                        className={`flex items-center gap-2 p-3 rounded-[6px] border-2 text-left transition-all ${
                          isActive
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 hover:border-neutral-400 text-neutral-700"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-[6px] p-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  2. Send ETB {billingCycle === "yearly" ? "499" : "199"} to
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-500 font-medium">{selectedMethodInfo.label} Number</p>
                      <p className="text-sm font-black text-neutral-900 tracking-wider font-mono">
                        {selectedMethodInfo.account}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethodInfo.account, selectedMethodInfo.label)}
                      className="p-1.5 hover:bg-neutral-200 rounded-[4px] transition-colors"
                    >
                      {copied === selectedMethodInfo.label
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />
                        : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 font-medium">Account Name</p>
                    <p className="text-xs font-bold text-neutral-900">{selectedMethodInfo.holder}</p>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 flex justify-between">
                    <p className="text-[10px] text-neutral-500 font-medium">Amount</p>
                    <p className="text-xs font-black text-neutral-900">ETB {billingCycle === "yearly" ? "499.00" : "199.00"}</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Upload screenshot */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  3. Upload Payment Screenshot
                </p>

                {screenshot ? (
                  <div className="relative rounded-[6px] overflow-hidden border border-neutral-200">
                    <img
                      src={screenshot.preview}
                      alt="Payment screenshot"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setScreenshot(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 bg-white border border-neutral-200 rounded-full p-1 hover:bg-neutral-100"
                    >
                      <X className="w-3 h-3 text-neutral-600" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-neutral-900/70 text-white text-[10px] font-bold py-1 px-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Screenshot ready
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-[6px] py-6 flex flex-col items-center gap-2 transition-colors text-neutral-400 hover:text-neutral-900"
                  >
                    <ImageIcon className="w-6 h-6" />
                    <p className="text-xs font-semibold">Click to upload screenshot</p>
                    <p className="text-[10px]">PNG, JPG up to 5MB</p>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!screenshot || isSubmitting}
                className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white rounded-[6px] text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Submit for Review</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
