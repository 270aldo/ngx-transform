"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Header global que se oculta en páginas de resultados (/s/)
 */
export function GlobalHeader() {
  const pathname = usePathname();

  // Ocultar en páginas de resultados - tienen su propio header
  if (pathname?.startsWith("/s/")) {
    return null;
  }

  return (
    <header className="border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">NGX Transform</Link>
        <nav className="flex items-center gap-3">
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/wizard">Probar</Link>
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#">Contacto</a>
        </nav>
      </div>
    </header>
  );
}
