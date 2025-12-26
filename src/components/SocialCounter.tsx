"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface SocialCounterProps {
  variant?: "landing" | "results" | "compact";
  className?: string;
  sessionId?: string;
}

export function SocialCounter({
  variant = "landing",
  className = "",
  sessionId,
}: SocialCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/counter");
        if (res.ok) {
          const data = await res.json();
          setCount(data.weeklyCount);

          // Track counter viewed event (client-side)
          if (sessionId) {
            fetch("/api/telemetry", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                event: "counter_viewed",
                metadata: { count: data.weeklyCount, variant },
              }),
            }).catch(console.error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch counter:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCount();
  }, [variant, sessionId]);

  if (isLoading || count === null) {
    return (
      <div className={`h-6 ${className}`}>
        <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <span className={`text-xs text-white/50 ${className}`}>
        {count.toLocaleString()} esta semana
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <Flame className="h-4 w-4 text-orange-500" />
      <span className="text-sm text-white/60">
        <motion.strong
          key={count}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white font-semibold"
        >
          {count.toLocaleString()}
        </motion.strong>{" "}
        transformaciones esta semana
      </span>
    </motion.div>
  );
}
