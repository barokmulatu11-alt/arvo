import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseCvFromText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure user exists (auto-sync fallback like in /api/resumes)
    let user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
    if (!user) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "New User";
      user = await prisma.user.create({ data: { id: userId, email, name }, include: { subscription: true } });
    }

    // Check limits
    const resumeCount = await prisma.resume.count({ where: { userId } });
    const isPro = user.subscription?.plan === "PRO";
    if (!isPro && resumeCount >= 1) {
      return NextResponse.json({ error: "Subscription limit reached. Free Plan is limited to exactly 1 active resume layout. Upgrade to Pro for unlimited resumes.", limitReached: true }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // Use unpdf — built for Node.js/serverless, no browser API dependencies
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(arrayBuffer));
    // extractText returns string[] (one per page) — join into a single string
    const pdfText = Array.isArray(text) ? text.join("\n") : text;

    if (!pdfText || pdfText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. It may be a scanned/image-only PDF. Please use a text-based PDF." },
        { status: 400 }
      );
    }

    // Parse text to JSON
    const parsed = await parseCvFromText(pdfText);

    // Map Gemini's schema → editor's ResumeContent schema
    const p = parsed?.personal_info || {};
    const nameParts = (p.full_name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const editorContent = {
      personalInfo: {
        firstName,
        lastName,
        email: p.email || "",
        phone: p.phone || "",
        website: p.portfolio_url || p.linkedin_url || "",
        location: p.location || "",
      },
      summary: parsed?.summary || "",
      experience: (parsed?.experience || []).map((e: any) => ({
        id: Math.random().toString(36).substring(2, 9),
        company: e.company || "",
        position: e.job_title || e.position || "",
        location: e.location || "",
        startDate: e.start_date || e.startDate || "",
        endDate: e.end_date || e.endDate || "",
        current: (e.end_date || e.endDate || "").toLowerCase() === "present",
        description: Array.isArray(e.highlights)
          ? e.highlights.join("\n")
          : e.description || "",
      })),
      education: (parsed?.education || []).map((e: any) => ({
        id: Math.random().toString(36).substring(2, 9),
        institution: e.institution || "",
        degree: e.degree || "",
        fieldOfStudy: e.field_of_study || e.fieldOfStudy || "",
        graduationDate: e.end_date || e.graduationDate || "",
        description: Array.isArray(e.details) ? e.details.join("\n") : "",
      })),
      // Skills: Gemini may return string[] or {category, items}[] — normalise both
      skills: (() => {
        const raw = parsed?.skills || [];
        if (raw.length === 0) return [];
        if (typeof raw[0] === "string") {
          return [{
            id: Math.random().toString(36).substring(2, 9),
            category: "Skills",
            items: raw as string[],
          }];
        }
        return (raw as any[]).map((s: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          category: s.category || s.name || "Skills",
          items: Array.isArray(s.items) ? s.items : Array.isArray(s.skills) ? s.skills : [],
        }));
      })(),
      projects: (parsed?.projects || []).map((p: any) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: p.name || "",
        description: Array.isArray(p.highlights)
          ? p.highlights.join("\n")
          : p.description || "",
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        url: p.link || p.url || "",
      })),
      certifications: (parsed?.certifications || []).map((c: any) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: c.name || "",
        issuer: c.issuer || "",
        date: c.date || "",
      })),
    };

    // Derive a meaningful title from the candidate's name
    const resumeTitle = [firstName, lastName].filter(Boolean).join(" ")
      ? `${firstName} ${lastName} — Resume`
      : "Imported Resume";

    // Create a new resume
    const newResume = await prisma.resume.create({
      data: {
        userId: userId,
        title: resumeTitle,
        templateId: "modern",
        content: JSON.stringify(editorContent),
      },
    });

    return NextResponse.json({ resumeId: newResume.id });
  } catch (error: any) {
    console.error("CV Parse error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
