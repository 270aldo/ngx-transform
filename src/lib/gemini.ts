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
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    level: "novato" | "intermedio" | "avanzado";
    goal: "definicion" | "masa" | "mixto";
    weeklyTime: number;
    notes?: string;
  };
}): Promise<InsightsResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const { mimeType, data } = await fetchImageAsInlineData(params.imageUrl);

  const systemPrompt = `
Eres un asesor de fitness NGX. Analiza la foto y el perfil y devuelve SOLO JSON válido.
Debes ser realista, conservador y evitar promesas. Incluye un recordatorio de que no es consejo médico.
Formato JSON (campos y tipos exactos):
{
  "insightsText": string,
  "timeline": {
    "m0": { "month": 0, "focus": string, "expectations": string[], "risks": string[] },
    "m4": { "month": 4, "focus": string, "expectations": string[], "risks": string[] },
    "m8": { "month": 8, "focus": string, "expectations": string[], "risks": string[] },
    "m12": { "month": 12, "focus": string, "expectations": string[], "risks": string[] }
  },
  "overlays": {
    "m0"?: { "x": number, "y": number, "label": string }[],
    "m4"?: { "x": number, "y": number, "label": string }[],
    "m8"?: { "x": number, "y": number, "label": string }[],
    "m12"?: { "x": number, "y": number, "label": string }[]
  }
}
Las coordenadas x,y deben ser relativas [0,1].`;

  const userContext = `Perfil: ${JSON.stringify(params.profile)}`;

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

