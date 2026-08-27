import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

const DEFAULT_RESUME_CONTENT = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

// GET /api/resumes - List all resumes of the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resumes = await prisma.resume.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error("Fetch resumes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/resumes - Create a new resume
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check user subscription tier and limits
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "New User";

      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
        },
        include: { subscription: true }
      });
    }

    const resumeCount = await prisma.resume.count({
      where: { userId: userId },
    });

    const isPro = user.subscription?.plan === "PRO";
    if (!isPro && resumeCount >= 1) {
      return NextResponse.json(
        {
          error: "Subscription limit reached. Free Plan is limited to exactly 1 active resume layout. Upgrade to Pro for unlimited resumes.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || "Untitled Resume";
    const templateId = body.templateId || "modern";

    const newResume = await prisma.resume.create({
      data: {
        userId: userId,
        title,
        templateId,
        content: JSON.stringify(DEFAULT_RESUME_CONTENT),
      },
    });

    return NextResponse.json({ resume: newResume });
  } catch (error: any) {
    console.error("Create resume error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
