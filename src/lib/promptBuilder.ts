/**
 * PR-1: Robust Prompt Builder for Nano Banana Pro
 *
 * This module constructs prompts for image generation with:
 * - Identity Lock: Preserving facial features and unique characteristics
 * - Transformation stages with appropriate percentages
 * - Environment progression (gym → lifestyle → editorial)
 * - NGX visual style (Nike commercial aesthetic)
 * - Explicit negative prompts to avoid common failures
 */

import { type NanoStep, ENVIRONMENT_BY_STEP, TRANSFORMATION_PERCENT } from "./imageConfig";
import type { StyleProfile } from "./schemas/analysis";

// ============================================================================
// Types
// ============================================================================

export interface PromptContext {
  step: NanoStep;
  userVisualAnchor: string;
  styleProfile?: StyleProfile;
  goal: "definicion" | "masa" | "mixto";
  sex: "male" | "female" | "other";
  focusZone?: "upper" | "lower" | "abs" | "full";
  aiPrompt?: string;  // Optional AI-generated prompt from analysis
}

export interface GeneratedPrompt {
  mainPrompt: string;
  negativePrompt: string;
  identityLock: string;
  environment: string;
}

// ============================================================================
// Goal Descriptions
// ============================================================================

const GOAL_DESCRIPTIONS: Record<string, {
  male: string;
  female: string;
  neutral: string;
}> = {
  definicion: {
    male: "extremely lean and shredded physique, visible six-pack abs, vascularity on arms, defined deltoids, sharp jawline, low body fat percentage",
    female: "toned and defined athletic physique, visible muscle definition, lean arms, defined abs outline, athletic build",
    neutral: "lean and defined athletic physique, visible muscle definition, low body fat, toned appearance",
  },
  masa: {
    male: "massive muscle hypertrophy, bodybuilder physique, thick chest, broad shoulders, powerful arms, thick neck, substantial muscle mass",
    female: "strong muscular physique, developed glutes, toned legs, defined arms, athletic curves with muscle",
    neutral: "muscular and powerful physique, significant muscle development, broad build, strength-focused",
  },
  mixto: {
    male: "athletic superhero physique, balanced muscle mass with definition, wide shoulders, V-taper, functional strength appearance",
    female: "athletic model physique, toned all over, balanced proportions, sporty and strong, functional fitness look",
    neutral: "athletic and balanced physique, good proportions, mix of strength and definition",
  },
};

// Focus zone emphasis
const FOCUS_ZONE_EMPHASIS: Record<string, string> = {
  upper: "with particular emphasis on chest, shoulders, back, and arms development",
  lower: "with particular emphasis on quadriceps, hamstrings, glutes, and calves development",
  abs: "with particular emphasis on core definition, visible abdominal muscles, and obliques",
  full: "with balanced full-body development and proportional muscle growth",
};

// ============================================================================
// Prompt Construction
// ============================================================================

/**
 * Build the identity lock section of the prompt
 * This is critical for maintaining consistency across milestones
 */
function buildIdentityLock(userVisualAnchor: string): string {
  return `[IDENTITY LOCK - CRITICAL]
Subject Identity: ${userVisualAnchor}

PRESERVE EXACTLY:
- Facial features: exact bone structure, nose shape, lip shape, eye shape and color
- Skin: exact skin tone, any moles, freckles, or distinguishing marks
- Hair: exact color, texture, length, style, hairline
- Distinguishing features: any tattoos, scars, unique characteristics

WARNING: Any deviation from these features will result in FAILURE.
The output MUST be recognizable as the SAME person in the reference.`;
}

/**
 * Build the transformation section based on step and goal
 */
function buildTransformation(context: PromptContext): string {
  const percent = TRANSFORMATION_PERCENT[context.step];
  const env = ENVIRONMENT_BY_STEP[context.step];

  const sexKey = context.sex === "other" ? "neutral" : context.sex;
  const goalDesc = GOAL_DESCRIPTIONS[context.goal]?.[sexKey]
    || GOAL_DESCRIPTIONS.mixto.neutral;

  const focusEmphasis = context.focusZone
    ? FOCUS_ZONE_EMPHASIS[context.focusZone] || ""
    : "";

  let progressDescription = "";
  if (context.step === "m4") {
    progressDescription = "Early visible changes beginning to show. Foundation being built. Initial muscle development becoming apparent.";
  } else if (context.step === "m8") {
    progressDescription = "Significant transformation in progress. Clear visible changes. Athletic build emerging strongly.";
  } else {
    progressDescription = "PEAK TRANSFORMATION achieved. Maximum results. Competition-ready elite physique.";
  }

  return `[TRANSFORMATION: ${context.step.toUpperCase()} - ${percent}% PROGRESS]

Target Physique: ${goalDesc} ${focusEmphasis}

Progress Level: ${percent}% toward goal
${progressDescription}

Environment: ${env.description}
Setting: ${env.setting}
Mood: ${env.mood}`;
}

/**
 * Build style and photography directions
 */
function buildStyle(styleProfile?: StyleProfile): string {
  const lighting = styleProfile?.lighting || "dramatic studio lighting with sharp shadows";
  const wardrobe = styleProfile?.wardrobe || "premium athletic wear (Nike/Under Armour style) or shirtless";
  const background = styleProfile?.background || "professional fitness environment";
  const colorGrade = styleProfile?.color_grade || "cinematic with deep blacks and vibrant highlights";

  return `[PHOTOGRAPHY STYLE]
Camera: 85mm portrait lens, f/2.8, shallow depth of field
Lighting: ${lighting}
Subject: Perfectly sharp and in focus, hero framing

Wardrobe: ${wardrobe}
Background: ${background}
Color Grade: ${colorGrade}

Aesthetic Reference: Nike commercial, Under Armour campaign, ESPN Body Issue
Quality: 8K ultra-high definition, photorealistic, magazine cover quality`;
}

/**
 * Build the negative prompt to avoid common issues
 */
function buildNegativePrompt(): string {
  return `[NEGATIVE - ABSOLUTELY AVOID]
- CGI appearance, 3D render look, video game graphics
- Cartoon, anime, illustration, painting style
- Plastic skin, waxy skin, overly smooth skin
- Extra limbs, deformed hands, missing fingers
- Face drift, different person, identity change
- Multiple subjects, crowd, other people
- Blurry, low quality, pixelated, grainy
- Distorted proportions, unnatural poses
- Uncanny valley effect
- Oversaturated, neon colors
- Text, watermarks, logos (other than subtle clothing brands)
- Mirror reflections showing different appearance`;
}

/**
 * Build additional details for realism
 */
function buildDetails(step: NanoStep): string {
  const detailsBase = `[REALISTIC DETAILS]
- Natural skin texture with pores
- Slight perspiration/sweat sheen
- Determined, focused expression
- Natural body positioning
- Authentic muscle striations and shadows`;

  if (step === "m12") {
    return `${detailsBase}
- Visible vascularity where appropriate
- Peak conditioning visible
- Competition-ready muscle definition
- Confident, accomplished expression`;
  }

  return detailsBase;
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Build a complete prompt for image generation
 */
export function buildImagePrompt(context: PromptContext): GeneratedPrompt {
  const identityLock = buildIdentityLock(context.userVisualAnchor);
  const transformation = buildTransformation(context);
  const style = buildStyle(context.styleProfile);
  const details = buildDetails(context.step);
  const negativePrompt = buildNegativePrompt();

  // If AI provided a specific prompt, incorporate it
  const aiSection = context.aiPrompt
    ? `\n[AI VISION GUIDANCE]\n${context.aiPrompt}\n`
    : "";

  const mainPrompt = `GENERATE A NEW PHOTOREALISTIC IMAGE of this person showing their fitness transformation.

${identityLock}

${transformation}

${style}

${details}
${aiSection}
${negativePrompt}

FINAL INSTRUCTION: Create a MASTERPIECE of fitness photography. This should look like a professional billboard campaign, not a casual photo. The subject MUST be clearly recognizable as the same person from the reference image.`;

  return {
    mainPrompt,
    negativePrompt: buildNegativePrompt(),
    identityLock,
    environment: ENVIRONMENT_BY_STEP[context.step].description,
  };
}

/**
 * Build a corrective prompt for retry attempts
 * Used when the first generation fails quality gates
 */
export function buildCorrectivePrompt(
  context: PromptContext,
  failureReason: string
): string {
  const basePrompt = buildImagePrompt(context);

  return `${basePrompt.mainPrompt}

[CORRECTION REQUIRED]
Previous attempt failed because: ${failureReason}

CRITICAL: Fix this issue specifically:
${failureReason.includes("face") ? "- Ensure the face is EXACTLY matching the reference. Same bone structure, same features." : ""}
${failureReason.includes("multiple") ? "- Generate ONLY ONE person. No other subjects in the image." : ""}
${failureReason.includes("artifact") ? "- Ensure clean generation with no visual artifacts, distortions, or glitches." : ""}
${failureReason.includes("quality") ? "- Generate at MAXIMUM quality. Professional photography standard." : ""}

This is a RETRY. The output MUST pass quality validation.`;
}

/**
 * Generate the system prompt for user_visual_anchor creation
 * Used in the analysis phase to create the identity description
 */
export function getVisualAnchorSystemPrompt(): string {
  return `You are a forensic visual analyst creating an IDENTITY ANCHOR for AI image generation.

Your task is to describe a person's IMMUTABLE visual characteristics that MUST be preserved across all generated images.

Include:
1. FACE: Exact bone structure, forehead shape, cheekbone prominence, jaw shape, chin type
2. EYES: Shape, size, color, eyebrow shape and thickness, eyelid type
3. NOSE: Bridge shape, tip shape, nostril size, overall proportion
4. MOUTH: Lip shape, lip fullness, smile characteristics
5. SKIN: Exact tone (use Pantone-like description), any moles, freckles, marks
6. HAIR: Color, texture, length, style, hairline shape
7. DISTINGUISHING: Any unique features - tattoos, scars, birthmarks, asymmetries

Format: Write as a dense, technical paragraph (100-400 words) that could be given to a forensic artist.

IMPORTANT: Be extremely specific. Vague descriptions like "brown hair" are USELESS. Instead: "medium brown hair with subtle auburn highlights, wavy texture, medium length reaching collar, receding slightly at temples forming M-shaped hairline"`;
}

/**
 * Generate the system prompt for style_profile creation
 */
export function getStyleProfileSystemPrompt(): string {
  return `Analyze this person and the NGX Transform aesthetic to create a STYLE PROFILE.

Output a JSON object with:
{
  "lighting": "specific lighting setup description (e.g., 'dramatic rim lighting with soft fill, creating defined shadows on muscle contours')",
  "wardrobe": "appropriate athletic wear description (e.g., 'sleeveless black compression top, fitted athletic shorts')",
  "background": "environment description that matches NGX aesthetic (e.g., 'industrial gym with exposed concrete, muted tones, dramatic depth')",
  "color_grade": "color grading style (e.g., 'cinematic teal-orange grade with deep shadows and lifted blacks')"
}

Match the style to:
- The person's appearance and build
- NGX brand aesthetic (premium, athletic, aspirational)
- Nike/Under Armour commercial quality`;
}
