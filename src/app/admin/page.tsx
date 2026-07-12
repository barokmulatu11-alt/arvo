"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export default function AdminLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast("Please fill in all fields", "warning");
      return;
    }

    setIsLoading(true);

    // Simulate Admin authentication
    setTimeout(() => {
      setIsLoading(false);
      if (username === "admin" && password === "admin123") {
        toast("Access granted. Welcome to Arvo Admin Control.", "success");
        router.push("/admin/dashboard");
      } else {
        toast("Invalid credentials. Access denied.", "error");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] border border-neutral-900 bg-neutral-900 flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-white">R</span>
            </div>
            <span className="font-mono text-xs font-bold text-neutral-950 uppercase tracking-widest">
              Arvo INTERNAL
            </span>
          </div>
        </div>
        <h2 className="text-center text-xl font-bold text-neutral-900 tracking-tight">
          Admin Control Center
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-500">
          Enter credentials to manage the platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white p-8 border border-neutral-200 rounded-[6px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
                Admin Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded-[6px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 text-sm bg-white hover:bg-neutral-50/50"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-neutral-500">
                Security Password
              </label>
              <div className="mt-2">
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded-[6px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 text-sm bg-white hover:bg-neutral-50/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[6px] text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Authenticate Access
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
