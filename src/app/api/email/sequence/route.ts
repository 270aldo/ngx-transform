import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  startEmailSequence,
  getSequenceStatus,
  advanceSequence,
  unsubscribeSequence,
  getDueSequences,
} from "@/lib/emailScheduler";

const StartSequenceSchema = z.object({
  action: z.literal("start"),
  email: z.string().email(),
  shareId: z.string().min(1),
  name: z.string().optional(),
});

const StatusSequenceSchema = z.object({
  action: z.literal("status"),
  shareId: z.string().min(1),
});

const AdvanceSequenceSchema = z.object({
  action: z.literal("advance"),
  shareId: z.string().min(1),
});

const UnsubscribeSequenceSchema = z.object({
  action: z.literal("unsubscribe"),
  shareId: z.string().min(1),
});

const GetDueSequencesSchema = z.object({
  action: z.literal("get_due"),
  apiKey: z.string().min(1), // For cron auth
});

const RequestSchema = z.discriminatedUnion("action", [
  StartSequenceSchema,
  StatusSequenceSchema,
  AdvanceSequenceSchema,
  UnsubscribeSequenceSchema,
  GetDueSequencesSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RequestSchema.parse(body);

    // Require API key for sequence management (server-to-server)
    const expectedKey = process.env.CRON_API_KEY;
    const headerKey = req.headers.get("X-Api-Key");
    const bodyKey = "apiKey" in validated ? validated.apiKey : undefined;
    if (!expectedKey && process.env.NODE_ENV === "production") {
      console.error("[EMAIL_SEQUENCE] CRON_API_KEY not configured in production!");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
    }
    if (expectedKey && (headerKey || bodyKey) !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized - API key required" },
        { status: 401 }
      );
    }

    switch (validated.action) {
      case "start": {
        const sequenceId = await startEmailSequence(
          validated.email,
          validated.shareId,
          validated.name
        );
        return NextResponse.json({
          success: true,
          sequenceId,
          message: "Email sequence started",
        });
      }

      case "status": {
        const sequence = await getSequenceStatus(validated.shareId);
        if (!sequence) {
          return NextResponse.json(
            { error: "Sequence not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, sequence });
      }

      case "advance": {
        const nextStage = await advanceSequence(validated.shareId);
        return NextResponse.json({
          success: true,
          nextStage,
          completed: nextStage === null,
        });
      }

      case "unsubscribe": {
        await unsubscribeSequence(validated.shareId);
        return NextResponse.json({
          success: true,
          message: "Unsubscribed successfully",
        });
      }

      case "get_due": {
        // Validate API key for cron
        const expectedKey = process.env.CRON_API_KEY;
        const headerKey = req.headers.get("X-Api-Key");
        if (!expectedKey || (validated.apiKey || headerKey) !== expectedKey) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }

        const dueSequences = await getDueSequences();
        return NextResponse.json({
          success: true,
          count: dueSequences.length,
          sequences: dueSequences,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[EMAIL_SEQUENCE]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
