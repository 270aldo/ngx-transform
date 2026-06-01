/**
 * PR-1: Robust Prompt Builder for Nano Banana Pro
 *
 * This module constructs prompts for image generation with:
 * - Identity Lock: Preserving facial features and unique characteristics
 * - Transformation stages with appropriate percentages
 * - Environment progression (gym → lifestyle → editorial)
 * - NGX visual style (premium athletic editorial aesthetic)
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
  level?: "novato" | "intermedio" | "avanzado";
  weeklyTime?: number;
  trainingDaysPerWeek?: number;
  trainingHistoryYears?: number;
  nutritionQuality?: number;
  bodyFatLevel?: "bajo" | "medio" | "alto";
  trainingStyle?: "fuerza" | "hipertrofia" | "funcional" | "hiit" | "mixto";
  aestheticPreference?: "cinematic" | "editorial" | "street" | "minimal";
  stressLevel?: number;
  sleepQuality?: number;
  disciplineRating?: number;
  focusAreas?: Array<"pecho" | "espalda" | "hombros" | "brazos" | "gluteos" | "piernas" | "core">;
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
    male: "realistic athletic recomposition, leaner waist, improved posture, visible shoulder and arm tone, natural proportions",
    female: "realistic athletic recomposition, improved posture, visible muscle tone, leaner waist, natural proportions",
    neutral: "realistic athletic recomposition, improved posture, visible muscle tone, leaner waist, natural proportions",
  },
  masa: {
    male: "functional muscle gain, fuller chest and shoulders, stronger arms, athletic proportions, natural size increase",
    female: "functional muscle gain, stronger glutes and legs, toned arms, athletic curves, natural size increase",
    neutral: "functional muscle gain, stronger frame, athletic proportions, natural size increase",
  },
  mixto: {
    male: "balanced athletic physique, visible strength, improved posture, tighter waist, functional performance look",
    female: "balanced athletic physique, visible tone, improved posture, stronger legs and core, functional performance look",
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

const FOCUS_AREA_LABELS: Record<string, string> = {
  pecho: "chest",
  espalda: "back",
  hombros: "shoulders",
  brazos: "arms",
  gluteos: "glutes",
  piernas: "legs",
  core: "core/abs",
};

// ============================================================================ 
// Realism & Progress Utilities
// ============================================================================ 

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

function computeAdherenceScore(context: PromptContext): number {
  const parts: number[] = [];

  if (typeof context.weeklyTime === "number") {
    parts.push(normalize(context.weeklyTime, 1, 14));
  }
  if (typeof context.trainingDaysPerWeek === "number") {
    parts.push(normalize(context.trainingDaysPerWeek, 1, 7));
  }
  if (typeof context.disciplineRating === "number") {
    parts.push(normalize(context.disciplineRating, 1, 10));
  }
  if (typeof context.sleepQuality === "number") {
    parts.push(normalize(context.sleepQuality, 1, 10));
  }
  if (typeof context.stressLevel === "number") {
    // Higher stress lowers adherence score
    parts.push(1 - normalize(context.stressLevel, 1, 10));
  }

  // Level baseline
  const levelBoost =
    context.level === "avanzado" ? 0.1 : context.level === "novato" ? -0.05 : 0.0;
  const experienceBoost = typeof context.trainingHistoryYears === "number"
    ? normalize(context.trainingHistoryYears, 0, 8) * 0.08
    : 0;
  const base = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0.6;

  return clamp(base + levelBoost + experienceBoost, 0.2, 0.95);
}

function describeProgressIntensity(score: number): string {
  if (score < 0.45) return "conservative but realistic";
  if (score < 0.7) return "moderate and sustainable";
  return "aggressive yet realistic";
}

function describeTrainingProfile(context: PromptContext): string {
  const weekly = typeof context.weeklyTime === "number"
    ? `${context.weeklyTime}h/week`
    : "unknown weekly volume";
  const level = context.level || "intermedio";
  const days = typeof context.trainingDaysPerWeek === "number"
    ? `${context.trainingDaysPerWeek} days/week`
    : "unknown days/week";

  return `Training profile: ${level}, ${weekly}, ${days}.`;
}

function describeTrainingStyle(style?: PromptContext["trainingStyle"]): string {
  if (!style) return "Balanced strength and hypertrophy approach.";
  switch (style) {
    case "fuerza":
      return "Strength-focused training, heavier loads, lower reps.";
    case "hipertrofia":
      return "Hypertrophy-focused training, moderate reps, higher volume.";
    case "funcional":
      return "Functional athletic training, movement quality and power.";
    case "hiit":
      return "HIIT and conditioning emphasis for leanness and stamina.";
    default:
      return "Balanced strength and hypertrophy approach.";
  }
}

function getChangeIntensityWord(score: number): string {
  if (score < 0.45) return "modest";
  if (score < 0.7) return "noticeable";
  return "pronounced";
}

function describeBodyFatLevel(level?: PromptContext["bodyFatLevel"]): string {
  if (!level) return "moderate body fat baseline";
  if (level === "bajo") return "low body fat baseline";
  if (level === "alto") return "higher body fat baseline";
  return "moderate body fat baseline";
}

function formatFocusAreas(areas?: PromptContext["focusAreas"]): string {
  if (!areas?.length) return "";
  const mapped = areas.map((area) => FOCUS_AREA_LABELS[area] || area);
  return `Primary focus areas: ${mapped.join(", ")}.`;
}

function buildVisualDelta(context: PromptContext, intensityWord: string): string {
  const goal = context.goal;
  const bodyFat = context.bodyFatLevel || "medio";
  const focusAreas = formatFocusAreas(context.focusAreas);

  const byStep: Record<NanoStep, string> = {
    m4: "",
    m8: "",
    m12: "",
  };

  if (goal === "definicion") {
    const earlyFat = bodyFat === "alto"
      ? "visible fat loss with a tighter waistline and softer-to-lean transition."
      : "tighter waistline with early ab outline and shoulder separation.";
    byStep.m4 = `${intensityWord} ${earlyFat}`;
    byStep.m8 = `clear fat reduction with a lean athletic look, visible abdominal definition starting to show under direct sunlight, sharper jawline, defined deltoids and athletic vascularity in arms.`;
    byStep.m12 = `realistic peak week 12 transformation: maximum healthy fat loss for this individual, full abdominal grid visible, highly defined oblique muscles, improved posture and shoulder alignment, peak natural proportions. The physical conditioning must be visibly more advanced and shredded compared to the Mes 8 stage.`;
  } else if (goal === "masa") {
    const cleanBulk = bodyFat === "alto"
      ? "cleaner bulk with tighter waistline control to avoid excessive fat gain."
      : "lean muscle gain with minimal fat increase.";
    byStep.m4 = `${intensityWord} increase in muscle fullness, thicker chest and shoulders, early arm growth; ${cleanBulk}`;
    byStep.m8 = `pronounced muscle fullness in the chest, back, and shoulders, arms are visibly thicker and athletic, showing active functional power.`;
    byStep.m12 = `realistic peak week 12 transformation: maximum high-performance lean muscle gain, broad dominant V-taper, thick fully developed shoulders and chest, peak athletic frame and muscle fullness. This represents the ultimate step of progress, showing a much more complete and massive muscular development than in the Mes 8 stage.`;
  } else {
    const recomposition = bodyFat === "alto"
      ? "recomposition with visible waist reduction and improved posture."
      : "recomposition: tighter waist, slightly broader shoulders, improved posture.";
    byStep.m4 = `${intensityWord} ${recomposition}`;
    byStep.m8 = `strong athletic recomposition silhouette, flat tight waistline with early visible abs, improved upper-to-lower body symmetry and active posture.`;
    byStep.m12 = `realistic peak week 12 transformation: ultimate high-performance balanced build, shredded tight midsection, broader powerful shoulders, peak posture and elite athletic symmetry. The overall physical conditioning, leanness, and muscle tone must be visibly superior and more mature than in the Mes 8 stage.`;
  }

  return `[VISUAL DELTA - MUST BE VISIBLE]
${byStep[context.step]}
${focusAreas ? `${focusAreas}` : ""}
Body changes must be clearly visible compared to the previous stage while preserving facial identity.`;
}

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
  const basePercent = TRANSFORMATION_PERCENT[context.step];
  const env = ENVIRONMENT_BY_STEP[context.step];
  const adherenceScore = computeAdherenceScore(context);
  const multiplier = clamp(0.65 + adherenceScore * 0.6, 0.7, 1.15);
  const effectivePercent = Math.min(100, Math.round(basePercent * multiplier));

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
    progressDescription = "Week 12 realistic peak. The subject shows calm confidence, stronger posture, visible muscle tone, and healthier body composition without exaggerated bodybuilding or facial changes.";
  }

  const intensityLabel = describeProgressIntensity(adherenceScore);
  const trainingProfile = describeTrainingProfile(context);
  const trainingStyle = describeTrainingStyle(context.trainingStyle);
  const intensityWord = getChangeIntensityWord(adherenceScore);
  const visualDelta = buildVisualDelta(context, intensityWord);
  const bodyFatLine = `Body fat baseline: ${describeBodyFatLevel(context.bodyFatLevel)}.`;
  const nutritionLine = typeof context.nutritionQuality === "number"
    ? `Nutrition quality: ${context.nutritionQuality}/10.`
    : "";
  const recoveryNote = (context.sleepQuality !== undefined || context.stressLevel !== undefined)
    ? `Recovery context: sleep ${context.sleepQuality ?? "N/A"}/10, stress ${context.stressLevel ?? "N/A"}/10.`
    : "";

  const varianceRule = context.step === "m8"
    ? "\n[VISUAL VARIANCE RULE]\n- You MUST completely change the subject's clothing style, clothing color, and posture compared to the original reference photo. The subject is active on an outdoor running track."
    : context.step === "m12"
      ? "\n[VISUAL VARIANCE RULE]\n- You MUST completely change the subject's clothing color, clothing style, posture, and framing compared to the Mes 8 reference image.\n- Do NOT copy the background, pose, or clothing from the Mes 8 reference image. Mes 12 is a complete visual styling reset: indoor dark premium cinematic studio with dramatic spotlighting, new dark athletic top, and a calm, focused standing posture."
      : "";

  return `[TRANSFORMATION: ${context.step.toUpperCase()} - ${effectivePercent}% PROGRESS]

Target Physique: ${goalDesc} ${focusEmphasis}

Progress Level: ${effectivePercent}% toward goal
Progress Intensity: ${intensityLabel}
${trainingProfile}
${trainingStyle}
${bodyFatLine}
${nutritionLine}
${recoveryNote}
${progressDescription}
${visualDelta}
${varianceRule}

Environment: ${env.description}
Setting: ${env.setting}
Mood: ${env.mood}`;
}

/**
 * Build style and photography directions
 */
function buildStyle(context: PromptContext): string {
  const aestheticPreference = context.aestheticPreference || "cinematic";
  let lighting = "";
  let wardrobe = "";
  let background = "";
  let colorGrade = "";

  if (context.step === "m4") {
    // Milestone 1 (m4): Gritty underground gym, cool tones
    lighting = "cool overhead industrial fluorescent light key, dramatic steep angles creating high-contrast shadows on muscle contours";
    wardrobe = "simple gray basic sleeveless workout tank top, no logos";
    background = "gritty raw industrial warehouse gym with exposed dark concrete walls, heavy steel weight racks, blurred background with shallow depth of field";
    colorGrade = "cool-toned, high-contrast, low-saturation gritty athletic commercial color grade";
  } else if (context.step === "m8") {
    // Milestone 2 (m8): Golden hour outdoor running track, warm golden lighting
    lighting = "dramatic natural golden hour sunlight, warm glowing key-light with organic lens flare and soft organic shadow fill";
    wardrobe = "fitted bright colored active performance t-shirt (such as active blue or electric orange), clean minimal design";
    background = "modern outdoor running track at golden hour sunrise, open sky horizon, warm sun disk on horizon line, shallow depth of field with blurred running lanes";
    colorGrade = "rich warm golden-hour cinematic grade, lifelike saturated skin tones, high-performance athletic commercial color style";
  } else {
    // Milestone 3 (m12): Dark premium wood-paneled elite studio, dramatic spotlight, black compression top
    lighting = "cinematic high-fashion spotlighting, single dramatic high-contrast overhead white spotlight casting soft edge shadows, highlighting peak physical cuts and definition";
    wardrobe = "sleek premium black long-sleeve compression top or fitted premium dark athletic tee, clean modern silhouette";
    background = "ultra-sleek premium private fitness space with dark acoustic vertical wood paneling and matte black machines, highly aesthetic premium minimalist environment, blurred background";
    colorGrade = "high-fashion moody cinematic grade, rich deep blacks, subtle dark violet undertones, premium editorial fitness commercial look";
  }

  return `[PHOTOGRAPHY STYLE]
Camera: 85mm portrait lens, f/2.8, shallow depth of field
Lighting: ${lighting}
Subject: Perfectly sharp and in focus, hero framing
 
Wardrobe: ${wardrobe}
Background: ${background}
Color Grade: ${colorGrade}
 
Aesthetic Reference: premium athletic editorial campaign, performance and longevity positioning
Preferred Aesthetic: ${aestheticPreference}
Quality: ultra-high definition, photorealistic, cinematic editorial fitness photography, controlled highlights, natural skin texture`;
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
- Natural athletic muscle tone visible through posture and lighting
- Healthier body composition without contest-level leanness
- Calm confident expression, not aggressive
- Editorial lighting that reveals realistic progress
- Week 12 consistency visible but anatomically plausible`;
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
  const style = buildStyle(context);
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

FINAL INSTRUCTION: Create premium realistic fitness photography. This is a credible 12-week direction, not a guaranteed or exaggerated transformation. The subject MUST be clearly recognizable as the same person from the reference image.`;

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
  return `Analyze this person and the NGX Vision aesthetic to create a STYLE PROFILE.

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
- premium athletic campaign quality`;
}
