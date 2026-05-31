/**
 * imageConfig.test.ts
 *
 * Unit tests for model resolution logic in imageConfig.ts.
 * These tests lock in the expected behavior of resolveImageModel so that
 * any future refactor that breaks model selection fails loudly in CI.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MODELS, getImageConfig } from "./imageConfig";

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
