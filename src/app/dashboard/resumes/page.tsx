"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatRelativeTime } from "@/lib/utils";
import { 
  Plus, Search, Copy, Trash2, FileEdit, MoreVertical, 
  Layout, Clock, AlertTriangle, Loader2 
} from "lucide-react";

interface Resume {
  id: string;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ResumesListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    fetchResumes();
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
      fetchResumes();
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
      fetchResumes();
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
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 max-w-6xl w-full mx-auto animate-fade-in bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Your Resumes</h1>
          <p className="text-xs text-neutral-500 mt-1 font-medium">Manage and edit your resume layouts.</p>
        </div>

        <button
          onClick={handleCreateResume}
          disabled={isCreating}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black px-4 py-2 rounded-[6px] transition-colors"
        >
          {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          New Resume
        </button>
      </div>

      <div className="flex items-center gap-3 relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3" />
        <input
          type="text"
          placeholder="Filter resumes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
        />
      </div>

      {filteredResumes.length === 0 ? (
        <div className="border border-neutral-200 bg-neutral-50/10 rounded-[6px] py-12 text-center">
          <p className="text-xs text-neutral-400">No resumes matching search parameters found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              onClick={() => router.push(`/editor/${resume.id}`)}
              className="group bg-white border border-neutral-200 hover:border-neutral-400 rounded-[6px] p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate group-hover:text-neutral-950 transition-colors">
                    {resume.title}
                  </h3>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === resume.id ? null : resume.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-950 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === resume.id && (
                      <div className="absolute right-0 bottom-6 w-32 bg-white border border-neutral-200 rounded-[6px] py-1 z-10">
                        <Link
                          href={`/editor/${resume.id}`}
                          className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => handleDuplicateResume(resume.id, e)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
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

                <div className="flex items-center gap-2.5 text-[10px] text-neutral-400 mt-2 font-medium">
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-neutral-600 uppercase tracking-wide">
                    {resume.templateId}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Edited {formatRelativeTime(resume.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 aspect-[16/10] bg-neutral-50 border border-neutral-100 rounded-[4px] flex items-center justify-center text-[10px] text-neutral-400 group-hover:bg-neutral-100/50 transition-colors select-none">
                <Layout className="w-4 h-4 text-neutral-350 mr-1" />
                Preview layout
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/20 backdrop-blur-[1px]">
          <div className="bg-white border border-neutral-200 rounded-[8px] max-w-sm w-full p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-8 h-8 bg-neutral-50 border border-neutral-100 rounded-[4px] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-neutral-900" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Delete Resume?</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-normal mb-6 font-medium">
              Are you sure you want to delete this resume layout? This action is catastrophic and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 rounded-[4px] transition-colors"
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
