import { GoogleGenerativeAI } from "@google/generative-ai";
import type { InsightsResult, ProfileInput } from "@/types/ai";
import { insightsResultSchema } from "./validators";

type AnalyzeOptions = {
  profile: ProfileInput;
  sessionId: string;
};

const DEFAULT_RESULT: InsightsResult = {
  insightsText:
    "Análisis no disponible. Activa GEMINI_API_KEY para obtener resultados reales. Mientras tanto, utiliza la demo.",
  timeline: {
    m0: { month: 0, focus: "Evaluación inicial", expectations: ["Establecer técnica"], risks: ["Sobrecarga"] },
    m4: { month: 4, focus: "Fuerza base", expectations: ["Progresos consistentes"], risks: ["Fatiga"] },
    m8: { month: 8, focus: "Volumen inteligente", expectations: ["Mayor capacidad"], risks: ["Estancamiento"] },
    m12: { month: 12, focus: "Consolidación", expectations: ["Hábitos sólidos"], risks: ["Lesiones"] },
  },
  overlays: {},
};

export async function analyzeProfileWithGemini({ profile, sessionId }: AnalyzeOptions): Promise<InsightsResult> {
  if (!process.env.GEMINI_API_KEY) {
    return DEFAULT_RESULT;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelId = process.env.GEMINI_TEXT_MODEL || "gemini-1.5-flash-latest";
  const model = genAI.getGenerativeModel({ model: modelId });

  const prompt = `Eres un coach deportivo. Devuelve JSON con la siguiente estructura:
  {
    "insightsText": string,
    "timeline": {
      "m0": { "month": 0, "focus": string, "expectations": string[], "risks": string[] },
      "m4": { "month": 4, "focus": string, "expectations": string[], "risks": string[] },
      "m8": { "month": 8, "focus": string, "expectations": string[], "risks": string[] },
      "m12": { "month": 12, "focus": string, "expectations": string[], "risks": string[] }
    },
    "overlays": {
      "m0"?: { "x": number (0-1), "y": number (0-1), "label": string }[],
      "m4"?: { "x": number, "y": number, "label": string }[],
      "m8"?: [...],
      "m12"?: [...]
    }
  }
  Debe ser JSON válido. Perfil: ${JSON.stringify(profile)}. SessionId: ${sessionId}.`;

  const result = await model.generateContent([prompt]);
  const text = result.response.text();
  if (!text) return DEFAULT_RESULT;
  const jsonText = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(jsonText);
  return insightsResultSchema.parse(parsed);
}
