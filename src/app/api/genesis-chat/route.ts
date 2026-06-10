import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { isSessionOwnerAuthError, requireSessionOwner } from "@/lib/authServer";
import { buildGenesisSystemPrompt } from "@/config/genesis/knowledge/prompt";
import { withTimeout } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1).max(2000),
});

const ChatRequestSchema = z.object({
  shareId: z.string().min(1).max(120),
  messages: z.array(MessageSchema).min(1).max(20),
});

const CHAT_TIMEOUT_MS = Number(process.env.GENESIS_CHAT_TIMEOUT_MS) || 30000;

/**
 * GENESIS text chat — second conversational channel over the same knowledge
 * base + funnel as the voice agent. Stateless (client holds the history; no
 * transcript stored). Streams Gemini Flash as text/plain. See spec
 * docs/superpowers/specs/2026-06-10-genesis-text-chat-design.md.
 */
export async function POST(req: NextRequest) {
  try {
    const enabled =
      process.env.FF_HYBRID_TEXT_CHAT !== "false" &&
      process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT !== "false";
    if (!enabled) {
      return NextResponse.json(
        { ok: false, error: "Text chat is disabled" },
        { status: 403 },
      );
    }

    const body = ChatRequestSchema.parse(await req.json().catch(() => ({})));

    const { authUser } = await requireSessionOwner(req, body.shareId);

    const limit = await checkRateLimit("api:genesis-chat", authUser.uid);
    if (!limit.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(limit) },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY not configured" },
        { status: 503 },
      );
    }

    const model = process.env.GENESIS_CHAT_MODEL || "gemini-2.5-flash";
    const systemInstruction = buildGenesisSystemPrompt({
      channel: "text",
      shareId: body.shareId,
    });
    const contents = body.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const ai = new GoogleGenAI({ apiKey });
    const genStream = await withTimeout(
      ai.models.generateContentStream({
        model,
        contents,
        config: { systemInstruction },
      }),
      CHAT_TIMEOUT_MS,
      "genesis_chat",
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of genStream) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("[GENESIS_CHAT] stream error", err);
          controller.enqueue(
            encoder.encode(
              "\n\n[La respuesta se interrumpió. Intenta de nuevo.]",
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    if (isSessionOwnerAuthError(error)) {
      return NextResponse.json(
        { ok: false, error: error.code },
        { status: error.status },
      );
    }
    console.error("[GENESIS_CHAT]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
