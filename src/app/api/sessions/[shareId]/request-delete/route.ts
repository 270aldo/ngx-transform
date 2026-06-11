import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { getDb } from "@/lib/firebaseAdmin";
import { getConfiguredFromEmail } from "@/lib/emailConfig";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * ARCO self-service: re-send the deletion link to the email stored on the
 * session (the only channel that proves mailbox possession), for users on a
 * new device or who lost the original confirmation email (fix-09). No auth —
 * possession of the inbox is the check, like POST /api/email.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await context.params;

    const rl = await checkRateLimit("api:email", getClientIP(req));
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const db = getDb();
    const ref = db.collection("sessions").doc(shareId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const data = snap.data() as
      | { email?: string; deleteToken?: string }
      | undefined;
    const email = data?.email;
    if (!email) {
      return NextResponse.json(
        { error: "No email associated with this session" },
        { status: 400 }
      );
    }

    // Very old sessions may predate the deleteToken — mint and persist one.
    let deleteToken = data?.deleteToken;
    if (!deleteToken) {
      deleteToken = randomBytes(32).toString("base64url");
      await ref.set({ deleteToken }, { merge: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = getConfiguredFromEmail("RequestDelete");
    if (!apiKey || !from) {
      return NextResponse.json(
        { error: "Email sender not configured" },
        { status: 503 }
      );
    }

    const vercelUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null;
    const rawBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      vercelUrl ||
      "http://localhost:3000";
    const base = String(rawBase).startsWith("http")
      ? rawBase
      : `https://${rawBase}`;
    const deleteUrl = `${base}/delete?shareId=${shareId}&token=${encodeURIComponent(
      deleteToken
    )}`;

    // Transactional/legal (ARCO) — must reach the user even if they opted out
    // of marketing, so we do NOT check email suppression.
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: email,
      subject: "Enlace para eliminar tus datos de NGX Vision",
      html: `<p>Recibimos una solicitud para eliminar tus datos de NGX Vision.</p><p>Para confirmar la eliminación de tu sesión (foto original, imágenes generadas y perfil), abre este enlace:</p><p><a href="${deleteUrl}">Eliminar mis datos</a></p><p style="font-size:12px;color:#888">Esta acción es irreversible. Si no fuiste tú, ignora este correo.</p>`,
    });

    // Never echo the email or token (anti-enumeration of PII).
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[REQUEST_DELETE]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
