import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";
import { generateAIContent } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription data not found" }, { status: 404 });
    }

    const isFree = subscription.plan === "FREE";
    if (isFree && subscription.aiUsageCount >= 3) {
      return NextResponse.json(
        {
          error: "AI limit reached. Free Plan is limited to exactly 3 AI generations. Upgrade to Pro for unlimited requests.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const { resumeId, jobDescription } = await request.json();

    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: "resumeId and jobDescription are required" }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resume.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resumeContent = JSON.parse(resume.content);

    const prompt = `
Resume Content: ${JSON.stringify(resumeContent)}
Target Job Description: ${jobDescription}

Perform a rigorous ATS gap analysis. Compare the resume achievements against the target job requirements.
You MUST return output EXCLUSIVELY as a strictly formatted, minified JSON object matching the following TypeScript schema structure:

{
  "score": number, // ATS match percentage (0 to 100)
  "matchedKeywords": string[], // Important keywords present in both
  "missingKeywords": string[], // Crucial job keywords missing in resume
  "gapAnalysis": string, // Detailed paragraph outlining critical matches and structural flaws
  "tailoredSummary": string, // A rewritten, highly tailored 3-sentence professional summary for this job
  "suggestedChanges": Array<{ section: string, action: string, details: string }> // Recommendations
}
    `;

    const aiRes = await generateAIContent(prompt, "json");

    if (!aiRes.success) {
      return NextResponse.json({ error: aiRes.error || "AI Tailoring failed" }, { status: 500 });
    }

    // Increment AI usage count
    await prisma.subscription.update({
      where: { userId: userId },
      data: {
        aiUsageCount: {
          increment: 1,
        },
      },
    });

    // Attempt to parse the response to verify JSON compliance
    try {
      const parsedData = JSON.parse(aiRes.content);
      return NextResponse.json({
        assessment: parsedData,
        usageCount: subscription.aiUsageCount + 1,
      });
    } catch (e: any) {
      console.error("AI failed to return valid JSON:", e);
      return NextResponse.json({
        error: "AI response parsing failed. The response may have been incomplete. Please try again.",
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI Tailor error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
