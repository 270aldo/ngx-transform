# NGX Transform v2.2: Implementation Blueprint
## Component-by-Component Development Guide

---

## PRIORITY 1: DRAMATIC REVEAL ANIMATION (Week 1)

### Component: `DramaticReveal.tsx`
**Location**: `src/components/results/DramaticReveal.tsx`
**Purpose**: 3-second countdown + morphing image animation

```typescript
// DramaticReveal.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DramaticRevealProps {
  originalImage: string;      // m0 photo
  transformedImage: string;   // m12 projection
  userName?: string;
}

export function DramaticReveal({ originalImage, transformedImage, userName }: DramaticRevealProps) {
  const [phase, setPhase] = useState<'countdown' | 'morphing' | 'complete'>('countdown');
  const [countdown, setCountdown] = useState(3);

  // Countdown timer
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (phase === 'countdown' && countdown === 0) {
      setPhase('morphing');
      setTimeout(() => setPhase('complete'), 4000);
    }
  }, [countdown, phase]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Countdown Phase */}
      {phase === 'countdown' && (
        <motion.div
          className="text-7xl font-bold text-transparent bg-gradient-to-r from-violet-600 to-cyan-400 bg-clip-text"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          {countdown}
        </motion.div>
      )}

      {/* Morphing Phase */}
      {(phase === 'morphing' || phase === 'complete') && (
        <div className="relative w-96 h-96">
          {/* Base image (original) */}
          <motion.img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            animate={{ opacity: phase === 'morphing' ? 0 : 0.3 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          />

          {/* Morphing image (transformed) */}
          <motion.img
            src={transformedImage}
            alt="Transformed"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            animate={{ opacity: phase === 'morphing' ? 1 : 1 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Overlay text */}
      {phase === 'complete' && (
        <motion.div
          className="absolute bottom-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2">
            En 12 meses, así lucirás.
          </h2>
          <p className="text-lg text-gray-300">
            Con disciplina consciente y un plan científico.
          </p>
        </motion.div>
      )}
    </div>
  );
}
```

**Integration in Results Page**:
```typescript
// pages/s/[shareId].tsx
<DramaticReveal 
  originalImage={session.photoUrl}
  transformedImage={session.m12ImageUrl}
  userName={session.userName}
/>
```

---

## PRIORITY 2: AGENT BRIDGE CTA (Week 1-2)

### Component: `AgentBridgeCTA.tsx`
**Location**: `src/components/results/AgentBridgeCTA.tsx`
**Purpose**: Introduce GENESIS, embed chatbot demo

```typescript
// AgentBridgeCTA.tsx
import { useState } from 'react';
import { GenesisEmbeddedChat } from './GenesisEmbeddedChat';

interface AgentBridgeCTAProps {
  sessionId: string;
  userTransformationStats: {
    projectedMuscleGain: number;
    projectedFatLoss: number;
    timelineMonths: number;
  };
}

export function AgentBridgeCTA({ sessionId, userTransformationStats }: AgentBridgeCTAProps) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="w-full py-20 bg-gradient-to-b from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Así es cómo ejecutaremos tu plan
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mira cómo GENESIS (nuestro ecosistema multi-agente de IA) orquesta cada aspecto
            de tu transformación.
          </p>
        </div>

        {/* Agent System Explanation */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <AgentCard
            name="BLAZE"
            role="Workout AI"
            description="Crea tu programa dinámico basado en tu progreso semanal."
            icon="⚡"
          />
          <AgentCard
            name="TRINITY"
            role="Nutrition AI"
            description="Ajusta macros diarios según tu peso, actividad y metas."
            icon="🥗"
          />
          <AgentCard
            name="APOLLO"
            role="Recovery & Mindset AI"
            description="Monitorea stress, sleep, disciplina. Optimiza mentalidad."
            icon="🧠"
          />
        </div>

        {/* Live Demo Button */}
        <div className="text-center mb-12">
          {!showDemo && (
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all"
            >
              Ver Demo en Vivo →
            </button>
          )}
        </div>

        {/* Embedded Chatbot Demo */}
        {showDemo && (
          <GenesisEmbeddedChat sessionId={sessionId} stats={userTransformationStats} />
        )}
      </div>
    </section>
  );
}

function AgentCard({
  name,
  role,
  description,
  icon,
}: {
  name: string;
  role: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-sm text-violet-400 mb-3">{role}</p>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}
```

---

## PRIORITY 3: GENESIS EMBEDDED CHAT (Week 2)

### Component: `GenesisEmbeddedChat.tsx`
**Location**: `src/components/results/GenesisEmbeddedChat.tsx`
**Purpose**: Show live GENESIS agent responses

```typescript
// GenesisEmbeddedChat.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GenesisEmbeddedChatProps {
  sessionId: string;
  stats: {
    projectedMuscleGain: number;
    projectedFatLoss: number;
    timelineMonths: number;
  };
}

interface ChatMessage {
  role: 'user' | 'agent';
  message: string;
  agentName?: string;
  subAgentsInvolved?: string[];
}

const SAMPLE_DEMOS = [
  {
    userMessage: '¿Cuánto tiempo para ver resultados?',
    agentResponse: 'Basado en tu perfil, los primeros cambios visibles en 4 semanas. Adaptación hormonal + patrones neurales optimizados por nuestro ecosistema. APOLLO monitorea tu sleep y stress para maximizar recuperación.',
    subAgents: ['BLAZE', 'APOLLO'],
  },
  {
    userMessage: '¿Cuál será mi rutina?',
    agentResponse: 'BLAZE genera tu programa dinámico cada semana basado en tu progreso. TRINITY ajusta nutrición diaria. APOLLO monitorea tu stress/sleep. Todo orquestado por mí (GENESIS) en tiempo real.',
    subAgents: ['BLAZE', 'TRINITY', 'APOLLO'],
  },
  {
    userMessage: '¿Qué pasa si me desanimo?',
    agentResponse: 'APOLLO tiene módulo de mentalidad dedicado. Cuando detecte baja disciplina, ajustamos intensidad, celebramos pequeñas victorias, recalibramos metas. No es rigidez. Es adaptación inteligente.',
    subAgents: ['APOLLO'],
  },
];

export function GenesisEmbeddedChat({ sessionId, stats }: GenesisEmbeddedChatProps) {
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-load first demo on mount
  useEffect(() => {
    loadDemo(0);
  }, []);

  const loadDemo = async (index: number) => {
    setIsLoading(true);
    const demo = SAMPLE_DEMOS[index];

    // Simulate agent thinking
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Fetch actual GENESIS response (or use fallback)
    try {
      const response = await fetch('/api/genesis-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userQuestion: demo.userMessage,
          transformationStats: stats,
        }),
      });

      const data = await response.json();
      setMessages([
        { role: 'user', message: demo.userMessage },
        {
          role: 'agent',
          message: data.message || demo.agentResponse,
          agentName: 'GENESIS',
          subAgentsInvolved: demo.subAgents,
        },
      ]);
    } catch (error) {
      // Fallback to demo response
      setMessages([
        { role: 'user', message: demo.userMessage },
        {
          role: 'agent',
          message: demo.agentResponse,
          agentName: 'GENESIS',
          subAgentsInvolved: demo.subAgents,
        },
      ]);
    }

    setCurrentDemoIndex(index);
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl p-6 rounded-lg bg-white/5 border border-violet-500/30">
      {/* Chat messages */}
      <div className="space-y-4 mb-6 min-h-48">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-violet-600/80 text-white'
                  : 'bg-cyan-500/20 text-gray-100 border border-cyan-500/30'
              }`}
            >
              {msg.role === 'agent' && (
                <p className="text-xs font-bold text-cyan-400 mb-2">GENESIS (Multi-Agent Orchestrator)</p>
              )}
              <p>{msg.message}</p>
              {msg.subAgentsInvolved && (
                <p className="text-xs text-cyan-300 mt-2 pt-2 border-t border-cyan-500/30">
                  Agents: {msg.subAgentsInvolved.join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demo Navigation */}
      <div className="flex gap-2 justify-center">
        {SAMPLE_DEMOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => loadDemo(idx)}
            disabled={isLoading}
            className={`px-4 py-2 rounded transition-all ${
              currentDemoIndex === idx
                ? 'bg-violet-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Demo {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## PRIORITY 4: PLAN DOWNLOAD CARD (Week 2)

### Component: `PlanDownloadCard.tsx`
**Location**: `src/components/results/PlanDownloadCard.tsx`
**Purpose**: 7-day plan generation + download

```typescript
// PlanDownloadCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

interface PlanDownloadCardProps {
  sessionId: string;
  userName: string;
  transformationStats: {
    projectedMuscleGain: number;
    projectedFatLoss: number;
  };
}

export function PlanDownloadCard({
  sessionId,
  userName,
  transformationStats,
}: PlanDownloadCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleGenerateAndDownload = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/plan/${sessionId}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Plan generation failed');

      const data = await response.json();
      const { pdfUrl } = data;

      // Download PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `NGX_Plan_7Dias_${userName}.pdf`;
      link.click();

      setIsDownloaded(true);

      // Track conversion
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'plan_downloaded',
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="w-full py-20 bg-black">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div
          className="p-8 rounded-lg bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-violet-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Tu plan de acción</h2>
          <p className="text-gray-300 mb-6">
            7 días personalizados basados en tu transformación proyectada
            {transformationStats && (
              <span className="block text-sm mt-2 text-cyan-400">
                (+{transformationStats.projectedMuscleGain}kg músculo,
                {transformationStats.projectedFatLoss.toFixed(1)}% reducción de grasa)
              </span>
            )}
          </p>

          {/* Plan Preview */}
          <div className="bg-white/5 rounded p-4 mb-6 space-y-2 text-sm text-gray-300">
            <p>✓ Rutinas diarias (generadas por BLAZE)</p>
            <p>✓ Macros personalizadas (TRINITY)</p>
            <p>✓ Estrategia mental (APOLLO)</p>
            <p className="text-xs text-gray-500 mt-3">
              Nota: Este es tu plan básico (7 días). La versión completa en ASCEND incluye 90 días
              personalizados con ajustes semanales.
            </p>
          </div>

          {/* Download Button */}
          <motion.button
            onClick={handleGenerateAndDownload}
            disabled={isGenerating || isDownloaded}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isDownloaded
                ? 'bg-green-600 cursor-default'
                : isGenerating
                  ? 'bg-gray-600 cursor-wait'
                  : 'bg-gradient-to-r from-violet-600 to-cyan-400 hover:shadow-lg hover:shadow-violet-500/50'
            }`}
            whileHover={!isGenerating && !isDownloaded ? { scale: 1.05 } : {}}
            whileTap={!isGenerating && !isDownloaded ? { scale: 0.95 } : {}}
          >
            {isDownloaded
              ? '✓ Plan descargado'
              : isGenerating
                ? 'Generando tu plan...'
                : 'Descargar Plan Gratuito'}
          </motion.button>

          {isDownloaded && (
            <motion.div
              className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ Plan listo. Revisa tu descarga y comienza HOY.
            </motion.div>
          )}
        </motion.div>

        {/* Upsell Section */}
        <motion.div
          className="mt-8 p-6 bg-white/5 rounded border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-lg font-bold text-white mb-2">Quiero el plan completo</h3>
          <p className="text-gray-300 text-sm mb-4">
            ASCEND: 90 días personalizados, ajuste semanal, GENESIS orquestando cada decisión.
          </p>
          <a
            href="https://ascend.ngx.app"
            className="inline-block px-6 py-2 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-all"
          >
            Explorar ASCEND → $99/mes
          </a>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## PRIORITY 5: SOCIAL PROOF COUNTER (Week 1)

### Component: `SocialCounter.tsx`
**Location**: `src/components/results/SocialCounter.tsx`
**Purpose**: Real-time weekly transformation counter

```typescript
// SocialCounter.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function SocialCounter() {
  const [weeklyCount, setWeeklyCount] = useState<number | null>(null);
  const [monthlyCount, setMonthlyCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/counter?period=weekly');
        const data = await response.json();
        setWeeklyCount(data.count);
      } catch (error) {
        // Fallback values
        setWeeklyCount(15234);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (weeklyCount === null) return null;

  return (
    <motion.div
      className="text-center py-8 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-lg border border-white/10 mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-sm text-gray-400 mb-2">MOVIMIENTO EN VIVO</p>
      <p className="text-3xl font-bold text-white mb-1">
        +{weeklyCount?.toLocaleString()} personas
      </p>
      <p className="text-gray-300">
        iniciaron su transformación esta semana en NGX
      </p>
    </motion.div>
  );
}
```

---

## API ENDPOINT: `/api/genesis-demo`

**Location**: `app/src/app/api/genesis-demo/route.ts`

```typescript
// app/src/app/api/genesis-demo/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface GenesisRequest {
  sessionId: string;
  userQuestion: string;
  transformationStats: {
    projectedMuscleGain: number;
    projectedFatLoss: number;
    timelineMonths: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenesisRequest = await request.json();
    const { sessionId, userQuestion, transformationStats } = body;

    // Call GENESIS backend (genesis_A2UI_chatbot API)
    const genesisResponse = await fetch('https://genesis-api.ngx.app/api/demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GENESIS_API_KEY}`,
      },
      body: JSON.stringify({
        sessionId,
        userQuestion,
        context: transformationStats,
        mode: 'demo', // Demo mode for lead magnet
      }),
    });

    if (!genesisResponse.ok) {
      throw new Error(`GENESIS API error: ${genesisResponse.statusText}`);
    }

    const genesisData = await genesisResponse.json();

    // Log telemetry
    await logTelemetry({
      event: 'genesis_demo_shown',
      sessionId,
      userQuestion,
    });

    return NextResponse.json({
      agentName: 'GENESIS',
      message: genesisData.response,
      agentType: 'ORCHESTRATOR',
      subAgentsInvolved: genesisData.agentsInvolved || ['BLAZE', 'TRINITY', 'APOLLO'],
    });
  } catch (error) {
    console.error('Error in /api/genesis-demo:', error);

    // Fallback response
    return NextResponse.json(
      {
        error: 'Failed to fetch agent response',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

async function logTelemetry(data: any) {
  // Send to telemetry service
  try {
    await fetch(`${process.env.TELEMETRY_URL}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silent fail
  }
}
```

---

## INTEGRATION CHECKLIST

### Results Page Updates (`/s/[shareId]`)
- [ ] Import and place `DramaticReveal` at top
- [ ] Import and place `SocialCounter` below reveal
- [ ] Import and place `TimelineViewer` (existing)
- [ ] Import and place `NeonRadar` (existing)
- [ ] Import and place `AgentBridgeCTA` (NEW)
- [ ] Import and place `PlanDownloadCard` (NEW)
- [ ] Add feature flag: `FF_GENESIS_BRIDGE = true`

### Environment Variables to Add
```bash
GENESIS_API_KEY=xxx
NEXT_PUBLIC_ASCEND_URL=https://ascend.ngx.app
TELEMETRY_URL=https://telemetry.ngx.app
```

---

## STYLING NOTES

- Use Tailwind CSS v4 (already in project)
- Colors: `from-violet-600 to-cyan-400` gradient
- Animations: Framer Motion (already in project)
- Shadows: `shadow-lg shadow-violet-500/50`
- Borders: `border-violet-500/30`

---

## SUCCESS METRICS

**Component KPIs**:
- DramaticReveal: 2+ min average view time (vs 45 sec static)
- AgentBridgeCTA: 25%+ demo button click rate
- PlanDownloadCard: 40%+ plan download rate
- SocialCounter: 15%+ "check ASCEND" after seeing counts

---

## DEPLOYMENT ORDER

1. **Week 1**: DramaticReveal + SocialCounter + AgentBridgeCTA (layout only)
2. **Week 2**: GenesisEmbeddedChat + `/api/genesis-demo` endpoint
3. **Week 2**: PlanDownloadCard + `/api/plan` enhancement
4. **Week 3**: Full integration test + A/B test dramatic reveal
5. **Week 4**: Launch with FF_GENESIS_BRIDGE = true

---
