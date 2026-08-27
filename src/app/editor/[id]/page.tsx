"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/Toast";
import { TEMPLATES } from "@/lib/templates";
import { buildResumeHTML as generatePdfHtml } from "@/lib/templateGenerator";
import { 
  ArrowLeft, Loader2, User, Briefcase, GraduationCap, 
  Code, FolderGit, Award, Eye, FileText, ChevronUp, 
  ChevronDown, Plus, Trash2, Wand2, Compass, Printer,
  Lock, Send, MessageSquare
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Types matching Schema
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  location: string;
}

interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  description: string;
}

interface SkillCategory {
  id: string;
  category: string;
  items: string[];
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export default function ResumeEditor() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const resumeId = params.id as string;

  // Editor states
  const [title, setTitle] = useState("Untitled Resume");
  const [templateId, setTemplateId] = useState("modern");
  const [content, setContent] = useState<ResumeContent>({
    personalInfo: { firstName: "", lastName: "", email: "", phone: "", website: "", linkedin: "", location: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("saved");
  const [activeTab, setActiveTab] = useState<"inputs" | "preview" | "ai">("inputs");
  const [focusedSection, setFocusedSection] = useState<keyof ResumeContent | "general">("general");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  // AI sidebar states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [previousContent, setPreviousContent] = useState<ResumeContent | null>(null);

  // Conversational AI chat state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Template select modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [skillsInputs, setSkillsInputs] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch subscription info for template lock checking
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok && data.user) {
          setUserProfile(data.user);
        }
      } catch {
        // Ignore
      }
    };
    fetchProfile();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Export configurations and state hooks
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx">("pdf");
  const [paperSize, setPaperSize] = useState<"a4" | "letter">("a4");
  const [margins, setMargins] = useState<"narrow" | "standard" | "wide">("standard");
  const [fontSize, setFontSize] = useState<"small" | "standard" | "large">("standard");
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeHyperlinks, setIncludeHyperlinks] = useState(true);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  // Dynamic pages state
  const [pages, setPages] = useState<any[][]>([]);
  const [zoomScale, setZoomScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const isFirstLoad = useRef(true);

  // Fetch resume data
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (!res.ok) throw new Error("Failed to load resume");
        
        const data = await res.json();
        setTitle(data.resume.title);
        setTemplateId(data.resume.templateId);
        
        let raw = data.resume.content;
        if (typeof raw === "string") {
          raw = JSON.parse(raw);
        }

        // ── Defensive normalizer ──────────────────────────────────────────
        // Handles both the editor's own schema AND old Gemini snake_case output.
        const pi = raw?.personalInfo || raw?.personal_info || {};
        const nameParts = ((pi.full_name || "") as string).trim().split(" ");
        const normalised: ResumeContent = {
          personalInfo: {
            firstName: pi.firstName || nameParts[0] || "",
            lastName:  pi.lastName  || nameParts.slice(1).join(" ") || "",
            email:    pi.email    || "",
            phone:    pi.phone    || "",
            website:  pi.website  || pi.portfolio_url || "",
            linkedin: pi.linkedin_url || "",
            location: pi.location || "",
          },
          summary: raw?.summary || "",
          experience: (raw?.experience || []).map((e: any) => ({
            id:          e.id || Math.random().toString(36).substring(2, 9),
            company:     e.company    || "",
            position:    e.position   || e.job_title || "",
            location:    e.location   || "",
            startDate:   e.startDate  || e.start_date || "",
            endDate:     e.endDate    || e.end_date   || "",
            current:     e.current    ?? (e.end_date || e.endDate || "").toLowerCase() === "present",
            description: typeof e.description === "string"
              ? e.description
              : Array.isArray(e.highlights) ? e.highlights.join("\n") : "",
          })),
          education: (raw?.education || []).map((e: any) => ({
            id:             e.id || Math.random().toString(36).substring(2, 9),
            institution:    e.institution   || "",
            degree:         e.degree        || "",
            fieldOfStudy:   e.fieldOfStudy  || e.field_of_study || "",
            graduationDate: e.graduationDate || e.end_date || "",
            description:    typeof e.description === "string"
              ? e.description
              : Array.isArray(e.details) ? e.details.join("\n") : "",
          })),
          // Skills: handle string[], {category,items}[], or old Gemini raw objects
          skills: (() => {
            const rawSkills = raw?.skills || [];
            if (!rawSkills.length) return [];
            if (typeof rawSkills[0] === "string") {
              return [{ id: Math.random().toString(36).substring(2, 9), category: "Skills", items: rawSkills as string[] }];
            }
            return rawSkills.map((s: any) => ({
              id:       s.id       || Math.random().toString(36).substring(2, 9),
              category: s.category || s.name || "Skills",
              items:    Array.isArray(s.items)  ? s.items
                      : Array.isArray(s.skills) ? s.skills
                      : [],
            }));
          })(),
          projects: (raw?.projects || []).map((p: any) => ({
            id:           p.id || Math.random().toString(36).substring(2, 9),
            name:         p.name        || "",
            description:  typeof p.description === "string"
              ? p.description
              : Array.isArray(p.highlights) ? p.highlights.join("\n") : "",
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            url:          p.url || p.link || "",
          })),
          certifications: (raw?.certifications || []).map((c: any) => ({
            id:     c.id     || Math.random().toString(36).substring(2, 9),
            name:   c.name   || "",
            issuer: c.issuer || "",
            date:   c.date   || "",
          })),
        };
        // ─────────────────────────────────────────────────────────────────

        setContent(normalised);

        const inputs: Record<string, string> = {};
        normalised.skills.forEach((s) => {
          inputs[s.id] = s.items.join(", ");
        });
        setSkillsInputs(inputs);
      } catch (err: any) {
        toast(err.message || "Failed to load resume", "error");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isFirstLoad.current = false;
        }, 300);
      }
    };

    fetchResume();
  }, [resumeId, router, toast]);


  // Debounced Autosave effect
  useEffect(() => {
    if (isFirstLoad.current) return;

    setSaveStatus("saving");
    const saveTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            templateId,
            content,
          }),
        });

        if (!res.ok) throw new Error("Auto-save failed");
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
        toast("Autosave failed. Check your connection.", "warning");
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [content, title, templateId, resumeId, toast]);

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setContent((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const moveItem = (section: "experience" | "education" | "skills" | "projects" | "certifications", index: number, direction: "up" | "down") => {
    setContent((prev) => {
      const items = [...prev[section]] as any[];
      if (direction === "up" && index > 0) {
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;
      } else if (direction === "down" && index < items.length - 1) {
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;
      }
      return { ...prev, [section]: items };
    });
  };

  const addExperience = () => {
    setContent((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Math.random().toString(36).substring(2, 9),
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }));
    setFocusedSection("experience");
  };

  const removeExperience = (index: number) => {
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    setContent((prev) => {
      const newList = [...prev.experience];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, experience: newList };
    });
  };

  const addEducation = () => {
    setContent((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Math.random().toString(36).substring(2, 9),
          institution: "",
          degree: "",
          fieldOfStudy: "",
          graduationDate: "",
          description: "",
        },
      ],
    }));
    setFocusedSection("education");
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: any) => {
    setContent((prev) => {
      const newList = [...prev.education];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, education: newList };
    });
  };

  const addSkillCategory = () => {
    const id = Math.random().toString(36).substring(2, 9);
    setSkillsInputs(prev => ({ ...prev, [id]: "" }));
    setContent((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id,
          category: "",
          items: [],
        },
      ],
    }));
    setFocusedSection("skills");
  };

  const updateSkillCategory = (index: number, category: string) => {
    setContent((prev) => {
      const newList = [...prev.skills];
      newList[index] = { ...newList[index], category };
      return { ...prev, skills: newList };
    });
  };

  const updateSkillItems = (index: number, id: string, itemsString: string) => {
    setSkillsInputs(prev => ({ ...prev, [id]: itemsString }));
    setContent((prev) => {
      const newList = [...prev.skills];
      newList[index] = { 
        ...newList[index], 
        items: itemsString.split(",").map(i => i.trim()).filter(Boolean) 
      };
      return { ...prev, skills: newList };
    });
  };

  const addProject = () => {
    setContent((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: "",
          description: "",
          technologies: [],
          url: "",
        },
      ],
    }));
    setFocusedSection("projects");
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: any) => {
    setContent((prev) => {
      const newList = [...prev.projects];
      if (field === "technologies") {
        newList[index] = { 
          ...newList[index], 
          technologies: value.split(",").map((i: string) => i.trim()).filter(Boolean)
        };
      } else {
        newList[index] = { ...newList[index], [field]: value };
      }
      return { ...prev, projects: newList };
    });
  };

  const addCertification = () => {
    setContent((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: "",
          issuer: "",
          date: "",
        },
      ],
    }));
    setFocusedSection("certifications");
  };

  const updateCertification = (index: number, field: keyof CertificationItem, value: any) => {
    setContent((prev) => {
      const newList = [...prev.certifications];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, certifications: newList };
    });
  };

  // AI Actions
  const handleAIImprove = async () => {
    setIsGenerating(true);
    setAiResult("");
    
    let contentToImprove = "";
    if (focusedSection === "summary") {
      contentToImprove = content.summary;
    } else if (focusedSection === "experience" && content.experience.length > 0) {
      const idx = focusedIndex !== null && focusedIndex < content.experience.length ? focusedIndex : 0;
      const e = content.experience[idx];
      contentToImprove = `${e.position} at ${e.company}: ${e.description}`;
    } else if (focusedSection === "projects" && content.projects.length > 0) {
      const idx = focusedIndex !== null && focusedIndex < content.projects.length ? focusedIndex : 0;
      const p = content.projects[idx];
      contentToImprove = `${p.name}: ${p.description}`;
    } else if (focusedSection === "education" && content.education.length > 0) {
      const idx = focusedIndex !== null && focusedIndex < content.education.length ? focusedIndex : 0;
      const edu = content.education[idx];
      contentToImprove = `${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}: ${edu.description || ""}`;
    } else if (focusedSection === "certifications" && content.certifications.length > 0) {
      const idx = focusedIndex !== null && focusedIndex < content.certifications.length ? focusedIndex : 0;
      const c = content.certifications[idx];
      contentToImprove = `${c.name} issued by ${c.issuer}`;
    } else if (focusedSection === "skills" && content.skills.length > 0) {
      const idx = focusedIndex !== null && focusedIndex < content.skills.length ? focusedIndex : 0;
      const s = content.skills[idx];
      contentToImprove = `${s.category}: ${s.items.join(", ")}`;
    } else {
      contentToImprove = content.summary || "General profile metrics";
    }

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: focusedSection,
          content: contentToImprove,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/dashboard/billing");
        } else {
          throw new Error(data.error || "AI failed");
        }
        return;
      }

      setAiResult(data.result);
      toast("AI optimization complete", "success");
    } catch (err: any) {
      toast(err.message || "Failed to call AI assistant", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISummary = async () => {
    setIsGenerating(true);
    setAiResult("");
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSummary: content.summary,
          skills: content.skills.map(s => s.items).flat(),
          experienceSummary: content.experience.map(e => `${e.position} at ${e.company}`).join(", "),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          toast(data.error, "warning", 6000);
          router.push("/dashboard/billing");
        } else {
          throw new Error(data.error || "AI failed");
        }
        return;
      }

      setAiResult(data.result);
      toast("AI Professional summary generated", "success");
    } catch (err: any) {
      toast(err.message || "Failed to generate summary", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Conversational AI chat handler
  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const instruction = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: instruction }]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvJson: content, instruction }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          setChatMessages(prev => [...prev, { role: "assistant", text: "⚠️ AI limit reached. Upgrade to Pro for unlimited uses." }]);
          router.push("/billing");
        } else {
          setChatMessages(prev => [...prev, { role: "assistant", text: `Error: ${data.error || "AI request failed."}` }]);
        }
        return;
      }

      // Apply updated CV to editor state
      if (data.updatedCv) {
        setPreviousContent(content);
        setContent(prev => ({
          ...prev,
          ...data.updatedCv,
        }));
      }

      setChatMessages(prev => [...prev, { role: "assistant", text: data.assistantMessage || "Done! Your resume has been updated." }]);
      toast("Resume updated by AI", "success");
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const ghostRef = useRef<HTMLDivElement>(null);

  // Dynamic layout partition calculation
  useEffect(() => {
    const performPagination = () => {
      if (!ghostRef.current) return;
      const elements = ghostRef.current.querySelectorAll("[data-page-element]");
      if (elements.length === 0) return;

      const pageHeight = paperSize === "a4" ? 1122 : 1056;
      let padding = 76; // standard (20mm)
      if (margins === "narrow") padding = 38; // 10mm
      if (margins === "wide") padding = 113; // 30mm

      const usableHeight = pageHeight - (padding * 2) - 15; // safe padding
      const tempPages: any[][] = [[]];
      let currentHeight = 0;

      elements.forEach((el: any) => {
        const h = el.offsetHeight;
        const type = el.getAttribute("data-page-element-type");
        const idx = el.getAttribute("data-page-element-index");

        const item = { type, index: idx ? parseInt(idx) : undefined };
        const isFirstInPage = tempPages[tempPages.length - 1].length === 0;
        const spacing = isFirstInPage ? 0 : 16; // gap-4 = 16px

        if (currentHeight + h + spacing > usableHeight) {
          tempPages.push([item]);
          currentHeight = h;
        } else {
          if (type.startsWith("sectionHeader") && (usableHeight - (currentHeight + h + spacing) < 100)) {
            tempPages.push([item]);
            currentHeight = h;
          } else {
            tempPages[tempPages.length - 1].push(item);
            currentHeight += h + spacing;
          }
        }
      });

      setPages(tempPages);
    };

    // Use requestAnimationFrame + timeout to ensure fonts are loaded and layout is settled
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(performPagination);
    }, 300);
    window.addEventListener("resize", performPagination);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", performPagination);
    };
  }, [content, templateId, paperSize, margins]);

  useEffect(() => {
    const handleZoomResize = () => {
      if (!previewContainerRef.current) return;
      const parent = previewContainerRef.current.parentElement;
      if (!parent) return;

      const padding = 64; // p-8 is 32px left + 32px right
      const parentWidth = parent.clientWidth - padding;
      const pageWidth = paperSize === "a4" ? 794 : 816; // 210mm or 216mm in pixels

      if (parentWidth < pageWidth) {
        setZoomScale(parentWidth / pageWidth);
      } else {
        setZoomScale(1);
      }
    };

    handleZoomResize();
    window.addEventListener("resize", handleZoomResize);
    return () => window.removeEventListener("resize", handleZoomResize);
  }, [paperSize, activeTab, pages]);



  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setExportProgress("Preparing document...");

    await new Promise(r => setTimeout(r, 200));

    if (exportFormat === "pdf") {
      setExportProgress("Generating PDF...");
      try {
        const res = await fetch("/api/resumes/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            content,
            margins,
            paperSize,
            fontSize,
            title,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const errMsg = err.error || "Export failed";
          toast("PDF generation failed: " + errMsg, "error");
          setShowExportModal(false);
          setExportProgress("");
          return;
        }

        // Stream the PDF blob and trigger a native download — no dialog
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(title || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportProgress("Done!");
        await new Promise(r => setTimeout(r, 300));
      } catch (err: any) {
        console.error("PDF generation failed:", err);
        toast(err.message || "Failed to generate PDF", "error");
      } finally {
        setExportProgress(null);
        setShowExportModal(false);
      }
    }
  };

  const renderPageItem = (item: any, key: any) => {
    switch (item.type) {
      case "header":
        return (
          <div key={key} className={activeTemplate.header}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const [first = "", last = ""] = e.target.innerText.split(" ");
                updatePersonalInfo("firstName", first);
                updatePersonalInfo("lastName", last);
              }}
              className={activeTemplate.nameText}
            >
              {content.personalInfo.firstName || "Your"} {content.personalInfo.lastName || "Name"}
            </div>

            {content.summary && (
              <div className={activeTemplate.tagline}>
                Resume Highlights
              </div>
            )}

            <div className={activeTemplate.contactRow}>
              {content.personalInfo.email && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("personalInfo", 0, "email", e.target.innerText)}
                  className={activeTemplate.contactItem}
                >
                  {content.personalInfo.email}
                </span>
              )}
              {content.personalInfo.phone && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("personalInfo", 0, "phone", e.target.innerText)}
                  className={activeTemplate.contactItem}
                >
                  {content.personalInfo.phone}
                </span>
              )}
              {content.personalInfo.location && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("personalInfo", 0, "location", e.target.innerText)}
                  className={activeTemplate.contactItem}
                >
                  {content.personalInfo.location}
                </span>
              )}
              {content.personalInfo.website && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("personalInfo", 0, "website", e.target.innerText)}
                  className={activeTemplate.contactItem}
                >
                  {content.personalInfo.website}
                </span>
              )}
              {content.personalInfo.linkedin && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInlineEdit("personalInfo", 0, "linkedin", e.target.innerText)}
                  className={activeTemplate.contactItem}
                >
                  {content.personalInfo.linkedin}
                </span>
              )}
            </div>
          </div>
        );
      case "summary":
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("summary", 0, "summary", e.target.innerText)}
              className="text-xs leading-relaxed whitespace-pre-wrap outline-none"
            >
              {content.summary}
            </p>
          </div>
        );
      case "sectionHeader-experience":
        return (
          <div key={key} className={activeTemplate.sectionHeader}>
            <h4 className={activeTemplate.sectionTitle}>Work Experience</h4>
            <div className={activeTemplate.sectionDivider}></div>
          </div>
        );
      case "experienceItem":
        const exp = content.experience[item.index];
        if (!exp) return null;
        return (
          <div key={key} className={activeTemplate.experienceItem}>
            <div className={activeTemplate.itemHeader}>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("experience", item.index, "position", e.target.innerText)}
                className={activeTemplate.itemTitle}
              >
                {exp.position || "Position Title"}
              </div>
              <div className={activeTemplate.itemDate}>
                {exp.startDate || "Start"} — {exp.current ? "Present" : exp.endDate || "End"}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("experience", item.index, "company", e.target.innerText)}
                className={activeTemplate.itemSub}
              >
                {exp.company || "Company Name"}
              </span>
            </div>

            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("experience", item.index, "description", e.target.innerText)}
              className={activeTemplate.itemDesc}
            >
              {exp.description || "Achievements..."}
            </p>
          </div>
        );
      case "sectionHeader-education":
        return (
          <div key={key} className={activeTemplate.sectionHeader}>
            <h4 className={activeTemplate.sectionTitle}>Education</h4>
            <div className={activeTemplate.sectionDivider}></div>
          </div>
        );
      case "educationItem":
        const edu = content.education[item.index];
        if (!edu) return null;
        return (
          <div key={key} className="text-xs">
            <div className="flex justify-between items-baseline font-bold text-neutral-850">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("education", item.index, "institution", e.target.innerText)}
              >
                {edu.institution || "Institution"}
              </span>
              <span className="text-muted-foreground font-medium tabular-nums">{edu.graduationDate}</span>
            </div>
            <div className="text-muted-foreground italic">
              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
            </div>
          </div>
        );
      case "sectionHeader-skills":
        return (
          <div key={key} className={activeTemplate.sectionHeader}>
            <h4 className={activeTemplate.sectionTitle}>Skills</h4>
            <div className={activeTemplate.sectionDivider}></div>
          </div>
        );
      case "skills":
        return (
          <div key={key} className={activeTemplate.skillsGrid}>
            {content.skills.map((skill) => (
              <div key={skill.id} className="text-xs">
                <span className={activeTemplate.skillCategory}>{skill.category}: </span>
                <div className="inline-block">
                  {skill.items.map((item, i) => (
                    <span key={i} className={activeTemplate.skillBadge}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case "sectionHeader-projects":
        return (
          <div key={key} className={activeTemplate.sectionHeader}>
            <h4 className={activeTemplate.sectionTitle}>Projects</h4>
            <div className={activeTemplate.sectionDivider}></div>
          </div>
        );
      case "projectItem":
        const proj = content.projects[item.index];
        if (!proj) return null;
        return (
          <div key={key} className="text-xs">
            <div className="flex justify-between font-bold text-neutral-850">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineEdit("projects", item.index, "name", e.target.innerText)}
              >
                {proj.name || "Project Name"}
              </span>
              {proj.url && <span className="text-muted-foreground font-mono text-[10px]">{proj.url}</span>}
            </div>
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleInlineEdit("projects", item.index, "description", e.target.innerText)}
              className="text-muted-foreground text-xs mt-1 leading-normal"
            >
              {proj.description || "Project description..."}
            </p>
          </div>
        );
      case "sectionHeader-certifications":
        return (
          <div key={key} className={activeTemplate.sectionHeader}>
            <h4 className={activeTemplate.sectionTitle}>Certifications</h4>
            <div className={activeTemplate.sectionDivider}></div>
          </div>
        );
      case "certificationItem":
        const cert = content.certifications[item.index];
        if (!cert) return null;
        return (
          <div key={key} className="flex justify-between text-xs text-foreground">
            <div>
              <span className="font-bold">{cert.name}</span> — <span>{cert.issuer}</span>
            </div>
            <span className="text-muted-foreground tabular-nums">{cert.date}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleUndoAIChange = () => {
    if (!previousContent) return;
    setContent(previousContent);
    setPreviousContent(null);
    toast("Undid applied AI suggestion changes", "success");
  };

  const applyAIChange = () => {
    if (!aiResult) return;
    const targetIdx = focusedIndex !== null ? focusedIndex : 0;
    setPreviousContent(JSON.parse(JSON.stringify(content)));

    if (focusedSection === "summary") {
      setContent(prev => ({ ...prev, summary: aiResult }));
      toast("Applied AI summary successfully", "success");
    } else if (focusedSection === "experience") {
      if (content.experience.length === 0) {
        toast("Please add an experience item first", "warning");
        return;
      }
      setContent(prev => {
        const newList = [...prev.experience];
        const idx = targetIdx < newList.length ? targetIdx : 0;
        newList[idx] = { ...newList[idx], description: aiResult };
        return { ...prev, experience: newList };
      });
      toast(`Applied AI improvements to experience item #${targetIdx + 1}`, "success");
    } else if (focusedSection === "projects") {
      if (content.projects.length === 0) {
        toast("Please add a project item first", "warning");
        return;
      }
      setContent(prev => {
        const newList = [...prev.projects];
        const idx = targetIdx < newList.length ? targetIdx : 0;
        newList[idx] = { ...newList[idx], description: aiResult };
        return { ...prev, projects: newList };
      });
      toast(`Applied AI improvements to project #${targetIdx + 1} description`, "success");
    } else if (focusedSection === "skills") {
      if (content.skills.length === 0) {
        toast("Please add a skill category first", "warning");
        return;
      }
      setContent(prev => {
        const newList = [...prev.skills];
        const idx = targetIdx < newList.length ? targetIdx : 0;
        newList[idx] = { 
          ...newList[idx], 
          items: aiResult.split(",").map(i => i.trim()).filter(Boolean) 
        };
        return { ...prev, skills: newList };
      });
      toast(`Applied AI skills list to category #${targetIdx + 1}`, "success");
    } else if (focusedSection === "certifications") {
      if (content.certifications.length === 0) {
        toast("Please add a certification first", "warning");
        return;
      }
      setContent(prev => {
        const newList = [...prev.certifications];
        const idx = targetIdx < newList.length ? targetIdx : 0;
        newList[idx] = { ...newList[idx], name: aiResult };
        return { ...prev, certifications: newList };
      });
      toast(`Applied AI improvements to certification #${targetIdx + 1} name`, "success");
    } else if (focusedSection === "education") {
      if (content.education.length === 0) {
        toast("Please add education details first", "warning");
        return;
      }
      setContent(prev => {
        const newList = [...prev.education];
        const idx = targetIdx < newList.length ? targetIdx : 0;
        newList[idx] = { ...newList[idx], description: aiResult };
        return { ...prev, education: newList };
      });
      toast(`Applied AI education description to item #${targetIdx + 1}`, "success");
    } else {
      toast("Copy the text from the AI panel and paste it directly into your desired fields.", "info");
    }
  };

  const handleInlineEdit = (section: string, index: number, field: string, value: string) => {
    setContent((prev: any) => {
      if (section === "personalInfo") {
        return {
          ...prev,
          personalInfo: { ...prev.personalInfo, [field]: value }
        };
      }
      if (section === "summary") {
        return { ...prev, summary: value };
      }
      
      const list = [...prev[section]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
    });
  };

  const activeTemplate = TEMPLATES[templateId] || TEMPLATES.modern;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-foreground mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden text-foreground font-sans">
      {/* Editor Header */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/resumes" className="p-1 hover:bg-surface rounded-[4px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-neutral-200"></div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-bold text-foreground text-xs focus:outline-none focus:bg-surface px-2 py-1 rounded border border-transparent hover:border-border transition-colors w-48 sm:w-64"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && <span className="text-red-650">Error</span>}
          </span>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-foreground bg-background hover:bg-surface border border-border px-2.5 py-1.5 rounded-[4px] uppercase tracking-wider transition-colors"
          >
            Template: {templateId}
          </button>

          <Link
            href={`/tailor/${resumeId}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-neutral-900 hover:bg-black px-2.5 py-1.5 rounded-[4px] uppercase tracking-wider transition-colors"
          >
            Tailor Layout
          </Link>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-neutral-900 hover:bg-black px-2.5 py-1.5 rounded-[4px] uppercase tracking-wider transition-colors"
            title="Export Resume"
          >
            Export
          </button>
          
          <div className="w-px h-4 bg-neutral-200 mx-1"></div>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Tab Selectors */}
      <div className="sm:hidden grid grid-cols-3 border-b border-border bg-background h-11 shrink-0">
        <button
          onClick={() => setActiveTab("inputs")}
          className={`text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${
            activeTab === "inputs" ? "text-foreground border-b border-neutral-900 bg-surface" : "text-muted-foreground"
          }`}
        >
          Inputs
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${
            activeTab === "preview" ? "text-foreground border-b border-neutral-900 bg-surface" : "text-muted-foreground"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${
            activeTab === "ai" ? "text-foreground border-b border-neutral-900 bg-surface" : "text-muted-foreground"
          }`}
        >
          AI Optimize
        </button>
      </div>

      {/* Workspace columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Data inputs */}
        <section
          className={`w-full md:w-[28%] border-r border-border bg-background flex flex-col overflow-y-auto p-5 ${
            activeTab === "inputs" ? "block" : "hidden md:block"
          }`}
          onClick={() => setFocusedSection("general")}
        >
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-3" onClick={(e) => { e.stopPropagation(); setFocusedSection("personalInfo"); }}>
              <div className="flex items-center gap-1.5 border-b border-border pb-2">
                <User className="w-3.5 h-3.5 text-foreground" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Personal Info</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">First Name</label>
                  <input
                    type="text"
                    value={content.personalInfo.firstName}
                    onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Last Name</label>
                  <input
                    type="text"
                    value={content.personalInfo.lastName}
                    onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={content.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Phone</label>
                  <input
                    type="text"
                    value={content.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    value={content.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Website</label>
                  <input
                    type="text"
                    value={content.personalInfo.website}
                    onChange={(e) => updatePersonalInfo("website", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                    placeholder="portfolio.com"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">LinkedIn</label>
                  <input
                    type="text"
                    value={content.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2" onClick={(e) => { e.stopPropagation(); setFocusedSection("summary"); }}>
              <div className="flex items-center gap-1.5 border-b border-border pb-2">
                <Wand2 className="w-3.5 h-3.5 text-foreground" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Summary</h3>
              </div>
              <textarea
                value={content.summary}
                onChange={(e) => setContent(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full h-24 px-2.5 py-1.5 border border-border rounded-[6px] text-xs focus:ring-1 focus:ring-neutral-900 bg-background resize-none leading-relaxed"
                placeholder="Brief professional profile..."
              />
            </div>

            {/* Experience */}
            <div className="space-y-3" onClick={(e) => { e.stopPropagation(); setFocusedSection("experience"); }}>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-foreground" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Experience</h3>
                </div>
                <button
                  onClick={addExperience}
                  className="text-[10px] text-foreground hover:underline font-bold"
                >
                  + Add
                </button>
              </div>

              {content.experience.map((exp, idx) => (
                <div 
                  key={exp.id} 
                  onClick={(e) => { e.stopPropagation(); setFocusedSection("experience"); setFocusedIndex(idx); }}
                  className={`border rounded-[6px] p-3 space-y-2 relative bg-surface transition-all ${
                    focusedSection === "experience" && focusedIndex === idx ? "border-neutral-900 ring-1 ring-neutral-900" : "border-border"
                  }`}
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button onClick={() => moveItem("experience", idx, "up")} className="p-0.5 hover:bg-surface rounded text-muted-foreground">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveItem("experience", idx, "down")} className="p-0.5 hover:bg-surface rounded text-muted-foreground">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeExperience(idx)} className="p-0.5 hover:bg-red-55 rounded text-muted-foreground hover:text-red-750">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="pr-12">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, "company", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(idx, "position", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                        className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                        placeholder="YYYY-MM"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">End Date</label>
                      <input
                        type="text"
                        disabled={exp.current}
                        value={exp.current ? "" : exp.endDate}
                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                        className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background disabled:opacity-50"
                        placeholder="YYYY-MM"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id={`curr-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => updateExperience(idx, "current", e.target.checked)}
                      className="rounded border-neutral-300 text-foreground"
                    />
                    <label htmlFor={`curr-${exp.id}`} className="text-[10px] font-medium text-muted-foreground">
                      Current Position
                    </label>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, "description", e.target.value)}
                      className="w-full h-20 mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background resize-none leading-normal"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-3" onClick={(e) => { e.stopPropagation(); setFocusedSection("education"); }}>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-foreground" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Education</h3>
                </div>
                <button
                  onClick={addEducation}
                  className="text-[10px] text-foreground hover:underline font-bold"
                >
                  + Add
                </button>
              </div>

              {content.education.map((edu, idx) => (
                <div 
                  key={edu.id} 
                  onClick={(e) => { e.stopPropagation(); setFocusedSection("education"); setFocusedIndex(idx); }}
                  className={`border rounded-[6px] p-3 space-y-2 relative bg-surface transition-all ${
                    focusedSection === "education" && focusedIndex === idx ? "border-neutral-900 ring-1 ring-neutral-900" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setContent(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))}
                    className="absolute top-2 right-2 p-0.5 hover:bg-red-55 rounded text-muted-foreground"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="pr-10">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Field</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(idx, "fieldOfStudy", e.target.value)}
                        className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Graduation Date</label>
                      <input
                        type="text"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(idx, "graduationDate", e.target.value)}
                        className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                        placeholder="YYYY-MM"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-3" onClick={(e) => { e.stopPropagation(); setFocusedSection("skills"); }}>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-foreground" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Skills</h3>
                </div>
                <button
                  onClick={addSkillCategory}
                  className="text-[10px] text-foreground hover:underline font-bold"
                >
                  + Add Category
                </button>
              </div>

              {content.skills.map((skill, idx) => (
                <div 
                  key={skill.id} 
                  onClick={(e) => { e.stopPropagation(); setFocusedSection("skills"); setFocusedIndex(idx); }}
                  className={`border rounded-[6px] p-3 space-y-2 relative bg-surface transition-all ${
                    focusedSection === "skills" && focusedIndex === idx ? "border-neutral-900 ring-1 ring-neutral-900" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setContent(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}
                    className="absolute top-2 right-2 p-0.5 hover:bg-red-55 rounded text-muted-foreground"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="pr-10">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                    <input
                      type="text"
                      value={skill.category}
                      onChange={(e) => updateSkillCategory(idx, e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                      placeholder="e.g. Languages"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Items (comma separated)</label>
                    <input
                      type="text"
                      value={skillsInputs[skill.id] !== undefined ? skillsInputs[skill.id] : skill.items.join(", ")}
                      onChange={(e) => updateSkillItems(idx, skill.id, e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                      placeholder="React, Vue, Angular"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="space-y-3" onClick={(e) => { e.stopPropagation(); setFocusedSection("projects"); }}>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <FolderGit className="w-3.5 h-3.5 text-foreground" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Projects</h3>
                </div>
                <button
                  onClick={addProject}
                  className="text-[10px] text-foreground hover:underline font-bold"
                >
                  + Add
                </button>
              </div>

              {content.projects.map((proj, idx) => (
                <div 
                  key={proj.id} 
                  onClick={(e) => { e.stopPropagation(); setFocusedSection("projects"); setFocusedIndex(idx); }}
                  className={`border rounded-[6px] p-3 space-y-2 relative bg-surface transition-all ${
                    focusedSection === "projects" && focusedIndex === idx ? "border-neutral-900 ring-1 ring-neutral-900" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setContent(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))}
                    className="absolute top-2 right-2 p-0.5 hover:bg-red-55 rounded text-muted-foreground"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="pr-10">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(idx, "name", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.technologies.join(", ")}
                      onChange={(e) => updateProject(idx, "technologies", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">URL</label>
                    <input
                      type="text"
                      value={proj.url}
                      onChange={(e) => updateProject(idx, "url", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                    <textarea
                      value={proj.description}
                      onChange={(e) => updateProject(idx, "description", e.target.value)}
                      className="w-full h-16 mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background resize-none leading-normal"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-3" onClick={(e) => { e.stopPropagation(); setFocusedSection("certifications"); }}>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-foreground" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Certifications</h3>
                </div>
                <button
                  onClick={addCertification}
                  className="text-[10px] text-foreground hover:underline font-bold"
                >
                  + Add
                </button>
              </div>

              {content.certifications.map((cert, idx) => (
                <div 
                  key={cert.id} 
                  onClick={(e) => { e.stopPropagation(); setFocusedSection("certifications"); setFocusedIndex(idx); }}
                  className={`border rounded-[6px] p-3 space-y-2 relative bg-surface transition-all ${
                    focusedSection === "certifications" && focusedIndex === idx ? "border-neutral-900 ring-1 ring-neutral-900" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setContent(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }))}
                    className="absolute top-2 right-2 p-0.5 hover:bg-red-55 rounded text-muted-foreground"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="pr-10">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Certification</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(idx, "name", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => updateCertification(idx, "date", e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 border border-border rounded-[6px] text-xs bg-background"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: Live Interactive Preview */}
        <section
          className={`flex-1 bg-surface/40 p-8 overflow-y-auto overflow-x-hidden flex justify-center ${
            activeTab === "preview" ? "block" : "hidden sm:flex"
          }`}
        >


          {/* Active Paginated Resume Preview */}
          <div 
            ref={previewContainerRef}
            className="flex flex-col gap-8 items-center print-area-wrapper py-4 origin-top transition-transform duration-150"
            style={{
              transform: `scale(${zoomScale})`,
              width: paperSize === "a4" ? "210mm" : "215.9mm",
              height: pages.length > 0 
                ? `${((paperSize === "a4" ? 1122 : 1056) * pages.length + 32 * (pages.length - 1) + 32) * zoomScale}px` 
                : "auto"
            }}
          >
            {pages.length > 0 ? (
              pages.map((pageItems, pageIdx) => (
                <div
                  key={pageIdx}
                  className={`relative ${paperSize === "a4" ? "page-a4" : "page-letter"} ${
                    margins === "narrow" ? "margin-narrow" : margins === "wide" ? "margin-wide" : "margin-standard"
                  } ${activeTemplate.container} flex flex-col shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border overflow-hidden bg-background`}
                >
                  <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {pageItems.map((item, itemIdx) => renderPageItem(item, itemIdx))}
                  </div>

                  {includePageNumbers && (
                    <div className="absolute bottom-4 right-6 text-[9px] text-muted-foreground font-mono tracking-widest uppercase">
                      Page {pageIdx + 1} of {pages.length}
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Fallback before first measurement */
              <div
                className={`relative ${paperSize === "a4" ? "page-a4" : "page-letter"} ${
                  margins === "narrow" ? "margin-narrow" : margins === "wide" ? "margin-wide" : "margin-standard"
                } ${activeTemplate.container} flex flex-col shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border overflow-hidden bg-background`}
              >
                <div className="flex-1 flex flex-col gap-4">
                  {renderPageItem({ type: "header" }, "fallback-hdr")}
                  {content.summary && renderPageItem({ type: "summary" }, "fallback-sum")}
                </div>
              </div>
            )}
          </div>


        </section>

        {/* RIGHT COLUMN: AI Sidebar */}
        <section
          className={`w-full md:w-[27%] border-l border-border bg-background flex flex-col overflow-y-auto p-5 ${
            activeTab === "ai" ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">AI Optimizer</h3>
          </div>

          <div className="space-y-5">
            <div className="bg-surface border border-border rounded-[6px] p-3.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase block tracking-wider">Active Scope</label>
              <div className="text-xs font-bold text-foreground mt-1">
                {focusedSection.toUpperCase()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-normal">
                Click any input form fields on the left to redirect active AI optimization.
              </p>
            </div>

            <div className="space-y-2">
              {focusedSection === "summary" ? (
                <button
                  onClick={handleAISummary}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black px-3.5 py-2 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Generate summary
                </button>
              ) : (
                <button
                  onClick={handleAIImprove}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground bg-surface hover:bg-surface border border-border px-3.5 py-2 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Improve section
                </button>
              )}
            </div>

            {aiResult && (
              <div className="border border-border rounded-[6px] p-3.5 space-y-3 bg-surface">
                <label className="text-[9px] font-bold text-foreground uppercase">AI Recommendation</label>
                <div className="text-xs text-foreground leading-normal whitespace-pre-wrap select-all font-medium">
                  {aiResult}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={applyAIChange}
                    className="flex-1 text-[10px] font-bold text-white bg-neutral-900 hover:bg-black py-1.5 rounded-[4px] transition-colors"
                  >
                    Apply Changes
                  </button>
                  {previousContent && (
                    <button
                      onClick={handleUndoAIChange}
                      className="text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-[4px] transition-colors"
                      title="Undo applied changes"
                    >
                      Undo
                    </button>
                  )}
                  <button
                    onClick={() => setAiResult("")}
                    className="text-[10px] font-bold text-muted-foreground hover:text-neutral-950 px-2 py-1.5 rounded-[4px] hover:bg-surface"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-5 space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Job Tailoring</label>
              <Link
                href={`/tailor/${resumeId}`}
                className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-foreground bg-background hover:bg-surface border border-border py-2 rounded-[6px] transition-colors text-center"
              >
                <Compass className="w-3.5 h-3.5" />
                Open Tailor Panel
              </Link>
            </div>

            {/* Conversational AI Chat */}
            <div className="border-t border-border pt-5 space-y-3">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AI Chat Editor</label>
              </div>

              <div className="bg-surface border border-border rounded-[6px] min-h-[120px] max-h-[240px] overflow-y-auto p-3 space-y-2">
                {chatMessages.length === 0 && (
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Tell me what to change. E.g. &ldquo;Make my summary more impactful&rdquo; or &ldquo;Add Python to my skills&rdquo;.
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`text-[10px] leading-relaxed ${
                    msg.role === "user"
                      ? "text-foreground font-semibold text-right"
                      : "text-muted-foreground font-medium"
                  }`}>
                    {msg.role === "assistant" && <span className="text-muted-foreground mr-1">Arvo:</span>}
                    {msg.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Ask Arvo to edit your CV..."
                  className="flex-1 px-2.5 py-1.5 border border-border rounded-[6px] text-xs bg-background focus:outline-none focus:border-neutral-400"
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleChatSend}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-1.5 bg-neutral-900 hover:bg-black text-white rounded-[6px] transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {previousContent && chatMessages.length > 0 && (
                <button
                  onClick={() => { setContent(previousContent); setPreviousContent(null); toast("Reverted last AI change", "info"); }}
                  className="text-[10px] font-bold text-amber-600 hover:underline"
                >
                  ↩ Undo last change
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Ghost measurement element - rendered at top level with position:fixed to avoid parent clipping */}
      <div 
        ref={ghostRef} 
        className={activeTemplate.container}
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: paperSize === "a4" ? "210mm" : "215.9mm",
          padding: margins === "narrow" ? "10mm" : margins === "wide" ? "30mm" : "20mm",
          boxSizing: "border-box",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -99999,
          height: "auto",
          maxHeight: "none",
          overflow: "visible",
          background: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
          <div data-page-element data-page-element-type="header">
            {renderPageItem({ type: "header" }, "ghost-hdr")}
          </div>
          {content.summary && (
            <div data-page-element data-page-element-type="summary">
              {renderPageItem({ type: "summary" }, "ghost-sum")}
            </div>
          )}
          {content.experience.length > 0 && (
            <>
              <div data-page-element data-page-element-type="sectionHeader-experience">
                {renderPageItem({ type: "sectionHeader-experience" }, "ghost-hdr-exp")}
              </div>
              {content.experience.map((_, idx) => (
                <div key={idx} data-page-element data-page-element-type="experienceItem" data-page-element-index={idx}>
                  {renderPageItem({ type: "experienceItem", index: idx }, `ghost-exp-${idx}`)}
                </div>
              ))}
            </>
          )}
          {content.education.length > 0 && (
            <>
              <div data-page-element data-page-element-type="sectionHeader-education">
                {renderPageItem({ type: "sectionHeader-education" }, "ghost-hdr-edu")}
              </div>
              {content.education.map((_, idx) => (
                <div key={idx} data-page-element data-page-element-type="educationItem" data-page-element-index={idx}>
                  {renderPageItem({ type: "educationItem", index: idx }, `ghost-edu-${idx}`)}
                </div>
              ))}
            </>
          )}
          {content.skills.length > 0 && (
            <>
              <div data-page-element data-page-element-type="sectionHeader-skills">
                {renderPageItem({ type: "sectionHeader-skills" }, "ghost-hdr-skills")}
              </div>
              <div data-page-element data-page-element-type="skills">
                {renderPageItem({ type: "skills" }, "ghost-skls")}
              </div>
            </>
          )}
          {content.projects.length > 0 && (
            <>
              <div data-page-element data-page-element-type="sectionHeader-projects">
                {renderPageItem({ type: "sectionHeader-projects" }, "ghost-hdr-proj")}
              </div>
              {content.projects.map((_, idx) => (
                <div key={idx} data-page-element data-page-element-type="projectItem" data-page-element-index={idx}>
                  {renderPageItem({ type: "projectItem", index: idx }, `ghost-proj-${idx}`)}
                </div>
              ))}
            </>
          )}
          {content.certifications.length > 0 && (
            <>
              <div data-page-element data-page-element-type="sectionHeader-certifications">
                {renderPageItem({ type: "sectionHeader-certifications" }, "ghost-hdr-cert")}
              </div>
              {content.certifications.map((_, idx) => (
                <div key={idx} data-page-element data-page-element-type="certificationItem" data-page-element-index={idx}>
                  {renderPageItem({ type: "certificationItem", index: idx }, `ghost-cert-${idx}`)}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Template Select Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/20 backdrop-blur-[1px]">
          <div className="bg-background border border-border rounded-[8px] max-w-md w-full p-6 shadow-sm animate-fade-in">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Select Design Template</h3>
            <p className="text-xs text-muted-foreground mb-4 font-medium">Choose an interchangeable typographic configuration.</p>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {Object.values(TEMPLATES).map((tmpl, idx) => {
                const isLocked = userProfile?.subscription?.plan !== "PRO" && idx >= 3;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      if (isLocked) {
                        toast(`The "${tmpl.name}" template is exclusive to Arvo Pro subscribers. Please upgrade your plan on the Billing page.`, "warning", 5000);
                        return;
                      }
                      setTemplateId(tmpl.id);
                      setShowTemplateModal(false);
                      toast(`Switched template to ${tmpl.name}`, "success");
                    }}
                    className={`border p-3 rounded-[6px] cursor-pointer text-left transition-colors flex items-center justify-between ${
                      templateId === tmpl.id ? "border-neutral-900 bg-surface" : "border-border hover:border-neutral-300 bg-background"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        {tmpl.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-normal font-medium">{tmpl.description}</p>
                    </div>
                    {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end mt-4">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-neutral-950 rounded-[4px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Resume Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/20 backdrop-blur-[1px] no-print">
          <div className="bg-background border border-border rounded-[8px] max-w-md w-full p-6 shadow-sm animate-fade-in space-y-4">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Export Resume</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Choose your preferred export format and options.</p>
            </div>

            {exportProgress ? (
              /* Progress State */
              <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">{exportProgress}</span>
              </div>
            ) : (
              /* Input settings form */
              <form onSubmit={handleExport} className="space-y-4">
                {/* Format choice (Only PDF allowed now) */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Export Format</label>
                  <div className="grid grid-cols-1">
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3 border border-neutral-900 bg-surface text-foreground text-xs font-semibold rounded-[6px] text-center"
                    >
                      PDF (.pdf)
                    </button>
                  </div>
                </div>

                {/* Configurations */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Paper Size</label>
                    <select
                      value={paperSize}
                      onChange={(e: any) => setPaperSize(e.target.value)}
                      className="w-full p-2 border border-border rounded-[6px] bg-background text-xs"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Margins</label>
                    <select
                      value={margins}
                      onChange={(e: any) => setMargins(e.target.value)}
                      className="w-full p-2 border border-border rounded-[6px] bg-background text-xs"
                    >
                      <option value="narrow">Narrow (10mm)</option>
                      <option value="standard">Standard (20mm)</option>
                      <option value="wide">Wide (30mm)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs mb-1">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e: any) => setFontSize(e.target.value)}
                      className="w-full p-2 border border-border rounded-[6px] bg-background text-xs"
                    >
                      <option value="small">Small</option>
                      <option value="standard">Standard</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includePageNumbers}
                      onChange={(e) => setIncludePageNumbers(e.target.checked)}
                      className="rounded border-neutral-300 text-foreground focus:ring-0"
                    />
                    <span className="text-muted-foreground font-medium">Include Page Numbers</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeHyperlinks}
                      onChange={(e) => setIncludeHyperlinks(e.target.checked)}
                      className="rounded border-neutral-300 text-foreground focus:ring-0"
                    />
                    <span className="text-muted-foreground font-medium">Include Hyperlinks</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-neutral-950 rounded-[6px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-[6px] transition-colors"
                  >
                    Download File
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
