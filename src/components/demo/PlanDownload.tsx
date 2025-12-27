"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  Check,
  Loader2,
  Copy,
  MessageCircle,
  Mail,
} from "lucide-react";

interface PlanDownloadProps {
  shareId: string;
  userName: string;
  onDownload: () => void;
  onShare: () => void;
}

export function PlanDownload({
  shareId,
  userName,
  onDownload,
  onShare,
}: PlanDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/demo/${shareId}`
      : "";

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/generate-plan?shareId=${shareId}`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NGX-Plan-Semana1-${userName.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadComplete(true);
      onDownload();
    } catch (error) {
      console.error("Download error:", error);
      // Still trigger transition even on error for demo
      setDownloadComplete(true);
      onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async (method: "native" | "copy" | "whatsapp" | "email") => {
    const shareText = `Mira mi plan de entrenamiento personalizado creado por GENESIS! #NGXTransform`;

    switch (method) {
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Mi Plan NGX GENESIS",
              text: shareText,
              url: shareUrl,
            });
            onShare();
          } catch {
            // User cancelled or error
          }
        }
        break;

      case "copy":
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onShare();
        break;

      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
          "_blank"
        );
        onShare();
        break;

      case "email":
        window.open(
          `mailto:?subject=${encodeURIComponent("Mi Plan NGX GENESIS")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
          "_blank"
        );
        onShare();
        break;
    }

    setShowShareOptions(false);
  };

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <motion.button
        onClick={handleDownload}
        disabled={isDownloading || downloadComplete}
        whileHover={{ scale: downloadComplete ? 1 : 1.02 }}
        whileTap={{ scale: downloadComplete ? 1 : 0.98 }}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-3 ${
          downloadComplete
            ? "bg-emerald-600"
            : isDownloading
            ? "bg-[#6D00FF]/70 cursor-wait"
            : "bg-[#6D00FF] hover:bg-[#5B00E0]"
        }`}
      >
        {downloadComplete ? (
          <>
            <Check className="w-5 h-5" />
            <span>Descargado</span>
          </>
        ) : isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generando PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Descargar PDF</span>
          </>
        )}
      </motion.button>

      {/* Share Button */}
      <div className="relative">
        <motion.button
          onClick={() => setShowShareOptions(!showShareOptions)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
        >
          <Share2 className="w-5 h-5" />
          <span>Compartir</span>
        </motion.button>

        {/* Share Options Dropdown */}
        <AnimatePresence>
          {showShareOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900 rounded-xl border border-white/10 overflow-hidden shadow-xl"
            >
              {/* Native Share (if supported) */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  onClick={() => handleShare("native")}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                >
                  <Share2 className="w-4 h-4 text-[#B98CFF]" />
                  <span className="text-sm text-white">Compartir...</span>
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={() => handleShare("copy")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-400" />
                )}
                <span className="text-sm text-white">
                  {copied ? "Copiado!" : "Copiar enlace"}
                </span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">WhatsApp</span>
              </button>

              {/* Email */}
              <button
                onClick={() => handleShare("email")}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">Email</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint Text */}
      <p className="text-center text-xs text-neutral-500">
        Tu plan incluye 7 días de entrenamiento, hábitos y nutrición
      </p>
    </div>
  );
}
