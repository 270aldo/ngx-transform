"use client";

import { useEffect } from "react";
import type { VariantId } from "@/config/landing";

const STORAGE_KEY = "ngx_landing_variant";

/**
 * Hook to track and persist landing page variant
 *
 * Stores variant in sessionStorage so it can be passed
 * to session creation for analytics.
 */
export function useVariantTracking(variant: VariantId) {
  useEffect(() => {
    // Store variant in sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, variant);
    } catch {
      // sessionStorage not available (SSR or privacy mode)
    }
  }, [variant]);
}

/**
 * Get the stored landing variant
 * Returns "general" if not found
 */
export function getStoredVariant(): VariantId {
  if (typeof window === "undefined") return "general";

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "general" || stored === "jovenes" || stored === "mayores") {
      return stored;
    }
  } catch {
    // sessionStorage not available
  }

  return "general";
}

/**
 * Clear stored variant (e.g., after session creation)
 */
export function clearStoredVariant(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage not available
  }
}
