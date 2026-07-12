"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast("Please fill in all fields", "warning");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters long", "warning");
      return;
    }

    if (password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      toast("Welcome to Arvo! 🎉", "success");

      // Small delay so the toast is visible, then hard-redirect so the
      // auth cookie is fully committed before the dashboard layout loads.
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-500">
          Already have an account?{" "}
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded-[6px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 text-sm bg-white hover:bg-neutral-50/50 focus:bg-white"
                  placeholder="Barok Mulatu"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
                Password
              </label>
              <div className="mt-2">
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
                Confirm Password
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
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-neutral-400">
        &copy; 2026 Arvo. Barok Labs
      </div>
    </div>
  );
}
