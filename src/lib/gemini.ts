import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsightsResultZ, type InsightsResult } from "@/types/ai";

async function fetchImageAsInlineData(url: string): Promise<{ mimeType: string; data: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetching image: ${res.status}`);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const data = Buffer.from(arrayBuffer).toString("base64");
  return { mimeType, data };
}

export async function generateInsightsFromImage(params: {
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
}): Promise<InsightsResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const { mimeType, data } = await fetchImageAsInlineData(params.imageUrl);

  const { profile } = params;

  // Handle both field naming conventions (API vs Firestore)
  const height = profile.height ?? profile.heightCm;
  const weight = profile.weight ?? profile.weightKg;
  const goals = profile.goals ?? profile.goal;

  const systemPrompt = `
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

  const userContext = `Perfil: ${JSON.stringify(params.profile)} `;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userContext },
    { inlineData: { mimeType, data } },
  ]);

  let text = result.response.text().trim();
  // Strip code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
  }

  const parsed = InsightsResultZ.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error("Gemini output validation failed: " + parsed.error.message);
  }
  return parsed.data;
}

