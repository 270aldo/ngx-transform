"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLandingConfig } from "./LandingProvider";

export function LandingTopNav() {
  const { config, trackCta } = useLandingConfig();
  const { hero } = config.copy;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="fixed z-50 pt-5 md:pt-6 top-0 right-0 left-0">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="landing-surface rounded-full px-3 py-2.5 md:px-4 flex items-center justify-between backdrop-blur-2xl">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/brand/ngx-mark-purple.png"
                alt="NGX"
                width={30}
                height={30}
                className="h-7 w-7 object-contain"
                priority
              />
              <div className="leading-none">
                <span className="font-display text-sm font-black uppercase tracking-[0.14em] text-white">
                  NGX <span className="text-[#B98CFF]">Vision</span>
                </span>
                <p className="hidden md:block mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">by Genesis</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.055] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
              <a href="#como-funciona" className="rounded-full px-4 py-2 text-xs font-medium text-white/58 transition-colors hover:bg-white/[0.09] hover:text-white">Cómo Funciona</a>
              <a href="#que-recibes" className="rounded-full px-4 py-2 text-xs font-medium text-white/58 transition-colors hover:bg-white/[0.09] hover:text-white">Qué Recibes</a>
              <a href="#reporte-ejemplo" className="hidden lg:inline-flex rounded-full px-4 py-2 text-xs font-medium text-white/58 transition-colors hover:bg-white/[0.09] hover:text-white">Ejemplo</a>
              <a href="#puente" className="hidden lg:inline-flex rounded-full px-4 py-2 text-xs font-medium text-white/58 transition-colors hover:bg-white/[0.09] hover:text-white">HYBRID</a>
              <a href="#faq" className="rounded-full px-4 py-2 text-xs font-medium text-white/58 transition-colors hover:bg-white/[0.09] hover:text-white">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/wizard"
                onClick={() => trackCta("topnav_primary", hero.primaryCta.intent, hero.primaryCta.label)}
                className="ngx-primary-cta hidden !min-h-0 px-6 py-3 text-xs md:inline-flex"
              >
                {hero.primaryCta.label}
              </Link>
              <button
                type="button"
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#050505]/95 backdrop-blur-xl md:hidden">
          <div className="absolute top-6 right-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
              onClick={closeMenu}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <a href="#como-funciona" className="text-2xl text-white font-display" onClick={closeMenu}>Cómo Funciona</a>
            <a href="#que-recibes" className="text-2xl text-white font-display" onClick={closeMenu}>Qué Recibes</a>
            <a href="#puente" className="text-2xl text-white font-display" onClick={closeMenu}>HYBRID</a>
            <a href="#faq" className="text-2xl text-white font-display" onClick={closeMenu}>FAQ</a>
            <Link
              href="/wizard"
              className="ngx-primary-cta inline-flex px-8 py-4 text-lg"
              onClick={() => {
                trackCta("mobile_menu_primary", hero.primaryCta.intent, hero.primaryCta.label);
                closeMenu();
              }}
            >
              {hero.primaryCta.label}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
