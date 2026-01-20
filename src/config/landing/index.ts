/**
 * Landing Page Configuration - Barrel Export
 *
 * Central export for all landing page variant configuration.
 */

// Types
export type {
  VariantId,
  VariantTheme,
  VariantCopy,
  VariantConfig,
  HeroCopy,
  StatCopy,
  FeatureCopy,
  StepCopy,
  TestimonialCopy,
  CTACopy,
  FooterCopy,
} from "./types";

// Themes
export { themes } from "./themes";

// Copy variants
export { generalCopy } from "./copy/general";
export { jovenesCopy } from "./copy/jovenes";
export { mayoresCopy } from "./copy/mayores";

// Variants registry
export {
  variants,
  getVariant,
  isValidVariant,
  getVariantIds,
} from "./variants";
