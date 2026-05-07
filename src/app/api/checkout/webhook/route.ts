/**
 * Webhook de Mercado Pago — Checkout Pro
 *
 * Recibe notificaciones de pago y reconcilia el estado en Firestore.
 * Mercado Pago envía el `data.id` del payment; nosotros consultamos el estado
 * real al servidor de MP (no confiamos en el body) y actualizamos la sesión.
 *
 * Validación:
 *  - Si `MP_WEBHOOK_SECRET` está configurado, validamos el header
 *    `x-signature` siguiendo el formato oficial de MP.
 *  - Si no, aceptamos pero registramos warning (modo permisivo para tests).
 *
 * Idempotencia:
 *  - Cada paymentId solo se procesa una vez. Si ya está marcado como completed,
 *    devolvemos 200 sin reprocesar.
 *
 * Docs: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fetchMpPayment, parseExternalReference } from "@/lib/mercadoPago";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { trackEvent } from "@/lib/telemetry";

export const runtime = "nodejs";

interface MpWebhookBody {
  type?: string;
  action?: string;
  data?: { id?: string | number };
  // formato legacy
  topic?: string;
  resource?: string;
  id?: string | number;
}

function validateSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[MP_WEBHOOK] MP_WEBHOOK_SECRET no configurado — aceptando sin validar (no seguro en prod)"
    );
    return true;
  }

  // Mercado Pago envía: x-signature: ts=...,v1=...
  const sigHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id") || "";
  const dataId =
    req.nextUrl.searchParams.get("data.id") ||
    req.nextUrl.searchParams.get("id") ||
    "";

  if (!sigHeader) {
    console.error("[MP_WEBHOOK] Falta header x-signature");
    return false;
  }

  const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k && v) acc[k] = v;
    return acc;
  }, {});

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Manifest según docs MP: id:DATA_ID;request-id:REQ_ID;ts:TS;
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  // También aceptar firma sobre el raw body como fallback
  const expectedBody = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return v1 === expected || v1 === expectedBody;
}

export async function POST(req: NextRequest) {
  let rawBody = "";
  try {
    rawBody = await req.text();

    if (!validateSignature(req, rawBody)) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    let body: MpWebhookBody = {};
    try {
      body = rawBody ? (JSON.parse(rawBody) as MpWebhookBody) : {};
    } catch {
      // MP a veces manda body vacío con todo en query string
    }

    const isPayment =
      body.type === "payment" ||
      body.topic === "payment" ||
      body.action?.includes("payment");

    if (!isPayment) {
      // Otros eventos (merchant_order, etc.) — los ignoramos por ahora
      return NextResponse.json({ ok: true, ignored: true });
    }

    const paymentId =
      String(body.data?.id ?? body.id ?? "") ||
      req.nextUrl.searchParams.get("data.id") ||
      req.nextUrl.searchParams.get("id") ||
      "";

    if (!paymentId) {
      return NextResponse.json(
        { ok: false, error: "Missing payment id" },
        { status: 400 }
      );
    }

    const payment = await fetchMpPayment(paymentId);
    if (!payment) {
      return NextResponse.json(
        { ok: false, error: "Payment not found in MP" },
        { status: 404 }
      );
    }

    const ref = parseExternalReference(payment.external_reference);
    if (!ref?.shareId) {
      console.error(
        "[MP_WEBHOOK] external_reference inválido:",
        payment.external_reference
      );
      return NextResponse.json({ ok: true, skipped: "no-share-id" });
    }

    const db = getDb();
    const sessionRef = db.collection("sessions").doc(ref.shareId);

    // Idempotencia — si ya procesamos este paymentId con status final, no reprocesamos
    const snap = await sessionRef.get();
    const existing = snap.data()?.checkout as
      | {
          paymentId?: string;
          status?: string;
        }
      | undefined;

    if (
      existing?.paymentId === paymentId &&
      existing?.status === "completed"
    ) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    const sku = (payment.metadata?.sku as string) || "unknown";
    const internalId = (payment.metadata?.internalId as string) || ref.internalId;
    const status = payment.status; // approved | pending | rejected | in_process | refunded | etc

    let mappedStatus: "completed" | "pending" | "failed" | "redirected" = "pending";
    if (status === "approved") mappedStatus = "completed";
    else if (status === "rejected" || status === "cancelled") mappedStatus = "failed";
    else if (status === "in_process" || status === "pending") mappedStatus = "pending";

    await sessionRef.set(
      {
        checkout: {
          provider: "mercadopago",
          sku,
          internalId,
          paymentId,
          status: mappedStatus,
          mpStatus: status,
          mpStatusDetail: payment.status_detail || null,
          amount: payment.transaction_amount || null,
          payerEmail: payment.payer?.email || null,
          approvedAt: payment.date_approved
            ? new Date(payment.date_approved)
            : null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        lastActivityAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Telemetry
    if (mappedStatus === "completed") {
      await trackEvent({
        sessionId: ref.shareId,
        event: "mp_checkout_completed",
        metadata: {
          sku,
          paymentId,
          amount: payment.transaction_amount,
        },
      });
    } else if (mappedStatus === "failed") {
      await trackEvent({
        sessionId: ref.shareId,
        event: "mp_checkout_failed",
        metadata: { sku, paymentId, reason: payment.status_detail || status },
      });
    } else {
      await trackEvent({
        sessionId: ref.shareId,
        event: "mp_checkout_pending",
        metadata: { sku, paymentId },
      });
    }

    return NextResponse.json({
      ok: true,
      paymentId,
      shareId: ref.shareId,
      status: mappedStatus,
    });
  } catch (error) {
    console.error("[MP_WEBHOOK]", error, "rawBody:", rawBody?.slice(0, 200));
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// MP a veces hace GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ ok: true, service: "mp-webhook" });
}
