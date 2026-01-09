import { NextRequest, NextResponse } from "next/server";
import { generatePlanPDF, generateSamplePlan } from "@/lib/plan-pdf";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { checkRateLimit, getRateLimitHeaders, getClientIP } from "@/lib/rateLimit";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("shareId");

  if (!shareId) {
    return NextResponse.json(
      { error: "shareId is required" },
      { status: 400 }
    );
  }

  // Rate limiting by IP (Upstash Redis)
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkRateLimit("api:generate-plan", clientIP);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    // Try to get session data from Firestore
    let userName = "Usuario";
    let goal = "mixto";
    let level = "intermedio";
    let trainingDays = 4;

    if (getApps().length > 0) {
      try {
        const db = getFirestore();
        const sessionDoc = await db.collection("sessions").doc(shareId).get();

        if (sessionDoc.exists) {
          const data = sessionDoc.data();
          userName = data?.name || data?.email?.split("@")[0] || "Usuario";
          goal = data?.goal || "mixto";
          level = data?.level || "intermedio";
          trainingDays = data?.weeklyTime
            ? data.weeklyTime <= 3
              ? 3
              : data.weeklyTime <= 5
              ? 4
              : 5
            : 4;
        }
      } catch (dbError) {
        console.warn("Could not fetch session from Firestore:", dbError);
        // Continue with default values
      }
    }

    // Generate the plan
    const plan = generateSamplePlan(userName, goal, level, trainingDays);

    // Generate PDF
    const pdfBlob = await generatePlanPDF(plan);

    // Return PDF as download
    return new Response(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="NGX-Plan-Semana1-${userName.replace(/\s+/g, "-")}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating plan PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate plan PDF" },
      { status: 500 }
    );
  }
}

// POST to generate plan data (for preview)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, responses } = body;

    if (!shareId) {
      return NextResponse.json(
        { error: "shareId is required" },
        { status: 400 }
      );
    }

    // Get user data
    let userName = "Usuario";
    let goal = responses?.goal || "mixto";
    let level = "intermedio";
    let trainingDays = 4;

    // Map responses to training days
    if (responses?.trainingDays) {
      trainingDays =
        responses.trainingDays === "2-3"
          ? 3
          : responses.trainingDays === "4"
          ? 4
          : 5;
    }

    // Try to get name from Firestore
    if (getApps().length > 0) {
      try {
        const db = getFirestore();
        const sessionDoc = await db.collection("sessions").doc(shareId).get();

        if (sessionDoc.exists) {
          const data = sessionDoc.data();
          userName = data?.name || data?.email?.split("@")[0] || "Usuario";
          level = data?.level || "intermedio";
        }
      } catch (dbError) {
        console.warn("Could not fetch session from Firestore:", dbError);
      }
    }

    // Generate plan data
    const plan = generateSamplePlan(userName, goal, level, trainingDays);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error generating plan data:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
