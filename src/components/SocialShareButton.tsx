"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X, Loader2 } from "lucide-react";
import { addWatermark } from "@/lib/watermark";

// Custom icons for social networks (lucide doesn't have all brand icons)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

interface SocialShareButtonProps {
  shareId: string;
  imageUrl?: string;
}

const socialNetworks = [
  {
    name: "WhatsApp",
    Icon: WhatsAppIcon,
    color: "#25D366",
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    name: "Instagram",
    Icon: InstagramIcon,
    color: "#E4405F",
    action: "copy" as const,
  },
  {
    name: "X",
    Icon: XIcon,
    color: "#FFFFFF",
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    Icon: FacebookIcon,
    color: "#1877F2",
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export function SocialShareButton({ shareId, imageUrl }: SocialShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/s/${shareId}`
    : `/s/${shareId}`;

  const shareText = "Mira mi proyección de transformación física de 12 meses con NGX Vision";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async (network: typeof socialNetworks[0]) => {
    if (network.action === "copy") {
      // Instagram: try to copy watermarked image to clipboard
      setIsProcessing(true);
      try {
        if (imageUrl && typeof ClipboardItem !== "undefined") {
          // Generate watermarked image and copy to clipboard
          const blob = await addWatermark(imageUrl);
          await navigator.clipboard.write([
            new ClipboardItem({ "image/jpeg": blob }),
          ]);
          setCopiedNetwork("Instagram");
          setTimeout(() => setCopiedNetwork(null), 3000);
        } else {
          // Fallback: just copy URL
          await handleCopy();
          setCopiedNetwork(network.name);
          setTimeout(() => setCopiedNetwork(null), 3000);
        }
      } catch (error) {
        console.error("Failed to copy image:", error);
        // Fallback to URL copy
        await handleCopy();
        setCopiedNetwork(network.name);
        setTimeout(() => setCopiedNetwork(null), 3000);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (network.getUrl) {
      const url = network.getUrl(shareUrl, shareText);
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Main Share Button */}
      <motion.button
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
        aria-label="Compartir"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50"
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 sm:w-64 p-4 card z-[60]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
                  Compartir en
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* Social Networks Grid */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                {socialNetworks.map((network) => (
                  <motion.button
                    key={network.name}
                    onClick={() => handleShare(network)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${network.color}20` }}
                    >
                      <div style={{ color: network.color }}>
                        <network.Icon />
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {network.name}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Instagram Copy Message */}
              <AnimatePresence>
                {copiedNetwork === "Instagram" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <p className="text-xs text-green-400 text-center">
                      {imageUrl
                        ? "Imagen con watermark copiada. Pega en Instagram Stories."
                        : "Enlace copiado. Pega en Instagram Stories o Bio."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing indicator */}
              {isProcessing && (
                <div className="mb-3 flex items-center justify-center gap-2 text-xs text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando imagen...</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-neutral-800 my-3" />

              {/* Copy Link Section */}
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-neutral-800/50 border border-neutral-700 text-xs text-neutral-300 truncate min-h-[44px]"
                />
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center justify-center w-11 h-11 rounded-lg font-medium transition-colors
                    ${copied
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[var(--primary)] text-white hover:brightness-110"
                    }
                  `}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
