import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";
import { generateAIContent } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check user subscription limits
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

    const { sectionType, content } = await request.json();

    if (!sectionType || !content) {
      return NextResponse.json({ error: "sectionType and content are required" }, { status: 400 });
    }

    const prompt = `
Section Type: ${sectionType}
Current Content: ${content}

Please rewrite this content to make it highly professional, outcome-focused, and ATS-friendly. 
Use strong action verbs (e.g., spearheaded, designed, optimized, spearheaded) and list quantifiable achievements if possible. Keep it concise.
    `;

    const aiRes = await generateAIContent(prompt, "text");

    if (!aiRes.success) {
      return NextResponse.json({ error: aiRes.error || "AI Generation failed" }, { status: 500 });
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

    return NextResponse.json({ 
      result: aiRes.content, 
      usageCount: subscription.aiUsageCount + 1 
    });
  } catch (error: any) {
    console.error("AI Improve error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
