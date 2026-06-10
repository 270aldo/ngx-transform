/**
 * imageConfig.test.ts
 *
 * Unit tests for model resolution logic in imageConfig.ts.
 * These tests lock in the expected behavior of resolveImageModel so that
 * any future refactor that breaks model selection fails loudly in CI.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  MODELS,
  PRICING,
  getImageConfig,
  estimateSessionCost,
  assertImageConfigForProductionDeploy,
} from "./imageConfig";

// ============================================================================
// Helpers
// ============================================================================

function setEnv(vars: Record<string, string | undefined>) {
  for (const [key, val] of Object.entries(vars)) {
    if (val === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = val;
    }
  }
}

// ============================================================================
// MODELS constant
// ============================================================================

describe("MODELS constant", () => {
  it("exports the correct gemini-3.1-flash-image-preview identifier", () => {
    expect(MODELS.GEMINI_31_FLASH_IMAGE).toBe("gemini-3.1-flash-image-preview");
  });

  it("exports the correct gemini-3-pro-image-preview identifier", () => {
    expect(MODELS.GEMINI_3_PRO_IMAGE).toBe("gemini-3-pro-image-preview");
  });

  it("exports the correct legacy identifier", () => {
    expect(MODELS.GEMINI_25_FLASH_IMAGE).toBe("gemini-2.5-flash-image");
  });
});

// ============================================================================
// resolveImageModel via getImageConfig()
// ============================================================================

describe("resolveImageModel — GEMINI_IMAGE_MODEL env var", () => {
  let savedImageModel: string | undefined;
  let savedModel: string | undefined;
  let savedNbPro: string | undefined;

  beforeEach(() => {
    savedImageModel = process.env.GEMINI_IMAGE_MODEL;
    savedModel = process.env.GEMINI_MODEL;
    savedNbPro = process.env.FF_NB_PRO;
  });

  afterEach(() => {
    setEnv({
      GEMINI_IMAGE_MODEL: savedImageModel,
      GEMINI_MODEL: savedModel,
      FF_NB_PRO: savedNbPro,
    });
  });

  it("uses Pro when FF_NB_PRO=true even if the example Flash image model is set", () => {
    setEnv({ GEMINI_IMAGE_MODEL: "gemini-3.1-flash-image-preview", FF_NB_PRO: "true" });
    const config = getImageConfig();
    expect(config.default.model).toBe(MODELS.GEMINI_3_PRO_IMAGE);
  });

  it("returns a custom image model when GEMINI_IMAGE_MODEL is set to an arbitrary value", () => {
    setEnv({ GEMINI_IMAGE_MODEL: "gemini-future-image-preview", FF_NB_PRO: undefined });
    const config = getImageConfig();
    expect(config.default.model).toBe("gemini-future-image-preview");
  });

  it("maps GEMINI_MODEL=gemini-2.5-flash → gemini-3.1-flash-image-preview", () => {
    setEnv({
      GEMINI_IMAGE_MODEL: undefined,
      GEMINI_MODEL: "gemini-2.5-flash",
      FF_NB_PRO: "false",
    });
    const config = getImageConfig();
    expect(config.default.model).toBe(MODELS.GEMINI_31_FLASH_IMAGE);
  });

  it("maps GEMINI_MODEL=gemini-3.1-flash → gemini-3.1-flash-image-preview", () => {
    setEnv({
      GEMINI_IMAGE_MODEL: undefined,
      GEMINI_MODEL: "gemini-3.1-flash",
      FF_NB_PRO: "false",
    });
    const config = getImageConfig();
    expect(config.default.model).toBe(MODELS.GEMINI_31_FLASH_IMAGE);
  });

  it("passes through GEMINI_MODEL values that contain 'image' unchanged", () => {
    setEnv({
      GEMINI_IMAGE_MODEL: undefined,
      GEMINI_MODEL: "gemini-3-pro-image-preview",
      FF_NB_PRO: "false",
    });
    const config = getImageConfig();
    expect(config.default.model).toBe("gemini-3-pro-image-preview");
  });
});

describe("resolveImageModel — fallback logic (no GEMINI_IMAGE_MODEL set)", () => {
  let savedImageModel: string | undefined;
  let savedModel: string | undefined;
  let savedNbPro: string | undefined;

  beforeEach(() => {
    savedImageModel = process.env.GEMINI_IMAGE_MODEL;
    savedModel = process.env.GEMINI_MODEL;
    savedNbPro = process.env.FF_NB_PRO;
    setEnv({ GEMINI_IMAGE_MODEL: undefined, GEMINI_MODEL: undefined });
  });

  afterEach(() => {
    setEnv({
      GEMINI_IMAGE_MODEL: savedImageModel,
      GEMINI_MODEL: savedModel,
      FF_NB_PRO: savedNbPro,
    });
  });

  it("defaults to gemini-3.1-flash-image-preview when FF_NB_PRO=false", () => {
    setEnv({ FF_NB_PRO: "false" });
    const config = getImageConfig();
    expect(config.default.model).toBe(MODELS.GEMINI_31_FLASH_IMAGE);
  });

  it("defaults to gemini-3.1-flash-image-preview when FF_NB_PRO is absent", () => {
    setEnv({ FF_NB_PRO: undefined });
    const config = getImageConfig();
    expect(config.default.model).toBe(MODELS.GEMINI_31_FLASH_IMAGE);
  });

  it("upgrades to gemini-3-pro-image-preview when FF_NB_PRO=true", () => {
    setEnv({ FF_NB_PRO: "true" });
    const config = getImageConfig();
    // Pro model is selected via getImageConfig unlock config
    expect(config.unlock.model).toBe(MODELS.GEMINI_3_PRO_IMAGE);
  });

  it("never falls back to a legacy 2.5 model by default", () => {
    setEnv({ FF_NB_PRO: "false" });
    const config = getImageConfig();
    expect(config.default.model).not.toContain("2.5");
    expect(config.unlock.model).not.toContain("2.5");
  });
});

// ============================================================================
// assertImageConfigForProductionDeploy — Identity Chain footgun guard (#10)
// ============================================================================

describe("assertImageConfigForProductionDeploy", () => {
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = {
      VERCEL_ENV: process.env.VERCEL_ENV,
      FF_IDENTITY_CHAIN: process.env.FF_IDENTITY_CHAIN,
      FF_NB_PRO: process.env.FF_NB_PRO,
      GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
    };
    // Clean model overrides so resolution depends only on FF_NB_PRO.
    setEnv({ GEMINI_IMAGE_MODEL: undefined, GEMINI_MODEL: undefined });
  });

  afterEach(() => {
    setEnv(saved);
  });

  it("is a no-op outside production even with an invalid combo", () => {
    setEnv({ VERCEL_ENV: "preview", FF_NB_PRO: "false", FF_IDENTITY_CHAIN: undefined });
    expect(() => assertImageConfigForProductionDeploy()).not.toThrow();
  });

  it("throws in production when Identity Chain is on but the model is Flash", () => {
    // FF_IDENTITY_CHAIN defaults to true (!== "false"); FF_NB_PRO=false → Flash model.
    setEnv({ VERCEL_ENV: "production", FF_NB_PRO: "false", FF_IDENTITY_CHAIN: undefined });
    expect(() => assertImageConfigForProductionDeploy()).toThrow(/Identity Chain/i);
  });

  it("does not throw in production when FF_NB_PRO=true (Pro model supports chain)", () => {
    setEnv({ VERCEL_ENV: "production", FF_NB_PRO: "true", FF_IDENTITY_CHAIN: undefined });
    expect(() => assertImageConfigForProductionDeploy()).not.toThrow();
  });

  it("does not throw in production when Identity Chain is disabled", () => {
    setEnv({ VERCEL_ENV: "production", FF_NB_PRO: "false", FF_IDENTITY_CHAIN: "false" });
    expect(() => assertImageConfigForProductionDeploy()).not.toThrow();
  });

  it("does not throw in production when GEMINI_IMAGE_MODEL is the Pro model", () => {
    setEnv({
      VERCEL_ENV: "production",
      FF_NB_PRO: "false",
      FF_IDENTITY_CHAIN: undefined,
      GEMINI_IMAGE_MODEL: MODELS.GEMINI_3_PRO_IMAGE,
    });
    expect(() => assertImageConfigForProductionDeploy()).not.toThrow();
  });
});

// ============================================================================
// estimateSessionCost — sin precio "batch" ficticio (#9 / fix-14)
// ============================================================================

describe("estimateSessionCost", () => {
  it("usa precio estándar en todos los pasos (sin descuento batch inventado)", () => {
    const cost = estimateSessionCost(["m4", "m8", "m12"]);
    // 3 pasos × standardCost (2K). El batch ficticio antes daba ~0.268 (subestimado).
    expect(cost).toBeCloseTo(3 * PRICING["2K"].standardCost, 5);
    expect(cost).toBeGreaterThan(0.4);
  });
});
