import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 flex flex-col justify-between animate-fade-in font-sans">
      {/* Header */}
      <header className="h-14 border-b border-neutral-100 px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-neutral-900 uppercase">
            Arvo
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-xs font-semibold text-white bg-neutral-900 hover:bg-black px-3 py-1.5 rounded-[4px] transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>
      </header>

      {/* Main hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:px-6">
        <div className="max-w-2xl text-center space-y-6">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
            Enterprise Resume Builder
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
            Build a job-winning resume with computational precision.
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed font-normal">
            An editorial, typography-first builder equipped with gap analysis and recruiter optimization pipelines. Built for professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-black px-6 py-3 rounded-[6px] transition-colors">
                  Create Resume Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-black px-6 py-3 rounded-[6px] transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Show>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-100 shrink-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <span className="font-bold text-xs text-neutral-900 uppercase">Arvo</span>
          <p className="text-[10px] text-neutral-400 font-medium">
            &copy; 2026 Arvo. Barok Labs
          </p>
        </div>
      </footer>
    </div>
  );
}
