import { copyFile } from "./storage";

interface GenerateOptions {
  sessionId: string;
  sourcePath: string;
}

type StepKey = "m4" | "m8" | "m12";

export async function generateTransformationImages({ sessionId, sourcePath }: GenerateOptions): Promise<Record<StepKey, string>> {
  const fallback: Record<StepKey, string> = {
    m4: sourcePath,
    m8: sourcePath,
    m12: sourcePath,
  };

  if (!process.env.GEMINI_API_KEY) {
    return fallback;
  }

  const baseName = sourcePath.split("/").pop() ?? "image.jpg";

  try {
    for (const step of ["m4", "m8", "m12"] as const) {
      const destination = `generated/${sessionId}/${step}-${baseName}`;
      await copyFile(sourcePath, destination);
      fallback[step] = destination;
    }
  } catch (err) {
    console.warn("generateTransformationImages", err);
  }

  return fallback;
}
