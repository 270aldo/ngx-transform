'use client';

/**
 * Genesis Demo Page
 * Shows AgentOrchestration → DemoChat flow
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AgentOrchestration } from '@/components/genesis/AgentOrchestration';
import { DemoChat } from '@/components/genesis/DemoChat';

type DemoPhase = 'orchestration' | 'chat';

export default function DemoPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [phase, setPhase] = useState<DemoPhase>('orchestration');

  const handleOrchestrationComplete = () => {
    setPhase('chat');
  };

  const handleChatComplete = () => {
    router.push(`/s/${shareId}/plan`);
  };

  return (
    <main className="min-h-screen bg-[#050505]">
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
        />
      )}
    </main>
  );
}
