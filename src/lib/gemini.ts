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
    trainingDaysPerWeek?: number;
    trainingHistoryYears?: number;
    nutritionQuality?: number;
    bodyFatLevel?: string;
    trainingStyle?: string;
    aestheticPreference?: string;
    stressLevel?: number;
    sleepQuality?: number;
    disciplineRating?: number;
    bodyType?: string;
    focusAreas?: string[];
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

    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      throw new Error("Image buffer too large (>10MB)");
    }

    const data = Buffer.from(arrayBuffer).toString("base64");
    return { mimeType, data };
  } finally {
    clearTimeout(timeoutId);
  }
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

  return `Eres un Entrenador de Alto Rendimiento Elite y Experto en Fisiología Deportiva con capacidades de análisis forense visual.
Tu misión: Analizar la foto y datos del usuario para proyectar su evolución física en 12 meses basándote en PRINCIPIOS CIENTÍFICOS REALES (adaptación fisiológica, hipertrofia, recomposición).

DATOS DEL USUARIO:
- Edad: ${profile.age}, Sexo: ${profile.sex}
- Altura: ${height}cm, Peso: ${weight}kg
- Somatotipo: ${profile.bodyType || "no especificado"}
- Nivel Actual: ${profile.level || "novato"}
- Objetivo Principal: ${goals || "mixto"}
- Dedicación Semanal: ${profile.weeklyTime || 3} horas
- Días/Semana: ${profile.trainingDaysPerWeek || "N/A"}
- Historia de Entrenamiento: ${profile.trainingHistoryYears ?? "N/A"} años
- Nutrición: ${profile.nutritionQuality ?? "N/A"}/10
- Grasa Corporal: ${profile.bodyFatLevel || "medio"}
- Estilo: ${profile.trainingStyle || "mixto"}
- Deep Data: Estrés ${profile.stressLevel}/10, Sueño ${profile.sleepQuality}/10, Disciplina ${profile.disciplineRating}/10

ZONA PRIORITARIA: ${profile.focusZone?.toUpperCase() || "FULL BODY"}
ÁREAS FOCO: ${profile.focusAreas?.length ? profile.focusAreas.join(", ") : "no especificado"}
ESTÉTICA: ${profile.aestheticPreference || "cinematic"}
NOTAS: ${profile.notes || "ninguna"}

INSTRUCCIONES CLAVE:
1. OUTPUT MUST BE IN SPANISH (LATAM). TODO EL TEXTO VISIBLE AL USUARIO (title, description, narrative, stats names) DEBE SER EN ESPAÑOL (LATAM).
2. "image_prompt" DEBE MANTENERSE EN INGLÉS (Detailed ENGLISH prompt for generating fitness photo).
3. Sé CIENTÍFICAMENTE PRECISO. Si el usuario duerme mal, menciónalo como factor limitante. Usa terminología correcta (ej: "adaptación neuromuscular", "síntesis proteica").
4. TONO: Profesional, Maduro, Estoico. Nada de "marketing hype" barato.

FORMATO JSON REQUERIDO:
{
  "user_visual_anchor": "Brief visual description of the user from the photo (use for strict consistency)",
  "style_profile": "Cinematic lighting keywords based on user aesthetic preference",
  "timeline": {
  "style_profile": { ... }
}

REGLAS CRÍTICAS:
1. TODO EL TEXTO VISIBLE (title, description, narrative, mental, risks, expectations, letter) DEBE SER EN ESPAÑOL (LATAM).
2. "image_prompt" DEBE MANTENERSE EN INGLÉS.
3. Sé CIENTÍFICAMENTE PRECISO. Si el usuario duerme mal, menciónalo como factor limitante.
4. JSON válido únicamente.`;
}

// Legacy V1 prompt for backward compatibility
function getV1SystemPrompt(profile: AnalysisParams["profile"]): string {
  const height = profile.height ?? profile.heightCm;
  const weight = profile.weight ?? profile.weightKg;
  const goals = profile.goals ?? profile.goal;

  return `
    Eres un Entrenador de Alto Rendimiento Elite y Futurista (Estoico, Clínico, Motivacional).
    Tu objetivo es analizar la foto y datos del usuario para proyectar su evolución física y mental en 12 meses.

    DATOS DEL USUARIO:
    - Edad: ${profile.age}, Sexo: ${profile.sex}
    - Altura: ${height}cm, Peso: ${weight}kg
    - Somatotipo: ${profile.bodyType}
    - Nivel Actual: ${profile.level}
    - Objetivo: ${goals}
    - Dedicación: ${profile.weeklyTime} horas/semana
    - Días Entreno: ${profile.trainingDaysPerWeek || "N/A"}
    - Historia: ${profile.trainingHistoryYears ?? "N/A"} años
    - Nutrición: ${profile.nutritionQuality ?? "N/A"}/10
    - Grasa: ${profile.bodyFatLevel || "medio"}
    - Estilo: ${profile.trainingStyle || "mixto"}
    - Deep Data: Estrés ${profile.stressLevel}/10, Sueño ${profile.sleepQuality}/10, Disciplina ${profile.disciplineRating}/10

    ZONA PRIORITARIA: ${profile.focusZone?.toUpperCase() || "FULL BODY"}
    (Adapta el enfoque a esta área).
    ÁREAS FOCO: ${profile.focusAreas?.length ? profile.focusAreas.join(", ") : "no especificado"}
    ESTÉTICA: ${profile.aestheticPreference || "cinematic"}
    NOTAS: ${profile.notes || "ninguna"}

    Genera un JSON con una línea de tiempo de 4 fases (OUTPUT IN SPANISH):
    - "m0" (Actual): Análisis del punto de partida.
    - "m4" (Fundación): Cambios visibles tempranos, adaptación.
    - "m8" (Expansión): Ganancias musculares notables, definición.
    - "m12" (Cúspide): Estado final transformado.

    Para cada fase:
    1. "title": Nombre de fase poderoso (ej: "GÉNESIS", "METAMORFOSIS").
    2. "description": Resumen clínico y motivador en ESPAÑOL.
    3. "stats": Numéricos (0-100) Fuerza, Estética, Resistencia, Mental.
    4. "image_prompt": Prompt en INGLÉS altamente detallado para generar la foto.
       - Mantén la identidad facial.
       - Estilo: Cinematic, 8k, dramatic lighting, Nike commercial.
       - POSES: m4 = Entrenando duro; m8 = Atleta dinámico; m12 = Héroe estático/Portada.
    5. "mental": Cambio de mentalidad estoico (en ESPAÑOL).
    6. "risks" (m0): Riesgos potenciales (en ESPAÑOL).
    7. "expectations" (m0): Expectativas realistas (en ESPAÑOL).

    TONO:
    - Clínico pero inspirador.
    - Usa "Deep Data" (estrés, sueño) para personalizar el consejo.
    - Sé CIENTÍFICO (ej: habla de recuperación, síntesis, adaptaciones).

    OUTPUT FORMAT (JSON):
    {
      "insightsText": "Resumen principal (ESPAÑOL)",
      "timeline": {
        "m0": { "month": 0, "title": "...", "description": "...", "stats": {...}, "image_prompt": "ENGLISH...", "mental": "...", "risks": ["..."], "expectations": ["..."] },
        "m4": { "month": 4, "title": "...", "description": "...", "stats": {...}, "image_prompt": "ENGLISH...", "mental": "..." },
        "m8": { "month": 8, "title": "...", "description": "...", "stats": {...}, "image_prompt": "ENGLISH...", "mental": "..." },
        "m12": { "month": 12, "title": "...", "description": "...", "stats": {...}, "image_prompt": "ENGLISH...", "mental": "..." }
      },
      "overlays": {
        "m0": [{ "x": number, "y": number, "label": "string" }]
      }
    }
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
  const userContext = `Profile: ${JSON.stringify(params.profile)} `;

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
      `Gemini output validation failed: ${validation.errors?.map((e) => e.message).join(", ")} `
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
