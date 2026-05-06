import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import {
  claimReferralReward,
  completeReferral,
  recordReferralVisit,
} from "@/lib/viral/referralTracking";

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 30,
    remaining: 29,
    reset: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
  getClientIP: vi.fn(() => "203.0.113.10"),
}));

vi.mock("@/lib/viral/referralTracking", () => ({
  recordReferralVisit: vi.fn(async () => true),
  completeReferral: vi.fn(async () => ({ success: true, referrerId: "referrer_1" })),
  claimReferralReward: vi.fn(async () => ({ success: true, rewardsAvailable: 1 })),
  getReferrerStats: vi.fn(async () => ({
    totalReferrals: 1,
    completedReferrals: 1,
    rewardsClaimed: 0,
  })),
}));

function request(body: unknown, headers?: Record<string, string>) {
  return new Request("https://ngx.test/api/referral", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("referral API security policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_API_KEY = "server-secret";
  });

  it("keeps visit attribution public", async () => {
    const res = await POST(
      request({
        action: "visit",
        inviteeId: "invitee_1",
        referrerId: "referrer_1",
      }) as never
    );

    expect(res.status).toBe(200);
    expect(recordReferralVisit).toHaveBeenCalledWith("invitee_1", "referrer_1");
  });

  it("blocks public completion of a referral", async () => {
    const res = await POST(
      request({
        action: "complete",
        inviteeId: "invitee_1",
      }) as never
    );

    expect(res.status).toBe(401);
    expect(completeReferral).not.toHaveBeenCalled();
  });

  it("allows server-authenticated completion of a referral", async () => {
    const res = await POST(
      request(
        {
          action: "complete",
          inviteeId: "invitee_1",
        },
        { "X-Api-Key": "server-secret" }
      ) as never
    );

    expect(res.status).toBe(200);
    expect(completeReferral).toHaveBeenCalledWith("invitee_1");
  });

  it("blocks public reward claims", async () => {
    const res = await POST(
      request({
        action: "claim",
        shareId: "referrer_1",
      }) as never
    );

    expect(res.status).toBe(401);
    expect(claimReferralReward).not.toHaveBeenCalled();
  });
});
