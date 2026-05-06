import { describe, expect, it } from "vitest";
import { getClientIP } from "./rateLimit";

describe("getClientIP", () => {
  it("prefers Vercel's forwarded IP over a spoofable x-forwarded-for value", () => {
    const request = new Request("https://ngx.test/api/sessions", {
      headers: {
        "x-forwarded-for": "198.51.100.250",
        "x-vercel-forwarded-for": "203.0.113.7",
      },
    });

    expect(getClientIP(request)).toBe("203.0.113.7");
  });
});
