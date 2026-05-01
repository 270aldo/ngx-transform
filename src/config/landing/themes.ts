/**
 * Landing Page Variant Themes
 *
 * Color schemes and visual settings per variant.
 * Currently all variants use the same colors (brand consistency),
 * but the architecture supports per-variant customization.
 */

import type { VariantTheme } from "./types";

// ============================================================================
// Shared Brand Colors
// ============================================================================

const BRAND_COLORS = {
  primary: "#6D00FF",
  primaryHover: "#7D1AFF",
  accent: "#5B21B6",
} as const;

// ============================================================================
// Theme Definitions
// ============================================================================

export const themes: Record<string, VariantTheme> = {
  general: {
    ...BRAND_COLORS,
    textScale: 1,
    animationIntensity: 1,
  },

  jovenes: {
    ...BRAND_COLORS,
    textScale: 1,
    animationIntensity: 1.2, // More dynamic animations
  },

  mayores: {
    ...BRAND_COLORS,
    textScale: 1.15, // 15% larger text for readability
    animationIntensity: 0.6, // Reduced animations
  },
} as const;
