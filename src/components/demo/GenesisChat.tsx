"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Flame, Brain, Timer } from "lucide-react";
import { AgentStatus, DemoUserResponses } from "@/types/demo";
import { AgentStatusBar } from "./AgentStatusBar";

interface ChatMessage {
  id: string;
  type: "genesis" | "agent_report" | "system";
  content: string;
  agent?: "blaze" | "sage" | "tempo";
  timestamp: number;
}

interface GenesisChatProps {
  shareId: string;
  responses: DemoUserResponses;
  onPlanReady: () => void;
}

export function GenesisChat({ shareId, responses, onPlanReady }: GenesisChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    blaze: "pending",
    sage: "pending",
    tempo: "pending",
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start chat stream on mount
  useEffect(() => {
    startChatStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startChatStream = useCallback(async () => {
    setIsStreaming(true);

    try {
      const response = await fetch("/api/genesis-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId,
          responses,
          action: "start",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start chat");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamEvent(data);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat stream error:", error);
      addMessage({
        type: "system",
        content: "Error al conectar con GENESIS. Por favor recarga la página.",
      });
    } finally {
      setIsStreaming(false);
    }
  }, [shareId, responses]);

  const handleStreamEvent = useCallback((event: {
    type: string;
    content?: string;
    agent?: "blaze" | "sage" | "tempo";
    status?: "pending" | "loading" | "complete";
  }) => {
    switch (event.type) {
      case "genesis_message":
        addMessage({ type: "genesis", content: event.content || "" });
        break;

      case "agent_status":
        if (event.agent && event.status) {
          setAgentStatus((prev) => ({
            ...prev,
            [event.agent!]: event.status,
          }));
        }
        break;

      case "agent_report":
        addMessage({
          type: "agent_report",
          content: event.content || "",
          agent: event.agent,
        });
        break;

      case "plan_ready":
        addMessage({ type: "genesis", content: event.content || "" });
        setPlanReady(true);
        // Delay before transitioning to plan phase
        setTimeout(() => {
          onPlanReady();
        }, 2000);
        break;

      case "done":
        // Stream complete
        break;

      case "error":
        addMessage({ type: "system", content: event.content || "Error desconocido" });
        break;
    }
  }, [onPlanReady]);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Agent Status Bar */}
      <AgentStatusBar status={agentStatus} />

      {/* Chat Messages */}
      <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isStreaming && !planReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-neutral-400"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#6D00FF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[#6D00FF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[#6D00FF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">GENESIS está procesando...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Plan Ready Indicator */}
      {planReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#6D00FF]/20 to-[#B98CFF]/20 rounded-xl border border-[#6D00FF]/30 p-4 text-center"
        >
          <p className="text-[#B98CFF] font-medium">
            ✨ Tu plan está listo. Preparando vista previa...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isGenesis = message.type === "genesis";
  const isAgentReport = message.type === "agent_report";
  const isSystem = message.type === "system";

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-neutral-500 py-2"
      >
        {message.content}
      </motion.div>
    );
  }

  // v11.0: GENESIS habla en primera persona, los "agentes" ahora son módulos
  if (isAgentReport) {
    const moduleConfig = {
      blaze: { icon: Flame, color: "#fb923c", label: "Entrenamiento" },
      sage: { icon: Brain, color: "#34d399", label: "Nutrición" },
      tempo: { icon: Timer, color: "#7D1AFF", label: "Recuperación" },
    }[message.agent || "blaze"];

    const Icon = moduleConfig.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/5 rounded-xl border border-white/10 p-4"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${moduleConfig.color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: moduleConfig.color }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1 text-[#B98CFF]">
              GENESIS • {moduleConfig.label}
            </p>
            <p className="text-neutral-300 text-sm">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Genesis message
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl border border-white/10 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D00FF] to-[#B98CFF] flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm text-[#B98CFF] font-medium mb-1">GENESIS</p>
          <p className="text-neutral-300 text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}
