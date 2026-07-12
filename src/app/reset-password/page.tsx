"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Loader2, CheckCircle } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <h3 className="text-sm font-bold text-neutral-950 mb-2">Invalid Reset Link</h3>
        <p className="text-xs text-neutral-500 leading-relaxed mb-6">
          The password reset link is invalid or missing the token.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-2"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 bg-neutral-50 text-neutral-950 rounded-[6px] flex items-center justify-center mx-auto mb-4 border border-neutral-200">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-neutral-950 mb-2">Password Reset Successful</h3>
        <p className="text-xs text-neutral-500 leading-relaxed mb-6">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[6px] text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast("Please fill in all fields", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "warning");
      return;
    }

    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      toast("Password reset successful", "success");
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="newPassword" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
          New Password
        </label>
        <div className="mt-2">
          <PasswordInput
            id="newPassword"
            name="newPassword"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
          Confirm New Password
        </label>
        <div className="mt-2">
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[6px] text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:border-neutral-950 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </form>
  );
}

export default function ResetPassword() {
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
          Create new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white p-8 border border-neutral-200 rounded-[6px]">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      
      <div className="mt-12 text-center text-xs text-neutral-400">
        &copy; 2026 Arvo. Barok Labs
      </div>
    </div>
  );
}
