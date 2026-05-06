import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  shareId?: string;
}

export default async function CheckoutPending({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const shareId = sp.shareId;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030005] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.14),transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span
          className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.40)",
          }}
        >
          <Clock className="h-7 w-7" style={{ color: "#f59e0b" }} />
        </span>

        <span className="ngx-eyebrow-pill mb-4">NGX HYBRID</span>
        <h1 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "18ch" }}>
          Pago en proceso.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
          Tu pago está siendo verificado por Mercado Pago. Esto suele tomar
          entre 5 minutos y unas horas dependiendo del método de pago. Te
          enviaremos un correo en cuanto se confirme y tu acceso quede
          activado.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {shareId && (
            <Link
              href={`/s/${shareId}`}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                backgroundColor: "var(--ngx-purple)",
                boxShadow: "var(--ngx-glow-primary)",
              }}
            >
              Volver a mi transformación
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/"
            className="ngx-glass-clear inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
