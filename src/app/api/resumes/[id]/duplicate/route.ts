import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Fetch source resume
    const sourceResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!sourceResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (sourceResume.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check subscription limits
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
          error: "Subscription limit reached. Free Plan is limited to exactly 1 active resume layout. Upgrade to Pro to duplicate resumes.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    // Clone resume
    const duplicatedResume = await prisma.resume.create({
      data: {
        userId: userId,
        title: `Copy of ${sourceResume.title}`,
        templateId: sourceResume.templateId,
        content: sourceResume.content,
      },
    });

    return NextResponse.json({ resume: duplicatedResume });
  } catch (error: any) {
    console.error("Duplicate resume error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
