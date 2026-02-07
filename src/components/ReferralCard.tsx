"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Users, Gift } from "lucide-react";

interface ReferralCardProps {
  referralCode: string;
  referralCount: number;
  shareId: string;
  sessionId?: string;
}

export function ReferralCard({
  referralCode,
  referralCount,
  shareId,
  sessionId,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const referralLink = `${baseUrl}/?ref=${referralCode}`;

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
          metadata: { shareId, referralCode, ...metadata },
        }),
      }).catch(console.error);
    },
    [sessionId, shareId, referralCode]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      trackEvent("referral_code_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-white/10 bg-white/5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-violet-500/10">
          <Users className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Invita a tus amigos</h3>
          <p className="text-sm text-white/50">
            {referralCount > 0
              ? `Has referido a ${referralCount} persona${
                  referralCount > 1 ? "s" : ""
                }`
              : "Comparte tu link y gana recompensas"}
          </p>
        </div>
      </div>

      {/* Referral link */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-sm text-white/80 truncate"
        />
        <button
          onClick={handleCopy}
          className={`p-3 rounded-lg transition-all ${
            copied
              ? "bg-green-500/20 text-green-400"
              : "bg-white/10 text-white/60 hover:text-white"
          }`}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>
      </div>

      {/* Reward hint */}
      <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
        <Gift className="h-3 w-3" />
        <span>Por cada 3 referidos, desbloquea contenido exclusivo</span>
      </div>

      {/* Progress indicator */}
      {referralCount > 0 && referralCount < 3 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Progreso</span>
            <span>{referralCount}/3 para desbloquear</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(referralCount / 3) * 100}%` }}
              className="h-full bg-violet-500 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
