import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Arvo — AI-Powered Resume Builder",
  description:
    "Create stunning, ATS-optimized resumes with the power of AI. Arvo helps you craft professional resumes that land interviews.",
  keywords: ["resume builder", "AI resume", "ATS optimization", "career"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
