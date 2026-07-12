"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Read callback URL or default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Check if we just signed out or were redirected
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast("Account created successfully! Please log in.", "success");
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all fields", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast("Welcome back!", "success");
      
      // Force page refresh and navigation to refresh middleware state
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-neutral-200 rounded-[6px]">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
              Password
            </label>
            <div className="text-xs">
              <Link
                href="/forgot-password"
                className="font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="mt-2">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Login() {
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
          Welcome back
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-500">
          Or{" "}
          <Link
            href="/signup"
            className="font-medium text-neutral-900 hover:text-neutral-700 underline underline-offset-2"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={
          <div className="bg-white py-12 px-4 border border-neutral-200 rounded-[6px] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
      
      <div className="mt-12 text-center text-xs text-neutral-400">
        &copy; 2026 Arvo. Barok Labs
      </div>
    </div>
  );
}
