"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function BookingCTA() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  // Don't render if no booking URL configured
  if (!bookingUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] p-4 sm:p-6 lg:p-8">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-white/10 to-[var(--primary)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              <span className="text-white/70 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Da el siguiente paso
              </span>
            </div>

            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2">
              ¿Listo para tu transformación?
            </h3>

            <p className="text-white/70 text-xs sm:text-sm lg:text-base mb-4 sm:mb-6">
              Únete a NGX y convierte esta visión en realidad con entrenamiento personalizado.
            </p>

            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white text-[var(--primary)] font-semibold text-xs sm:text-sm lg:text-base shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-shadow min-h-[44px]"
            >
              COMENZAR AHORA
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-[var(--accent)]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>
      </a>
    </motion.div>
  );
}
