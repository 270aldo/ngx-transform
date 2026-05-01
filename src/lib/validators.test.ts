import { describe, expect, it } from "vitest";
import {
  ProfileSchema,
  CreateSessionSchema,
  SessionConsentsSchema,
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
