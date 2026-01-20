/**
 * Landing Page Variants Registry
 *
 * Central registry of all landing page variants.
 * Add new variants here when needed.
 */

import type { VariantConfig, VariantId } from "./types";
import { themes } from "./themes";
import { generalCopy } from "./copy/general";
import { jovenesCopy } from "./copy/jovenes";
import { mayoresCopy } from "./copy/mayores";

// ============================================================================
// Variant Configurations
// ============================================================================

export const variants: Record<VariantId, VariantConfig> = {
  general: {
    id: "general",
    name: "General",
    description: "Default landing page for broad audience",
    theme: themes.general,
    copy: generalCopy,
    meta: {
      title: "NGX Transform - Visualiza tu Transformación con IA",
      description:
        "IA que proyecta tu evolución física en 12 meses. Sube tu foto, recibe tu timeline personalizado. Gratis.",
    },
  },

  jovenes: {
    id: "jovenes",
    name: "Jóvenes (18-35)",
    description: "Energetic, fitness-focused copy for younger audience",
    theme: themes.jovenes,
    copy: jovenesCopy,
    meta: {
      title: "NGX Transform - Desbloquea tu Mejor Versión",
      description:
        "IA de última generación que proyecta tu transformación física. Visualiza tu potencial y empieza a entrenar.",
    },
  },

  mayores: {
    id: "mayores",
    name: "Mayores (50+)",
    description: "Calm, health-focused copy for older audience",
    theme: themes.mayores,
    copy: mayoresCopy,
    meta: {
      title: "NGX Transform - Recupera tu Vitalidad",
      description:
        "Proyección personalizada de tu evolución física. Visualiza cómo puedes mejorar tu salud y bienestar.",
    },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get variant configuration by ID
 * Falls back to general if variant not found
 */
export function getVariant(id: VariantId | string): VariantConfig {
  return variants[id as VariantId] || variants.general;
}

/**
 * Check if a string is a valid variant ID
 */
export function isValidVariant(id: string): id is VariantId {
  return id in variants;
}

/**
 * Get all available variant IDs
 */
export function getVariantIds(): VariantId[] {
  return Object.keys(variants) as VariantId[];
}
