import { NextResponse } from "next/server";
import { getAuthUser, removeAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cascade deletes resumes & subscription via foreign key relation setup in Prisma
    await prisma.user.delete({
      where: { id: authUser.userId },
    });

    // Clear session cookies
    await removeAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
