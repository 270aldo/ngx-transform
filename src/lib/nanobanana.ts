/**
 * PR-1: NanoBanana Pro - Gemini Image Generation with Identity Chain
 *
 * "NanoBanana" is the internal alias for Gemini image generation.
 * This module supports:
 * - Gemini 3 Pro Image (gemini-3-pro-image-preview) with Identity Chain
 * - Gemini 2.5 Flash Image (gemini-2.5-flash-image-preview) legacy mode
 *
 * Identity Chain: Multi-reference generation for facial consistency
 * - m4 refs: [original, styleRef]
 * - m8 refs: [original, styleRef, m4]
 * - m12 refs: [original, styleRef, m8]
 */

import {
  getImageConfig,
  getIdentityChainConfig,
  getImageGenerationEndpoint,
  supportsIdentityChain,
  type NanoStep,
  type AspectRatio,
  type ImageSize,
} from "./imageConfig";
import { buildImagePrompt, buildCorrectivePrompt, type PromptContext } from "./promptBuilder";
import { runQualityGates, getCorrectionMessage, formatQualityReport } from "./qualityGates";
import type { StyleProfile } from "./schemas/analysis";

// Re-export NanoStep for backward compatibility
export type { NanoStep };

// ============================================================================
// Types
// ============================================================================

export interface GenerationParams {
  imageUrl: string;               // Signed URL to original photo
  profile: {
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    level: "novato" | "intermedio" | "avanzado";
    goal: "definicion" | "masa" | "mixto";
    weeklyTime: number;
    focusZone?: "upper" | "lower" | "abs" | "full";
    notes?: string;
  };
  step: NanoStep;
  aiPrompt?: string;              // AI-generated prompt from analysis
  userVisualAnchor?: string;      // Identity description for consistency
  styleProfile?: StyleProfile;    // Visual style parameters
  previousStepUrl?: string;       // URL to previous step image (for chaining)
  styleRefUrl?: string;           // URL to NGX style reference image
  isRetry?: boolean;              // Is this a retry attempt?
  retryReason?: string;           // Why we're retrying
}

export interface GenerationResult {
  buffer: Buffer;
  contentType: string;
  qualityScore: number;
  degraded: boolean;
  model: string;
  usedIdentityChain: boolean;
}

interface InlineData {
  mimeType: string;
  data: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: InlineData;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Fetch an image and convert to base64 inline data
 */
async function fetchImageAsInlineData(url: string): Promise<InlineData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetching image: ${res.status}`);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const data = Buffer.from(arrayBuffer).toString("base64");
  return { mimeType, data };
}

/**
 * Build the request body for Gemini API
 */
function buildRequestBody(params: {
  prompt: string;
  images: InlineData[];
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
}): object {
  const parts: GeminiPart[] = [{ text: params.prompt }];

  // Add all reference images
  for (const img of params.images) {
    parts.push({ inlineData: img });
  }

  return {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      // Only include imageConfig if we have non-default values
      ...(params.aspectRatio || params.imageSize
        ? {
            imageConfig: {
              aspectRatio: params.aspectRatio || "4:5",
              imageSize: params.imageSize || "2K",
            },
          }
        : {}),
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };
}

/**
 * Extract image data from Gemini response
 */
function extractImageFromResponse(json: unknown): { data: string; mimeType: string } {
  const response = json as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
      };
    }>;
  };

  const candidates = response?.candidates || [];
  const parts = candidates[0]?.content?.parts || [];

  for (const p of parts) {
    if (p?.inlineData?.data) {
      return {
        data: p.inlineData.data,
        mimeType: p.inlineData.mimeType || "image/jpeg",
      };
    }
  }

  throw new Error("Gemini image API: no inline image data found in response");
}

// ============================================================================
// Main Generation Function
// ============================================================================

/**
 * Generate a transformed image using Gemini Image API
 * Supports Identity Chain for consistent facial identity across milestones
 */
export async function generateTransformedImage(
  params: GenerationParams
): Promise<GenerationResult> {
  const config = getImageConfig();
  const stepConfig = config.byStep[params.step];
  const identityConfig = getIdentityChainConfig();

  const model = stepConfig.model;
  const useIdentityChain =
    identityConfig.enabled && supportsIdentityChain(model);

  console.log(`🍌 NanoBanana ${useIdentityChain ? "Pro" : "Legacy"} - ${params.step}`);
  console.log(`   Model: ${model}`);
  console.log(`   Identity Chain: ${useIdentityChain ? "enabled" : "disabled"}`);

  // Collect reference images
  const referenceImages: InlineData[] = [];

  // 1. Original image (always first)
  const originalImage = await fetchImageAsInlineData(params.imageUrl);
  referenceImages.push(originalImage);

  // 2. Style reference (if Identity Chain enabled and URL provided)
  if (useIdentityChain && params.styleRefUrl) {
    try {
      const styleRef = await fetchImageAsInlineData(params.styleRefUrl);
      referenceImages.push(styleRef);
      console.log("   Style ref: loaded");
    } catch (err) {
      console.warn("   Style ref: failed to load, continuing without", err);
    }
  }

  // 3. Previous step image (for chaining m8 → m12)
  if (useIdentityChain && params.previousStepUrl) {
    try {
      const prevStep = await fetchImageAsInlineData(params.previousStepUrl);
      referenceImages.push(prevStep);
      console.log("   Previous step ref: loaded");
    } catch (err) {
      console.warn("   Previous step ref: failed to load, continuing without", err);
    }
  }

  console.log(`   Total references: ${referenceImages.length}`);

  // Build prompt
  const promptContext: PromptContext = {
    step: params.step,
    userVisualAnchor:
      params.userVisualAnchor || buildFallbackVisualAnchor(params.profile),
    styleProfile: params.styleProfile,
    goal: params.profile.goal,
    sex: params.profile.sex,
    focusZone: params.profile.focusZone,
    aiPrompt: params.aiPrompt,
  };

  let prompt: string;
  if (params.isRetry && params.retryReason) {
    prompt = buildCorrectivePrompt(promptContext, params.retryReason);
    console.log("   Using corrective prompt for retry");
  } else {
    const built = buildImagePrompt(promptContext);
    prompt = built.mainPrompt;
  }

  console.log(`🍌 Prompt length: ${prompt.length} chars`);

  // Build request
  const endpoint = getImageGenerationEndpoint(model);
  const body = buildRequestBody({
    prompt,
    images: referenceImages,
    aspectRatio: stepConfig.aspectRatio,
    imageSize: stepConfig.imageSize,
  });

  // Make API request
  console.log("🍌 Sending request to Gemini...");
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errTxt = await resp.text().catch(() => "");
    throw new Error(`Gemini image API error ${resp.status}: ${errTxt}`);
  }

  const json = await resp.json();

  // Extract image
  const imageData = extractImageFromResponse(json);
  const buffer = Buffer.from(imageData.data, "base64");

  // Run quality gates
  const qualityResult = runQualityGates(buffer, imageData.mimeType, json);
  console.log(formatQualityReport(qualityResult));

  if (!qualityResult.passed && qualityResult.canRetry && !params.isRetry) {
    // This will be handled by the caller with withRetry
    const correctionMsg = getCorrectionMessage(qualityResult.issues);
    throw new Error(`Quality gate failed: ${correctionMsg}`);
  }

  return {
    buffer,
    contentType: imageData.mimeType,
    qualityScore: qualityResult.score,
    degraded: qualityResult.degraded,
    model,
    usedIdentityChain: useIdentityChain && referenceImages.length > 1,
  };
}

/**
 * Build a fallback visual anchor when none is provided
 * This is less accurate than the AI-generated one but provides some consistency
 */
function buildFallbackVisualAnchor(profile: GenerationParams["profile"]): string {
  const sexDesc =
    profile.sex === "male"
      ? "adult male"
      : profile.sex === "female"
        ? "adult female"
        : "adult person";

  return `${sexDesc}, approximately ${profile.age} years old.
Preserve exact facial features, skin tone, hair color and style, and any distinguishing marks.
The subject must be clearly recognizable as the same person throughout all images.`;
}

// ============================================================================
// Legacy Export (Backward Compatibility)
// ============================================================================

/**
 * Legacy function signature for backward compatibility
 * @deprecated Use generateTransformedImage with full params instead
 */
export async function generateTransformedImageLegacy(params: {
  imageUrl: string;
  profile: {
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    level: "novato" | "intermedio" | "avanzado";
    goal: "definicion" | "masa" | "mixto";
    weeklyTime: number;
    notes?: string;
  };
  step: NanoStep;
  aiPrompt?: string;
}): Promise<{ buffer: Buffer; contentType: string }> {
  const result = await generateTransformedImage(params);
  return {
    buffer: result.buffer,
    contentType: result.contentType,
  };
}
