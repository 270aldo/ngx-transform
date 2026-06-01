import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from "@/lib/rateLimit";

const RealtimeSessionRequestSchema = z.object({
  shareId: z.string().min(1).max(120).optional(),
  saveTranscript: z.boolean().default(false),
});

const OPENAI_REALTIME_CLIENT_SECRET_URL =
  "https://api.openai.com/v1/realtime/client_secrets";

function readClientSecret(payload: unknown): {
  value?: string;
  expiresAt?: number;
} {
  if (!payload || typeof payload !== "object") return {};
  const data = payload as {
    value?: string;
    expires_at?: number;
    client_secret?: { value?: string; expires_at?: number };
    secret?: { value?: string; expires_at?: number };
  };

  return {
    value: data.value ?? data.client_secret?.value ?? data.secret?.value,
    expiresAt:
      data.expires_at ?? data.client_secret?.expires_at ?? data.secret?.expires_at,
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  const clientIP = getClientIP(req);
  const limit = await checkRateLimit("api:general", clientIP);
  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: getRateLimitHeaders(limit) }
    );
  }

  try {
    const body = RealtimeSessionRequestSchema.parse(await req.json().catch(() => ({})));
    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

    const instructions = [
      "Eres GENESIS, el agente conversacional de NGX Vision.",
      "Tu tarea es entrevistar brevemente al usuario después de ver su diagnóstico visual.",
      "Clasifica el fit en una de estas etiquetas exactas: listo_para_diagnostico, necesita_claridad, no_fit_ahora.",
      "Explica NGX Vision y NGX HYBRID con lenguaje sobrio.",
      "No diagnostiques salud, no des prescripciones médicas o nutricionales, y no prometas resultados físicos.",
      "Haz máximo 5 preguntas antes de recomendar el siguiente paso.",
      body.saveTranscript
        ? "El usuario consintió guardar un resumen; al final resume intención, fricción y clasificación."
        : "No guardes ni pidas datos sensibles; el transcript es solo para esta sesión del navegador.",
      body.shareId ? `Contexto de sesión: ${body.shareId}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const openaiRes = await fetch(OPENAI_REALTIME_CLIENT_SECRET_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          instructions,
        },
      }),
    });

    const payload = await openaiRes.json().catch(() => ({}));
    if (!openaiRes.ok) {
      console.error("[REALTIME_SESSION] OpenAI error", {
        status: openaiRes.status,
        payload,
      });
      return NextResponse.json(
        { ok: false, error: "Could not create realtime session" },
        { status: 502 }
      );
    }

    const secret = readClientSecret(payload);
    if (!secret.value) {
      console.error("[REALTIME_SESSION] Missing client secret in OpenAI response", payload);
      return NextResponse.json(
        { ok: false, error: "Realtime client secret missing" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        provider: "openai",
        model,
        client_secret: secret.value,
        expires_at: secret.expiresAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[REALTIME_SESSION]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
