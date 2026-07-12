import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIContent } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: authUser.userId },
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

    const { currentSummary, skills, experienceSummary } = await request.json();

    const prompt = `
Generate or improve a professional resume summary.
Current Summary: ${currentSummary || "None"}
Key Skills: ${skills ? JSON.stringify(skills) : "None"}
Core Work Experience: ${experienceSummary || "None"}

Please craft a powerful 3-4 sentence professional summary. Make it highly engaging, highlighting core competencies, technical leadership, and career accomplishments. Clean plain text only.
    `;

    const aiRes = await generateAIContent(prompt, "text");

    if (!aiRes.success) {
      return NextResponse.json({ error: aiRes.error || "AI Generation failed" }, { status: 500 });
    }

    // Increment AI usage count
    await prisma.subscription.update({
      where: { userId: authUser.userId },
      data: {
        aiUsageCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ 
      result: aiRes.content, 
      usageCount: subscription.aiUsageCount + 1 
    });
  } catch (error: any) {
    console.error("AI Summary error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
