"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export function BookingHeaderButton() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  // Don't render if no booking URL configured
  if (!bookingUrl) return null;

  return (
    <motion.a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-10 sm:h-11
        rounded-full bg-[var(--primary)] text-white text-xs sm:text-sm font-medium
        hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/20 cursor-pointer"
    >
      <Calendar className="w-4 h-4" />
      <span className="hidden min-[375px]:inline">Agendar</span>
    </motion.a>
  );
}
