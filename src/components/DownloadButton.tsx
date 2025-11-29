"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { downloadWithWatermark } from "@/lib/watermark";

interface DownloadButtonProps {
  imageUrl?: string;
  filename?: string;
}

export function DownloadButton({ imageUrl, filename = "ngx-vision" }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl || isLoading) return;

    setIsLoading(true);
    try {
      await downloadWithWatermark(imageUrl, filename);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleDownload}
      disabled={isLoading || !imageUrl}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full
        bg-white/10 backdrop-blur-md border border-white/10 text-white
        hover:bg-white/20 transition-all disabled:opacity-50 cursor-pointer"
      aria-label="Descargar imagen con watermark"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
      ) : (
        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </motion.button>
  );
}
