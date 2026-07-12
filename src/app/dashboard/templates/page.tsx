"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, TemplateStyle } from "@/lib/templates";
import { Check, Lock } from "lucide-react";
import { useToast } from "@/components/Toast";

function TemplatePreview({ tmpl, isLocked }: { tmpl: TemplateStyle; isLocked: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = width / 800;

  return (
    <div
      ref={containerRef}
      className="aspect-[3/4] w-full bg-white border border-neutral-200 rounded-[4px] mb-3 relative overflow-hidden select-none pointer-events-none group-hover:border-neutral-350 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: "800px",
          height: "1066px",
          transform: `scale(${scale})`,
        }}
      >
        <div className={`${tmpl.container} h-full overflow-hidden text-[11px] leading-relaxed p-6`}>
          {/* Header */}
          <div className={tmpl.header}>
            <div className={tmpl.nameText}>Jane Doe</div>
            {tmpl.tagline && <div className={tmpl.tagline}>Lead Software Engineer</div>}
            <div className={tmpl.contactRow}>
              <span className={tmpl.contactItem}>jane.doe@email.com</span>
              <span className={tmpl.contactItem}>+1 (555) 019-2834</span>
              <span className={tmpl.contactItem}>San Francisco, CA</span>
            </div>
          </div>

          {/* Work Experience */}
          <div className={tmpl.sectionHeader}>
            <h4 className={tmpl.sectionTitle}>Experience</h4>
            <div className={tmpl.sectionDivider}></div>
          </div>

          <div className={tmpl.experienceItem}>
            <div className={tmpl.itemHeader}>
              <div className={tmpl.itemTitle}>Senior Developer</div>
              <div className={tmpl.itemDate}>2022 — Present</div>
            </div>
            <div className={tmpl.itemSub}>TechCorp Solutions</div>
            <p className={tmpl.itemDesc}>
              Led development of high-performance web applications and backend APIs.
            </p>
          </div>

          <div className={tmpl.experienceItem}>
            <div className={tmpl.itemHeader}>
              <div className={tmpl.itemTitle}>Software Engineer</div>
              <div className={tmpl.itemDate}>2020 — 2022</div>
            </div>
            <div className={tmpl.itemSub}>InnoSoft Inc</div>
            <p className={tmpl.itemDesc}>
              Designed responsive interfaces and optimized database performance.
            </p>
          </div>

          {/* Education */}
          <div className={tmpl.sectionHeader}>
            <h4 className={tmpl.sectionTitle}>Education</h4>
            <div className={tmpl.sectionDivider}></div>
          </div>
          <div className="flex justify-between font-bold text-slate-800">
            <span>State University</span>
            <span className="text-slate-400 font-medium">2020</span>
          </div>
          <div className="text-slate-655 italic -mt-1">
            B.S. in Computer Science
          </div>

          {/* Skills */}
          <div className={tmpl.sectionHeader}>
            <h4 className={tmpl.sectionTitle}>Skills</h4>
            <div className={tmpl.sectionDivider}></div>
          </div>
          <div className={tmpl.skillsGrid}>
            <div>
              <span className={tmpl.skillCategory}>Stack: </span>
              <span className={tmpl.skillBadge}>TypeScript,</span>
              <span className={tmpl.skillBadge}>React,</span>
              <span className={tmpl.skillBadge}>Node.js,</span>
              <span className={tmpl.skillBadge}>Next.js</span>
            </div>
          </div>
        </div>
      </div>
      {isLocked && (
        <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white rounded-[4px]">
          <div className="bg-neutral-950/80 px-2.5 py-1.5 rounded-[4px] flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase shadow-md">
            <Lock className="w-3 h-3 text-amber-400" />
            Pro locked
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch {
        // Ignore
      } finally {
        setLoadingUser(false);
      }
    };
    fetchProfile();
  }, []);

  const isPro = user?.subscription?.plan === "PRO";

  const handleSelectTemplateDemo = async (tmplId: string, name: string, isLocked: boolean) => {
    if (isLocked) {
      toast(`The "${name}" layout is exclusive to Arvo Pro subscribers. Please upgrade your plan in the Billing tab.`, "warning", 5000);
      return;
    }
    
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: `Untitled Resume (${name})`,
          templateId: tmplId 
        }),
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

      toast(`Created new resume with "${name}" template`, "success");
      router.push(`/editor/${data.resume.id}`);
    } catch (err: any) {
      toast(err.message || "Failed to create resume", "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 max-w-6xl w-full mx-auto animate-fade-in bg-white">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Design Templates</h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium">typography-first templates engineered structurally to protect underlying JSON content.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.values(TEMPLATES).map((tmpl, idx) => {
          const isLocked = !isPro && idx >= 3;
          return (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplateDemo(tmpl.id, tmpl.name, isLocked)}
              className="group bg-white border border-neutral-200 hover:border-neutral-400 rounded-[6px] p-4 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <TemplatePreview tmpl={tmpl} isLocked={isLocked} />
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-800 tracking-wide">{tmpl.name}</h3>
                  {isLocked && <Lock className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 leading-normal font-medium">{tmpl.description}</p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-neutral-900 uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                SaaS Compatible
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
