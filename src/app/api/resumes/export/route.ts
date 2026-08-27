import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { buildResumeHTML } from "@/lib/templateGenerator";

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { templateId, content, margins, paperSize, title, fontSize } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Missing resume content" },
        { status: 400 }
      );
    }

    const browserlessToken = process.env.BROWSERLESS_TOKEN;
    if (!browserlessToken) {
      console.error("[PDF_EXPORT] Missing BROWSERLESS_TOKEN in environment variables");
      return NextResponse.json({ error: "Server configuration error: PDF generation token missing." }, { status: 500 });
    }

    const htmlContent = buildResumeHTML(
      templateId || "minimal",
      content,
      margins || "normal",
      paperSize || "a4",
      fontSize || "standard"
    );

    // Call Browserless.io /pdf endpoint
    const browserlessUrl = `https://chrome.browserless.io/pdf?token=${browserlessToken}`;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000); // 25s timeout

    let res: Response;
    try {
      res = await fetch(browserlessUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          html: htmlContent,
          options: {
            displayHeaderFooter: false,
            printBackground: true,
            format: paperSize === "a4" ? "A4" : "Letter",
          },
          gotoOptions: {
            waitUntil: "networkidle0"
          }
        }),
      });
    } catch (fetchError: any) {
      console.error("[PDF_EXPORT] Fetch to Browserless failed:", fetchError);
      return NextResponse.json({ error: "Failed to connect to PDF generation service." }, { status: 500 });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unable to read error text");
      console.error(`[PDF_EXPORT] Browserless returned ${res.status}:`, errorText);
      return NextResponse.json({ error: "PDF generation service reported an error. Please try again." }, { status: 500 });
    }

    const pdfBuffer = await res.arrayBuffer();
    const sanitizedTitle = (title || "resume")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-") // Replace any non-alphanumeric (and non-ascii) chars with dashes
      .replace(/-+/g, "-")          // Collapse multiple dashes
      .replace(/^-|-$/g, "");       // Trim leading/trailing dashes
    const fileName = `${sanitizedTitle || "resume"}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });

  } catch (error: any) {
    console.error("[PDF_EXPORT] Unexpected error during PDF generation:", error);
    return NextResponse.json(
      { error: "PDF generation failed due to a server issue. Please try again." },
      { status: 500 }
    );
  }
}
