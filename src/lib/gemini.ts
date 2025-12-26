/**
 * PR-1: Gemini Analysis with Identity Chain Support
 *
 * This module handles profile analysis using Gemini 2.5 Flash/Pro.
 * Updated to generate v2.0 schema with:
 * - user_visual_anchor: Detailed description for facial consistency
 * - style_profile: Visual style parameters for generation
 * - letter_from_future: Motivational message from m12 self
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  InsightsResultZ,
  type InsightsResult,
  AnalysisOutputSchema,
  type AnalysisOutput,
  validateAnalysisOutput,
  attemptJsonRepair,
  migrateV1toV2,
} from "@/types/ai";
import { getVisualAnchorSystemPrompt, getStyleProfileSystemPrompt } from "./promptBuilder";
import { getFeatureFlags } from "./validators";

// ============================================================================
// Types
// ============================================================================

export interface AnalysisParams {
  imageUrl: string;
  profile: {
    age?: string | number;
    sex?: string;
    height?: string | number;
    heightCm?: number;
    weight?: string | number;
    weightKg?: number;
    goals?: string;
    goal?: string;
    level?: string;
    weeklyTime?: string | number;
    stressLevel?: number;
    sleepQuality?: number;
    disciplineRating?: number;
    bodyType?: string;
    focusZone?: string;
    notes?: string;
  };
}

// ============================================================================
// Utilities
// ============================================================================

async function fetchImageAsInlineData(
  url: string
): Promise<{ mimeType: string; data: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetching image: ${res.status}`);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const data = Buffer.from(arrayBuffer).toString("base64");
  return { mimeType, data };
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Strip code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

// ============================================================================
// System Prompts
// ============================================================================

function getV2SystemPrompt(profile: AnalysisParams["profile"]): string {
  // Handle both field naming conventions
  const height = profile.height ?? profile.heightCm;
  const weight = profile.weight ?? profile.weightKg;
  const goals = profile.goals ?? profile.goal;

  return `You are an Elite High-Performance Coach & Futurist with forensic visual analysis capabilities.
Your mission: Analyze the user's photo and data to project their physical evolution over 12 months.

USER DATA:
- Age: ${profile.age}, Sex: ${profile.sex}
- Height: ${height}cm, Weight: ${weight}kg
- Body Type: ${profile.bodyType || "not specified"}
- Current Level: ${profile.level || "novato"}
- Main Goal: ${goals || "mixto"}
- Weekly Dedication: ${profile.weeklyTime || 3} hours
- Stress: ${profile.stressLevel || 5}/10, Sleep: ${profile.sleepQuality || 5}/10, Discipline: ${profile.disciplineRating || 5}/10
- Focus Zone: ${profile.focusZone?.toUpperCase() || "FULL BODY"}

TASK: Generate a COMPLETE analysis in JSON format.

${getVisualAnchorSystemPrompt()}

${getStyleProfileSystemPrompt()}

TIMELINE GENERATION:
For each milestone (m0, m4, m8, m12), generate:
- title: Powerful 1-2 word phase name (e.g., "GÉNESIS", "METAMORFOSIS", "ASCENSIÓN", "APEX")
- description: Clinical but inspiring 2-3 sentence summary
- narrative: Longer motivational narrative (3-5 sentences) about this phase
- stats: { strength: 0-100, aesthetics: 0-100, endurance: 0-100, mental: 0-100 }
- image_prompt: Detailed English prompt for generating fitness photo at this stage
- mental: Stoic mindset shift required
- risks (m0 only): Array of potential pitfalls
- expectations (m0 only): Array of realistic outcomes

LETTER FROM FUTURE:
Write a 50-100 word message from the m12 version of this person to their current self.
Tone: Stoic but warm. Acknowledge the struggle ahead. End with encouragement.

OVERLAYS (optional):
For each milestone, provide 2-4 overlay points marking key transformation areas:
{ x: 0.0-1.0, y: 0.0-1.0, label: "short label", detail: "explanation" }

OUTPUT SCHEMA (strict JSON):
{
  "user_visual_anchor": "detailed 100-400 word description of immutable facial/physical characteristics",
  "profile_summary": {
    "sex": "male|female|other",
    "age": number,
    "goal": "definicion|masa|mixto",
    "bodyType": "ectomorph|mesomorph|endomorph",
    "focusZone": "upper|lower|abs|full"
  },
  "insightsText": "main analysis summary",
  "timeline": {
    "m0": { "month": 0, "title": "...", "description": "...", "narrative": "...", "stats": {...}, "image_prompt": "...", "mental": "...", "risks": [...], "expectations": [...] },
    "m4": { "month": 4, "title": "...", "description": "...", "narrative": "...", "stats": {...}, "image_prompt": "...", "mental": "..." },
    "m8": { "month": 8, "title": "...", "description": "...", "narrative": "...", "stats": {...}, "image_prompt": "...", "mental": "..." },
    "m12": { "month": 12, "title": "...", "description": "...", "narrative": "...", "stats": {...}, "image_prompt": "...", "mental": "..." }
  },
  "overlays": {
    "m0": [...], "m4": [...], "m8": [...], "m12": [...]
  },
  "letter_from_future": "message from m12 self",
  "style_profile": {
    "lighting": "...",
    "wardrobe": "...",
    "background": "...",
    "color_grade": "..."
  }
}

CRITICAL RULES:
1. "user_visual_anchor" must be 100-400 words, extremely detailed about facial features
2. "stats" values must be integers 0-100
3. "overlays" coordinates x,y must be 0.0-1.0 (relative)
4. "image_prompt" must be English, photorealistic, Nike commercial style
5. "letter_from_future" must be 50-100 words, stoic but encouraging
6. Return ONLY valid JSON, no markdown, no explanations`;
}

// Legacy V1 prompt for backward compatibility
function getV1SystemPrompt(profile: AnalysisParams["profile"]): string {
  const height = profile.height ?? profile.heightCm;
  const weight = profile.weight ?? profile.weightKg;
  const goals = profile.goals ?? profile.goal;

  return `
    You are an Elite High-Performance Coach & Futurist (Stoic, Clinical, Motivational).
    Your goal is to analyze the user's current photo and data to project their physical and mental evolution over 12 months.

    USER DATA:
    - Age: ${profile.age}, Sex: ${profile.sex}
    - Height: ${height}cm, Weight: ${weight}kg
    - Body Type: ${profile.bodyType}
    - Current Level: ${profile.level}
    - Main Goal: ${goals}
    - Weekly Dedication: ${profile.weeklyTime} hours
    - Stress: ${profile.stressLevel}/10, Sleep: ${profile.sleepQuality}/10, Discipline: ${profile.disciplineRating}/10

    FOCUS ZONE (PRIORITY): ${profile.focusZone?.toUpperCase() || "FULL BODY"}
    (Tailor the training and aesthetic focus to this area).

    You must generate a JSON response with a timeline of 4 stages:
    - "m0" (Current): Analysis of starting point.
    - "m4" (Foundation): Early visible changes.
    - "m8" (Expansion): Significant muscle/definition gains.
    - "m12" (Peak): The final transformed state.

    For each stage, provide:
    1. "title": A powerful, 1-2 word phase name (e.g., "GÉNESIS", "METAMORFOSIS").
    2. "description": A clinical but motivating summary of changes.
    3. "stats": Numerical attributes (0-100) for Strength, Aesthetics, Endurance, Mental.
    4. "image_prompt": A highly detailed, photorealistic prompt for generating the user's photo at this stage.
       - MUST incorporate the user's "Visual Vision" for this specific month.
       - Keep the face consistent but evolve the body.
       - Style: Cinematic, 8k, dramatic lighting, Nike commercial aesthetic.
    5. "mental": A short, stoic mindset shift required for this stage.
    6. "risks" (m0 only): Potential pitfalls based on their stress/sleep data.
    7. "expectations" (m0 only): Realistic physical outcomes.

    TONE:
    - Clinical yet inspiring.
    - Use "Deep Data" (stress, sleep) to customize advice.
    - If stress is high, emphasize recovery. If discipline is low, emphasize consistency.

    OUTPUT FORMAT:
    Return ONLY valid JSON matching this exact Schema:
    {
      "insightsText": "string (Main analysis summary)",
      "timeline": {
        "m0": { "month": 0, "title": "string", "description": "string", "stats": { "strength": number, "aesthetics": number, "endurance": number, "mental": number }, "image_prompt": "string", "mental": "string", "risks": ["string"], "expectations": ["string"] },
        "m4": { "month": 4, "title": "string", "description": "string", "stats": { "strength": number, "aesthetics": number, "endurance": number, "mental": number }, "image_prompt": "string", "mental": "string" },
        "m8": { "month": 8, "title": "string", "description": "string", "stats": { "strength": number, "aesthetics": number, "endurance": number, "mental": number }, "image_prompt": "string", "mental": "string" },
        "m12": { "month": 12, "title": "string", "description": "string", "stats": { "strength": number, "aesthetics": number, "endurance": number, "mental": number }, "image_prompt": "string", "mental": "string" }
      },
      "overlays": {
        "m0": [{ "x": number, "y": number, "label": "string" }]
      }
    }

    IMPORTANT:
    - "stats" values must be integers 0-100.
    - "overlays" coordinates x,y must be 0.0-1.0 (relative).
    - "image_prompt" must be English, highly detailed, photorealistic.
  `;
}

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Generate insights from image using v2.0 schema
 * Returns full AnalysisOutput with user_visual_anchor and style_profile
 */
export async function generateInsightsV2(
  params: AnalysisParams
): Promise<AnalysisOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const { mimeType, data } = await fetchImageAsInlineData(params.imageUrl);
  const systemPrompt = getV2SystemPrompt(params.profile);
  const userContext = `Profile: ${JSON.stringify(params.profile)}`;

  console.log("[Gemini V2] Generating analysis...");

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userContext },
    { inlineData: { mimeType, data } },
  ]);

  let text = cleanJsonResponse(result.response.text());

  // Try to parse and validate
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.warn("[Gemini V2] Initial parse failed, attempting repair...");
    text = attemptJsonRepair(text);
    parsed = JSON.parse(text);
  }

  // Validate against v2 schema
  const validation = validateAnalysisOutput(parsed);

  if (!validation.success) {
    console.warn("[Gemini V2] Schema validation failed:", validation.errors);

    // Try to migrate from v1 if possible
    const v1Check = InsightsResultZ.safeParse(parsed);
    if (v1Check.success) {
      console.log("[Gemini V2] Migrating from v1 schema...");
      return migrateV1toV2(v1Check.data, params.profile);
    }

    throw new Error(
      `Gemini output validation failed: ${validation.errors?.map((e) => e.message).join(", ")}`
    );
  }

  return validation.data as AnalysisOutput;
}

/**
 * Generate insights from image (legacy v1 format)
 * @deprecated Use generateInsightsV2 for new code
 */
export async function generateInsightsFromImage(
  params: AnalysisParams
): Promise<InsightsResult> {
  const flags = getFeatureFlags();

  // If NB Pro is enabled, use v2 and convert back to v1 for compatibility
  if (flags.FF_NB_PRO || flags.FF_IDENTITY_CHAIN) {
    const v2Result = await generateInsightsV2(params);

    // Convert v2 to v1 format for backward compatibility
    return {
      insightsText: v2Result.insightsText,
      timeline: {
        m0: {
          ...v2Result.timeline.m0,
          stats: v2Result.timeline.m0.stats,
          risks: v2Result.timeline.m0.risks || [],
          expectations: v2Result.timeline.m0.expectations || [],
        },
        m4: {
          ...v2Result.timeline.m4,
          stats: v2Result.timeline.m4.stats,
          risks: [],
          expectations: [],
        },
        m8: {
          ...v2Result.timeline.m8,
          stats: v2Result.timeline.m8.stats,
          risks: [],
          expectations: [],
        },
        m12: {
          ...v2Result.timeline.m12,
          stats: v2Result.timeline.m12.stats,
          risks: [],
          expectations: [],
        },
      },
      overlays: v2Result.overlays || {},
    };
  }

  // Legacy path
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const { mimeType, data } = await fetchImageAsInlineData(params.imageUrl);
  const systemPrompt = getV1SystemPrompt(params.profile);
  const userContext = `Perfil: ${JSON.stringify(params.profile)} `;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userContext },
    { inlineData: { mimeType, data } },
  ]);

  const text = cleanJsonResponse(result.response.text());

  const parsed = InsightsResultZ.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(
      "Gemini output validation failed: " + parsed.error.message
    );
  }
  return parsed.data;
}

/**
 * Get the user_visual_anchor from an analysis result
 * Returns a fallback if not present (legacy data)
 */
export function extractVisualAnchor(
  analysis: InsightsResult | AnalysisOutput | null | undefined,
  fallback?: string
): string {
  if (!analysis) {
    return fallback || "Adult person. Preserve exact facial features.";
  }

  // Check if it's v2 format
  if ("user_visual_anchor" in analysis && analysis.user_visual_anchor) {
    return analysis.user_visual_anchor;
  }

  // Return fallback for v1 format
  return fallback || "Adult person. Preserve exact facial features, skin tone, and distinguishing marks.";
}

/**
 * Get the style_profile from an analysis result
 * Returns defaults if not present
 */
export function extractStyleProfile(
  analysis: InsightsResult | AnalysisOutput | null | undefined
): {
  lighting: string;
  wardrobe: string;
  background: string;
  color_grade: string;
} {
  const defaults = {
    lighting: "dramatic studio lighting with sharp shadows",
    wardrobe: "premium athletic wear",
    background: "professional fitness environment",
    color_grade: "cinematic with deep blacks",
  };

  if (!analysis) {
    return defaults;
  }

  if ("style_profile" in analysis && analysis.style_profile) {
    return {
      lighting: analysis.style_profile.lighting || defaults.lighting,
      wardrobe: analysis.style_profile.wardrobe || defaults.wardrobe,
      background: analysis.style_profile.background || defaults.background,
      color_grade: analysis.style_profile.color_grade || defaults.color_grade,
    };
  }

  return defaults;
}

/**
 * Get the letter from future from an analysis result
 */
export function extractLetterFromFuture(
  analysis: InsightsResult | AnalysisOutput | null | undefined
): string | null {
  if (!analysis) return null;

  if ("letter_from_future" in analysis && analysis.letter_from_future) {
    return analysis.letter_from_future;
  }

  return null;
}
