"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { VariantConfig, VariantId } from "@/config/landing";
import { getVariant } from "@/config/landing";

// ============================================================================
// Context
// ============================================================================

interface LandingContextValue {
  config: VariantConfig;
  variantId: VariantId;
  trackCta: (location: string, intent?: string, label?: string) => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface LandingProviderProps {
  variant: VariantId;
  children: ReactNode;
}

export function LandingProvider({ variant, children }: LandingProviderProps) {
  const value = useMemo<LandingContextValue>(
    () => ({
      config: getVariant(variant),
      variantId: variant,
      trackCta: (location, intent, label) => {
        // Lightweight client-side telemetry. Posts to /api/telemetry if available.
        try {
          void fetch("/api/telemetry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              sessionId: "landing",
              event: "cta_clicked",
              metadata: { location, intent, label, variant },
            }),
          }).catch(() => {});
        } catch {
          // ignore — telemetry is best-effort.
        }
      },
    }),
    [variant]
  );

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useLandingConfig(): LandingContextValue {
  const context = useContext(LandingContext);
  if (!context) {
    throw new Error("useLandingConfig must be used within LandingProvider");
  }
  return context;
}

/**
 * Get CSS custom properties for the current theme
 */
export function useThemeStyles(): React.CSSProperties {
  const { config } = useLandingConfig();
  const { theme } = config;

  return {
    "--landing-primary": theme.primary,
    "--landing-primary-hover": theme.primaryHover,
    "--landing-accent": theme.accent,
    "--landing-text-scale": String(theme.textScale),
    "--landing-animation-intensity": String(theme.animationIntensity),
  } as React.CSSProperties;
}
