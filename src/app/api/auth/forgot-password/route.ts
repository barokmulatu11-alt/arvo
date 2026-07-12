import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // We still return success even if user not found to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Construct the reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      // Send email using Resend
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your password - Arvo",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #171717;">Reset your password</h2>
            <p style="color: #525252; font-size: 16px; line-height: 1.5;">
              We received a request to reset the password for your Arvo account. 
              Click the button below to choose a new password.
            </p>
            <div style="margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #171717; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #737373; font-size: 14px;">
              If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.
            </p>
          </div>
        `,
      });
    } else {
      // Fallback for development if no API key is set
      console.log(`\n======================================================`);
      console.log(`[MOCK EMAIL] Password Reset Request`);
      console.log(`To: ${email}`);
      console.log(`Subject: Reset your password`);
      console.log(`Body: Click the link below to reset your password:\n${resetLink}`);
      console.log(`======================================================\n`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
