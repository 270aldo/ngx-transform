"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6D00FF] to-[#5B21B6] rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-semibold text-xs">N</span>
            </div>
            <span className="text-white/60 text-sm font-display">NGX GENESIS</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors font-body">
              Privacidad
            </Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors font-body">
              Términos
            </Link>
            <a href="mailto:hola@ngxgenesis.com" className="text-xs text-slate-500 hover:text-white transition-colors font-body">
              Contacto
            </a>
          </div>

          <p className="text-xs text-slate-600 font-body">© 2026 NGX. Performance & Longevity.</p>
        </div>
      </div>
    </footer>
  );
}
