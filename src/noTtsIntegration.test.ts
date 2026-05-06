import { existsSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";

const retiredRouteName = ["genesis", "-", "voice"].join("");
const retiredProvider = ["eleven", "labs"].join("");
const retiredEnvPrefix = ["EL", "EVEN", "LABS"].join("");

function readIfExists(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("retired GENESIS TTS integration", () => {
  it("does not expose the old TTS route or provider client", () => {
    expect(existsSync(`src/app/api/${retiredRouteName}/route.ts`)).toBe(false);
    expect(existsSync(`src/lib/${retiredProvider}-voice.ts`)).toBe(false);
  });

  it("does not keep provider dependency, env vars, rate-limit keys, or docs references", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const pnpmLock = readIfExists("pnpm-lock.yaml");
    const packageLock = readIfExists("package-lock.json");
    const envExample = readIfExists(".env.example");
    const rateLimitSource = readFileSync("src/lib/rateLimit.ts", "utf8");
    const docs = [
      readIfExists("AGENTS.md"),
      readIfExists("docs/AGENTS.md"),
      readIfExists("src/app/privacy/page.tsx"),
      readIfExists("CHANGELOG.md"),
      readIfExists("PLAN.md"),
    ].join("\n").toLowerCase();

    expect(packageJson.dependencies?.[`@${retiredProvider}/${retiredProvider}-js`]).toBeUndefined();
    expect(packageJson.devDependencies?.[`@${retiredProvider}/${retiredProvider}-js`]).toBeUndefined();
    expect(pnpmLock).not.toContain(retiredProvider);
    expect(packageLock).not.toContain(retiredProvider);
    expect(envExample).not.toContain(retiredEnvPrefix);
    expect(rateLimitSource).not.toContain(`api:${retiredRouteName}`);
    expect(docs).not.toContain(retiredProvider);
    expect(docs).not.toContain(retiredRouteName);
  });

  it("does not keep the legacy demo TTS phase model", () => {
    const demoTypes = readFileSync("src/types/demo.ts", "utf8");

    expect(demoTypes).not.toContain(["voice", "_", "intro"].join(""));
    expect(demoTypes).not.toContain("VoiceSegment");
    expect(demoTypes).not.toContain("GenesisVoiceResponse");
  });
});
