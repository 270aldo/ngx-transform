import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMpPreference, getHybridSkuConfig } from "@/lib/mercadoPago";
import { FieldValue } from "firebase-admin/firestore";
import { trackEvent } from "@/lib/telemetry";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "@/lib/rateLimit";
import { isSessionOwnerAuthError, requireSessionOwner } from "@/lib/authServer";

const Body = z.object({
  shareId: z.string().min(1),
  sku: z.enum(["monthly", "quarterly", "annual"]),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validar body primero — un payload mal formado merece 400 antes de
    //    cualquier check de ambiente.
    const parsed = Body.parse(await req.json());

    const { authUser, sessionRef, session } = await requireSessionOwner<{
      ownerUid?: string;
      email?: string | null;
    }>(req, parsed.shareId);

    const limit = await checkRateLimit("api:checkout", authUser.uid);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    // 2. Pre-check de credenciales de Mercado Pago. Si falta el access token,
    //    degradamos suave (503) con mensaje user-friendly en lugar de filtrar
    //    el detalle técnico del Error que lanza createMpPreference. La UI
    //    de HybridOfferV2 ya maneja este 503 redirigiendo al usuario a los
    //    paths secundarios (Calendly / WhatsApp).
    if (!process.env.MP_ACCESS_TOKEN) {
      console.warn(
        "[MP_CREATE_PREFERENCE] MP_ACCESS_TOKEN no configurado — devolviendo 503 graceful."
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "El pago directo no está activo todavía. Agenda una llamada o escríbenos por WhatsApp y te lo procesamos manual.",
        },
        { status: 503 }
      );
    }

    const config = getHybridSkuConfig(parsed.sku);
    if (!config) {
      return NextResponse.json(
        {
          ok: false,
          error: `Pricing no configurado para SKU "${parsed.sku}". Contacta al equipo NGX.`,
        },
        { status: 503 }
      );
    }

    // Recoger email del lead si existe — ayuda al pre-fill de MP y tracking
    const email = session.email || undefined;

    // Determinar baseUrl absoluto
    const vercelUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null;
    const rawBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      vercelUrl ||
      "http://localhost:3000";
    const baseUrl = rawBase.startsWith("http") ? rawBase : `https://${rawBase}`;

    const pref = await createMpPreference({
      sku: parsed.sku,
      shareId: parsed.shareId,
      email,
      baseUrl,
    });

    // Persistir intent en Firestore para reconciliar en el webhook
    await sessionRef.set(
      {
        checkout: {
          provider: "mercadopago",
          sku: parsed.sku,
          internalId: config.internalId,
          preferenceId: pref.preferenceId,
          status: "redirected",
          amount: config.price,
          currency: config.currency,
          createdAt: FieldValue.serverTimestamp(),
        },
        lastActivityAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await trackEvent({
      sessionId: parsed.shareId,
      event: "mp_checkout_redirected",
      metadata: {
        sku: parsed.sku,
        preferenceId: pref.preferenceId,
        amount: config.price,
        currency: config.currency,
      },
    });

    const useSandbox = process.env.NODE_ENV !== "production";
    const initPoint = useSandbox ? pref.sandboxInitPoint : pref.initPoint;

    return NextResponse.json({
      ok: true,
      preferenceId: pref.preferenceId,
      initPoint,
      sku: parsed.sku,
      amount: config.price,
      currency: config.currency,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    if (isSessionOwnerAuthError(error)) {
      return NextResponse.json({ ok: false, error: error.code }, { status: error.status });
    }
    // No filtrar `error.message` al cliente: puede contener detalles internos
    // (env var names, stack traces, llamadas a APIs externas). El detalle
    // técnico va al log; el cliente recibe un mensaje genérico user-friendly.
    console.error("[MP_CREATE_PREFERENCE]", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "No pudimos iniciar el checkout. Intenta de nuevo o agenda una llamada.",
      },
      { status: 500 }
    );
  }
}
