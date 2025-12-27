import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebaseAdmin";
import {
  generateChatSequence,
  ChatStreamEvent,
} from "@/lib/genesis-orchestrator";
import { DemoUserResponses } from "@/types/demo";

// Request schema
const requestSchema = z.object({
  shareId: z.string().min(1),
  responses: z.object({
    trainingDays: z.enum(["2-3", "4", "5+"]).nullable(),
    goal: z.enum(["muscle", "fat", "both"]).nullable(),
    equipment: z.enum(["gym", "home", "bodyweight"]).nullable(),
  }),
  action: z.enum(["start", "message"]).default("start"),
  message: z.string().optional(),
});

// Delays between events (ms) for realistic feel
const DELAYS = {
  genesis_message: 500,
  agent_status: 300,
  agent_report: 1200,
  plan_ready: 800,
};

/**
 * POST /api/genesis-chat
 * Streams chat events using Server-Sent Events (SSE)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareId, responses, action } = requestSchema.parse(body);

    // Validate session exists
    const db = getDb();
    const snap = await db.collection("sessions").doc(shareId).get();

    if (!snap.exists) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const sessionData = snap.data() as { email?: string };
    const userName = sessionData.email?.split("@")[0] || "Usuario";

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (action === "start") {
            // Generate full chat sequence
            const events = generateChatSequence(userName, responses as DemoUserResponses);

            for (const event of events) {
              // Send event
              const data = JSON.stringify(event);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));

              // Add delay for realistic feel
              const delay = DELAYS[event.type as keyof typeof DELAYS] || 500;
              await sleep(delay);
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
          controller.close();
        } catch (error) {
          console.error("[genesis-chat] Stream error:", error);
          const errorEvent: ChatStreamEvent = {
            type: "error",
            content: "Error al procesar tu solicitud. Por favor intenta de nuevo.",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[genesis-chat] Error:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
