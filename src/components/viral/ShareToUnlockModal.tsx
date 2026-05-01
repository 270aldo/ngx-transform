"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Unlock,
  Image as ImageIcon,
  FileText,
  Share2,
  MessageCircle,
  Instagram,
  Twitter,
  Facebook,
  Copy,
  Check,
} from "lucide-react";
import {
  buildShareData,
  getShareUrl,
  getShareText,
  type SharePlatform,
} from "@/lib/viral/shareMessages";

interface ShareToUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string;
  unlockedContent: string[];
  onUnlock: (contentType: string) => void;
  sessionId?: string;
  stats?: {
    strength?: number;
    aesthetics?: number;
    energy?: number;
  };
  userName?: string;
}

const UNLOCKABLE_CONTENT = [
  {
    id: "hd_images",
    icon: ImageIcon,
    title: "Imágenes HD",
    description: "Descarga tus transformaciones en alta resolución",
  },
  {
    id: "plan",
    icon: FileText,
    title: "Plan de 7 días",
    description: "Entrenamiento, nutrición y hábitos personalizados",
  },
];

const SHARE_PLATFORMS: Array<{
  id: SharePlatform;
  icon: typeof MessageCircle;
  label: string;
  color: string;
}> = [
  { id: "whatsapp", icon: MessageCircle, label: "WhatsApp", color: "#22C55E" },
  { id: "instagram", icon: Instagram, label: "Instagram", color: "#A855F7" },
  { id: "twitter", icon: Twitter, label: "Twitter", color: "#6D00FF" },
  { id: "facebook", icon: Facebook, label: "Facebook", color: "#7D1AFF" },
  { id: "copy", icon: Copy, label: "Copiar link", color: "#6D00FF" },
];

export function ShareToUnlockModal({
  isOpen,
  onClose,
  shareId,
  unlockedContent,
  onUnlock,
  sessionId,
  stats,
  userName,
}: ShareToUnlockModalProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = buildShareData(shareId, stats, userName);

  // Track event helper
  const trackEvent = useCallback(
    (event: string, metadata?: Record<string, unknown>) => {
      if (!sessionId) return;
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          event,
          metadata: { shareId, ...metadata },
        }),
      }).catch(console.error);
    },
    [sessionId, shareId]
  );

  const handleShareIntent = async (platform: SharePlatform) => {
    trackEvent(`share_intent_${platform}`);

    if (platform === "copy") {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    } else if (platform === "instagram") {
      // Instagram: copy text to clipboard
      const text = getShareText("instagram", shareData);
      try {
        await navigator.clipboard.writeText(text);
        alert("Texto copiado. Pégalo en tu historia de Instagram.");
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    } else {
      // Open share URL
      const url = getShareUrl(platform, shareData);
      if (url) {
        window.open(url, "_blank", "width=600,height=400");
      }
    }

    // After share intent, unlock content
    handleShareComplete();
  };

  const handleShareComplete = async () => {
    setIsUnlocking(true);
    trackEvent("share_completed");

    // Unlock all content
    for (const content of UNLOCKABLE_CONTENT) {
      if (!unlockedContent.includes(content.id)) {
        await onUnlock(content.id);
        trackEvent("content_unlocked", { contentType: content.id });
      }
    }

    setIsUnlocking(false);
    setTimeout(onClose, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Share2 className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Desbloquea contenido premium
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-white/40 hover:text-white/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-white/60">
              Comparte tu transformación para acceder a:
            </p>
          </div>

          {/* Content to unlock */}
          <div className="p-6 space-y-3">
            {UNLOCKABLE_CONTENT.map((content) => {
              const isUnlocked = unlockedContent.includes(content.id);
              const Icon = isUnlocked ? Unlock : Lock;

              return (
                <div
                  key={content.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isUnlocked
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isUnlocked ? "bg-green-500/10" : "bg-white/10"
                    }`}
                  >
                    <content.icon
                      className={`h-5 w-5 ${
                        isUnlocked ? "text-green-400" : "text-white/60"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">
                      {content.title}
                    </h3>
                    <p className="text-xs text-white/50">{content.description}</p>
                  </div>
                  <Icon
                    className={`h-4 w-4 ${
                      isUnlocked ? "text-green-400" : "text-white/30"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Share buttons */}
          <div className="p-6 border-t border-white/10">
            <p className="text-xs text-white/40 mb-4 text-center">
              Elige dónde compartir
            </p>
            <div className="grid grid-cols-5 gap-2">
              {SHARE_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShareIntent(platform.id)}
                  disabled={isUnlocking}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    {platform.id === "copy" && copied ? (
                      <Check className="h-5 w-5" style={{ color: platform.color }} />
                    ) : (
                      <platform.icon
                        className="h-5 w-5"
                        style={{ color: platform.color }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-white/60">
                    {platform.id === "copy" && copied ? "Copiado" : platform.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Skip option */}
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-white/40 hover:text-white/60"
            >
              Quizás después
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
