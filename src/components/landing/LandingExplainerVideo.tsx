"use client";

/**
 * LandingExplainerVideo Component
 *
 * Video explainer section for the landing page.
 * Shows a short video explaining how NGX Transform works.
 *
 * Features:
 * - HTML5 video with poster image
 * - Play/Pause toggle
 * - Mute/Unmute toggle
 * - Progress bar
 * - Glass panel styling
 * - Hides automatically if no videoUrl provided
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

// ============================================================================
// Component
// ============================================================================

export function LandingExplainerVideo() {
  const { config } = useLandingConfig();
  const { explainerVideo } = config.copy;
  const { theme } = config;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Hide section if no video URL provided
  if (!explainerVideo?.videoUrl) {
    return null;
  }

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
      {/* Section Header */}
      <div className="text-center mb-12 animate-on-scroll">
        <h2 className="text-3xl text-white mb-4 tracking-tight font-semibold">
          {explainerVideo.title}
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          {explainerVideo.subtitle}
        </p>
      </div>

      {/* Video Container */}
      <motion.div
        className="relative max-w-3xl mx-auto group"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Glow Effect */}
        <div
          className="absolute -inset-4 rounded-[28px] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.primary}44, ${theme.primary}11, transparent 70%)`,
          }}
        />

        {/* Video Wrapper */}
        <div className="relative glass-panel rounded-[20px] border border-white/10 overflow-hidden shadow-2xl">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            poster={explainerVideo.posterUrl}
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onClick={togglePlay}
          >
            <source src={explainerVideo.videoUrl} type="video/mp4" />
            Tu navegador no soporta el video.
          </video>

          {/* Play Button Overlay (when paused) */}
          {!isPlaying && (
            <motion.button
              className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
              onClick={togglePlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 0 40px ${theme.primary}66`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </motion.div>
            </motion.button>
          )}

          {/* Controls Bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Progress Bar */}
            <div
              className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  backgroundColor: theme.primary,
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                {/* Mute/Unmute */}
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Duration Badge */}
              {explainerVideo.duration && (
                <span className="text-xs text-white/60 font-medium">
                  {explainerVideo.duration}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
