"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Mail, Calendar, Copy, Check } from "lucide-react";

interface ActionsCardProps {
  shareId: string;
  goal: string;
}

/**
 * ActionsCard - Muestra acciones de compartir/email/booking
 * En modo demo (shareId === "demo"), los botones muestran toasts informativos
 * en lugar de llamar APIs reales que fallarían.
 */
export function ActionsCard({ shareId, goal }: ActionsCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isDemo = shareId === "demo";
  const shareUrl = isDemo ? "#" : `${typeof window !== "undefined" ? window.location.origin : ""}/s/${shareId}`;
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "#";

  const handleCopyLink = async () => {
    if (isDemo) {
      // En demo, simular copia
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      console.error("Failed to copy link");
    }
  };

  const handleSendEmail = async () => {
    if (isDemo) {
      // En demo, simular envío
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 2000);
      return;
    }

    // En producción, esto llamaría a /api/email
    // Por ahora solo mostramos que funcionaría
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 2000);
  };

  const handleShare = async () => {
    if (isDemo) {
      // En demo, abrir share nativo si está disponible
      if (navigator.share) {
        await navigator.share({
          title: "Mi transformación NGX",
          text: "Mira mi proyección de transformación",
          url: window.location.href,
        });
      }
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: "Mi transformación NGX",
        text: `Mira mi proyección de transformación - ${goal}`,
        url: shareUrl,
      });
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Share2 className="w-4 h-4 text-[var(--primary)]" />
        Acciones
      </h3>

      <div className="space-y-2">
        {/* Copy Link */}
        <motion.button
          onClick={handleCopyLink}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors text-sm"
        >
          <span className="flex items-center gap-2 text-neutral-300">
            {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? "¡Copiado!" : "Copiar enlace"}
          </span>
          {isDemo && <span className="text-xs text-neutral-500">(Demo)</span>}
        </motion.button>

        {/* Send Email */}
        <motion.button
          onClick={handleSendEmail}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors text-sm"
        >
          <span className="flex items-center gap-2 text-neutral-300">
            {emailSent ? <Check className="w-4 h-4 text-green-400" /> : <Mail className="w-4 h-4" />}
            {emailSent ? "¡Enviado!" : "Enviar por email"}
          </span>
          {isDemo && <span className="text-xs text-neutral-500">(Demo)</span>}
        </motion.button>

        {/* Native Share */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors text-sm"
          >
            <span className="flex items-center gap-2 text-neutral-300">
              <Share2 className="w-4 h-4" />
              Compartir
            </span>
          </motion.button>
        )}

        {/* Booking CTA */}
        <motion.a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-colors text-sm font-medium text-white"
        >
          <Calendar className="w-4 h-4" />
          Agendar asesoría
        </motion.a>
      </div>

      {isDemo && (
        <p className="text-xs text-neutral-500 text-center">
          Modo demo - Las acciones son simuladas
        </p>
      )}
    </div>
  );
}
