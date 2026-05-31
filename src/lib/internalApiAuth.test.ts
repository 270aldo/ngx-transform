import { afterEach, describe, expect, it } from "vitest";
import { getInternalApiHeaders, hasInternalApiKey } from "./internalApiAuth";

function request(headers: Record<string, string>) {
  return new Request("https://ngx.test/api/pipeline", { headers });
}

describe("internal API auth", () => {
  afterEach(() => {
    delete process.env.CRON_API_KEY;
    delete process.env.AI_WORKER_TOKEN;
  });

  it("accepts the cron key from x-api-key", () => {
    process.env.CRON_API_KEY = "cron-secret";

    expect(hasInternalApiKey(request({ "x-api-key": "cron-secret" }))).toBe(true);
  });

  it("accepts the worker token from x-worker-token", () => {
    process.env.AI_WORKER_TOKEN = "worker-secret";

    expect(hasInternalApiKey(request({ "x-worker-token": "worker-secret" }))).toBe(true);
  });

  it("prefers worker token when building internal headers", () => {
    process.env.CRON_API_KEY = "cron-secret";
    process.env.AI_WORKER_TOKEN = "worker-secret";

    expect(getInternalApiHeaders()).toEqual({ "x-worker-token": "worker-secret" });
  });

  it("rejects missing or wrong credentials", () => {
    process.env.CRON_API_KEY = "cron-secret";

    expect(hasInternalApiKey(request({ "x-api-key": "wrong" }))).toBe(false);
    expect(hasInternalApiKey(request({}))).toBe(false);
  });
});
