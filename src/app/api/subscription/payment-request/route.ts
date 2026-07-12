import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "barok.m.lakew@gmail.com";
const APP_NAME = "Arvo";

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { method, screenshotBase64, screenshotType, billingCycle } = await req.json();

    if (!method || !screenshotBase64) {
      return NextResponse.json({ error: "Missing method or screenshot" }, { status: 400 });
    }
    if (!["TELEBIRR", "CBE"].includes(method)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Cancel any previous PENDING request from this user
    await prisma.paymentRequest.updateMany({
      where: { userId: authUser.userId, status: "PENDING" },
      data: { status: "REJECTED", adminNote: "Superseded by new submission" },
    });

    // Create new payment request
    const amount = billingCycle === "yearly" ? 499 : 199;
    
    const request = await prisma.paymentRequest.create({
      data: {
        userId: authUser.userId,
        method,
        screenshotData: screenshotBase64,
        screenshotType: screenshotType || "image/jpeg",
        amount: amount,
        status: "PENDING",
      },
    });

    // Send notification email via Resend (best effort, don't fail on email error)
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${APP_NAME} <onboarding@resend.dev>`,
        to: ADMIN_EMAIL,
        subject: `New Payment Request — ${authUser.name} (${method})`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #171717;">
            <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">New Payment Request</h2>
            <p style="font-size: 13px; color: #555; margin-bottom: 16px;">A user has submitted a manual payment for review.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #888; font-weight: 600;">Name</td><td style="padding: 6px 0; font-weight: 700;">${authUser.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #888; font-weight: 600;">Email</td><td style="padding: 6px 0;">${authUser.email}</td></tr>
              <tr><td style="padding: 6px 0; color: #888; font-weight: 600;">Method</td><td style="padding: 6px 0; font-weight: 700;">${method}</td></tr>
              <tr><td style="padding: 6px 0; color: #888; font-weight: 600;">Amount</td><td style="padding: 6px 0;">ETB ${amount} (${billingCycle || "monthly"})</td></tr>
              <tr><td style="padding: 6px 0; color: #888; font-weight: 600;">Request ID</td><td style="padding: 6px 0; font-family: monospace;">${request.id}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #555;">
              Log in to the <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/dashboard" style="color: #000; font-weight: 700;">Admin Panel</a> to review the screenshot and approve or reject this request.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("Admin notification email failed:", emailErr);
    }

    return NextResponse.json({ success: true, requestId: request.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const latest = await prisma.paymentRequest.findFirst({
      where: { userId: authUser.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ request: latest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
