import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200 flex flex-col justify-between">
      <Navbar />

      <main className="relative z-10 flex-1 flex items-center justify-center pt-32 pb-24 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl mx-auto dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 flex items-center justify-center dark:text-[#0A84FF] text-[#FF7A00] shadow-sm">
            <Compass className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest dark:text-[#0A84FF] text-[#FF7A00]">
              404 · Uncharted Territory
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold dark:text-white text-[#171717] mt-2">
              Page Not Found
            </h1>
            <p className="text-sm dark:text-slate-400 text-slate-600 mt-2 font-sans">
              The algorithmic path you requested does not exist or has been pruned by optimization passes.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="py-2.5 px-5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 bg-[#FF7A00] hover:bg-[#EA580C] dark:bg-[#0A84FF] dark:hover:bg-blue-600 text-white transition-all shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </Link>

            <Link
              href="/simulations"
              className="py-2.5 px-4 rounded-xl border dark:border-white/10 border-slate-300 hover:dark:bg-white/[0.05] hover:bg-slate-100 font-mono text-xs transition-all"
            >
              Explore Simulations
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
