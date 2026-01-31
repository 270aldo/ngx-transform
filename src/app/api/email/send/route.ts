import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import {
  getSequenceStatus,
  advanceSequence,
  markEmailSent,
  getEmailSubject,
  type EmailStage,
} from "@/lib/emailScheduler";
import { trackEvent } from "@/lib/telemetry";
import D0Results from "@/emails/sequence/D0Results";
import D1Reminder from "@/emails/sequence/D1Reminder";
import D3Plan from "@/emails/sequence/D3Plan";
import D7Conversion from "@/emails/sequence/D7Conversion";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";

// Lazy initialization of Resend to avoid build errors
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const SendEmailSchema = z.object({
  shareId: z.string().min(1),
  template: z.enum(["D0", "D1", "D3", "D7"]),
  name: z.string().optional(),
  m0ImageUrl: z.string().url().optional(),
  m12ImageUrl: z.string().url().optional(),
});

type SendEmailRequest = z.infer<typeof SendEmailSchema>;

function getEmailComponent(
  template: EmailStage,
  props: {
    name?: string;
    shareId: string;
    m0ImageUrl?: string;
    m12ImageUrl?: string;
  }
) {
  switch (template) {
    case "D0":
      return D0Results(props);
    case "D1":
      return D1Reminder(props);
    case "D3":
      return D3Plan(props);
    case "D7":
      return D7Conversion(props);
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require API key for email sending (server-to-server)
    const expectedKey = process.env.CRON_API_KEY;
    const apiKey = req.headers.get("X-Api-Key");
    if (!expectedKey && process.env.NODE_ENV === "production") {
      console.error("[EMAIL_SEND] CRON_API_KEY not configured in production!");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
    }
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized - API key required" },
        { status: 401 }
      );
    }

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
    const validated: SendEmailRequest = SendEmailSchema.parse(body);

    // Get sequence to find email
    const sequence = await getSequenceStatus(validated.shareId);
    const email = sequence?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found. Start sequence first." },
        { status: 400 }
      );
    }

    // Check if Resend is configured
    const resend = getResend();
    if (!resend) {
      console.warn("[EMAIL_SEND] RESEND_API_KEY not configured, skipping send");
      return NextResponse.json({
        success: false,
        skipped: true,
        message: "Email not sent (Resend not configured)",
      });
    }

    // Build email props
    const emailProps = {
      name: validated.name || sequence?.name,
      shareId: validated.shareId,
      m0ImageUrl: validated.m0ImageUrl,
      m12ImageUrl: validated.m12ImageUrl,
    };

    // Send email
    const { data, error: resendError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "NGX Transform <transform@ngxgenesis.com>",
      to: email,
      subject: getEmailSubject(validated.template),
      react: getEmailComponent(validated.template, emailProps),
    });

    if (resendError) {
      console.error("[EMAIL_SEND] Resend error:", resendError);
      return NextResponse.json(
        { error: "Failed to send email", details: resendError },
        { status: 500 }
      );
    }

    // Track telemetry
    await trackEvent({
      sessionId: validated.shareId,
      event: `email_${validated.template}_sent` as const,
      metadata: { email, template: validated.template },
    });

    // Mark email as sent in sequence
    if (sequence) {
      await markEmailSent(validated.shareId, validated.template);

      // If this is the current stage, advance
      if (sequence.stage === validated.template) {
        await advanceSequence(validated.shareId);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      template: validated.template,
      email,
    });
  } catch (error) {
    console.error("[EMAIL_SEND]", error);

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
