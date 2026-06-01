import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { POST as analyzeSession } from "@/app/api/analyze/route";
import { POST as generateSessionImages } from "@/app/api/generate-images/route";
import { POST as generateSessionReport } from "@/app/api/report/route";
import { getDb } from "@/lib/firebaseAdmin";
import {
  acquireJobLock,
  getOrCreateJob,
  markJobCompleted,
  markJobFailed,
  markJobPartial,
} from "@/lib/jobManager";

vi.mock("@/app/api/analyze/route", () => ({
  POST: vi.fn(),
}));

vi.mock("@/app/api/generate-images/route", () => ({
  POST: vi.fn(),
}));

vi.mock("@/app/api/report/route", () => ({
  POST: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/jobManager", () => ({
  getOrCreateJob: vi.fn(),
  acquireJobLock: vi.fn(),
  markJobCompleted: vi.fn(async () => undefined),
  markJobFailed: vi.fn(async () => undefined),
  markJobPartial: vi.fn(async () => undefined),
}));

function pipelineRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("https://ngx.test/api/pipeline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function setupDb(session: unknown = { report_ready: false }) {
  const sessionRef = {
    get: vi.fn(async () => ({ exists: !!session, data: () => session })),
    set: vi.fn(async () => undefined),
  };
  const collection = vi.fn(() => ({
    doc: vi.fn(() => sessionRef),
  }));
  vi.mocked(getDb).mockReturnValue({ collection } as never);
  return { sessionRef };
}

function response(body: unknown, init?: ResponseInit) {
  return Response.json(body, init);
}

describe("Season pipeline API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_API_KEY = "server-secret";
    process.env.AI_WORKER_TOKEN = "worker-secret";
    vi.mocked(getOrCreateJob).mockResolvedValue({
      jobId: "share_1_season_pipeline",
      sessionId: "share_1",
      type: "season_pipeline",
      status: "pending",
      retryCount: 0,
      maxRetries: 2,
    });
    vi.mocked(acquireJobLock).mockResolvedValue({ acquired: true, status: "in_progress" });
    vi.mocked(analyzeSession).mockResolvedValue(response({ ok: true, ai: { timeline: {} } }) as never);
    vi.mocked(generateSessionImages).mockResolvedValue(
      response({
        ok: true,
        status: "ready",
        images: {
          m4: "sessions/share_1/generated/m4.jpg",
          m8: "sessions/share_1/generated/m8.jpg",
          m12: "sessions/share_1/generated/m12.jpg",
        },
        quality: { m4: 91, m8: 88, m12: 93 },
        degraded: [],
      }) as never
    );
    vi.mocked(generateSessionReport).mockResolvedValue(
      response({
        ok: true,
        pdfStoragePath: "reports/share_1/season-vision-report-v1.pdf",
        pdfUrl: "https://storage.test/report.pdf",
      }) as never
    );
  });

  it("blocks public requests", async () => {
    setupDb();

    const res = await POST(pipelineRequest({ sessionId: "share_1" }) as never);

    expect(res.status).toBe(401);
    expect(analyzeSession).not.toHaveBeenCalled();
  });

  it("runs analysis, image generation, and report generation in order", async () => {
    const bodies: unknown[] = [];
    vi.mocked(analyzeSession).mockImplementation(async (req: Request) => {
      bodies.push(await req.json());
      return response({ ok: true, ai: { timeline: {} } }) as never;
    });
    vi.mocked(generateSessionImages).mockImplementation(async (req: Request) => {
      bodies.push(await req.json());
      return response({
        ok: true,
        status: "ready",
        images: {
          m4: "sessions/share_1/generated/m4.jpg",
          m8: "sessions/share_1/generated/m8.jpg",
          m12: "sessions/share_1/generated/m12.jpg",
        },
        quality: { m4: 91, m8: 88, m12: 93 },
        degraded: [],
      }) as never;
    });
    vi.mocked(generateSessionReport).mockImplementation(async (req: Request) => {
      bodies.push(await req.json());
      return response({
        ok: true,
        pdfStoragePath: "reports/share_1/season-vision-report-v1.pdf",
        pdfUrl: "https://storage.test/report.pdf",
      }) as never;
    });
    const { sessionRef } = setupDb();

    const res = await POST(
      pipelineRequest({ sessionId: "share_1" }, { "x-api-key": "server-secret" }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ready");
    expect(body.reportReady).toBe(true);
    expect(bodies).toEqual([
      { sessionId: "share_1" },
      { sessionId: "share_1", steps: ["m4", "m8", "m12"] },
      { shareId: "share_1", force: false },
    ]);
    expect(vi.mocked(analyzeSession).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(generateSessionImages).mock.invocationCallOrder[0]
    );
    expect(vi.mocked(generateSessionImages).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(generateSessionReport).mock.invocationCallOrder[0]
    );
    expect(sessionRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        report_ready: true,
        pipeline: expect.objectContaining({
          status: "completed",
          reportPdfStoragePath: "reports/share_1/season-vision-report-v1.pdf",
        }),
      }),
      { merge: true }
    );
    expect(markJobCompleted).toHaveBeenCalledWith("share_1_season_pipeline");
  });

  it("does not render the report when the three Season images are incomplete", async () => {
    setupDb();
    vi.mocked(generateSessionImages).mockResolvedValueOnce(
      response({
        ok: true,
        status: "partial",
        images: {
          m4: "sessions/share_1/generated/m4.jpg",
          m8: "sessions/share_1/generated/m8.jpg",
        },
      }) as never
    );

    const res = await POST(
      pipelineRequest({ sessionId: "share_1" }, { "x-api-key": "server-secret" }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe("image_generation_incomplete");
    expect(generateSessionReport).not.toHaveBeenCalled();
    expect(markJobPartial).toHaveBeenCalledWith("share_1_season_pipeline", "image_generation_incomplete");
  });

  it("marks the pipeline failed when an upstream step fails", async () => {
    setupDb();
    vi.mocked(analyzeSession).mockResolvedValueOnce(
      response({ error: "analysis_not_ready" }, { status: 409 }) as never
    );

    const res = await POST(
      pipelineRequest({ sessionId: "share_1" }, { "x-api-key": "server-secret" }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.failedStep).toBe("analysis");
    expect(generateSessionImages).not.toHaveBeenCalled();
    expect(markJobFailed).toHaveBeenCalledWith("share_1_season_pipeline", "analysis_failed");
  });

  it("returns cached when report_ready is already persisted", async () => {
    setupDb({
      report_ready: true,
      report: { status: "ready", pdfStoragePath: "reports/share_1/season-vision-report-v1.pdf" },
    });

    const res = await POST(
      pipelineRequest({ sessionId: "share_1" }, { "x-api-key": "server-secret" }) as never
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.cached).toBe(true);
    expect(analyzeSession).not.toHaveBeenCalled();
  });
});
