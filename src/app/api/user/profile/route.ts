import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check if email is already taken by another user
    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: emailLower,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    // Auto-sync fallback if webhook failed
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

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
