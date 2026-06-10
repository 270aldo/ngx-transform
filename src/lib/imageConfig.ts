/**
 * Centralized Image Configuration for Nano Banana
 *
 * This module provides all configuration for image generation including:
 * - Model settings (Gemini 3.1 Flash Image vs Gemini 3 Pro Image)
 * - Aspect ratios and sizes
 * - Cost optimization strategies (standard vs batch)
 * - Identity Chain configuration
 *
 * Standard image model: gemini-3.1-flash-image-preview (NanoBanana 2)
 * Pro image model:      gemini-3-pro-image-preview    (NanoBanana Pro, FF_NB_PRO=true)
 */

import { getFeatureFlags } from "./validators";

// ============================================================================
// Types
// ============================================================================

export type ImageSize = "1K" | "2K" | "4K";
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";
export type ProcessingStrategy = "standard" | "batch";
export type NanoStep = "m4" | "m8" | "m12";

export interface ImageGenerationConfig {
  model: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  processingStrategy: ProcessingStrategy;
}

export interface IdentityChainConfig {
  enabled: boolean;
  maxHumanRefs: number;  // Gemini 3 Pro supports up to 5 human images
  maxTotalRefs: number;  // Up to 14 total images
  useStyleRef: boolean;
}

export interface CostEstimate {
  standardCost: number;  // USD per image
  batchCost: number;     // USD per image (batch ~50% cheaper)
}

// ============================================================================
// Constants
// ============================================================================

// Model identifiers
export const MODELS = {
  // Gemini 3.1 Flash Image (NanoBanana 2) - Default, high-efficiency, released 2026-02-26
  GEMINI_31_FLASH_IMAGE: "gemini-3.1-flash-image-preview",
  // Gemini 3 Pro Image (NanoBanana Pro) - Higher quality, Identity Chain support, up to 4K
  GEMINI_3_PRO_IMAGE: "gemini-3-pro-image-preview",
  // Gemini 2.5 Flash Image (Legacy) - kept for backward compatibility only
  GEMINI_25_FLASH_IMAGE: "gemini-2.5-flash-image",
} as const;

function resolveImageModel(ffNbProEnabled: boolean): string {
  const explicitImageModel = process.env.GEMINI_IMAGE_MODEL?.trim();
  if (
    ffNbProEnabled &&
    (!explicitImageModel ||
      explicitImageModel === MODELS.GEMINI_31_FLASH_IMAGE ||
      explicitImageModel === MODELS.GEMINI_25_FLASH_IMAGE)
  ) {
    return MODELS.GEMINI_3_PRO_IMAGE;
  }

  if (explicitImageModel) {
    return explicitImageModel;
  }

  const genericModel = process.env.GEMINI_MODEL?.trim();
  if (genericModel) {
    // Compatibility: users often set GEMINI_MODEL for text analysis.
    // For image generation we map it to the corresponding image-capable model.
    if (genericModel === "gemini-2.5-flash" || genericModel === "gemini-3.1-flash") {
      return MODELS.GEMINI_31_FLASH_IMAGE;
    }
    if (genericModel.includes("image")) {
      return genericModel;
    }
  }

  return ffNbProEnabled
    ? MODELS.GEMINI_3_PRO_IMAGE
    : MODELS.GEMINI_31_FLASH_IMAGE;
}

// Cost per image (USD) - Based on official Gemini pricing
export const PRICING: Record<ImageSize, CostEstimate> = {
  "1K": { standardCost: 0.134, batchCost: 0.067 },
  "2K": { standardCost: 0.134, batchCost: 0.067 },
  "4K": { standardCost: 0.24, batchCost: 0.12 },
};

// Environment mappings for aspect ratios
export const ENVIRONMENT_BY_STEP: Record<NanoStep, {
  description: string;
  mood: string;
  setting: string;
}> = {
  m4: {
    description: "gritty underground gym",
    mood: "raw determination, early grind phase",
    setting: "industrial gym with exposed brick, heavy weights, chalk dust in air",
  },
  m8: {
    description: "dynamic outdoor athletic setting during golden hour",
    mood: "high athletic energy, absolute confidence, dynamic movement, premium athletic commercial vibe",
    setting: "modern outdoor running track at sunrise, dramatic warm sunlight, soft natural sky background, training lanes blurred in shallow depth of field, natural environment",
  },
  m12: {
    description: "premium editorial training space",
    mood: "calm confidence, visible consistency, realistic week 12 peak",
    setting: "high-end training studio with cinematic lighting, clean equipment, controlled atmosphere, focused posture",
  },
};

// Transformation percentages by milestone
export const TRANSFORMATION_PERCENT: Record<NanoStep, number> = {
  m4: 40,
  m8: 70,
  m12: 100,
};

// ============================================================================
// Configuration Functions
// ============================================================================

/**
 * Get the current image generation configuration based on feature flags
 */
export function getImageConfig(): {
  default: ImageGenerationConfig;
  unlock: ImageGenerationConfig;
  byStep: Record<NanoStep, ImageGenerationConfig>;
} {
  const flags = getFeatureFlags();

  const model = resolveImageModel(flags.FF_NB_PRO);

  // Default config for standard generation
  const defaultConfig: ImageGenerationConfig = {
    model,
    aspectRatio: "4:5",  // Instagram-ready portrait
    imageSize: "2K",     // Good quality, reasonable cost
    processingStrategy: "standard",
  };

  // Premium config for unlocked/4K content
  const unlockConfig: ImageGenerationConfig = {
    model,
    aspectRatio: "4:5",
    imageSize: "4K",     // Maximum quality for unlocks
    processingStrategy: "standard",
  };

  // Per-step config with cost optimization
  const byStep: Record<NanoStep, ImageGenerationConfig> = {
    m4: {
      ...defaultConfig,
      processingStrategy: "standard",  // Fast for first reveal
    },
    m8: {
      ...defaultConfig,
      processingStrategy: "batch",     // Cheaper, can wait
    },
    m12: {
      ...defaultConfig,
      processingStrategy: "batch",     // Cheaper, final hero
    },
  };

  return { default: defaultConfig, unlock: unlockConfig, byStep };
}

/**
 * Get Identity Chain configuration
 */
export function getIdentityChainConfig(): IdentityChainConfig {
  const flags = getFeatureFlags();

  return {
    enabled: flags.FF_IDENTITY_CHAIN,
    maxHumanRefs: 5,     // Gemini 3 Pro limit for human images
    maxTotalRefs: 14,    // Gemini 3 Pro total ref limit
    useStyleRef: true,   // Use NGX Visual DNA as style reference
  };
}

/**
 * Estimate cost for a session's image generation
 */
export function estimateSessionCost(steps: NanoStep[] = ["m4", "m8", "m12"]): number {
  // No existe API batch real: todas las imágenes van por :generateContent síncrono
  // (ver nanobanana.ts), así que el costo es SIEMPRE el estándar. Antes esto asumía
  // un descuento "batch" ficticio que subestimaba el gasto reservado ~33-50%. Ver fix-14 / #9.
  const config = getImageConfig();
  let totalCost = 0;

  for (const step of steps) {
    const stepConfig = config.byStep[step];
    totalCost += PRICING[stepConfig.imageSize].standardCost;
  }

  return totalCost;
}

/**
 * Get the Gemini API endpoint for image generation
 */
export function getImageGenerationEndpoint(model: string): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

/**
 * Get image config object for Gemini API request
 */
export function getGeminiImageConfig(
  aspectRatio: AspectRatio = "4:5",
  imageSize: ImageSize = "2K"
): { aspectRatio: string; imageSize: string } {
  return {
    aspectRatio,
    imageSize,
  };
}

/**
 * Validate that the model supports Identity Chain
 */
export function supportsIdentityChain(model: string): boolean {
  // Only Gemini 3 Pro Image supports multi-reference identity chain
  return model === MODELS.GEMINI_3_PRO_IMAGE;
}

/**
 * Get maximum references allowed based on model
 */
export function getMaxReferences(model: string): { human: number; total: number } {
  if (model === MODELS.GEMINI_3_PRO_IMAGE) {
    return { human: 5, total: 14 };
  }
  // Legacy model - single reference only
  return { human: 1, total: 1 };
}

/**
 * Build-time guard against the Identity Chain footgun (audit finding #10).
 *
 * If FF_IDENTITY_CHAIN is enabled but the resolved image model does not support
 * chained references, the generate-images route fails closed with a 503 for
 * EVERY request (src/app/api/generate-images/route.ts), silently bricking image
 * generation in production. This assertion makes a real production deploy
 * (Vercel VERCEL_ENV=production) FAIL LOUDLY at build instead, mirroring
 * assertLegalConfigForProductionDeploy() in legalConfig.ts.
 *
 * No-op on local dev and CI (VERCEL_ENV !== "production").
 */
export function assertImageConfigForProductionDeploy(): void {
  if (process.env.VERCEL_ENV !== "production") return;
  const flags = getFeatureFlags();
  if (!flags.FF_IDENTITY_CHAIN) return; // chain disabled → any model is valid
  const model = getImageConfig().default.model;
  if (!supportsIdentityChain(model)) {
    throw new Error(
      `[imageConfig] Cannot deploy to production: FF_IDENTITY_CHAIN is enabled but the ` +
        `resolved image model "${model}" does not support Identity Chain. Image generation ` +
        `would return 503 for every request. Fix with one of: set FF_NB_PRO=true (recommended), ` +
        `set GEMINI_IMAGE_MODEL=${MODELS.GEMINI_3_PRO_IMAGE}, or disable with FF_IDENTITY_CHAIN=false.`
    );
  }
}
