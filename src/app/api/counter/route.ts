import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const COUNTER_DOC = "counters/global_transforms";
const SEED_COUNT = Number(process.env.SOCIAL_COUNTER_SEED_TOTAL || "8547");
const WEEKLY_SEED = Number(process.env.SOCIAL_COUNTER_SEED_WEEKLY || "2341");

export async function GET() {
  try {
    const db = getDb();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);

    const totalAggPromise = db.collection("sessions").where("status", "==", "ready").count().get();
    const weeklyAggPromise = db
      .collection("sessions")
      .where("status", "==", "ready")
      .where("generatedAt", ">=", Timestamp.fromDate(weekStart))
      .count()
      .get();

    const [totalAgg, weeklyAgg] = await Promise.all([
      totalAggPromise,
      weeklyAggPromise.catch(async (error) => {
        console.warn("[COUNTER_GET] weekly count fallback:", error);
        const fallbackSnap = await db.collection("sessions").where("status", "==", "ready").get();
        const weeklyCount = fallbackSnap.docs.filter((doc) => {
          const generatedAt = doc.data().generatedAt as Timestamp | undefined;
          if (!generatedAt) return false;
          return generatedAt.toDate().getTime() >= weekStart.getTime();
        }).length;
        return { data: () => ({ count: weeklyCount }) };
      }),
    ]);

    const totalCount = Number(totalAgg.data().count || 0) + SEED_COUNT;
    const weeklyCount = Number(weeklyAgg.data().count || 0) + WEEKLY_SEED;

    return NextResponse.json({
      count: totalCount,
      weeklyCount,
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
