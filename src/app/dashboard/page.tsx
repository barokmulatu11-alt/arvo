"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatRelativeTime } from "@/lib/utils";
import { 
  Plus, Search, Bell, Copy, Trash2, FileText, 
  ArrowRight, Download, BarChart3, MoreVertical, 
  AlertTriangle, Check, Loader2 
} from "lucide-react";

interface Resume {
  id: string;
  title: string;
  templateId: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  name: string;
  email: string;
  subscription: {
    plan: "FREE" | "PRO";
    status: string;
    aiUsageCount: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Real data states
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drops & Modal states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom notifications & profile state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to Arvo! Start building your premium resume layouts.", read: false, time: "Just now" },
    { id: 2, text: "Pro Tip: Tailor your resumes to Job Descriptions to increase ATS matching scores.", read: false, time: "2 hours ago" },
    { id: 3, text: "Your new visual templates gallery is now live and fully customized.", read: true, time: "1 day ago" }
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const calculateProfileStrength = () => {
    if (!resumes || resumes.length === 0) return 0;
    
    let maxScore = 0;
    
    for (const resume of resumes) {
      if (!resume.content) continue;
      
      try {
        const content = JSON.parse(resume.content);
        let score = 0;
        
        // Personal Info (20%)
        if (content.personalInfo?.firstName?.trim()) score += 5;
        if (content.personalInfo?.lastName?.trim()) score += 5;
        if (content.personalInfo?.email?.trim()) score += 5;
        if (content.personalInfo?.phone?.trim()) score += 5;
        
        // Summary (20%)
        if (content.summary && content.summary.trim().length > 10) score += 20;
        
        // Experience (25%)
        if (content.experience && content.experience.length > 0) score += 25;
        
        // Education (20%)
        if (content.education && content.education.length > 0) score += 20;
        
        // Skills (15%)
        if (content.skills && content.skills.length >= 3) score += 15;
        else if (content.skills && content.skills.length > 0) score += 5;
        
        if (score > maxScore) maxScore = score;
      } catch (e) {
        // Safe parsing
      }
    }
    
    return maxScore;
  };

  const profileStrength = calculateProfileStrength();

  const fetchData = async () => {
    try {
      const userRes = await fetch("/api/user/profile");
      const userData = await userRes.json();
      if (userRes.ok && userData.user) {
        setUser(userData.user);
      }

      const resumesRes = await fetch("/api/resumes");
      const resumesData = await resumesRes.json();
      if (resumesRes.ok) {
        setResumes(resumesData.resumes || []);
      }
    } catch {
      toast("Failed to load dashboard metrics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateResume = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Resume" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/dashboard/billing");
        } else {
          throw new Error(data.error || "Failed to create resume");
        }
        return;
      }

      toast("Resume created successfully", "success");
      router.push(`/editor/${data.resume.id}`);
    } catch (err: any) {
      toast(err.message || "Failed to create resume", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast("Only PDF files are supported", "error");
      return;
    }

    setIsImporting(true);
    toast("Parsing PDF... this may take a moment", "success");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/dashboard/billing");
        } else {
          throw new Error(data.error || "Failed to parse PDF");
        }
        return;
      }

      toast("Resume imported successfully!", "success");
      router.push(`/editor/${data.resumeId}`);
    } catch (err: any) {
      toast(err.message || "Failed to import resume", "error");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDuplicateResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(null);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/dashboard/billing");
        } else {
          throw new Error(data.error || "Failed to duplicate resume");
        }
        return;
      }

      toast("Resume duplicated successfully", "success");
      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to duplicate resume", "error");
    }
  };

  const handleDeleteResume = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${deleteModalId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete resume");

      toast("Resume deleted successfully", "success");
      setDeleteModalId(null);
      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to delete resume", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredResumes = resumes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-foreground" />
      </div>
    );
  }

  const aiCount = user?.subscription?.aiUsageCount || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Search Header */}
      <header className="h-14 border-b border-border px-8 flex items-center justify-between shrink-0 bg-background">
        <div className="flex items-center gap-3 w-80 relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-border rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-background hover:bg-surface transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neutral-950 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-background border border-border rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-2 z-30 animate-fade-in text-left">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Notifications</span>
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      toast("All marked as read", "success");
                    }}
                    className="text-[9px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                  >
                    Mark read
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-neutral-50 last:border-b-0 hover:bg-surface transition-colors ${!n.read ? "bg-surface" : ""}`}>
                      <p className="text-[11px] text-foreground leading-normal font-medium">{n.text}</p>
                      <span className="text-[9px] text-muted-foreground block mt-1 font-bold">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
              className="w-6 h-6 rounded-[4px] bg-surface border border-border flex items-center justify-center font-bold text-[10px] text-muted-foreground hover:bg-surface/50 hover:border-neutral-350 transition-all"
            >
              {user?.name[0].toUpperCase() || "A"}
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-1.5 z-30 animate-fade-in text-left">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold text-foreground truncate leading-none">{user?.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate mt-1 leading-none">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full block px-4 py-2 text-[10.5px] font-bold text-foreground hover:bg-surface transition-colors text-left"
                >
                  Customise Profile
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full block px-4 py-2 text-[10.5px] font-bold text-foreground hover:bg-surface transition-colors text-left"
                >
                  Billing & Plan
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main dashboard viewport */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 max-w-6xl w-full mx-auto">
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
              {getGreeting()}, {user?.name.split(" ")[0]}.
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Here's what's happening with your resumes today.</p>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportPdf}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting || isCreating}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-surface hover:bg-neutral-200 px-4 py-2 rounded-[6px] transition-colors disabled:opacity-50"
            >
              {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 rotate-180" />}
              Import PDF
            </button>
            <button
              onClick={handleCreateResume}
              disabled={isCreating || isImporting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black px-4 py-2 rounded-[6px] transition-colors disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create New Resume
            </button>
          </div>
        </section>

        {/* Recent Resumes Grid */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">Recent Resumes</h2>
            <Link href="/dashboard/resumes" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredResumes.length === 0 ? (
            <div className="border border-border bg-surface rounded-[6px] py-12 text-center">
              <p className="text-xs text-muted-foreground">No resumes found. Create a new resume to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredResumes.slice(0, 4).map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => router.push(`/editor/${resume.id}`)}
                  className="group bg-surface border border-border hover:border-neutral-400 rounded-[6px] p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between aspect-[1/1]"
                >
                  <div className="w-full bg-surface border border-border rounded-[4px] flex-1 flex items-center justify-center p-3 relative overflow-hidden select-none mb-3 group-hover:bg-surface/50 transition-colors">
                    <div className="w-16 h-22 bg-background rounded shadow-sm border border-border p-1.5 flex flex-col gap-0.5">
                      <div className="h-1 bg-neutral-800 rounded w-1/2"></div>
                      <div className="h-0.5 bg-neutral-200 rounded w-full"></div>
                      <div className="h-0.5 bg-neutral-200 rounded w-2/3"></div>
                      <div className="border-t border-border my-0.5"></div>
                      <div className="h-1 bg-neutral-900 rounded w-1/3"></div>
                      <div className="h-0.5 bg-surface rounded w-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-foreground truncate group-hover:text-neutral-950 transition-colors" title={resume.title}>
                        {resume.title}
                      </h3>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === resume.id ? null : resume.id);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeDropdown === resume.id && (
                          <div className="absolute right-0 bottom-6 w-32 bg-background border border-border rounded-[6px] py-1 z-10">
                            <button
                              onClick={(e) => handleDuplicateResume(resume.id, e)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-foreground hover:bg-surface transition-colors text-left"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalId(resume.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-650 hover:bg-red-50/50 transition-colors text-left"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                      {formatRelativeTime(resume.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4 Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-surface border border-border rounded-[6px] p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-surface text-foreground border border-border rounded-[4px] flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground mt-1">
                {user?.subscription?.plan === "PRO" ? aiCount : `${aiCount} / 5`}
              </p>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AI Generations</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[6px] p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-surface text-foreground border border-border rounded-[4px] flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-base font-black text-foreground tracking-tight">{resumes.length}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Resumes Created</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[6px] p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-surface text-foreground border border-border rounded-[4px] flex items-center justify-center shrink-0">
              <Download className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-base font-black text-foreground tracking-tight">0</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Downloads</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[6px] p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-surface text-foreground border border-border rounded-[4px] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-base font-black text-foreground tracking-tight">{profileStrength}%</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Profile Strength</div>
            </div>
          </div>
        </section>

        {/* Promo Upgrade Banner */}
        {user?.subscription?.plan !== "PRO" && (
          <section className="bg-surface border border-border rounded-[6px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded bg-surface px-2 py-0.5 text-[9px] font-bold text-foreground uppercase tracking-wider">
                Pro Upgrade
              </span>
              <h3 className="text-base font-bold text-foreground tracking-tight">Unlock unlimited AI generations and template designs</h3>
              <p className="text-xs text-muted-foreground leading-normal max-w-lg">
                Upgrade to Arvo Pro and take your career to the next level with native PDF exports, ATS scoring, and custom designs.
              </p>
              
              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-2 text-[10px] text-muted-foreground font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
                  <span>Unlimited AI generations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
                  <span>Premium layouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
                  <span>Tailor to Job Descriptions</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/billing"
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black px-5 py-3 rounded-[6px] transition-colors shrink-0"
            >
              Upgrade to Pro
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/20 backdrop-blur-[1px]">
          <div className="bg-surface border border-border rounded-[8px] max-w-sm w-full p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 text-red-650 mb-4">
              <div className="w-8 h-8 bg-surface border border-border rounded-[4px] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Delete Resume?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal mb-6 font-medium">
              Are you sure you want to delete this resume layout? This action is catastrophic and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-neutral-950 rounded-[4px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResume}
                disabled={isDeleting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-[4px] transition-colors"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
