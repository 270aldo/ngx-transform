"use client";

import Image from "next/image";
import Link from "next/link";
import { useLandingConfig } from "./LandingProvider";

export function LandingFooter() {
  const { config } = useLandingConfig();
  const { footer } = config.copy;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";

  return (
    <footer className="ngx-footer relative z-10">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="flex flex-col gap-6 border-t border-white/[0.07] pt-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/brand/ngx-mark-purple.png"
              alt="NGX"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
            />
            <div className="leading-tight">
              <span className="font-display text-sm font-black uppercase tracking-[0.14em] text-white/86">
                {footer.brandName}
              </span>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/38">
                {footer.status}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/privacy" className="text-sm text-white/48 transition-colors hover:text-white font-body">
              Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-white/48 transition-colors hover:text-white font-body">
              Términos
            </Link>
            {supportEmail ? (
              <a href={`mailto:${supportEmail}`} className="text-sm text-white/48 transition-colors hover:text-white font-body">
                Contacto
              </a>
            ) : (
              <Link href="/privacy" className="text-sm text-white/48 transition-colors hover:text-white font-body">
                Contacto
              </Link>
            )}
          </div>

          <p className="text-sm text-white/38 font-body">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
