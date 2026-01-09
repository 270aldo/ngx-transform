import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const COUNTER_DOC = "counters/global_transforms";
const SEED_COUNT = 8547;
const WEEKLY_SEED = 2341;

export async function GET() {
  try {
    const db = getDb();
    const docRef = db.doc(COUNTER_DOC);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Initialize counter
      const initialData = {
        count: SEED_COUNT,
        weeklyCount: WEEKLY_SEED,
        lastReset: new Date(),
        seed: SEED_COUNT,
      };
      await docRef.set(initialData);
      return NextResponse.json(initialData);
    }

    const data = doc.data()!;

    // Check weekly reset
    const lastReset = data.lastReset?.toDate() || new Date(0);
    const daysSinceReset =
      (Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 7) {
      // Reset weekly count
      await docRef.update({
        weeklyCount: WEEKLY_SEED,
        lastReset: new Date(),
      });
      data.weeklyCount = WEEKLY_SEED;
    }

    return NextResponse.json({
      count: data.count,
      weeklyCount: data.weeklyCount,
    });
  } catch (error) {
    console.error("[COUNTER_GET]", error);
    return NextResponse.json(
      { error: "Failed to get counter" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, apiKey } = await req.json();

    // SECURITY: Require API key for counter manipulation
    const expectedKey = process.env.CRON_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized - API key required" },
        { status: 401 }
      );
    }

    if (action !== "increment") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const db = getDb();
    const docRef = db.doc(COUNTER_DOC);
    await docRef.update({
      count: FieldValue.increment(1),
      weeklyCount: FieldValue.increment(1),
    });

    const updated = await docRef.get();
    const data = updated.data()!;

    return NextResponse.json({
      count: data.count,
      weeklyCount: data.weeklyCount,
    });
  } catch (error) {
    console.error("[COUNTER_POST]", error);
    return NextResponse.json(
      { error: "Failed to increment counter" },
      { status: 500 }
    );
  }
}
