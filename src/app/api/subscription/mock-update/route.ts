import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "barok.m.lakew@gmail.com";

// This route is admin-only. Regular users must submit a payment request instead.
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only the admin can directly update plans
    const requestingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!requestingUser || requestingUser.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { plan } = await request.json();

    if (plan !== "FREE" && plan !== "PRO") {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    await prisma.subscription.upsert({
      where: { userId: userId },
      update: { plan, status: "ACTIVE" },
      create: {
        userId: userId,
        plan,
        status: "ACTIVE",
        aiUsageCount: 0,
        resetDate: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
