import { NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import ResultsEmail from "@/emails/ResultsEmail";
import { getDb } from "@/lib/firebaseAdmin";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";
import { isEmailSuppressed } from "@/lib/emailSuppression";
import { requireAuth } from "@/lib/authServer";
import { getConfiguredFromEmail } from "@/lib/emailConfig";

function getFromEmail(): string | null {
  return getConfiguredFromEmail("EMAIL");
}

export async function POST(req: Request) {
  try {
    // Rate limiting by IP (Upstash Redis)
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit("api:email", clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await req.json();
    const { shareId } = body as { shareId?: string };
    if (!shareId) return NextResponse.json({ error: "Missing shareId" }, { status: 400 });

    const authUser = await requireAuth(req);

    const key = process.env.RESEND_API_KEY;
    if (!key) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 400 });

    // Fetch session to get the owner's email - SECURITY: only send to session owner
    const db = getDb();
    const sessionDoc = await db.collection("sessions").doc(shareId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const ownerUid = sessionData?.ownerUid as string | undefined;
    if (ownerUid && ownerUid !== authUser.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const ownerEmail = sessionData?.email || sessionData?.input?.email;
    if (!ownerEmail) {
      return NextResponse.json({ error: "No email associated with this session" }, { status: 400 });
    }
    if (!ownerUid && authUser.email && ownerEmail.toLowerCase() !== authUser.email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (await isEmailSuppressed(ownerEmail)) {
      return NextResponse.json({ ok: false, skipped: true, message: "Email suppressed" }, { status: 200 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const url = String(baseUrl).startsWith("http") ? `${baseUrl}/s/${shareId}` : `https://${baseUrl}/s/${shareId}`;
    const from = getFromEmail();
    if (!from) {
      console.error("[EMAIL] RESEND_FROM_EMAIL not configured in production");
      return NextResponse.json({ error: "Email sender not configured" }, { status: 503 });
    }

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to: ownerEmail, // SECURITY: Only send to session owner, not arbitrary addresses
      subject: "Tus resultados NGX están listos",
      react: React.createElement(ResultsEmail, { url })
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
