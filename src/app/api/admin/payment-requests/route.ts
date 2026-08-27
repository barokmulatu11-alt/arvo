import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "barok.m.lakew@gmail.com";

// GET — all payment requests (admin only)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!requestingUser || requestingUser.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const requests = await prisma.paymentRequest.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Don't send the full base64 in the list — only when viewing detail
    const list = requests.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      method: r.method,
      amount: r.amount,
      status: r.status,
      adminNote: r.adminNote,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      screenshotType: r.screenshotType,
      // Include screenshot inline for the admin panel
      screenshotData: r.screenshotData,
    }));

    const pendingCount = list.filter((r) => r.status === "PENDING").length;

    return NextResponse.json({ success: true, requests: list, pendingCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — approve or reject a request (admin only)
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!requestingUser || requestingUser.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { requestId, action, adminNote } = await req.json();

    if (!requestId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
    });

    if (!paymentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Update the payment request status
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        adminNote: adminNote || null,
        reviewedAt: new Date(),
      },
    });

    // On approval: upgrade user to PRO
    if (action === "APPROVE") {
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: paymentRequest.userId },
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { userId: paymentRequest.userId },
          data: { plan: "PRO", status: "ACTIVE" },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: paymentRequest.userId,
            plan: "PRO",
            status: "ACTIVE",
          },
        });
      }

      // Notify the user by email (best effort)
      try {
        const user = await prisma.user.findUnique({
          where: { id: paymentRequest.userId },
        });
        if (user) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: `Arvo <onboarding@resend.dev>`,
            to: user.email,
            subject: "Your Pro Plan is now active 🎉",
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #171717;">
                <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Welcome to Arvo Pro!</h2>
                <p style="font-size: 13px; color: #555; margin-bottom: 16px;">
                  Hi ${user.name}, your payment has been verified and your account has been upgraded to Pro.
                </p>
                <ul style="font-size: 13px; padding-left: 20px; color: #333; line-height: 1.8;">
                  <li>Unlimited active resumes</li>
                  <li>Unlimited AI tailoring requests</li>
                  <li>All premium templates unlocked</li>
                  <li>Clean PDF exports (no watermarks)</li>
                </ul>
                <p style="margin-top: 20px; font-size: 13px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="background: #171717; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 700;">
                    Go to Dashboard →
                  </a>
                </p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.warn("User notification email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
