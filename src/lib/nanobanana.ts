/**
 * NanoBanana — Gemini Image Generation with Identity Chain
 *
 * "NanoBanana" is the internal alias for Gemini image generation.
 * This module supports:
 * - Gemini 3.1 Flash Image (gemini-3.1-flash-image-preview) — Default, NanoBanana 2
 * - Gemini 3 Pro Image (gemini-3-pro-image-preview) — Identity Chain, FF_NB_PRO=true
 * - Gemini 2.5 Flash Image (gemini-2.5-flash-image) — Legacy, not recommended
 *
 * Identity Chain: Multi-reference generation for facial consistency
 * - m4 refs: [original, styleRef]
 * - m8 refs: [original, styleRef, m4]
 * - m12 refs: [original, styleRef, m8]
 */
// NOTE: Identity Chain requiere gemini-3-pro-image-preview (FF_NB_PRO=true).
// Un deploy con FF_IDENTITY_CHAIN activo + un modelo Flash ahora falla en build
// vía assertImageConfigForProductionDeploy() (src/lib/imageConfig.ts); en runtime
// el route falla closed con 503 antes de gastar presupuesto de generación.

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
    trainingDaysPerWeek?: number;
    trainingHistoryYears?: number;
    nutritionQuality?: number;
    bodyFatLevel?: "bajo" | "medio" | "alto";
    trainingStyle?: "fuerza" | "hipertrofia" | "funcional" | "hiit" | "mixto";
    aestheticPreference?: "cinematic" | "editorial" | "street" | "minimal";
    focusZone?: "upper" | "lower" | "abs" | "full";
    focusAreas?: Array<"pecho" | "espalda" | "hombros" | "brazos" | "gluteos" | "piernas" | "core">;
    stressLevel?: number;
    sleepQuality?: number;
    disciplineRating?: number;
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
/**
 * Fetch an image and convert to base64 inline data
 * Includes timeout and size limit for security
 */
async function fetchImageAsInlineData(url: string): Promise<InlineData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Failed fetching image: ${res.status}`);

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("Image too large (>10MB)");
    }

    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    // Double check actual buffer size
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      throw new Error("Image buffer too large (>10MB)");
    }

    const data = Buffer.from(arrayBuffer).toString("base64");
    return { mimeType, data };
  } finally {
    clearTimeout(timeoutId);
  }
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
      imageConfig: {
        aspectRatio: params.aspectRatio || "4:5",
        imageSize: params.imageSize || "2K",
      },
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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada para generar imágenes");
  }

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
      const detail = err instanceof Error ? err.message : "unknown_error";
      console.warn(`   Style ref: failed to load (${detail}), continuing without`);
    }
  }

  // 3. Previous step image (for chaining m8 → m12)
  if (useIdentityChain && params.previousStepUrl) {
    try {
      const prevStep = await fetchImageAsInlineData(params.previousStepUrl);
      referenceImages.push(prevStep);
      console.log("   Previous step ref: loaded");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "unknown_error";
      console.warn(`   Previous step ref: failed to load (${detail}), continuing without`);
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
    level: params.profile.level,
    weeklyTime: params.profile.weeklyTime,
    trainingDaysPerWeek: params.profile.trainingDaysPerWeek,
    trainingHistoryYears: params.profile.trainingHistoryYears,
    nutritionQuality: params.profile.nutritionQuality,
    bodyFatLevel: params.profile.bodyFatLevel,
    trainingStyle: params.profile.trainingStyle,
    aestheticPreference: params.profile.aestheticPreference,
    stressLevel: params.profile.stressLevel,
    sleepQuality: params.profile.sleepQuality,
    disciplineRating: params.profile.disciplineRating,
    focusAreas: params.profile.focusAreas,
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

  // Make API request, bounded by a timeout so a hung provider doesn't freeze
  // the job (see fix-16). On abort we throw a typed error so withRetry counts it.
  console.log("🍌 Sending request to Gemini...");
  const imageTimeoutMs = Number(process.env.GEMINI_IMAGE_TIMEOUT_MS || "90000");
  const imageController = new AbortController();
  const imageTimeoutId = setTimeout(() => imageController.abort(), imageTimeoutMs);
  let resp: Response;
  try {
    resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: imageController.signal,
    });
  } catch (err) {
    if (imageController.signal.aborted) {
      throw new Error("gemini_image_timeout");
    }
    throw err;
  } finally {
    clearTimeout(imageTimeoutId);
  }

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
