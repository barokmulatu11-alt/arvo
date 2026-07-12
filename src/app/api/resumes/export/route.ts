import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { buildResumeHTML } from "@/lib/templateGenerator";

// Path to Chrome/Edge already installed on the system — no Chromium download needed
const CHROME_PATHS = [
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function getChromePath(): string {
  const fs = require("fs");
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error(
    "No Chrome or Edge installation found. Install Chrome and try again."
  );
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, content, margins, paperSize, title } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Missing resume content" },
        { status: 400 }
      );
    }

    const htmlContent = buildResumeHTML(
      templateId || "minimal",
      content,
      margins || "normal",
      paperSize || "a4"
    );

    // Use puppeteer-core with the system Chrome — no ~170MB download
    const puppeteer = await import("puppeteer-core");

    const browser = await puppeteer.launch({
      executablePath: getChromePath(),
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set viewport to A4/Letter width so layout is correct
      await page.setViewport({
        width: paperSize === "a4" ? 794 : 816, // ~210mm or 215.9mm at 96dpi
        height: paperSize === "a4" ? 1123 : 1056,
        deviceScaleFactor: 2,
      });

      // Write the complete HTML document and wait for layout + fonts
      await page.setContent(htmlContent, {
        waitUntil: "load",
        timeout: 30000,
      });
      // Extra delay to allow Google Fonts to fully render
      await new Promise((r) => setTimeout(r, 1500));

      // Generate PDF — printBackground preserves colors/borders
      const pdfBuffer = await page.pdf({
        format: paperSize === "a4" ? "A4" : "Letter",
        printBackground: true,   // preserve background colors and borders
        preferCSSPageSize: true, // honour @page size/margin from templateGenerator
        displayHeaderFooter: false,
      });

      const fileName = `${(title || "resume")
        .toLowerCase()
        .replace(/\s+/g, "-")}.pdf`;

      // Convert to Uint8Array so NextResponse accepts it as BodyInit
      const pdfBytes = new Uint8Array(pdfBuffer as Buffer);

      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": String(pdfBytes.length),
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate PDF: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
