import { NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import ResultsEmail from "@/emails/ResultsEmail";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shareId } = body as { shareId?: string };
    if (!shareId) return NextResponse.json({ error: "Missing shareId" }, { status: 400 });

    const key = process.env.RESEND_API_KEY;
    if (!key) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 400 });

    // Fetch session to get the owner's email - SECURITY: only send to session owner
    const db = getDb();
    const sessionDoc = await db.collection("sessions").doc(shareId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const ownerEmail = sessionData?.input?.email;
    if (!ownerEmail) {
      return NextResponse.json({ error: "No email associated with this session" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000";
    const url = String(baseUrl).startsWith("http") ? `${baseUrl}/s/${shareId}` : `https://${baseUrl}/s/${shareId}`;

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: "NGX Transform <no-reply@resend.dev>",
      to: ownerEmail, // SECURITY: Only send to session owner, not arbitrary addresses
      subject: "Tus resultados NGX están listos",
      react: React.createElement(ResultsEmail, { url })
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
