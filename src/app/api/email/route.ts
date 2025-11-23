import { NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import ResultsEmail from "@/emails/ResultsEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, shareId } = body as { to?: string; shareId?: string };
    if (!to || !shareId) return NextResponse.json({ error: "Missing to or shareId" }, { status: 400 });
    const key = process.env.RESEND_API_KEY;
    if (!key) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000";
    const url = String(baseUrl).startsWith("http") ? `${baseUrl}/s/${shareId}` : `https://${baseUrl}/s/${shareId}`;

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: "NGX Transform <no-reply@resend.dev>",
      to,
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
