"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { 
  User, Lock, Download, Trash2, Layout, 
  AlertTriangle, Loader2 
} from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

interface UserProfile {
  name: string;
  email: string;
  subscription: {
    plan: "FREE" | "PRO";
    status: string;
    aiUsageCount: number;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Profile state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Custom accent state to demo theme variables switching
  const [activeAccent, setActiveAccent] = useState("#111111");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok || !data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch {
      toast("Failed to load settings profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast("Name and email are required", "warning");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile update failed");

      toast("Profile updated successfully", "success");
      fetchProfile();
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please fill in all password fields", "warning");
      return;
    }

    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters long", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");

      toast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast(err.message || "Failed to update password", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleExportData = () => {
    window.location.href = "/api/user/export";
    toast("Exporting your Arvo data JSON...", "success");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Account deletion failed");

      toast("Account deleted successfully", "success");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Failed to delete account", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const changeAccentColor = (hex: string) => {
    setActiveAccent(hex);
    document.documentElement.style.setProperty("--primary", hex);
    localStorage.setItem("arvo-accent", hex);
    window.dispatchEvent(new Event("accent-change"));
    toast(`Accent color set to ${hex}`, "info");
  };

  useEffect(() => {
    const saved = localStorage.getItem("arvo-accent");
    if (saved) {
      setActiveAccent(saved);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 max-w-3xl w-full mx-auto animate-fade-in bg-white">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium">Manage profile metadata, password updates, theme settings, and deletion.</p>
      </div>

      {/* Profile details */}
      <section className="bg-white border border-neutral-200 rounded-[6px] p-5">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
          <User className="w-4 h-4 text-neutral-900" />
          <h2 className="font-bold text-neutral-800 text-xs sm:text-sm">Profile Details</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-primary hover:opacity-90 px-4 py-2 rounded-[6px] transition-colors"
            >
              {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="bg-white border border-neutral-200 rounded-[6px] p-5">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
          <Lock className="w-4 h-4 text-neutral-900" />
          <h2 className="font-bold text-neutral-800 text-xs sm:text-sm">Security & Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Current Password</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-white"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-white"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Confirm New Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-primary hover:opacity-90 px-4 py-2 rounded-[6px] transition-colors"
            >
              {isSavingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* Custom Accent Variables Selector */}
      <section className="bg-white border border-neutral-200 rounded-[6px] p-5">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
          <Layout className="w-4 h-4 text-neutral-900" />
          <h2 className="font-bold text-neutral-800 text-xs sm:text-sm">Theme (CSS Variables)</h2>
        </div>



        <div className="flex flex-wrap gap-2.5">
          {[
            { hex: "#111111", name: "Solid Black" },
            { hex: "#2563EB", name: "Deep Blue" },
            { hex: "#0D9488", name: "Teal" },
            { hex: "#4B5563", name: "Slate" }
          ].map((color) => (
            <button
              key={color.hex}
              onClick={() => changeAccentColor(color.hex)}
              className={`px-3 py-1.5 border rounded-[4px] text-xs font-bold transition-all flex items-center gap-2 ${
                activeAccent === color.hex 
                  ? "border-primary bg-neutral-50" 
                  : "border-neutral-200 bg-white"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/10" style={{ backgroundColor: color.hex }}></span>
              {color.name}
            </button>
          ))}
        </div>
      </section>

      {/* Catastrophic actions */}
      <section className="border border-neutral-250 bg-neutral-50/50 rounded-[6px] p-5 space-y-5">
        <div>
          <h2 className="font-bold text-neutral-800 text-xs sm:text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-neutral-900" />
            Catastrophic Actions
          </h2>
          <p className="text-xs text-neutral-500 mt-1 leading-normal font-medium">
            Permanent operations. Proceed with extreme caution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200">
          <div>
            <h3 className="text-xs font-bold text-neutral-800">Export Personal Data</h3>
            <p className="text-[10px] text-neutral-450 mt-0.5">Download all JSON templates and content drafts.</p>
          </div>
          <button
            onClick={handleExportData}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-[6px] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            Export JSON
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200">
          <div>
            <h3 className="text-xs font-bold text-neutral-800">Delete Account</h3>
            <p className="text-[10px] text-neutral-450 mt-0.5">Permanently purge all data from records.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-primary hover:opacity-90 px-3.5 py-2 rounded-[6px] transition-colors"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/20 backdrop-blur-[1px]">
          <div className="bg-white border border-neutral-200 rounded-[8px] max-w-sm w-full p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 text-neutral-900 mb-4">
              <div className="w-8 h-8 bg-neutral-50 border border-neutral-100 rounded-[4px] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-neutral-950" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Catastrophic Deletion</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-normal mb-6 font-medium">
              Are you sure you want to permanently delete your account? This action is catastrophic, immediate, and cannot be undone. All resume templates and content will be purged forever.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 rounded-[4px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-primary hover:opacity-90 rounded-[4px] transition-colors"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
