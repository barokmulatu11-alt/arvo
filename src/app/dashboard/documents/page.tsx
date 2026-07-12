"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

interface Resume {
  id: string;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
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
        toast("Failed to load documents", "error");
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
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 max-w-6xl w-full mx-auto animate-fade-in bg-white">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">All Documents</h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium font-medium">Review active resume records, tailored revisions, and document drafts.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[6px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <th className="px-6 py-3">Document Title</th>
              <th className="px-6 py-3">Template</th>
              <th className="px-6 py-3">Last Edited</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-xs font-medium text-neutral-700">
            {resumes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">
                  No documents found.
                </td>
              </tr>
            ) : (
              resumes.map((resume) => (
                <tr key={resume.id} className="hover:bg-neutral-50/20 transition-colors">
                  <td className="px-6 py-3.5 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
                    <span className="font-bold text-neutral-900 truncate max-w-xs">{resume.title}</span>
                  </td>
                  <td className="px-6 py-3.5 uppercase">
                    <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-neutral-600 tracking-wide">
                      {resume.templateId}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-neutral-400">
                    {formatRelativeTime(resume.updatedAt)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => router.push(`/editor/${resume.id}`)}
                      className="inline-flex items-center gap-0.5 text-[11px] font-bold text-neutral-900 hover:underline"
                    >
                      Open Editor
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
