/**
 * Landing Page Variants Configuration Types
 *
 * Defines the structure for landing page variants (general, jóvenes, mayores)
 * used for A/B testing ads campaigns.
 */

import { LucideIcon } from "lucide-react";

// ============================================================================
// Variant Identifiers
// ============================================================================

export type VariantId = "general" | "jovenes" | "mayores";

// ============================================================================
// Theme Configuration
// ============================================================================

export interface VariantTheme {
  /** Primary brand color (buttons, accents) */
  primary: string;
  /** Hover state for primary */
  primaryHover: string;
  /** Accent color for highlights */
  accent: string;
  /** Text size multiplier (1 = normal, 1.2 = 20% larger) */
  textScale: number;
  /** Animation intensity (1 = normal, 0.5 = reduced) */
  animationIntensity: number;
}

// ============================================================================
// Copy Configuration
// ============================================================================

export interface HeroCopy {
  badge: {
    aiLabel: string;
    version: string;
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  cta: string;
  socialProof: {
    count: string;
    label: string;
  };
  /** Before/After transformation demo for hero section */
  transformationDemo?: {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;  // default: "ANTES"
    afterLabel?: string;   // default: "DESPUÉS"
  };
}

export interface StatCopy {
  value: string;
  suffix: string;
  label: string;
}

export interface FeatureCopy {
  icon: LucideIcon;
  title: string;
  description: string;
  size: "large" | "medium" | "full";
  badge?: string;
}

export interface StepCopy {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface TestimonialCopy {
  text: string;
  name: string;
  role: string;
  gradient: string;
}

export interface CTACopy {
  headline: string;
  subtitle: string;
  buttonText: string;
  footnote: string;
}

export interface FooterCopy {
  brandName: string;
  status: string;
  copyright: string;
}

export interface ExplainerVideoCopy {
  title: string;
  subtitle: string;
  videoUrl: string;
  posterUrl?: string;
  duration?: string;
}

export interface VariantCopy {
  hero: HeroCopy;
  stats: StatCopy[];
  features: FeatureCopy[];
  howItWorks: {
    title: string;
    subtitle: string;
    steps: StepCopy[];
  };
  testimonials: {
    sectionLabel: string;
    items: TestimonialCopy[];
  };
  cta: CTACopy;
  footer: FooterCopy;
  /** Optional explainer video section */
  explainerVideo?: ExplainerVideoCopy;
}

// ============================================================================
// Complete Variant Configuration
// ============================================================================

export interface VariantConfig {
  id: VariantId;
  name: string;
  description: string;
  theme: VariantTheme;
  copy: VariantCopy;
  /** SEO metadata */
  meta: {
    title: string;
    description: string;
  };
}
