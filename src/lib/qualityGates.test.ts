import { describe, expect, it } from "vitest";
import { validateImageBasics } from "./qualityGates";

const JPEG = "image/jpeg";

describe("validateImageBasics", () => {
  it("fails with no_image_data on an empty buffer", () => {
    const r = validateImageBasics(Buffer.alloc(0), JPEG);
    expect(r.passed).toBe(false);
    expect(r.score).toBe(0);
    expect(r.issues[0].type).toBe("no_image_data");
    expect(r.issues[0].severity).toBe("error");
    expect(r.canRetry).toBe(true);
  });

  it("passes a normal-sized JPEG with no issues", () => {
    const r = validateImageBasics(Buffer.alloc(50 * 1024), JPEG);
    expect(r.passed).toBe(true);
    expect(r.score).toBe(100);
    expect(r.issues).toHaveLength(0);
  });

  it("warns unknown_format for a non-accepted mime type", () => {
    const r = validateImageBasics(Buffer.alloc(50 * 1024), "image/svg+xml");
    expect(r.issues.some((i) => i.type === "unknown_format")).toBe(true);
    expect(r.score).toBe(90);
  });

  it("reports image_too_large (NOT image_too_small) for an oversized file", () => {
    const r = validateImageBasics(Buffer.alloc(20 * 1024 * 1024 + 1), JPEG);
    const types = r.issues.map((i) => i.type);
    expect(types).toContain("image_too_large");
    expect(types).not.toContain("image_too_small");
  });

  it("warns image_too_small for a tiny file", () => {
    const r = validateImageBasics(Buffer.alloc(2 * 1024), JPEG);
    expect(r.issues.some((i) => i.type === "image_too_small")).toBe(true);
  });
});
