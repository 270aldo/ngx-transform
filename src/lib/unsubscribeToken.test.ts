import { beforeEach, describe, expect, it } from "vitest";
import { buildUnsubscribeUrl, createUnsubscribeToken, verifyUnsubscribeToken } from "./unsubscribeToken";

describe("unsubscribe tokens", () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = "unsubscribe-secret";
  });

  it("creates verifiable signed tokens per shareId", () => {
    const token = createUnsubscribeToken("share_1");

    expect(verifyUnsubscribeToken("share_1", token)).toBe(true);
    expect(verifyUnsubscribeToken("share_2", token)).toBe(false);
  });

  it("builds signed unsubscribe URLs from protocol-less base URLs", () => {
    const url = new URL(buildUnsubscribeUrl("ngxvision.app", "share_1"));

    expect(url.origin).toBe("https://ngxvision.app");
    expect(url.pathname).toBe("/unsubscribe");
    expect(url.searchParams.get("shareId")).toBe("share_1");
    expect(verifyUnsubscribeToken("share_1", url.searchParams.get("token"))).toBe(true);
  });
});
