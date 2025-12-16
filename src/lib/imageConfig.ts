/**
 * PR-1: Centralized Image Configuration for Nano Banana Pro
 *
 * This module provides all configuration for image generation including:
 * - Model settings (Gemini 3 Pro Image vs 2.5 Flash Image)
 * - Aspect ratios and sizes
 * - Cost optimization strategies (standard vs batch)
 * - Identity Chain configuration
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
  // Gemini 3 Pro Image (Nano Banana Pro) - Higher quality, Identity Chain support
  GEMINI_3_PRO_IMAGE: "gemini-3-pro-image-preview",
  // Gemini 2.5 Flash Image (Legacy) - Faster, lower cost
  GEMINI_25_FLASH_IMAGE: "gemini-2.5-flash-image-preview",
} as const;

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
    description: "lifestyle setting",
    mood: "earned confidence, visible progress",
    setting: "premium fitness studio, natural light, modern equipment",
  },
  m12: {
    description: "editorial studio",
    mood: "peak athletic form, magazine-worthy",
    setting: "professional photo studio, perfect lighting, clean backdrop",
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

  const model = flags.FF_NB_PRO
    ? MODELS.GEMINI_3_PRO_IMAGE
    : (process.env.GEMINI_IMAGE_MODEL || MODELS.GEMINI_25_FLASH_IMAGE);

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
  const config = getImageConfig();
  let totalCost = 0;

  for (const step of steps) {
    const stepConfig = config.byStep[step];
    const pricing = PRICING[stepConfig.imageSize];

    if (stepConfig.processingStrategy === "batch") {
      totalCost += pricing.batchCost;
    } else {
      totalCost += pricing.standardCost;
    }
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
