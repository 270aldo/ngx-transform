"use client";

import Link from "next/link";
import { useLandingConfig } from "./LandingProvider";

export function LandingFooter() {
  const { config } = useLandingConfig();
  const { footer } = config.copy;
  const { theme } = config;

  return (
    <footer className="border-t border-white/5 py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div
                className="absolute inset-0 blur-md opacity-40"
                style={{ backgroundColor: theme.primary }}
              />
              <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-400 rounded flex items-center justify-center border border-white/20">
                <div className="w-2 h-2 rounded-full bg-[#030005]" />
              </div>
            </div>
            <span className="text-white font-medium tracking-tight text-sm">
              {footer.brandName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] text-slate-500">{footer.status}</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacidad
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Términos
            </Link>
          </div>

          <p className="text-slate-600 text-[10px]">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
