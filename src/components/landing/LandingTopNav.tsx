"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingTopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="fixed z-50 pt-5 md:pt-6 top-0 right-0 left-0">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="glass-panel rounded-full px-4 md:px-5 py-3 flex items-center justify-between border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D00FF] to-[#5B21B6] flex items-center justify-center shadow-[0_0_16px_rgba(109,0,255,0.35)]">
                <span className="text-white text-[11px] font-display font-semibold leading-none">N</span>
              </div>
              <span className="text-white font-display font-medium text-sm tracking-tight uppercase">
                NGX <span className="text-[#B98CFF]">TRANSFORM</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1">
              <a href="#como-funciona" className="px-4 py-1.5 rounded-full text-xs text-slate-400 hover:text-white hover:bg-white/10 font-body transition-colors">Cómo Funciona</a>
              <a href="#que-recibes" className="px-4 py-1.5 rounded-full text-xs text-slate-400 hover:text-white hover:bg-white/10 font-body transition-colors">Qué Recibes</a>
              <a href="#faq" className="px-4 py-1.5 rounded-full text-xs text-slate-400 hover:text-white hover:bg-white/10 font-body transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <a href="#cta-final" className="hidden md:inline-flex px-6 py-2.5 rounded-full bg-[#6D00FF] text-white text-xs font-semibold font-body shadow-[0_0_20px_-5px_rgba(109,0,255,0.5)] hover:shadow-[0_0_30px_-5px_rgba(109,0,255,0.7)] transition-shadow">
                Empezar Gratis
              </a>
              <button
                type="button"
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
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
            <a href="#faq" className="text-2xl text-white font-display" onClick={closeMenu}>FAQ</a>
            <a href="#cta-final" className="px-8 py-4 rounded-full bg-[#6D00FF] text-white font-semibold text-lg font-body" onClick={closeMenu}>Empezar Gratis</a>
          </div>
        </div>
      )}
    </>
  );
}
