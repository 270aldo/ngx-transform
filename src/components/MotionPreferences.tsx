"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Makes every framer-motion component below it honor the operating system's
 * "reduce motion" accessibility setting. With `reducedMotion="user"`, transform
 * and layout animations are disabled for users who request reduced motion, while
 * opacity transitions are preserved.
 */
export function MotionPreferences({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
