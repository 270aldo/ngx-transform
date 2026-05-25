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
  /** Short conviction line shown under the subtitle on the hero. */
  punchline?: string;
  cta: string;
  /** Primary CTA detail used by LandingHero/LandingTopNav. */
  primaryCta: {
    label: string;
    intent: string;
  };
  /** Secondary CTA label (e.g. "Cómo funciona"). */
  secondaryCta: string;
  /** 3 short reassurance bullets shown under the hero CTA row. */
  supportingPoints: [string, string, string];
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

export interface FAQItemCopy {
  question: string;
  answer: string;
}

export interface FAQCopy {
  sectionLabel: string;
  title: string;
  items: FAQItemCopy[];
}

export interface ValueStackItemCopy {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ValueStackCopy {
  sectionLabel: string;
  title: string;
  highlight: string;
  subtitle: string;
  items: ValueStackItemCopy[];
}

export interface BridgeCardCopy {
  icon: LucideIcon;
  title: string;
  description: string;
}

// ============================================================================
// Problem (Iteración 4 — narrativa del problema)
// ============================================================================

export interface ProblemCardCopy {
  title: string;
  description: string;
}

export interface ProblemCopy {
  sectionLabel: string;
  title: string;
  highlight: string;
  subtitle: string;
  cards: ProblemCardCopy[];
}

export interface BridgeCopy {
  sectionLabel: string;
  title: string;
  highlight: string;
  subtitle: string;
  footnote: string;
  buttonText: string;
  buttonIntent: string;
  cards: BridgeCardCopy[];
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
  /** Optional intent string for telemetry. */
  intent?: string;
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

// ============================================================================
// Report Preview (Iteración 2 — diagnostic lead magnet)
// ============================================================================

export interface ReportPreviewDimension {
  label: string;
  value: number;
}

export interface ReportPreviewInsight {
  label: string;
  text: string;
}

export interface ReportPreviewCopy {
  sectionLabel: string;
  headline: string;
  subtitle: string;
  scoreLabel: string;
  scoreValue: number;
  scoreMax: number;
  scoreDescription: string;
  dimensions: ReportPreviewDimension[];
  insights: ReportPreviewInsight[];
  ctaLabel: string;
  ctaHref: string;
  microcopy: string;
}

export interface TrustCardCopy {
  title: string;
  description: string;
}

export interface TrustStripCopy {
  title: string;
  /** Optional supporting paragraph under the title in the new 2-col layout. */
  subtitle?: string;
  /** Preferred — 4 cards with title + description. */
  cards?: TrustCardCopy[];
  /** Legacy — bullets-only fallback. Component prefers `cards` if present. */
  bullets?: string[];
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
  /** Optional problem narrative section */
  problem?: ProblemCopy;
  /** Optional FAQ section */
  faq?: FAQCopy;
  /** Optional value stack (qué recibes) section */
  valueStack?: ValueStackCopy;
  /** Optional bridge section (puente a HYBRID/coach) */
  bridge?: BridgeCopy;
  /** Optional explainer video section */
  explainerVideo?: ExplainerVideoCopy;
  /** Optional report preview (diagnostic mock dashboard before wizard) */
  reportPreview?: ReportPreviewCopy;
  /** Optional trust/privacy strip */
  trustStrip?: TrustStripCopy;
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
