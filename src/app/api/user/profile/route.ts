import { NextResponse } from "next/server";
import { getAuthUser, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check if email is already taken by another user
    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existing && existing.id !== authUser.userId) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        name,
        email: emailLower,
      },
    });

    // Re-issue cookie with new details
    await setAuthCookie({
      userId: updated.id,
      email: updated.email,
      name: updated.name,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
