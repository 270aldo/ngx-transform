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

  it("ignores generic forwarding headers unless proxy headers are explicitly trusted", () => {
    const previous = process.env.TRUST_PROXY_IP_HEADERS;
    delete process.env.TRUST_PROXY_IP_HEADERS;
    const request = new Request("https://ngx.test/api/sessions", {
      headers: {
        "x-forwarded-for": "198.51.100.250",
        "x-real-ip": "198.51.100.251",
      },
    });

    try {
      expect(getClientIP(request)).toBe("unknown");
    } finally {
      if (previous === undefined) delete process.env.TRUST_PROXY_IP_HEADERS;
      else process.env.TRUST_PROXY_IP_HEADERS = previous;
    }
  });
});
