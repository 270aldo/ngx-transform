import { describe, expect, it } from "vitest";
import {
  ProfileSchema,
  CreateSessionSchema,
  ConsentSchema,
  TelemetryEventSchema,
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

describe("ConsentSchema", () => {
  it("requires terms and aiProcessing to be true", () => {
    const result = ConsentSchema.safeParse({
      terms: true,
      aiProcessing: true,
      marketing: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects when terms is false", () => {
    const result = ConsentSchema.safeParse({
      terms: false,
      aiProcessing: true,
      marketing: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts marketing true or false", () => {
    expect(
      ConsentSchema.safeParse({ terms: true, aiProcessing: true, marketing: true }).success
    ).toBe(true);
    expect(
      ConsentSchema.safeParse({ terms: true, aiProcessing: true, marketing: false }).success
    ).toBe(true);
  });
});

describe("CreateSessionSchema", () => {
  it("accepts payload with consent", () => {
    const result = CreateSessionSchema.safeParse({
      email: "test@example.com",
      input: validProfile,
      photoPath: "uploads/abc/seed/original.jpg",
      consent: { terms: true, aiProcessing: true, marketing: false },
      marketingConsent: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts payload without consent (back-compat)", () => {
    const result = CreateSessionSchema.safeParse({
      email: "test@example.com",
      input: validProfile,
      photoPath: "uploads/abc/seed/original.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects under-18 in input", () => {
    const result = CreateSessionSchema.safeParse({
      email: "test@example.com",
      input: { ...validProfile, age: 16 },
      photoPath: "uploads/abc/seed/original.jpg",
    });
    expect(result.success).toBe(false);
  });
});

describe("TelemetryEventSchema", () => {
  it("accepts new Trust & Compliance events", () => {
    const events = [
      "scan_started",
      "scan_completed",
      "disclaimer_viewed",
      "marketing_consent_skipped",
      "hybrid_recommended",
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
