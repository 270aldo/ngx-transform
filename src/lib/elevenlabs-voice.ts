/**
 * ElevenLabs Voice Client for GENESIS
 * Generates voice audio for the GENESIS AI coach intro
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Default voice ID for GENESIS (Spanish, authoritative, warm)
const DEFAULT_GENESIS_VOICE_ID = process.env.ELEVENLABS_GENESIS_VOICE_ID || "lxw1m2gBwmWTLxjGCVJO";

// Model for multilingual support (Spanish latam)
const MULTILINGUAL_MODEL = "eleven_multilingual_v2";

export interface VoiceGenerationOptions {
  voiceId?: string;
  modelId?: string;
  outputFormat?: "mp3_44100_128" | "mp3_22050_32" | "pcm_16000" | "pcm_22050";
}

export interface VoiceGenerationResult {
  audioBuffer: Buffer;
  contentType: string;
}

/**
 * Generate speech from text using ElevenLabs
 */
export async function generateSpeech(
  text: string,
  options: VoiceGenerationOptions = {}
): Promise<VoiceGenerationResult> {
  const {
    voiceId = DEFAULT_GENESIS_VOICE_ID,
    modelId = MULTILINGUAL_MODEL,
    outputFormat = "mp3_44100_128",
  } = options;

  try {
    const audioResponse = await client.textToSpeech.convert(voiceId, {
      text,
      modelId,
      outputFormat,
    });

    // Convert ReadableStream to Buffer
    const chunks: Uint8Array[] = [];
    const reader = audioResponse.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = Buffer.concat(chunks);

    return {
      audioBuffer,
      contentType: "audio/mpeg",
    };
  } catch (error) {
    console.error("[ElevenLabs] Error generating speech:", error);
    throw new Error("Failed to generate speech audio");
  }
}

/**
 * Generate GENESIS intro speech for a user
 * Returns audio for the personalized intro message
 */
export async function generateGenesisIntro(
  userName: string,
  userLevel: string,
  userGoal: string
): Promise<VoiceGenerationResult> {
  // GENESIS intro script (Spanish latam, ~60-90 seconds)
  const script = buildGenesisIntroScript(userName, userLevel, userGoal);

  return generateSpeech(script);
}

/**
 * Build the GENESIS intro script based on user context
 */
export function buildGenesisIntroScript(
  userName: string,
  userLevel: string,
  userGoal: string
): string {
  const levelText = {
    novato: "empezando este camino",
    intermedio: "con experiencia en el entrenamiento",
    avanzado: "con años de dedicación",
  }[userLevel] || "en tu camino fitness";

  const goalText = {
    definicion: "definir tu físico",
    masa: "ganar masa muscular",
    mixto: "transformar tu cuerpo completamente",
  }[userGoal] || "alcanzar tus metas";

  return `Hola ${userName}. Soy GENESIS, tu coach de inteligencia artificial.

He analizado tu perfil y tus proyecciones de transformación. Veo que estás ${levelText}, y tu objetivo es ${goalText}.

Antes de crear tu plan personalizado, necesito hacerte 3 preguntas rápidas. Esto me ayudará a calibrar exactamente lo que necesitas.

Mis agentes especializados, BLAZE, SAGE y TEMPO, están listos para diseñar tu programa. BLAZE estructurará tus entrenamientos, SAGE optimizará tu progresión, y TEMPO calibrará los tiempos perfectos para ti.

Responde las preguntas que verás en pantalla y prepararé tu plan de la Semana 1 en menos de un minuto.

Comencemos.`;
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices() {
  try {
    const voices = await client.voices.getAll();
    return voices.voices;
  } catch (error) {
    console.error("[ElevenLabs] Error fetching voices:", error);
    throw new Error("Failed to fetch available voices");
  }
}

/**
 * Validate that a voice ID exists
 */
export async function validateVoiceId(voiceId: string): Promise<boolean> {
  try {
    await client.voices.get(voiceId);
    return true;
  } catch {
    return false;
  }
}
