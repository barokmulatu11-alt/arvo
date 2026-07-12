"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { 
  ArrowLeft, Loader2, Target, CheckCircle2, 
  AlertCircle, Briefcase, ChevronRight
} from "lucide-react";

interface TailorAssessment {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  gapAnalysis: string;
  tailoredSummary: string;
  suggestedChanges: Array<{ section: string; action: string; details: string }>;
}

export default function TailorResume() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const resumeId = params.id as string;

  const [resumeTitle, setResumeTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [assessment, setAssessment] = useState<TailorAssessment | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (!res.ok) throw new Error("Failed to fetch resume");
        const data = await res.json();
        setResumeTitle(data.resume.title);
      } catch (err: any) {
        toast(err.message || "Failed to load resume details", "error");
        router.push("/dashboard");
      } finally {
        setIsLoadingResume(false);
      }
    };
    fetchResume();
  }, [resumeId, router, toast]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast("Please paste a job description first", "warning");
      return;
    }

    setIsAnalyzing(true);
    setAssessment(null);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/billing");
        } else {
          throw new Error(data.error || "Analysis failed");
        }
        return;
      }

      setAssessment(data.assessment);
      toast("ATS analysis complete!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to analyze job description", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTailored = async () => {
    if (!assessment) return;
    setIsApplying(true);

    try {
      const res = await fetch("/api/ai/tailor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          tailoredSummary: assessment.tailoredSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/billing");
        } else {
          throw new Error(data.error || "Failed to generate tailored version");
        }
        return;
      }

      toast("Cloned & tailored resume version generated!", "success");
      router.push(`/editor/${data.resumeId}`);
    } catch (err: any) {
      toast(err.message || "Failed to generate tailored version", "error");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoadingResume) {
    return (
      <div className="h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <Link
            href={`/editor/${resumeId}`}
            className="p-1 hover:bg-neutral-100 rounded-[6px] text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-neutral-200"></div>
          <div>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block leading-none mb-0.5">AI Tailoring Tool</span>
            <h1 className="text-xs font-bold text-neutral-950 leading-none">Optimize: {resumeTitle}</h1>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Form: Job description input */}
        <section className="md:col-span-5 border-r border-neutral-200 p-6 overflow-y-auto flex flex-col">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-neutral-950" />
              <h2 className="font-bold text-neutral-950 text-xs uppercase tracking-wider font-mono">Target Job details</h2>
            </div>
            
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2 font-mono">
              Paste Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="flex-1 w-full min-h-[300px] px-3 py-2 border border-neutral-200 rounded-[6px] text-xs focus:outline-none focus:border-neutral-950 resize-none leading-relaxed placeholder-neutral-400 font-sans"
              placeholder="Paste full description text, including key requirements, skills, and expectations..."
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[6px] text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing resume match...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Analyze Match Score
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Output: Analysis metrics */}
        <section className="md:col-span-7 bg-neutral-50 p-6 overflow-y-auto flex flex-col">
          {!assessment ? (
            /* Idle / Waiting state */
            <div className="flex-1 border border-dashed border-neutral-200 bg-white rounded-[6px] p-12 text-center flex flex-col justify-center items-center">
              <div className="w-10 h-10 border border-neutral-200 text-neutral-950 rounded-[6px] flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-neutral-500" />
              </div>
              <h3 className="font-bold text-neutral-950 text-sm">Ready for analysis</h3>
              <p className="text-neutral-500 text-xs max-w-sm mt-1 leading-normal">
                Paste the job description on the left and click analyze to start checking keyword matches and missing competencies.
              </p>
            </div>
          ) : (
            /* Populated analysis state */
            <div className="space-y-6">
              {/* Top match score row with Progress Bar */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-neutral-950 text-sm">ATS Compatibility</h3>
                    <p className="text-neutral-500 text-[10px] mt-0.5 font-medium">Based on keyword matching and structural parameters.</p>
                  </div>
                  <span className="text-lg font-black text-neutral-950">{assessment.score}% Match</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-[2px] overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900 transition-all duration-500" 
                    style={{ width: `${assessment.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-3">
                <h3 className="font-bold text-neutral-950 text-xs uppercase tracking-wider font-mono">Missing Skills</h3>
                <ul className="list-disc list-inside text-xs text-neutral-700 space-y-1">
                  {assessment.missingKeywords.length > 0 ? (
                    assessment.missingKeywords.slice(0, 8).map((kw, i) => (
                      <li key={i} className="font-medium text-neutral-800">{kw}</li>
                    ))
                  ) : (
                    <li className="text-neutral-450 italic">No missing skills detected!</li>
                  )}
                </ul>
              </div>

              {/* Matching Skills */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-3">
                <h3 className="font-bold text-neutral-950 text-xs uppercase tracking-wider font-mono">Matching Skills</h3>
                <ul className="list-disc list-inside text-xs text-neutral-700 space-y-1">
                  {assessment.matchedKeywords.length > 0 ? (
                    assessment.matchedKeywords.slice(0, 8).map((kw, i) => (
                      <li key={i} className="font-medium text-neutral-850">{kw}</li>
                    ))
                  ) : (
                    <li className="text-neutral-450 italic">No matching skills detected.</li>
                  )}
                </ul>
              </div>

              {/* Suggested Keywords */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-3">
                <h3 className="font-bold text-neutral-950 text-xs uppercase tracking-wider font-mono">Suggested Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.missingKeywords.length > 0 ? (
                    assessment.missingKeywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded-[4px] bg-white">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400 italic">All suggested keywords are already present.</span>
                  )}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-3">
                <h3 className="font-bold text-neutral-950 text-xs uppercase tracking-wider font-mono">AI Recommendations</h3>
                <ul className="list-disc list-inside text-xs text-neutral-700 space-y-2">
                  {assessment.suggestedChanges && assessment.suggestedChanges.length > 0 ? (
                    assessment.suggestedChanges.map((change, i) => (
                      <li key={i} className="leading-relaxed">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-neutral-400 font-mono mr-1">[{change.section}]</span>
                        <span className="font-bold text-neutral-800">{change.action}:</span> {change.details}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="text-neutral-800">Strengthen the professional summary with outcome-driven highlights.</li>
                      <li className="text-neutral-800">Mention cloud deployment experience and specific technology stacks.</li>
                      <li className="text-neutral-800">Quantify project achievements with metrics and percentage metrics.</li>
                      <li className="text-neutral-800">Include measurable business impact for senior roles.</li>
                      <li className="text-neutral-800">Add leadership experience or mentorship bullet points.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Tailoring Summary */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-3">
                <h3 className="font-bold text-neutral-950 text-xs uppercase tracking-wider font-mono">Tailoring Summary</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  {assessment.tailoredSummary || assessment.gapAnalysis}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="text-[10px] text-neutral-400 font-mono">
                  &copy; 2026 Arvo. Barok Labs
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 sm:flex-none py-2 px-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded-[6px] transition-colors"
                  >
                    Regenerate Analysis
                  </button>
                  <button
                    onClick={() => router.push(`/editor/${resumeId}`)}
                    className="flex-1 sm:flex-none py-2 px-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded-[6px] transition-colors"
                  >
                    Download Tailored Resume
                  </button>
                  <button
                    onClick={handleGenerateTailored}
                    disabled={isApplying}
                    className="flex-1 sm:flex-none py-2 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-[6px] transition-colors inline-flex items-center gap-1.5"
                  >
                    {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Apply AI Improvements
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
