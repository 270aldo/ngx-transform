import Link from "next/link";
import { AlertTriangle, ArrowRight, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  shareId?: string;
}

export default async function CheckoutFailure({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const shareId = sp.shareId;

  const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappNumber = whatsappRaw.replace(/[^\d]/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hola, intenté comprar NGX HYBRID y el pago no se completó. ¿Pueden ayudarme?"
      )}`
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030005] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.14),transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span
          className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.40)",
          }}
        >
          <AlertTriangle className="h-7 w-7" style={{ color: "#ef4444" }} />
        </span>

        <span className="ngx-eyebrow-pill mb-4">NGX HYBRID</span>
        <h1 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "20ch" }}>
          El pago no se completó.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
          Mercado Pago no pudo procesar la transacción. Esto suele ser un
          rechazo temporal del banco o una validación adicional pendiente.
          Puedes intentarlo de nuevo o contactarnos directamente.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {shareId && (
            <Link
              href={`/s/${shareId}#hybrid-offer`}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                backgroundColor: "var(--ngx-purple)",
                boxShadow: "var(--ngx-glow-primary)",
              }}
            >
              Intentar de nuevo
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ngx-glass-clear inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Hablar con el equipo
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
