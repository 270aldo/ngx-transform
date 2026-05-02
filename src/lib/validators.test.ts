import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ProfileSchema,
  CreateSessionSchema,
  SessionConsentsSchema,
  TelemetryEventSchema,
  LeadSchema,
  GenerateImagesSchema,
  DeleteSessionSchema,
  getFeatureFlags,
} from "./validators";

const validProfile = {
  age: 28,
  sex: "male" as const,
  heightCm: 175,
  weightKg: 75,
  level: "intermedio" as const,
  goal: "definicion" as const,
  weeklyTime: 5,
};

describe("ProfileSchema age", () => {
  it("rejects users under 18", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, age: 17 });
    expect(result.success).toBe(false);
  });

  it("accepts age 18", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, age: 18 });
    expect(result.success).toBe(true);
  });

  it("rejects age over 100", () => {
    const result = ProfileSchema.safeParse({ ...validProfile, age: 101 });
    expect(result.success).toBe(false);
  });
});

describe("SessionConsentsSchema", () => {
  it("requires terms and aiProcessing literal true", () => {
    const result = SessionConsentsSchema.safeParse({
      terms: true,
      aiProcessing: true,
      marketingEmailOptIn: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects when terms is false", () => {
    const result = SessionConsentsSchema.safeParse({
      terms: false,
      aiProcessing: true,
      marketingEmailOptIn: false,
    });
    expect(result.success).toBe(false);
  });

  it("marketing opt-in defaults to false when omitted", () => {
    const result = SessionConsentsSchema.safeParse({
      terms: true,
      aiProcessing: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingEmailOptIn).toBe(false);
    }
  });
});

describe("CreateSessionSchema", () => {
  it("accepts payload with consents block", () => {
    const result = CreateSessionSchema.safeParse({
      email: "test@example.com",
      input: validProfile,
      photoPath: "uploads/abc/seed/original.jpg",
      consents: { terms: true, aiProcessing: true, marketingEmailOptIn: false },
    });
    expect(result.success).toBe(true);
  });

  it("rejects payload without consents", () => {
    const result = CreateSessionSchema.safeParse({
      email: "test@example.com",
      input: validProfile,
      photoPath: "uploads/abc/seed/original.jpg",
    });
    expect(result.success).toBe(false);
  });

  it("rejects under-18 profile", () => {
    const result = CreateSessionSchema.safeParse({
      email: "test@example.com",
      input: { ...validProfile, age: 16 },
      photoPath: "uploads/abc/seed/original.jpg",
      consents: { terms: true, aiProcessing: true, marketingEmailOptIn: false },
    });
    expect(result.success).toBe(false);
  });
});

describe("TelemetryEventSchema", () => {
  it("accepts hybrid_offer + nps + email D5/D10/D14 events", () => {
    const events = [
      "hybrid_offer_calendly_click",
      "hybrid_offer_whatsapp_click",
      "nps_submitted",
      "email_D5_sent",
      "email_D10_sent",
      "email_D14_sent",
    ];
    for (const event of events) {
      const result = TelemetryEventSchema.safeParse({ sessionId: "abc123", event });
      expect(result.success, `event ${event} should validate`).toBe(true);
    }
  });

  it("rejects unknown events", () => {
    const result = TelemetryEventSchema.safeParse({ sessionId: "abc", event: "made_up_event" });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// LeadSchema
// ============================================================================

describe("LeadSchema", () => {
  it("accepts valid lead with consent=true", () => {
    const result = LeadSchema.safeParse({ email: "lead@example.com", consent: true });
    expect(result.success).toBe(true);
  });

  it("rejects when consent is false", () => {
    const result = LeadSchema.safeParse({ email: "lead@example.com", consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = LeadSchema.safeParse({ email: "not-an-email", consent: true });
    expect(result.success).toBe(false);
  });

  it("accepts optional source field", () => {
    const result = LeadSchema.safeParse({
      email: "lead@example.com",
      consent: true,
      source: "landing_hero",
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// GenerateImagesSchema
// ============================================================================

describe("GenerateImagesSchema", () => {
  it("accepts sessionId only — steps defaults to [m4, m8, m12]", () => {
    const result = GenerateImagesSchema.safeParse({ sessionId: "abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.steps).toEqual(["m4", "m8", "m12"]);
    }
  });

  it("accepts a subset of steps", () => {
    const result = GenerateImagesSchema.safeParse({ sessionId: "abc123", steps: ["m4", "m12"] });
    expect(result.success).toBe(true);
  });

  it("rejects invalid step value", () => {
    const result = GenerateImagesSchema.safeParse({ sessionId: "abc123", steps: ["m4", "m99"] });
    expect(result.success).toBe(false);
  });

  it("rejects empty sessionId", () => {
    const result = GenerateImagesSchema.safeParse({ sessionId: "" });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// DeleteSessionSchema
// ============================================================================

describe("DeleteSessionSchema", () => {
  const validToken = "a".repeat(20); // minimum 20 chars

  it("accepts sessionId + 20-char token", () => {
    const result = DeleteSessionSchema.safeParse({ sessionId: "sess_abc", deleteToken: validToken });
    expect(result.success).toBe(true);
  });

  it("rejects token shorter than 20 chars", () => {
    const result = DeleteSessionSchema.safeParse({ sessionId: "sess_abc", deleteToken: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects token longer than 64 chars", () => {
    const result = DeleteSessionSchema.safeParse({
      sessionId: "sess_abc",
      deleteToken: "a".repeat(65),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// getFeatureFlags
// ============================================================================

describe("getFeatureFlags", () => {
  let savedNbPro: string | undefined;
  let savedIdentityChain: string | undefined;

  beforeEach(() => {
    savedNbPro = process.env.FF_NB_PRO;
    savedIdentityChain = process.env.FF_IDENTITY_CHAIN;
  });

  afterEach(() => {
    if (savedNbPro === undefined) delete process.env.FF_NB_PRO;
    else process.env.FF_NB_PRO = savedNbPro;
    if (savedIdentityChain === undefined) delete process.env.FF_IDENTITY_CHAIN;
    else process.env.FF_IDENTITY_CHAIN = savedIdentityChain;
  });

  it("FF_NB_PRO defaults to false when env var is absent", () => {
    delete process.env.FF_NB_PRO;
    expect(getFeatureFlags().FF_NB_PRO).toBe(false);
  });

  it("FF_NB_PRO is true when env var is 'true'", () => {
    process.env.FF_NB_PRO = "true";
    expect(getFeatureFlags().FF_NB_PRO).toBe(true);
  });

  it("FF_IDENTITY_CHAIN defaults to true when env var is absent", () => {
    delete process.env.FF_IDENTITY_CHAIN;
    expect(getFeatureFlags().FF_IDENTITY_CHAIN).toBe(true);
  });

  it("FF_IDENTITY_CHAIN is false when env var is 'false'", () => {
    process.env.FF_IDENTITY_CHAIN = "false";
    expect(getFeatureFlags().FF_IDENTITY_CHAIN).toBe(false);
  });
});
