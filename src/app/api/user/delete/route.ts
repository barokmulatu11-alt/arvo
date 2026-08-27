import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Cascade deletes resumes & subscription via foreign key relation setup in Prisma
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear session cookies
    // Sign out handled by Clerk

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
