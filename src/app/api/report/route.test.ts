import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";
import { getAuthUserAny } from "@/lib/authServer";
import { getDb } from "@/lib/firebaseAdmin";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "@/lib/rateLimit";
import { renderSeasonReportPDF } from "@/lib/report/reportPdf";
import { getSignedUrl, uploadBuffer } from "@/lib/storage";

vi.mock("@/lib/authServer", () => ({
  getAuthUserAny: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 3600000,
  })),
  getClientIP: vi.fn(() => "203.0.113.7"),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock("@/lib/report/reportPdf", () => ({
  renderSeasonReportPDF: vi.fn(async () => Buffer.from("%PDF-1.7\nseason report")),
}));

vi.mock("@/lib/storage", () => ({
  getSignedUrl: vi.fn(async (path: string) => `https://storage.test/${path}?signed=1`),
  uploadBuffer: vi.fn(async (path: string) => path),
}));

const analysisFixture = {
  insightsText: "GENESIS convierte el baseline en una direccion fisica por temporadas.",
  timeline: {
    m0: {
      month: 0,
      title: "Baseline",
      description: "Estado inicial con margen de mejora en estructura y recuperacion.",
      mental: "Ordenar el sistema antes de subir intensidad.",
      stats: { strength: 40, aesthetics: 39, endurance: 38, mental: 43 },
    },
    m4: {
      month: 4,
      title: "Primer avance",
      description: "Mayor tono, postura y capacidad de trabajo.",
      mental: "La consistencia empieza a ganar.",
      stats: { strength: 57, aesthetics: 55, endurance: 53, mental: 60 },
    },
    m8: {
      month: 8,
      title: "Consolidacion",
      description: "Composicion mas estable y progreso visible.",
      mental: "El sistema pesa mas que la motivacion.",
      stats: { strength: 72, aesthetics: 68, endurance: 66, mental: 73 },
    },
    m12: {
      month: 12,
      title: "Vision completa",
      description: "Version mas fuerte, atletica y sostenible.",
      mental: "La identidad sostiene el resultado.",
      stats: { strength: 85, aesthetics: 82, endurance: 80, mental: 87 },
    },
  },
  diagnostic: {
    bottleneck: "structure",
    muscle_health_score: 71,
    dominant_error: "Falta una estructura semanal que convierta intencion en ejecucion.",
  },
};

function request(body: unknown, headers?: Record<string, string>) {
  return new Request("https://ngx.test/api/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function getRequest(shareId: string, headers?: Record<string, string>) {
  return new Request(`https://ngx.test/api/report?shareId=${shareId}`, {
    method: "GET",
    headers,
  });
}

function setupDb(options?: { existingReport?: unknown; session?: unknown }) {
  const session =
    options?.session ??
    ({
      shareId: "share_1",
      ownerUid: "owner_1",
      input: {
        age: 31,
        sex: "male",
        heightCm: 178,
        weightKg: 82,
        level: "intermedio",
        goal: "definicion",
        weeklyTime: 5,
        focusZone: "full",
      },
      photo: { originalStoragePath: "uploads/owner_1/original.jpg" },
      ai: analysisFixture,
      assets: {
        images: {
          m4: "sessions/share_1/m4.png",
          m8: "sessions/share_1/m8.png",
          m12: "sessions/share_1/m12.png",
        },
      },
    } as const);
  const sessionRef = {
    get: vi.fn(async () => ({ exists: !!session, data: () => session })),
    set: vi.fn(async () => undefined),
  };
  const reportRef = {
    get: vi.fn(async () => ({
      exists: !!options?.existingReport,
      data: () => options?.existingReport,
    })),
    set: vi.fn(async () => undefined),
  };
  const collection = vi.fn((name: string) => ({
    doc: vi.fn(() => (name === "sessions" ? sessionRef : reportRef)),
  }));

  vi.mocked(getDb).mockReturnValue({ collection } as never);
  return { sessionRef, reportRef };
}

describe("Season report API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_API_KEY = "server-secret";
    vi.mocked(getAuthUserAny).mockResolvedValue({ uid: "owner_1", email: "owner@test.com" });
  });

  it("generates a report PDF, stores it in Firebase Storage, and writes metadata to transform_reports", async () => {
    const { sessionRef, reportRef } = setupDb();

    const res = await POST(request({ shareId: "share_1" }) as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pdfUrl).toBe("https://storage.test/reports/share_1/season-vision-report-v1.pdf?signed=1");
    expect(checkRateLimit).toHaveBeenCalledWith("api:report", "203.0.113.7");
    expect(getClientIP).toHaveBeenCalled();
    expect(renderSeasonReportPDF).toHaveBeenCalledWith(expect.objectContaining({ shareId: "share_1" }));
    expect(uploadBuffer).toHaveBeenCalledWith(
      "reports/share_1/season-vision-report-v1.pdf",
      expect.any(Buffer),
      "application/pdf"
    );
    expect(reportRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        shareId: "share_1",
        schemaVersion: "season_vision_report.v1",
        status: "ready",
        pdfStoragePath: "reports/share_1/season-vision-report-v1.pdf",
        report: expect.objectContaining({
          visualizations: expect.arrayContaining([
            expect.objectContaining({ key: "m4", label: "Season 1" }),
            expect.objectContaining({ key: "m8", label: "Season 2" }),
            expect.objectContaining({ key: "m12", label: "Season 3" }),
          ]),
        }),
      }),
      { merge: true }
    );
    expect(sessionRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        report_ready: true,
        report: expect.objectContaining({
          status: "ready",
          schemaVersion: "season_vision_report.v1",
          transformReportId: "share_1",
        }),
      }),
      { merge: true }
    );
  });

  it("blocks non-owner generation without the server API key", async () => {
    setupDb();
    vi.mocked(getAuthUserAny).mockResolvedValue(null);

    const res = await POST(request({ shareId: "share_1" }) as never);

    expect(res.status).toBe(401);
    expect(uploadBuffer).not.toHaveBeenCalled();
  });

  it("returns a signed URL for an existing owner-accessible report", async () => {
    const report = {
      shareId: "share_1",
      schemaVersion: "season_vision_report.v1",
      status: "ready",
      report: {
        shareId: "share_1",
        schemaVersion: "season_vision_report.v1",
        title: "Season Vision Report",
      },
      pdfStoragePath: "reports/share_1/season-vision-report-v1.pdf",
      pdfContentType: "application/pdf",
      pdfByteSize: 2048,
    };
    setupDb({ existingReport: report });

    const res = await GET(getRequest("share_1") as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pdfUrl).toBe("https://storage.test/reports/share_1/season-vision-report-v1.pdf?signed=1");
    expect(getSignedUrl).toHaveBeenCalledWith("reports/share_1/season-vision-report-v1.pdf", {
      expiresInSeconds: 3600,
    });
  });

  it("returns rate limit headers when report generation is throttled", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 3600000,
    });
    vi.mocked(getRateLimitHeaders).mockReturnValueOnce({ "x-ratelimit-limit": "5" });

    const res = await POST(request({ shareId: "share_1" }) as never);

    expect(res.status).toBe(429);
    expect(res.headers.get("x-ratelimit-limit")).toBe("5");
  });
});
