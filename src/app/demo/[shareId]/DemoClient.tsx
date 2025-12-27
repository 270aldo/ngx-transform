"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DemoPhase,
  DemoContext,
  DemoUserResponses,
  createInitialDemoContext,
  hasCompletedVoiceIntro,
} from "@/types/demo";
import { ArrowLeft, Bot, Download, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { GenesisVoiceIntro, GenesisChat, PlanDashboard, PlanDownload, SubscriptionCTA, EscapeValve, WeekPlanSummary } from "@/components/demo";

interface UserContext {
  shareId: string;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  level: "novato" | "intermedio" | "avanzado";
  goal: "definicion" | "masa" | "mixto";
  weeklyTime: number;
  insightsText?: string;
}

interface DemoClientProps {
  userContext: UserContext;
}

export function DemoClient({ userContext }: DemoClientProps) {
  const [context, setContext] = useState<DemoContext>(() =>
    createInitialDemoContext(userContext.shareId)
  );
  const [planData, setPlanData] = useState<WeekPlanSummary | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const updatePhase = useCallback((phase: DemoPhase) => {
    setContext((prev) => ({ ...prev, phase }));
  }, []);

  const updateResponses = useCallback((updates: Partial<DemoUserResponses>) => {
    setContext((prev) => {
      const newResponses = { ...prev.responses, ...updates };
      // Auto-transition to chat when all questions answered
      if (hasCompletedVoiceIntro(newResponses) && prev.phase === "voice_intro") {
        return { ...prev, responses: newResponses, phase: "chat" };
      }
      return { ...prev, responses: newResponses };
    });
  }, []);

  const handlePlanReady = useCallback((pdfUrl: string) => {
    setContext((prev) => ({
      ...prev,
      phase: "plan_ready",
      planGenerated: true,
      planPdfUrl: pdfUrl,
    }));
  }, []);

  const handleDownloadOrShare = useCallback((action: "download" | "share") => {
    setContext((prev) => ({
      ...prev,
      phase: "cta",
      hasDownloaded: action === "download" ? true : prev.hasDownloaded,
      hasShared: action === "share" ? true : prev.hasShared,
    }));
  }, []);

  // Fetch plan data when entering plan_ready phase
  useEffect(() => {
    if (context.phase === "plan_ready" && !planData && !isLoadingPlan) {
      setIsLoadingPlan(true);
      fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId: userContext.shareId,
          responses: context.responses,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.plan) {
            setPlanData(data.plan);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch plan:", err);
        })
        .finally(() => {
          setIsLoadingPlan(false);
        });
    }
  }, [context.phase, context.responses, planData, isLoadingPlan, userContext.shareId]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/dashboard/${userContext.shareId}`}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
          <PhaseIndicator phase={context.phase} />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {context.phase === "voice_intro" && (
              <GenesisVoiceIntro
                key="voice_intro"
                userContext={{
                  shareId: userContext.shareId,
                  name: userContext.name,
                  level: userContext.level,
                  goal: userContext.goal,
                }}
                responses={context.responses}
                onUpdateResponses={updateResponses}
              />
            )}
            {context.phase === "chat" && (
              <GenesisChat
                key="chat"
                shareId={userContext.shareId}
                responses={context.responses}
                onPlanReady={() => handlePlanReady("")}
              />
            )}
            {context.phase === "plan_ready" && (
              <motion.div
                key="plan_ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {isLoadingPlan ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-2 border-[#6D00FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-neutral-400">Generando tu plan...</p>
                  </div>
                ) : planData ? (
                  <>
                    <PlanDashboard plan={planData} />
                    <PlanDownload
                      shareId={userContext.shareId}
                      userName={planData.userName}
                      onDownload={() => handleDownloadOrShare("download")}
                      onShare={() => handleDownloadOrShare("share")}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-400">Error al cargar el plan</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            {context.phase === "cta" && (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <SubscriptionCTA
                  shareId={userContext.shareId}
                  userName={userContext.name}
                />
                <EscapeValve shareId={userContext.shareId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: DemoPhase }) {
  const phases: { key: DemoPhase; label: string; icon: React.ReactNode }[] = [
    { key: "voice_intro", label: "Intro", icon: <Bot className="w-3 h-3" /> },
    { key: "chat", label: "Chat", icon: <MessageCircle className="w-3 h-3" /> },
    { key: "plan_ready", label: "Plan", icon: <Download className="w-3 h-3" /> },
    { key: "cta", label: "Próximo paso", icon: <Sparkles className="w-3 h-3" /> },
  ];

  const currentIndex = phases.findIndex((p) => p.key === phase);

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => (
        <div
          key={p.key}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            i <= currentIndex
              ? "bg-[#6D00FF]/20 text-[#B98CFF]"
              : "bg-white/5 text-neutral-500"
          }`}
        >
          {p.icon}
          <span className="hidden sm:inline">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

