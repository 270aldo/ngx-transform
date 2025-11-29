import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { CreateSessionSchema } from "@/lib/validators";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { Resend } from "resend";

export async function POST(req: Request) {
  let ipDocId: string | null = null;
  let emailDocId: string | null = null;
  try {
    const body = await req.json();
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, input, photoPath } = parsed.data;
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    ipDocId = `${ip}-${today}`;

    const db = getDb();
    const limit = Number(process.env.MAX_SESSIONS_PER_IP_PER_DAY || "3");
    const emailLimit = Number(process.env.MAX_SESSIONS_PER_EMAIL_PER_DAY || "2");

    // Rate limit per IP per day
    if (ip !== "unknown") {
      const rlRef = db.collection("rate_limits").doc(ipDocId);
      const rlSnap = await rlRef.get();
      const current = rlSnap.exists ? rlSnap.data()?.count || 0 : 0;
      if (current >= limit) {
        return NextResponse.json({ error: "Rate limit exceeded. Vuelve mañana." }, { status: 429 });
      }
      await rlRef.set(
        { count: FieldValue.increment(1), ip, day: today, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    if (email) {
      emailDocId = `${email.toLowerCase()}-${today}`;
      const erRef = db.collection("rate_limits_email").doc(emailDocId);
      const erSnap = await erRef.get();
      const current = erSnap.exists ? erSnap.data()?.count || 0 : 0;
      if (current >= emailLimit) {
        return NextResponse.json({ error: "Demasiados intentos para este correo hoy." }, { status: 429 });
      }
      await erRef.set(
        { count: FieldValue.increment(1), email: email.toLowerCase(), day: today, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    const shareId = randomUUID().replace(/-/g, "").slice(0, 12);
    const ref = db.collection("sessions").doc(shareId);

    await ref.set({
      shareId,
      email: email ?? null,
      input,
      photo: { originalStoragePath: photoPath },
      ai: null,
      assets: {},
      status: "processing",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Fire webhook to n8n (non-blocking)
    (async () => {
      try {
        const webhook = process.env.N8N_WEBHOOK_URL;
        if (!webhook) return;
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ngx_session_created",
            shareId,
            email: email ?? null,
            input,
            source: "wizard",
            createdAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("n8n webhook failed", err);
      }
    })();

    // Fire-and-forget email confirmation with share link (validates correo)
    (async () => {
      try {
        if (!email) return;
        const key = process.env.RESEND_API_KEY;
        if (!key) return;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000";
        const url = String(baseUrl).startsWith("http") ? `${baseUrl}/s/${shareId}` : `https://${baseUrl}/s/${shareId}`;
        const resend = new Resend(key);
        await resend.emails.send({
          from: "NGX Transform <no-reply@resend.dev>",
          to: email,
          subject: "Tus resultados NGX están en proceso",
          html: `<p>Estamos generando tu proyección. Podrás verla aquí:</p><p><a href="${url}">${url}</a></p><p>Puede tardar unos minutos.</p>`,
        });
      } catch (err) {
        console.error("Resend preflight email failed", err);
      }
    })();

    return NextResponse.json({ sessionId: shareId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    // Rollback rate-limit increment if session creation failed (safe decrement with min 0)
    try {
      const db = getDb();
      if (ipDocId) {
        const ipRef = db.collection("rate_limits").doc(ipDocId);
        await db.runTransaction(async (t) => {
          const doc = await t.get(ipRef);
          if (doc.exists) {
            const current = doc.data()?.count || 0;
            t.update(ipRef, { count: Math.max(0, current - 1) });
          }
        });
      }
      if (emailDocId) {
        const emailRef = db.collection("rate_limits_email").doc(emailDocId);
        await db.runTransaction(async (t) => {
          const doc = await t.get(emailRef);
          if (doc.exists) {
            const current = doc.data()?.count || 0;
            t.update(emailRef, { count: Math.max(0, current - 1) });
          }
        });
      }
    } catch {}
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
