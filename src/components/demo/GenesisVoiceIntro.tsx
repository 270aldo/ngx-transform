"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Volume2, VolumeX, Play, Pause, SkipForward } from "lucide-react";
import { DemoUserResponses } from "@/types/demo";

interface UserContext {
  shareId: string;
  name: string;
  level: string;
  goal: string;
}

interface GenesisVoiceIntroProps {
  userContext: UserContext;
  responses: DemoUserResponses;
  onUpdateResponses: (updates: Partial<DemoUserResponses>) => void;
}

type AudioState = "loading" | "ready" | "playing" | "paused" | "ended" | "error";

export function GenesisVoiceIntro({
  userContext,
  responses,
  onUpdateResponses,
}: GenesisVoiceIntroProps) {
  const [audioState, setAudioState] = useState<AudioState>("loading");
  const [transcript, setTranscript] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordsRef = useRef<string[]>([]);

  // Fetch audio on mount
  useEffect(() => {
    async function fetchAudio() {
      try {
        const res = await fetch("/api/genesis-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareId: userContext.shareId }),
        });

        const data = await res.json();

        if (data.transcript) {
          setTranscript(data.transcript);
          wordsRef.current = data.transcript.split(/\s+/);
        }

        if (data.audioBase64) {
          // Create audio from base64
          const audioBlob = base64ToBlob(data.audioBase64, "audio/mpeg");
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          audio.preload = "auto";

          audio.addEventListener("canplaythrough", () => {
            setAudioState("ready");
          });

          audio.addEventListener("play", () => {
            setAudioState("playing");
          });

          audio.addEventListener("pause", () => {
            if (!audio.ended) setAudioState("paused");
          });

          audio.addEventListener("ended", () => {
            setAudioState("ended");
          });

          audio.addEventListener("error", () => {
            setAudioState("error");
          });

          audioRef.current = audio;
        } else {
          // No audio, just show transcript
          setAudioState("ended");
          setShowTranscript(true);
        }
      } catch (error) {
        console.error("Failed to fetch audio:", error);
        setAudioState("error");
        setTranscript(
          "Hola. Soy GENESIS, tu coach de inteligencia artificial. Responde las preguntas para crear tu plan personalizado."
        );
        setShowTranscript(true);
      }
    }

    fetchAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [userContext.shareId]);

  // Word highlighting animation during playback
  useEffect(() => {
    if (audioState !== "playing" || !audioRef.current) return;

    const audio = audioRef.current;
    const words = wordsRef.current;
    const duration = audio.duration || 60;
    const wordsPerSecond = words.length / duration;

    const interval = setInterval(() => {
      const currentTime = audio.currentTime;
      const estimatedWordIndex = Math.floor(currentTime * wordsPerSecond);
      setCurrentWordIndex(Math.min(estimatedWordIndex, words.length - 1));
    }, 100);

    return () => clearInterval(interval);
  }, [audioState]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (audioState === "playing") {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [audioState]);

  const handleSkip = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioState("ended");
    setShowTranscript(true);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const isAudioAvailable = audioState !== "error" && audioState !== "loading";
  const showQuestions = audioState === "ended" || audioState === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* GENESIS Avatar with Animation */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          {/* Pulsing rings when speaking */}
          {audioState === "playing" && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-[#6D00FF]/30"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-[#6D00FF]/20"
                animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}

          {/* Avatar */}
          <motion.div
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#6D00FF] to-[#B98CFF] flex items-center justify-center"
            animate={audioState === "playing" ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Bot className="w-12 h-12 text-white" />
          </motion.div>

          {/* Status indicator */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
              audioState === "playing"
                ? "bg-emerald-500"
                : audioState === "loading"
                ? "bg-amber-500"
                : "bg-neutral-500"
            }`}
          >
            {audioState === "playing" ? (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ) : audioState === "loading" ? (
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ) : (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {audioState === "loading" ? "Preparando..." : `Hola, ${userContext.name}`}
          </h1>
          <p className="text-neutral-400">
            {audioState === "loading"
              ? "Cargando audio de GENESIS"
              : "Soy GENESIS, tu coach IA"}
          </p>
        </div>
      </div>

      {/* Audio Controls */}
      {isAudioAvailable && !showQuestions && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handlePlayPause}
            className="p-4 rounded-full bg-[#6D00FF] hover:bg-[#5B00E0] transition-colors"
            aria-label={audioState === "playing" ? "Pausar" : "Reproducir"}
          >
            {audioState === "playing" ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Saltar intro"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Transcript Display (during playback or on error) */}
      <AnimatePresence>
        {(showTranscript || audioState === "playing") && transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 rounded-2xl border border-white/10 p-6"
          >
            <p className="text-neutral-300 leading-relaxed">
              {audioState === "playing" ? (
                // Highlight words during playback
                wordsRef.current.map((word, index) => (
                  <span
                    key={index}
                    className={`transition-colors duration-200 ${
                      index <= currentWordIndex
                        ? "text-white"
                        : "text-neutral-500"
                    }`}
                  >
                    {word}{" "}
                  </span>
                ))
              ) : (
                transcript
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions Section - Only show after audio ends */}
      <AnimatePresence>
        {showQuestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Question 1: Training Days */}
            <QuestionBlock
              question="¿Cuántos días a la semana puedes entrenar?"
              value={responses.trainingDays}
              options={[
                { value: "2-3", label: "2-3 días" },
                { value: "4", label: "4 días" },
                { value: "5+", label: "5+ días" },
              ]}
              onSelect={(v) =>
                onUpdateResponses({
                  trainingDays: v as DemoUserResponses["trainingDays"],
                })
              }
            />

            {/* Question 2: Goal */}
            <QuestionBlock
              question="¿Cuál es tu objetivo principal ahora mismo?"
              value={responses.goal}
              options={[
                { value: "muscle", label: "Ganar músculo" },
                { value: "fat", label: "Perder grasa" },
                { value: "both", label: "Ambos" },
              ]}
              onSelect={(v) =>
                onUpdateResponses({ goal: v as DemoUserResponses["goal"] })
              }
            />

            {/* Question 3: Equipment */}
            <QuestionBlock
              question="¿Con qué equipo cuentas?"
              value={responses.equipment}
              options={[
                { value: "gym", label: "Gimnasio completo" },
                { value: "home", label: "Equipo en casa" },
                { value: "bodyweight", label: "Solo cuerpo" },
              ]}
              onSelect={(v) =>
                onUpdateResponses({
                  equipment: v as DemoUserResponses["equipment"],
                })
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuestionBlock({
  question,
  value,
  options,
  onSelect,
}: {
  question: string;
  value: string | null;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="font-medium">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              value === opt.value
                ? "bg-[#6D00FF] text-white"
                : "bg-white/5 text-neutral-300 hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper to convert base64 to Blob
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
