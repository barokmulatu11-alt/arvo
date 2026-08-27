import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeId, tailoredSummary } = await request.json();

    if (!resumeId || !tailoredSummary) {
      return NextResponse.json({ error: "resumeId and tailoredSummary are required" }, { status: 400 });
    }

    // Fetch source resume
    const sourceResume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!sourceResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (sourceResume.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check user subscription limits for another active layout
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resumeCount = await prisma.resume.count({
      where: { userId: userId },
    });

    const isPro = user.subscription?.plan === "PRO";
    if (!isPro && resumeCount >= 1) {
      return NextResponse.json(
        {
          error: "Subscription limit reached. Free Plan is limited to exactly 1 active resume layout. Upgrade to Pro to generate tailored versions.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    // Parse content JSON, update summary
    const content = JSON.parse(sourceResume.content);
    content.summary = tailoredSummary;

    // Create tailored clone
    const tailoredResume = await prisma.resume.create({
      data: {
        userId: userId,
        title: `[Tailored] ${sourceResume.title}`,
        templateId: sourceResume.templateId,
        content: JSON.stringify(content),
      },
    });

    return NextResponse.json({ resumeId: tailoredResume.id });
  } catch (error: any) {
    console.error("Apply tailoring error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
