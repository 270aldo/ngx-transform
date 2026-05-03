'use client';

/**
 * Genesis Demo Page
 * Shows AgentOrchestration → DemoChat flow.
 *
 * AUDIT-034: telemetry instrumentation. Emits demo_started on entering
 * the chat phase, demo_completed on natural exit, and demo_abandoned
 * if the user leaves before completing (page unmount with phase=chat).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AgentOrchestration } from '@/components/genesis/AgentOrchestration';
import { DemoChat } from '@/components/genesis/DemoChat';

type DemoPhase = 'orchestration' | 'chat';

function emit(event: string, sessionId: string, metadata?: Record<string, unknown>, latency_ms?: number) {
  try {
    void fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, event, latency_ms, metadata }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore — telemetry is fire-and-forget
  }
}

export default function DemoPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [phase, setPhase] = useState<DemoPhase>('orchestration');
  const chatStartedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const handleOrchestrationComplete = () => {
    setPhase('chat');
    if (!chatStartedAtRef.current) {
      chatStartedAtRef.current = Date.now();
      emit('demo_started', shareId);
    }
  };

  const handleChatComplete = () => {
    completedRef.current = true;
    const startedAt = chatStartedAtRef.current ?? Date.now();
    emit(
      'demo_completed',
      shareId,
      undefined,
      Date.now() - startedAt
    );
    router.push(`/s/${shareId}/plan`);
  };

  // Abandonment: fired when component unmounts and the user did not
  // complete the chat naturally. Covers back-navigation and tab close.
  useEffect(() => {
    return () => {
      if (
        chatStartedAtRef.current !== null &&
        !completedRef.current
      ) {
        const startedAt = chatStartedAtRef.current;
        emit(
          'demo_abandoned',
          shareId,
          undefined,
          Date.now() - startedAt
        );
      }
    };
  }, [shareId]);

  return (
    <main className="min-h-screen bg-transparent">
      {phase === 'orchestration' && (
        <AgentOrchestration
          shareId={shareId}
          onComplete={handleOrchestrationComplete}
        />
      )}

      {phase === 'chat' && (
        <DemoChat
          shareId={shareId}
          onComplete={handleChatComplete}
          onMessageSent={(idx) =>
            emit('demo_message_sent', shareId, { interactionIndex: idx })
          }
        />
      )}
    </main>
  );
}
