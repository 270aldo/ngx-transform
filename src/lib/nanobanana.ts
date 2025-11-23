// "NanoBanana" es el alias interno para el modelo de imágenes de Gemini 2.5 Flash.
// Integramos directamente con la API oficial de Gemini para generación/edición de imagen
// usando el modelo "gemini-2.5-flash-image-preview" (configurable por env).

export type NanoStep = "m4" | "m8" | "m12";

async function fetchImageAsInlineData(url: string): Promise<{ mimeType: string; data: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed fetching base image: ${res.status}`);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const data = Buffer.from(arrayBuffer).toString("base64");
  return { mimeType, data };
}

export async function generateTransformedImage(params: {
  imageUrl: string; // Signed URL to original in Firebase Storage
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
  step: NanoStep; // which month projection
}): Promise<{ buffer: Buffer; contentType: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image-preview";
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY for NanoBanana (Gemini 2.5 Flash Image)");

  const { mimeType, data } = await fetchImageAsInlineData(params.imageUrl);

  // Prompt enfocado a cambios realistas y consistentes con NGX
  const prompt = `Transformación fitness aproximada a ${params.step.replace("m", "")} meses con NGX. Apariencia realista, sin exagerar cambios. Luz y fondo coherentes. Mostrar progreso en tono natural.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } }, // imagen base para image-to-image
          { text: `Perfil: ${JSON.stringify(params.profile)}` },
          { text: `Paso: ${params.step}` },
        ],
      },
    ],
    generationConfig: {
      // Solicitamos bytes de imagen directamente en la respuesta
      responseMimeType: "image/jpeg",
      // Puedes ajustar calidad/tamaño con response parameters (si están soportados)
    },
  } as const;

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
  // Navegamos la estructura para extraer inlineData
  // Esperado: candidates[0].content.parts[0].inlineData.{data,mimeType}
  const candidates = json?.candidates || [];
  const parts = candidates[0]?.content?.parts || candidates[0]?.content || [];
  let inlineData = null as null | { data: string; mimeType?: string };

  for (const p of parts) {
    if (p?.inlineData?.data) { inlineData = p.inlineData; break; }
  }

  if (!inlineData?.data) {
    throw new Error("Gemini image API: no inline image data found in response");
  }

  const outMime = inlineData.mimeType || "image/jpeg";
  const buffer = Buffer.from(inlineData.data, "base64");
  return { buffer, contentType: outMime };
}

