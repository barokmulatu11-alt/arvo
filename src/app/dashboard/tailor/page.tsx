"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ChevronRight, Loader2 } from "lucide-react";

interface Resume {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
}

export default function TailorSelectorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (res.ok) {
          setResumes(data.resumes || []);
        }
      } catch {
        toast("Failed to load resumes", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 max-w-xl w-full mx-auto animate-fade-in bg-white">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">AI Tailoring Selector</h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium">Select a resume layout to analyze keyword gaps and generate job-optimized versions.</p>
      </div>

      {resumes.length === 0 ? (
        <div className="border border-neutral-200 bg-neutral-50/10 rounded-[6px] py-12 text-center">
          <p className="text-xs text-neutral-400">Create a resume layout first to access AI tailoring.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {resumes.map((resume) => (
            <button
              key={resume.id}
              onClick={() => router.push(`/tailor/${resume.id}`)}
              className="w-full flex items-center justify-between p-4 bg-white border border-neutral-200 hover:border-neutral-400 rounded-[6px] transition-colors text-left group"
            >
              <div>
                <h3 className="text-xs font-bold text-neutral-800">{resume.title}</h3>
                <span className="text-[10px] text-neutral-450 mt-1 block">Template: {resume.templateId.toUpperCase()}</span>
              </div>

              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
