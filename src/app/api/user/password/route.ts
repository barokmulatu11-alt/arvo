import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Delegate password update to Clerk
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, { password: newPassword });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Password update error:", error);
    const message = error?.errors?.[0]?.longMessage || error.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
