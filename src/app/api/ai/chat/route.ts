import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { editCvWithPrompt } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check subscription / usage limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription data not found" }, { status: 404 });
    }

    if (subscription.plan === "FREE" && subscription.aiUsageCount >= 3) {
      return NextResponse.json(
        {
          error: "AI limit reached. Free Plan is limited to 3 AI uses. Upgrade to Pro for unlimited.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const { cvJson, instruction } = await request.json();

    if (!cvJson || !instruction) {
      return NextResponse.json({ error: "cvJson and instruction are required" }, { status: 400 });
    }

    const result = await editCvWithPrompt(cvJson, instruction);

    // Increment usage
    await prisma.subscription.update({
      where: { userId },
      data: { aiUsageCount: { increment: 1 } },
    });

    return NextResponse.json({
      updatedCv: result.updatedCv,
      assistantMessage: result.assistantMessage,
      usageCount: subscription.aiUsageCount + 1,
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
