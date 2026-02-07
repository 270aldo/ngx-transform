"use client";

import { motion } from "framer-motion";

export function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="grid-bg" />

      <motion.div
        className="orb orb-1"
        animate={{ x: [0, 10, 20, 10, 0], y: [0, -10, 0, 10, 0] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="orb orb-2"
        animate={{ x: [0, 10, 20, 10, 0], y: [0, -10, 0, 10, 0] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, delay: 2 }}
      />
      <motion.div
        className="orb orb-3"
        animate={{ x: [0, 10, 20, 10, 0], y: [0, -10, 0, 10, 0] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, delay: 4 }}
      />
    </div>
  );
}

