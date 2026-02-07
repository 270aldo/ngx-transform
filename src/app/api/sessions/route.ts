import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import { getBucket, getDb } from "@/lib/firebaseAdmin";
import { CreateSessionSchema } from "@/lib/validators";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { telemetry, initSessionMetrics, startTimer } from "@/lib/telemetry";
import { getOrCreateJob } from "@/lib/jobManager";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/authServer";
import { sendN8NWebhook } from "@/lib/n8nWebhook";

/**
 * Genera un token seguro para acciones destructivas
 */
function generateDeleteToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function POST(req: Request) {
  const timer = startTimer();
  let ipDocId: string | null = null;
  let emailDocId: string | null = null;
  let shareId: string | null = null;

  try {
    const body = await req.json();
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const authUser = await requireAuth(req);
    const { email: formEmail, input, photoPath, landingVariant } = parsed.data;

    // Determine the email to use: prefer auth email, fall back to form email
    const userEmail = authUser.email || formEmail;
    if (!userEmail) {
      return NextResponse.json({ error: "Email is required. Please sign in with Google or email/password." }, { status: 400 });
    }

    // If both auth email and form email exist, they must match
    if (authUser.email && formEmail && formEmail.toLowerCase() !== authUser.email.toLowerCase()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
    }
    // Validate photo path ownership (prevent path injection)
    const expectedPrefix = `uploads/${authUser.uid}/`;
    if (!photoPath.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: "Invalid photo path" }, { status: 400 });
    }
    const ip = getClientIP(req);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    ipDocId = `${ip}-${today}`;

    const db = getDb();
    const limit = Number(process.env.MAX_SESSIONS_PER_IP_PER_DAY || "3");
    const emailLimit = Number(process.env.MAX_SESSIONS_PER_EMAIL_PER_DAY || "2");

    // Distributed rate limiting (Upstash Redis)
    const rateLimitResult = await checkRateLimit("api:sessions", ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Vuelve mañana." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Rate limit per IP + email per day (transaction to avoid race)
    if (ip !== "unknown") {
      const rlRef = db.collection("rate_limits").doc(ipDocId);
      emailDocId = `${userEmail.toLowerCase()}-${today}`;
      const erRef = db.collection("rate_limits_email").doc(emailDocId);

      await db.runTransaction(async (tx) => {
        const [rlSnap, erSnap] = await Promise.all([tx.get(rlRef), tx.get(erRef)]);
        const ipCount = rlSnap.exists ? (rlSnap.data()?.count || 0) : 0;
        const emailCount = erSnap.exists ? (erSnap.data()?.count || 0) : 0;

        if (ipCount >= limit) {
          throw new Error("RATE_LIMIT_IP");
        }
        if (emailCount >= emailLimit) {
          throw new Error("RATE_LIMIT_EMAIL");
        }

        tx.set(
          rlRef,
          { count: ipCount + 1, ip, day: today, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
        tx.set(
          erRef,
          { count: emailCount + 1, email: userEmail.toLowerCase(), day: today, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
      });
    } else {
      // Rate limit by email only when IP is unknown
      emailDocId = `${userEmail.toLowerCase()}-${today}`;
      const erRef = db.collection("rate_limits_email").doc(emailDocId);
      await db.runTransaction(async (tx) => {
        const erSnap = await tx.get(erRef);
        const emailCount = erSnap.exists ? (erSnap.data()?.count || 0) : 0;
        if (emailCount >= emailLimit) {
          throw new Error("RATE_LIMIT_EMAIL");
        }
        tx.set(
          erRef,
          { count: emailCount + 1, email: userEmail.toLowerCase(), day: today, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
      });
    }

    // Validate uploaded file metadata before creating session
    try {
      const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || "10485760"); // 10MB default
      const file = getBucket().file(photoPath);
      const [metadata] = await file.getMetadata();
      const size = Number(metadata.size || 0);
      const contentType = metadata.contentType || "";
      if (!contentType.startsWith("image/")) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (size <= 0 || size > maxBytes) {
        return NextResponse.json({ error: "File too large" }, { status: 400 });
      }
    } catch (metaError) {
      console.error("[Sessions] Photo metadata validation failed:", metaError);
      return NextResponse.json({ error: "Photo not found or inaccessible" }, { status: 400 });
    }

    shareId = randomUUID().replace(/-/g, "").slice(0, 12);
    const deleteToken = generateDeleteToken();
    const ref = db.collection("sessions").doc(shareId);

    // Inicializar métricas de sesión
    await initSessionMetrics(shareId);

    await ref.set({
      shareId,
      email: userEmail,
      ownerUid: authUser.uid,
      hybridStatus: "prospect",
      hybridConvertedAt: null,
      shareOriginal: false,
      shareScope: {
        shareOriginal: false,
        shareInsights: false,
        shareProfile: false,
      },
      input,
      photo: { originalStoragePath: photoPath },
      ai: null,
      assets: {},
      status: "processing",
      deleteToken, // Token para acciones destructivas
      source: {
        variant: landingVariant || "general",
      },
      lastActivityAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Crear job para tracking
    await getOrCreateJob(shareId, "analysis", { generateDeleteToken: false });

    // Track evento de sesión creada
    await telemetry.sessionCreated(shareId);

    void sendN8NWebhook("lead_captured", {
      shareId,
      email: userEmail,
      source: landingVariant || "general",
    });

    // Fire-and-forget email confirmation with share link (with telemetry)
    (async () => {
      try {
        const key = process.env.RESEND_API_KEY;
        if (!key) return;
        const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_BASE_URL ||
          vercelUrl ||
          "http://localhost:3000";
        const url = String(baseUrl).startsWith("http") ? `${baseUrl}/s/${shareId}` : `https://${baseUrl}/s/${shareId}`;
        const resend = new Resend(key);
        await resend.emails.send({
          from: "NGX Transform <no-reply@resend.dev>",
          to: userEmail,
          subject: "Tus resultados NGX están en proceso",
          html: `<p>Estamos generando tu proyección. Podrás verla aquí:</p><p><a href="${url}">${url}</a></p><p>Puede tardar unos minutos.</p>`,
        });
      } catch (err) {
        console.error("[Sessions] Resend preflight email failed:", err);
      }
    })();

    const latency = timer.stop();
    console.log(`[Sessions] Created ${shareId} in ${latency}ms`);

    return NextResponse.json({
      sessionId: shareId,
      latency_ms: latency,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "RATE_LIMIT_IP") {
      return NextResponse.json({ error: "Rate limit exceeded. Vuelve mañana." }, { status: 429 });
    }
    if (message === "RATE_LIMIT_EMAIL") {
      return NextResponse.json({ error: "Demasiados intentos para este correo hoy." }, { status: 429 });
    }
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[Sessions] Error:", e);

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
    } catch (rollbackError) {
      console.error("[Sessions] Rollback error:", rollbackError);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
