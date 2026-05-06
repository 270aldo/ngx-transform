import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  shareId?: string;
  sku?: string;
  payment_id?: string;
  status?: string;
}

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const shareId = sp.shareId;
  const skuLabel: Record<string, string> = {
    monthly: "Acceso mensual",
    quarterly: "Cohorte de 12 semanas",
    annual: "Programa anual",
  };
  const sku = sp.sku ? skuLabel[sp.sku] || sp.sku : "NGX HYBRID";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030005] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(109,0,255,0.18),transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span
          className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.40)",
            boxShadow: "0 0 30px rgba(34,197,94,0.25)",
          }}
        >
          <CheckCircle2 className="h-7 w-7" style={{ color: "var(--ngx-success, #22c55e)" }} />
        </span>

        <span className="ngx-eyebrow-pill mb-4">NGX HYBRID</span>
        <h1 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "18ch" }}>
          Pago confirmado.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
          Bienvenido a {sku}. Tu acceso está siendo activado. En los próximos
          minutos recibirás un correo con los siguientes pasos: acceso al
          sistema GENESIS, asignación de coach y el calendario de checkpoints
          de las primeras 4 semanas.
        </p>

        <div className="mt-8 ngx-card !p-5 max-w-md text-left">
          <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
            Lo que sigue
          </span>
          <ul className="mt-3 space-y-2 text-sm text-white/72">
            <li>1. Email de bienvenida con tu acceso al sistema (5–10 min)</li>
            <li>2. Tu coach humano te contactará en menos de 24 h</li>
            <li>3. Primer checkpoint agendado en los próximos 7 días</li>
          </ul>
        </div>

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

        <p className="mt-10 text-xs leading-relaxed text-white/40 max-w-md">
          Si no recibes el correo en los próximos 30 minutos, escríbenos por
          WhatsApp o respondiendo el email del recibo de Mercado Pago.
        </p>
      </div>
    </main>
  );
}
