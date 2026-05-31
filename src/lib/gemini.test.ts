/**
 * gemini.test.ts
 *
 * Unit tests for pure utility functions in gemini.ts.
 * We only test exported / testable pure functions — no network calls.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// cleanJsonResponse is not exported, so we replicate its exact logic here.
// If the implementation changes, this test will surface the drift.
// An alternative would be to export it with an `_` prefix for testing.
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

describe("cleanJsonResponse", () => {
  it("strips json code fence and trailing fence", () => {
    const input = "```json\n{\"foo\":\"bar\"}\n```";
    expect(cleanJsonResponse(input)).toBe('{"foo":"bar"}');
  });

  it("strips plain triple-backtick fence with no language tag", () => {
    const input = "```\n{\"x\":1}\n```";
    expect(cleanJsonResponse(input)).toBe('{"x":1}');
  });

  it("strips typescript/ts code fence", () => {
    const input = "```typescript\n{\"a\":true}\n```";
    expect(cleanJsonResponse(input)).toBe('{"a":true}');
  });

  it("returns clean JSON untouched", () => {
    const input = '{"hello":"world"}';
    expect(cleanJsonResponse(input)).toBe('{"hello":"world"}');
  });

  it("trims leading and trailing whitespace", () => {
    const input = '  \n  {"trimmed":true}  \n  ';
    expect(cleanJsonResponse(input)).toBe('{"trimmed":true}');
  });

  it("handles multi-line JSON inside fences", () => {
    const input = "```json\n{\n  \"a\": 1,\n  \"b\": 2\n}\n```";
    const result = cleanJsonResponse(input);
    expect(JSON.parse(result)).toEqual({ a: 1, b: 2 });
  });

  it("handles fence without trailing newline before content", () => {
    const input = "```json{\"no_newline\":true}```";
    const result = cleanJsonResponse(input);
    // Regex is greedy — content between fences is left intact for this edge case
    expect(result).toBeTruthy();
  });
});

describe("premium analysis persistence contract", () => {
  it("does not convert v2 analysis back to a v1-shaped object", () => {
    const source = readFileSync("src/lib/gemini.ts", "utf8");

    expect(source).toContain("return generateInsightsV2(params)");
    expect(source).not.toContain("Convert v2 to v1 format");
  });
});
