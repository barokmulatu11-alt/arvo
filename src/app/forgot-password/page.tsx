"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("Please enter your email address", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setIsSubmitted(true);
      toast("Recovery email sent successfully", "success");
    } catch (error) {
      console.error(error);
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-[6px] border border-neutral-900 bg-neutral-900 flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-white">R</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-neutral-950">
              Arvo
            </span>
          </Link>
        </div>
        <h2 className="text-center text-2xl font-bold text-neutral-900 tracking-tight">
          Reset password
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-500">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:text-neutral-700 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white p-8 border border-neutral-200 rounded-[6px]">
          {!isSubmitted ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-neutral-200 rounded-[6px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 text-sm bg-white hover:bg-neutral-50/50 focus:bg-white"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[6px] text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:border-neutral-950 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-neutral-50 text-neutral-950 rounded-[6px] flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-950 mb-2">Check your email</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                We've sent recovery instructions to <span className="font-semibold text-neutral-900">{email}</span>.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 text-center text-xs text-neutral-400">
        &copy; 2026 Arvo. Barok Labs
      </div>
    </div>
  );
}
