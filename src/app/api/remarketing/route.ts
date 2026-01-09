import { NextRequest, NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { z } from "zod";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_ADMIN_SDK
    ? JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_SDK, "base64").toString())
    : null;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

// Validation schema
const remarketingSchema = z.object({
  email: z.string().email("Email inválido"),
  shareId: z.string().min(1, "shareId requerido"),
  source: z.enum(["escape_valve", "demo_exit", "plan_download"]).optional().default("escape_valve"),
  reminderDays: z.number().min(1).max(30).optional().default(7),
});

// Rate limiting
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(key);

  if (!lastRequest || now - lastRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, now);
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = remarketingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, shareId, source, reminderDays } = result.data;

    // Rate limiting by email
    if (isRateLimited(`remarketing:${email}`)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        { status: 429 }
      );
    }

    // Check if Firebase is initialized
    if (!getApps().length) {
      console.warn("Firebase not initialized, skipping database save");
      return NextResponse.json({
        success: true,
        message: "Email registrado (modo demo)",
      });
    }

    const db = getFirestore();

    // Calculate reminder date
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + reminderDays);

    // Create or update remarketing lead
    const leadRef = db.collection("remarketing_leads").doc(email);
    const existingLead = await leadRef.get();

    if (existingLead.exists) {
      // Update existing lead
      await leadRef.update({
        lastShareId: shareId,
        lastSource: source,
        reminderDate,
        updatedAt: FieldValue.serverTimestamp(),
        interactions: FieldValue.increment(1),
      });
    } else {
      // Create new lead
      await leadRef.set({
        email,
        shareId,
        source,
        reminderDate,
        reminderDays,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        interactions: 1,
        emailsSent: 0,
        converted: false,
      });
    }

    // Also update the session with remarketing flag
    try {
      const sessionRef = db.collection("sessions").doc(shareId);
      await sessionRef.update({
        remarketingEmail: email,
        remarketingSource: source,
        remarketingDate: FieldValue.serverTimestamp(),
      });
    } catch {
      // Session might not exist, that's ok
    }

    return NextResponse.json({
      success: true,
      message: "Te contactaremos pronto con recursos gratuitos.",
      reminderDate: reminderDate.toISOString(),
    });
  } catch (error) {
    console.error("Remarketing error:", error);
    return NextResponse.json(
      { error: "Error al registrar. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

// GET endpoint to check lead status (for admin/debugging)
// SECURITY: Requires API key to prevent PII exposure
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate API key first
  const apiKey = searchParams.get("apiKey") || request.headers.get("X-Api-Key");
  const expectedKey = process.env.CRON_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized - API key required" },
      { status: 401 }
    );
  }

  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "email parameter required" },
      { status: 400 }
    );
  }

  if (!getApps().length) {
    return NextResponse.json(
      { error: "Firebase not initialized" },
      { status: 500 }
    );
  }

  try {
    const db = getFirestore();
    const leadDoc = await db.collection("remarketing_leads").doc(email).get();

    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: leadDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Error fetching lead" },
      { status: 500 }
    );
  }
}
