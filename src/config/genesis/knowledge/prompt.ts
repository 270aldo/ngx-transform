/**
 * Compositor del system prompt de GENESIS desde la knowledge base (`./content.ts`).
 *
 * Una sola fuente de verdad, dos canales: voz (OpenAI Realtime / ElevenLabs) y
 * texto (Gemini). Editar el contenido en `content.ts` se propaga al prompt.
 *
 * Las etiquetas de clasificación que el prompt pide al modelo coinciden con
 * `src/app/api/sessions/[shareId]/classify/route.ts`.
 */
import {
  FAQ,
  FOUNDER,
  HYBRID,
  LEAD_ROUTING,
  MEDICAL_DISCLAIMER,
  NGX,
  PRICING,
  TONE,
} from "./content";

export interface GenesisPromptOptions {
  /** Canal de la conversación; ajusta detalles de formato y privacidad. */
  channel: "voice" | "text";
  /** Id de la sesión de Transform (para contexto), si está disponible. */
  shareId?: string;
  /** Solo voz: el usuario consintió guardar un resumen del transcript. */
  saveTranscript?: boolean;
}

const bullets = (items: readonly string[]): string =>
  items.map((i) => `- ${i}`).join("\n");

/**
 * Devuelve el system prompt canónico de GENESIS. Rico pero enfocado:
 * identidad + tono + conocimiento condensado + postura de precio + FAQ clave +
 * reglas de clasificación. Pensado para enviarse una vez por sesión.
 */
export function buildGenesisSystemPrompt(opts: GenesisPromptOptions): string {
  const { channel, shareId, saveTranscript } = opts;

  // Subconjunto de FAQ más solicitado para el prompt; el resto vive en content.FAQ
  // (disponible para el chat de texto vía RAG/contexto cuando aplique).
  const keyFaq = FAQ.filter((f) =>
    [
      "¿Cuánto cuesta?",
      "¿Quién me va a atender?",
      "¿Esto funciona para mí / mi caso?",
      "¿Por qué confiar en NGX / en Aldo?",
      "No tengo disciplina / ya fallé antes",
    ].includes(f.q),
  );

  const sections: string[] = [
    // Identidad y misión
    `Eres GENESIS, el sistema conversacional de NGX. Hablas en español (es-MX). ` +
      `Acompañas al usuario justo después de que vio su diagnóstico visual en NGX Transform: ` +
      `lo entrevistas brevemente, educas con verdad sobre NGX y el programa HYBRID, y lo mueves al siguiente paso correcto. ` +
      `No eres un personaje con biografía ni una "IA superior": eres un sistema experto que analiza, explica y decide el siguiente paso.`,

    // Tono — Verdad Directa
    `TONO — ${TONE.principle}\n` +
      `SIEMPRE:\n${bullets(TONE.always)}\n` +
      `NUNCA:\n${bullets(TONE.never)}\n` +
      `REGLAS:\n${bullets(TONE.rules)}`,

    // Qué es NGX
    `QUÉ ES NGX: ${NGX.oneLiner}\n` +
      `Tesis: ${NGX.thesis}\n` +
      `Salud muscular: ${NGX.muscleThesis}\n` +
      `Para quién es:\n${bullets(NGX.forWhom)}\n` +
      `Para quién NO es:\n${bullets(NGX.notForWhom)}`,

    // El programa HYBRID
    `EL PROGRAMA HYBRID: ${HYBRID.oneLiner}\n` +
      `Estructura (12 semanas):\n` +
      HYBRID.phases
        .map((p) => `- ${p.name} (${p.weeks}): ${p.objective}`)
        .join("\n") +
      `\nIncluye:\n${bullets(HYBRID.includes)}\n` +
      `El coach humano: ${HYBRID.coach}\n` +
      `El diagnóstico: ${HYBRID.diagnosis}\n` +
      `Diferencia central: ${HYBRID.differentiation.core}\n` +
      `Compromiso de tiempo: ${HYBRID.timeCommitment}\n` +
      `HYBRID SÍ tiene sentido para:\n${bullets(HYBRID.forWhom)}\n` +
      `HYBRID NO tiene sentido para:\n${bullets(HYBRID.notForWhom)}`,

    // El fundador (para credibilidad cuando pregunten)
    `EL FUNDADOR (${FOUNDER.name}, ${FOUNDER.role}): ${FOUNDER.shortBio} ${FOUNDER.whyBuilt}`,

    // Postura de precio
    `PRECIO — ${PRICING.rule}\n` +
      `Si preguntan el precio, responde con la verdad y reconduce al diagnóstico: "${PRICING.ifAskedShort}"\n` +
      `Escasez: ${PRICING.scarcityRule}`,

    // FAQ clave
    `PREGUNTAS FRECUENTES (usa estas respuestas como base):\n` +
      keyFaq.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n\n"),

    // Salud
    `SALUD: ${MEDICAL_DISCLAIMER}`,

    // Clasificación + flujo de entrevista
    `FLUJO: Haz como máximo 5 preguntas, una a la vez, antes de recomendar el siguiente paso. ` +
      `Al final, clasifica el fit diciendo literalmente UNA de estas etiquetas exactas: ` +
      `listo_para_diagnostico, necesita_claridad o no_fit_ahora.\n` +
      LEAD_ROUTING.map(
        (t) =>
          `- ${t.classification}: cuando ${t.signals.join("; ")}. Siguiente paso: ${t.action}`,
      ).join("\n"),
  ];

  // Detalles por canal / privacidad
  if (channel === "voice") {
    sections.push(
      saveTranscript
        ? "El usuario consintió guardar un resumen; al final resume intención, fricción y clasificación."
        : "No guardes ni pidas datos sensibles; el transcript es solo para esta sesión del navegador.",
    );
  } else {
    sections.push(
      "Canal de texto: respuestas claras y breves (1-3 párrafos). Puedes usar listas cortas. Termina con una pregunta o una acción concreta.",
    );
  }

  if (shareId) {
    sections.push(`Contexto de sesión de Transform: ${shareId}.`);
  }

  return sections.join("\n\n");
}
