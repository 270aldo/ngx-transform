import { beforeEach, describe, expect, it } from "vitest";
import { generateAccessToken, verifyAccessToken } from "./accessToken";

describe("access tokens (fix-08)", () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = "access-secret";
  });

  it("creates verifiable signed tokens per shareId", () => {
    const token = generateAccessToken("share_1");
    expect(token).not.toBe("");
    expect(verifyAccessToken("share_1", token)).toBe(true);
  });

  it("rejects a token minted for a different shareId", () => {
    const token = generateAccessToken("share_1");
    expect(verifyAccessToken("share_2", token)).toBe(false);
  });

  it("rejects null/empty tokens", () => {
    expect(verifyAccessToken("share_1", null)).toBe(false);
    expect(verifyAccessToken("share_1", "")).toBe(false);
  });
});
