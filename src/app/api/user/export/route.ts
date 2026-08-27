import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: true,
        subscription: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare export JSON
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
      },
      subscription: userData.subscription ? {
        plan: userData.subscription.plan,
        status: userData.subscription.status,
        aiUsageCount: userData.subscription.aiUsageCount,
      } : null,
      resumes: userData.resumes.map((r) => ({
        title: r.title,
        templateId: r.templateId,
        content: JSON.parse(r.content),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="arvo_export_${userId}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Export data error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
