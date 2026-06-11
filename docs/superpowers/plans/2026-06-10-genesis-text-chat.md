# GENESIS Text Chat (Fase 2 · #13) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a streaming text chat with GENESIS on `/s/[shareId]`, over the same knowledge base and lead funnel as the existing voice agent.

**Architecture:** New `GenesisTextChat` client component (own section above the voice agent) → new stateless `POST /api/genesis-chat` that builds the canonical system prompt (`buildGenesisSystemPrompt({channel:"text"})`) and streams Gemini Flash back as `text/plain`. Lead classification + CTA routing are extracted into a shared `leadClassification.ts` that both voice and text import (single-source funnel). Cost is bounded by a dedicated fail-open rate-limit bucket; no transcript is persisted (only the existing `/classify` write).

**Tech Stack:** Next.js App Router (route handlers), `@google/genai` v2 (`generateContentStream`), Upstash rate limiting, Firebase auth (`requireSessionOwner`), Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-10-genesis-text-chat-design.md`

---

## File Structure

**Create:**
- `src/lib/genesis/leadClassification.ts` — shared types + `parseClassification` + CTA map (extracted from `HybridVoiceAgent`).
- `src/lib/genesis/leadClassification.test.ts` — unit tests for the helper.
- `src/app/api/genesis-chat/route.ts` — streaming chat endpoint.
- `src/app/api/genesis-chat/route.test.ts` — route tests (mocked genai/auth/ratelimit).
- `src/components/results/GenesisTextChat.tsx` — chat UI (NGX glass), streaming, CTA.

**Modify:**
- `src/components/results/HybridVoiceAgent.tsx` — import the shared helper, delete inline dupes.
- `src/lib/rateLimit.ts` — add `api:genesis-chat` bucket (2 places).
- `src/lib/telemetry.ts` — 2 new `FunnelEvent` members.
- `src/lib/validators.ts` — 2 new `TelemetryEventSchema` enum members.
- `src/app/s/[shareId]/page.tsx` — flag + import + mount.
- `src/app/s/[shareId]/seasonVisionReportPage.test.ts` — assert page renders `GenesisTextChat`.
- `.env.example` — flag + model + timeout.
- `CLAUDE.md` — fix the stale `/api/genesis-chat` row.

---

## Task 1: Shared lead-classification helper (extract from voice agent)

**Files:**
- Create: `src/lib/genesis/leadClassification.ts`
- Test: `src/lib/genesis/leadClassification.test.ts`
- Modify: `src/components/results/HybridVoiceAgent.tsx` (remove inline dupes, import helper)

- [ ] **Step 1: Write the failing test**

Create `src/lib/genesis/leadClassification.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  parseClassification,
  CTA_BY_CLASSIFICATION,
  CLASSIFICATION_LABELS,
} from "./leadClassification";

describe("parseClassification", () => {
  it("detects each fit label inside surrounding text", () => {
    expect(parseClassification("Mi veredicto: listo_para_diagnostico.")).toBe(
      "listo_para_diagnostico",
    );
    expect(parseClassification("creo que necesita_claridad todavía")).toBe(
      "necesita_claridad",
    );
    expect(parseClassification("no_fit_ahora")).toBe("no_fit_ahora");
  });

  it("returns null when no label is present", () => {
    expect(parseClassification("hola, ¿cómo estás?")).toBeNull();
    expect(parseClassification("")).toBeNull();
  });

  it("prioritizes 'listo' when multiple labels appear", () => {
    expect(
      parseClassification("listo_para_diagnostico y necesita_claridad"),
    ).toBe("listo_para_diagnostico");
  });

  it("maps every classification to a non-empty CTA and label", () => {
    (Object.keys(CTA_BY_CLASSIFICATION) as Array<
      keyof typeof CTA_BY_CLASSIFICATION
    >).forEach((k) => {
      expect(CTA_BY_CLASSIFICATION[k].label.length).toBeGreaterThan(0);
      expect(CLASSIFICATION_LABELS[k].length).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/genesis/leadClassification.test.ts`
Expected: FAIL — `Cannot find module './leadClassification'`.

- [ ] **Step 3: Create the helper**

Create `src/lib/genesis/leadClassification.ts`:

```ts
/**
 * Single source of truth for GENESIS lead-fit classification and the funnel CTA
 * it routes to. Shared by both conversational channels — the voice agent
 * (`HybridVoiceAgent`) and the text chat (`GenesisTextChat`) — and aligned with
 * the labels in `src/config/genesis/knowledge/prompt.ts` and the persistence in
 * `src/app/api/sessions/[shareId]/classify/route.ts`.
 */
export type FitClassification =
  | "listo_para_diagnostico"
  | "necesita_claridad"
  | "no_fit_ahora";

export type RouteIntent = "hybrid" | "ascend" | "nurture";

export const CLASSIFICATION_LABELS: Record<FitClassification, string> = {
  listo_para_diagnostico: "Listo para diagnóstico",
  necesita_claridad: "Necesita claridad",
  no_fit_ahora: "No fit por ahora",
};

/**
 * The segmented next step per fit classification. This is the funnel routing:
 * - listo    → NGX HYBRID (book a human diagnosis call)
 * - claridad → NGX ASCEND / the offer section (self-serve path)
 * - no fit   → soft exit (the email nurture already has them)
 */
export const CTA_BY_CLASSIFICATION: Record<
  FitClassification,
  { intent: RouteIntent; label: string }
> = {
  listo_para_diagnostico: {
    intent: "hybrid",
    label: "Agendar diagnóstico HYBRID",
  },
  necesita_claridad: { intent: "ascend", label: "Ver opciones y siguiente paso" },
  no_fit_ahora: { intent: "nurture", label: "Recibir mi brief por correo" },
};

/** Detects the first fit label GENESIS emits in free text (priority: listo > claridad > no_fit). */
export function parseClassification(text: string): FitClassification | null {
  if (text.includes("listo_para_diagnostico")) return "listo_para_diagnostico";
  if (text.includes("necesita_claridad")) return "necesita_claridad";
  if (text.includes("no_fit_ahora")) return "no_fit_ahora";
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/genesis/leadClassification.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Refactor `HybridVoiceAgent.tsx` to use the helper**

In `src/components/results/HybridVoiceAgent.tsx`:

Delete these inline declarations (currently lines ~18-21, ~29-33, ~35-40, ~48-56):
- `type FitClassification = …`
- `const CLASSIFICATION_LABELS: Record<FitClassification, string> = { … }`
- `function parseClassification(text: string): FitClassification | null { … }`
- `type RouteIntent = "hybrid" | "ascend" | "nurture";`
- `const CTA_BY_CLASSIFICATION: Record<…> = { … }`

Add this import next to the existing imports (after the `cn` import, line ~13):

```ts
import {
  parseClassification,
  CLASSIFICATION_LABELS,
  CTA_BY_CLASSIFICATION,
  type FitClassification,
  type RouteIntent,
} from "@/lib/genesis/leadClassification";
```

(Leave all other voice-agent code untouched — behavior is identical; the symbols now come from the shared module.)

- [ ] **Step 6: Verify tsc + full test suite stay green**

Run: `npx tsc --noEmit && pnpm vitest run`
Expected: tsc exit 0; all tests pass (153 prior + 4 new = 157).

- [ ] **Step 7: Commit**

```bash
git add src/lib/genesis/leadClassification.ts src/lib/genesis/leadClassification.test.ts src/components/results/HybridVoiceAgent.tsx
git commit -m "$(cat <<'EOF'
refactor(genesis): extract shared lead-classification helper

Single source of truth for fit labels + funnel CTA, shared by the voice
agent and (next) the text chat. Behavior of HybridVoiceAgent unchanged.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Rate-limit bucket + telemetry events (type/config plumbing)

**Files:**
- Modify: `src/lib/rateLimit.ts`
- Modify: `src/lib/telemetry.ts`
- Modify: `src/lib/validators.ts`

- [ ] **Step 1: Add the rate-limit bucket (2 places)**

In `src/lib/rateLimit.ts`, inside `getRateLimiters()`, immediately after the
`api:realtime-session` block (ends ~line 97), add:

```ts
  rateLimiters.set("api:genesis-chat", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(30, "10 m"), // 30 chat turns per owner per 10 min
    prefix: "rl:genesis-chat",
  }));
```

In the same file, inside the `IN_MEMORY_LIMITS` record (after the
`"api:realtime-session"` entry, ~line 162), add:

```ts
  "api:genesis-chat": { max: 30, windowMs: 600000 }, // 30/10min
```

Do **not** add `api:genesis-chat` to `CRITICAL_ENDPOINTS` — the chat must
**fail-open** (cheap conversational channel; availability > strictness), like
`api:realtime-session`.

- [ ] **Step 2: Add the two telemetry events to the union**

In `src/lib/telemetry.ts`, the `FunnelEvent` union currently ends with
`| "voice_agent_cta_clicked";`. Change that line to:

```ts
  | "voice_agent_cta_clicked"
  // GENESIS text chat (Fase 2)
  | "genesis_text_chat_opened"
  | "genesis_text_chat_classified";
```

- [ ] **Step 3: Add the same two events to the telemetry zod enum**

In `src/lib/validators.ts`, inside `TelemetryEventSchema`'s `z.enum([...])`
(starts ~line 99; the enum lists the same events as `FunnelEvent`), add — next
to the `"voice_agent_*"` entries — these two strings:

```ts
    "genesis_text_chat_opened",
    "genesis_text_chat_classified",
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rateLimit.ts src/lib/telemetry.ts src/lib/validators.ts
git commit -m "$(cat <<'EOF'
feat(genesis): add genesis-chat rate-limit bucket + text-chat telemetry events

Dedicated fail-open Upstash bucket (30/10min per owner) for the text chat,
plus genesis_text_chat_opened/_classified funnel events in both the
FunnelEvent union and the public telemetry enum.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `/api/genesis-chat` streaming route (TDD)

**Files:**
- Create: `src/app/api/genesis-chat/route.ts`
- Test: `src/app/api/genesis-chat/route.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/api/genesis-chat/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContentStream = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContentStream },
  })),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 30,
    remaining: 29,
    reset: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/authServer", () => ({
  requireSessionOwner: vi.fn(),
  isSessionOwnerAuthError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "status" in error,
}));

import { POST } from "./route";
import { requireSessionOwner } from "@/lib/authServer";
import { checkRateLimit } from "@/lib/rateLimit";

function request(body: unknown) {
  return new Request("https://ngx.test/api/genesis-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function streamOf(...chunks: string[]) {
  return (async function* () {
    for (const text of chunks) yield { text };
  })();
}

const validBody = {
  shareId: "demo",
  messages: [{ role: "user", content: "¿Qué es HYBRID?" }],
};

describe("genesis-chat API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT;
    delete process.env.FF_HYBRID_TEXT_CHAT;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GENESIS_CHAT_MODEL;
    generateContentStream.mockReset();
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 60000,
    });
    vi.mocked(requireSessionOwner).mockResolvedValue({
      authUser: { uid: "owner_1", email: "owner@test.com" },
      sessionRef: {} as never,
      session: { ownerUid: "owner_1" },
    });
  });

  it("returns 403 when the flag is explicitly off", async () => {
    process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT = "false";
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(403);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("rejects an invalid body with 400", async () => {
    const res = await POST(request({ shareId: "demo", messages: [] }) as never);
    expect(res.status).toBe(400);
  });

  it("blocks non-owners with 401 before calling Gemini", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(requireSessionOwner).mockRejectedValueOnce({
      code: "UNAUTHORIZED",
      status: 401,
    });
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(401);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("returns 429 when rate-limited", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 60000,
    });
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(429);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("returns 503 when GEMINI_API_KEY is missing", async () => {
    const res = await POST(request(validBody) as never);
    expect(res.status).toBe(503);
  });

  it("streams the model reply built from the text-channel system prompt", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    generateContentStream.mockResolvedValueOnce(
      streamOf("Hola, soy GENESIS. ", "listo_para_diagnostico"),
    );

    const res = await POST(request(validBody) as never);
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(text).toContain("GENESIS");
    expect(text).toContain("listo_para_diagnostico");
    expect(checkRateLimit).toHaveBeenCalledWith("api:genesis-chat", "owner_1");
    expect(generateContentStream).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining("listo_para_diagnostico"),
        }),
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/api/genesis-chat/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Implement the route**

Create `src/app/api/genesis-chat/route.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/api/genesis-chat/route.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/genesis-chat/route.ts src/app/api/genesis-chat/route.test.ts
git commit -m "$(cat <<'EOF'
feat(genesis): streaming text-chat API over the GENESIS knowledge base

POST /api/genesis-chat — zod -> flag -> requireSessionOwner -> rate limit ->
Gemini Flash generateContentStream (text channel system prompt) -> text/plain
stream. Stateless; bounded by withTimeout + the genesis-chat bucket.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `GenesisTextChat` component

**Files:**
- Create: `src/components/results/GenesisTextChat.tsx`

(No unit test: this repo verifies result components via tsc + the page-source
test in Task 5, not React Testing Library. The streaming fetch logic mirrors the
already-tested route, and classification uses the Task 1 helper.)

- [ ] **Step 1: Create the component**

Create `src/components/results/GenesisTextChat.tsx`:

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  PhoneCall,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  parseClassification,
  CLASSIFICATION_LABELS,
  CTA_BY_CLASSIFICATION,
  type FitClassification,
  type RouteIntent,
} from "@/lib/genesis/leadClassification";

interface GenesisTextChatProps {
  shareId: string;
  className?: string;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const MAX_INPUT = 2000;

async function emitTelemetry(
  shareId: string,
  event: "genesis_text_chat_opened" | "genesis_text_chat_classified",
  metadata?: Record<string, unknown>,
) {
  await fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: shareId,
      shareId,
      event,
      metadata: { ...metadata, location: "genesis_text_chat" },
    }),
  }).catch(() => {});
}

export function GenesisTextChat({ shareId, className }: GenesisTextChatProps) {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] =
    useState<FitClassification | null>(null);
  const openedRef = useRef(false);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    if (authLoading) {
      setError("Estamos validando tu sesión. Intenta de nuevo en unos segundos.");
      return;
    }
    if (!user) {
      setError("Abre tu sesión original para chatear con GENESIS.");
      return;
    }
    setError(null);

    const token = await getIdToken();
    if (!token) {
      setError("No se pudo validar tu sesión para chatear con GENESIS.");
      return;
    }
    if (!openedRef.current) {
      openedRef.current = true;
      void emitTelemetry(shareId, "genesis_text_chat_opened");
    }

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "model", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/genesis-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareId, messages: history }),
      });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "GENESIS no pudo responder.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const next = [...cur];
          next[next.length - 1] = { role: "model", content: acc };
          return next;
        });
      }

      const parsed = parseClassification(acc);
      if (parsed && parsed !== classification) {
        setClassification(parsed);
        void emitTelemetry(shareId, "genesis_text_chat_classified", {
          classification: parsed,
        });
        // Persist fit + route the lead into the funnel (same endpoint as voice).
        const t = await getIdToken();
        if (t) {
          void fetch(`/api/sessions/${shareId}/classify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`,
            },
            body: JSON.stringify({ classification: parsed }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al hablar con GENESIS.",
      );
      // Drop the trailing empty model bubble on failure.
      setMessages((cur) =>
        cur.filter(
          (m, i) =>
            !(i === cur.length - 1 && m.role === "model" && m.content === ""),
        ),
      );
    } finally {
      setStreaming(false);
    }
  }, [
    input,
    streaming,
    authLoading,
    user,
    getIdToken,
    messages,
    shareId,
    classification,
  ]);

  const cta = classification
    ? CTA_BY_CLASSIFICATION[classification]
    : { intent: "hybrid" as RouteIntent, label: "Agendar diagnóstico HYBRID" };

  const onCtaClick = () => {
    if (cta.intent === "hybrid") {
      const url =
        process.env.NEXT_PUBLIC_CALENDLY_URL ||
        process.env.NEXT_PUBLIC_BOOKING_URL;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
    }
    document
      .getElementById("hybrid-offer")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="genesis-text-chat"
      className={cn(
        "relative mx-auto max-w-6xl px-4 py-14 md:py-20 scroll-mt-24",
        className,
      )}
    >
      <div className="ngx-section-panel relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_28%_18%,rgba(109,0,255,0.10),transparent_36%)]" />
        <div className="relative z-10">
          <span className="ngx-eyebrow-pill mb-4">GENESIS · chat</span>
          <h2 className="ngx-h1 !text-left">
            Pregúntale a GENESIS lo que quieras.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
            Resuelve tus dudas sobre NGX y el programa HYBRID por texto. GENESIS
            te orienta y, cuando hace sentido, te dice el siguiente paso. No da
            diagnóstico médico ni promete resultados.
          </p>

          <div className="ngx-glass mt-6 !p-4 md:!p-5">
            <div className="flex max-h-[42vh] min-h-[160px] flex-col gap-3 overflow-y-auto pr-1">
              {messages.length === 0 && (
                <p className="m-auto max-w-sm text-center text-sm text-white/45">
                  Escribe tu primera pregunta para empezar.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "self-end bg-[var(--ngx-purple)]/15 text-white"
                      : "self-start border border-white/[0.08] bg-black/20 text-white/85",
                  )}
                >
                  {m.content ||
                    (streaming && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
                {error}
              </p>
            )}

            {classification && (
              <div className="mt-3 rounded-2xl border border-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/10 px-4 py-2.5">
                <span
                  className="ngx-eyebrow !text-[11px]"
                  style={{ color: "var(--ngx-purple-light)" }}
                >
                  Clasificación preliminar
                </span>
                <p className="mt-0.5 font-bold text-white">
                  {CLASSIFICATION_LABELS[classification]}
                </p>
              </div>
            )}

            <form
              className="mt-4 flex items-end gap-2 border-t border-white/[0.08] pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                value={input}
                maxLength={MAX_INPUT}
                rows={1}
                disabled={streaming || authLoading || !user}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={
                  !user && !authLoading
                    ? "Abre tu sesión original para chatear"
                    : "Escribe tu pregunta…"
                }
                className="min-h-[48px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--ngx-purple)]/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={streaming || authLoading || !user || !input.trim()}
                className="ngx-primary-cta inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {streaming ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar
              </button>
            </form>

            <button
              onClick={onCtaClick}
              className="ngx-glass-clear mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/85 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <CalendarDays className="h-4 w-4" />
              {cta.label}
              {cta.intent === "hybrid" ? (
                <PhoneCall className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify tsc + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/results/GenesisTextChat.tsx
git commit -m "$(cat <<'EOF'
feat(genesis): GenesisTextChat component (streaming chat UI)

NGX-glass chat surface: streaming reply, shared lead classification + segmented
CTA, owner-gated like the voice agent, opened/classified telemetry.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Mount in the results page (TDD via page-source test)

**Files:**
- Modify: `src/app/s/[shareId]/seasonVisionReportPage.test.ts`
- Modify: `src/app/s/[shareId]/page.tsx`

- [ ] **Step 1: Add the failing assertion**

In `src/app/s/[shareId]/seasonVisionReportPage.test.ts`, next to the existing
`expect(pageSource).toContain("HybridVoiceAgent");` (line ~17), add:

```ts
    expect(pageSource).toContain("GenesisTextChat");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/s/[shareId]/seasonVisionReportPage.test.ts`
Expected: FAIL — page source does not contain `GenesisTextChat`.

- [ ] **Step 3: Wire the component into the page**

In `src/app/s/[shareId]/page.tsx`:

Add the import after the `HybridVoiceAgent` import (line ~9):

```ts
import { GenesisTextChat } from "@/components/results/GenesisTextChat";
```

Add the flag after the `FF_HYBRID_VOICE_AGENT` declaration (after line ~21):

```ts
const FF_HYBRID_TEXT_CHAT =
  process.env.NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT !== "false";
```

Mount the chat directly above the voice-agent block (before line ~302
`{isReady && FF_HYBRID_VOICE_AGENT && (`):

```tsx
      {isReady && FF_HYBRID_TEXT_CHAT && (
        <GenesisTextChat shareId={shareId} />
      )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/s/[shareId]/seasonVisionReportPage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/s/[shareId]/page.tsx" "src/app/s/[shareId]/seasonVisionReportPage.test.ts"
git commit -m "$(cat <<'EOF'
feat(genesis): mount GenesisTextChat above the voice agent on results

Flag NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT (default on). Text is the lower-friction
primary channel; voice stays as-is below it.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Docs + full verification gate + finish branch

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Document env in `.env.example`**

In `.env.example`, near the other `NEXT_PUBLIC_FF_HYBRID_*` / GENESIS entries, add:

```bash
# GENESIS text chat (Fase 2) — second conversational channel over the KB
NEXT_PUBLIC_FF_HYBRID_TEXT_CHAT=true        # default on; set "false" to disable
GENESIS_CHAT_MODEL=gemini-2.5-flash         # text-chat brain (cheap/fast)
GENESIS_CHAT_TIMEOUT_MS=30000               # bound the Gemini stream start
```

- [ ] **Step 2: Fix the stale `/api/genesis-chat` row in `CLAUDE.md`**

In `CLAUDE.md`, find the API-routes table row:

```
| `/api/genesis-chat` | POST | DemoChat responses with A2UI widgets (v3.0) |
```

Replace it with:

```
| `/api/genesis-chat` | POST | GENESIS text chat — streaming Gemini over the knowledge base (Fase 2) |
```

- [ ] **Step 3: Run the full verification gate**

Run: `npx tsc --noEmit && pnpm lint && pnpm vitest run && pnpm build`
Expected: tsc 0; lint 0; all tests pass (≈163: 153 prior + 4 helper + 6 route);
`next build` completes with the route manifest including `ƒ /api/genesis-chat`.

- [ ] **Step 4: Grep-based acceptance checks**

Run:
```bash
grep -rn "api:genesis-chat" src/lib/rateLimit.ts        # expect 2 hits
grep -c "parseClassification" src/components/results/HybridVoiceAgent.tsx  # expect 1 (import usage), 0 inline def
grep -rn "genesis-chat" src/app/api/genesis-chat/route.ts
```
Expected: bucket present in both rateLimit places; `parseClassification` no longer
defined inline in the voice agent (only imported/used).

- [ ] **Step 5: Commit docs**

```bash
git add .env.example CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(genesis): document text-chat env + fix stale /api/genesis-chat row

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Finish the development branch**

Invoke `superpowers:finishing-a-development-branch` to choose how to integrate
`feat/lead-gen-pivot` (the whole pivot, now including the text chat). Update the
`lead-gen-pivot-plan` memory with this increment and set "what's next" (Fase 1:
fix-20 loading recovery, or fix-19 email trigger).

---

## Self-Review (against the spec)

**Spec coverage:**
- ✅ Streaming text/plain over `buildGenesisSystemPrompt({channel:"text"})` — Task 3.
- ✅ Own section above the voice agent, flag-gated — Task 5.
- ✅ `requireSessionOwner` auth parity — Task 3.
- ✅ Stateless; classification persisted via existing `/classify`, no summary — Task 4.
- ✅ Shared lead classification + CTA (DRY) — Task 1.
- ✅ Dedicated fail-open rate-limit bucket — Task 2.
- ✅ Input caps (20 messages, 2000 chars) — Task 3 zod.
- ✅ No `reserveSpend` coupling — by omission, intentional.
- ✅ Tests: route (zod/flag/auth/429/503/happy), helper, page-source — Tasks 1/3/5.
- ✅ Docs (.env.example, CLAUDE.md) — Task 6.

**Refinement vs spec:** the spec mentioned a `genesis_chat_message` telemetry
event; the plan ships only `opened` + `classified` (mirrors the voice agent,
avoids per-keystroke noise/cost). No other deviations.

**Placeholder scan:** none — every code/edit step shows complete content.

**Type consistency:** `FitClassification`, `RouteIntent`, `parseClassification`,
`CTA_BY_CLASSIFICATION`, `CLASSIFICATION_LABELS` defined in Task 1 and imported
identically in Tasks 3-style usages and Task 4. Route request shape
(`{shareId, messages:[{role,content}]}`) matches the component's POST body.
Bucket key `api:genesis-chat` identical across rateLimit.ts and the route.
