"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { 
  ChevronDown, Loader2, LayoutGrid, FileText, 
  Settings, CreditCard, Layers, Compass, LogOut
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok || !data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
    } catch {
      toast("Failed to load user profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const saved = localStorage.getItem("arvo-accent");
    if (saved) {
      document.documentElement.style.setProperty("--primary", saved);
    }
  }, []); // Only run on mount — re-fetching auth on every navigation caused a redirect race condition

  useEffect(() => {
    const handleAccentChange = () => {
      const saved = localStorage.getItem("arvo-accent");
      if (saved) {
        document.documentElement.style.setProperty("--primary", saved);
      }
    };
    window.addEventListener("accent-change", handleAccentChange);
    return () => window.removeEventListener("accent-change", handleAccentChange);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast("Logged out successfully", "success");
      router.push("/login");
      router.refresh();
    } catch {
      toast("Failed to log out", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Resumes", href: "/dashboard/resumes", icon: FileText },
    { name: "Templates", href: "/dashboard/templates", icon: Layers },
    { name: "AI Tailor", href: "/dashboard/tailor", icon: Compass },
    { name: "Subscription", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const aiCount = user?.subscription?.aiUsageCount || 0;
  const maxAi = 5;
  const isPro = user?.subscription?.plan === "PRO";

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white font-sans text-neutral-900 antialiased">
      {/* SIDEBAR */}
      <aside className="w-56 border-r border-neutral-100 flex flex-col justify-between shrink-0 bg-white p-4">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 px-2">
            <span className="font-extrabold text-xs tracking-widest text-neutral-900 uppercase">
              Arvo
            </span>
          </Link>

          {/* Nav list */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium tracking-normal transition-colors ${
                    isActive 
                      ? "bg-neutral-50 text-primary font-bold" 
                      : "text-neutral-500 hover:text-primary hover:bg-neutral-50/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-neutral-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar components */}
        <div className="flex flex-col gap-4">
          {/* Flat Usage Meter */}
          <div className="border border-neutral-150 rounded-[6px] p-3 space-y-2 bg-neutral-50/50">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
              {isPro ? "Pro Tier" : "Free Tier"}
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-base font-black text-neutral-900 tracking-tight">
                {isPro ? aiCount : `${aiCount}/5`}
              </span>
              <span className="text-[9px] text-neutral-400 font-medium">Generations</span>
            </div>
            <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: isPro ? "100%" : `${Math.min((aiCount / maxAi) * 100, 100)}%` }}
              ></div>
            </div>
            {!isPro && (
              <Link 
                href="/dashboard/billing"
                className="w-full mt-2 inline-flex items-center justify-center py-1 rounded-[4px] text-[9px] font-bold text-white bg-primary hover:opacity-90 transition-colors uppercase tracking-wider"
              >
                Upgrade
              </Link>
            )}
          </div>

          {/* User profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center justify-between p-1.5 rounded-[6px] hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-[4px] bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {user?.name.substring(0, 2).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-neutral-800 truncate leading-none">{user?.name}</span>
                  <span className="text-[9px] text-neutral-450 truncate mt-0.5 leading-none">{user?.email}</span>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-10 left-0 right-0 bg-white border border-neutral-200 rounded-[6px] shadow-sm py-1 z-50">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Account Settings
                </Link>
                <div className="border-t border-neutral-100 my-1"></div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50/50 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN RENDER PANEL */}
      <main className="flex-1 h-screen overflow-y-auto bg-white flex flex-col">
        {children}
      </main>
    </div>
  );
}
