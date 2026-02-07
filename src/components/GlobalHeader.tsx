"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebaseClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";

/**
 * Header global que se oculta en flujos inmersivos (resultados, loading, wizard).
 */
export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const userInitial = useMemo(() => {
    if (!user?.email) return "U";
    return user.email.trim().charAt(0).toUpperCase();
  }, [user?.email]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Ocultar en páginas que renderizan su propio encabezado inmersivo
  if (
    pathname?.startsWith("/s/") ||
    pathname?.startsWith("/loading/") ||
    pathname?.startsWith("/wizard") ||
    pathname === "/" ||
    pathname === "/j" ||
    pathname === "/m"
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo variant="full" size="md" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/wizard">Probar</Link>
          {user && (
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
          )}
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#hybrid-offer">HYBRID</a>
        </nav>
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="hidden sm:inline">{user.email || "Usuario"}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6D00FF]/20 text-[#B98CFF] text-xs font-semibold border border-[#6D00FF]/40">
                  {userInitial}
                </span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-neutral-900/95 shadow-xl backdrop-blur"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-neutral-400">Sesión activa</p>
                    <p className="text-sm text-white truncate">{user.email || "Usuario"}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-neutral-200 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Mis sesiones
                    </Link>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-neutral-200 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Mi cuenta
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                      onClick={async () => {
                        await signOut(getClientAuth());
                        setMenuOpen(false);
                        router.push("/auth");
                      }}
                      role="menuitem"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link className="text-xs text-muted-foreground hover:text-foreground" href="/auth">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
