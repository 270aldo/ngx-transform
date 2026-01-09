/**
 * Genesis Demo SSE Endpoint
 * Streams agent orchestration events for the demo experience
 */

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';
import {
  ORCHESTRATION_PHASES,
  AGENT_MESSAGES,
  interpolateMessage,
} from '@/lib/genesis-demo/agents';
import type { AgentType, AgentStatus } from '@/types/genesis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SessionData {
  input?: {
    weightKg?: number;
    level?: string;
    goal?: string;
    trainingHistoryYears?: number;
  };
}

// Helper to create SSE message
function createSSEMessage(event: string, data: object): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Helper to delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('shareId');

  if (!shareId) {
    return new Response('Missing shareId', { status: 400 });
  }

  // Fetch session data for personalization
  let sessionData: SessionData = {};
  try {
    const db = getDb();
    const snap = await db.collection('sessions').doc(shareId).get();
    if (snap.exists) {
      sessionData = snap.data() as SessionData;
    }
  } catch (error) {
    console.error('Error fetching session:', error);
  }

  // Extract user data for message interpolation
  const userData = {
    weight: sessionData.input?.weightKg || 75,
    level: sessionData.input?.level || 'intermedio',
    goal: sessionData.input?.goal || 'mixto',
    years: sessionData.input?.trainingHistoryYears || 2,
  };

  // Create readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: object) => {
        controller.enqueue(encoder.encode(createSSEMessage(event, data)));
      };

      try {
        // Initial connection message
        send('connected', { message: 'Genesis Demo started', shareId });

        // Process each phase
        for (const phase of ORCHESTRATION_PHASES) {
          // Send phase start event
          send('phase', {
            phase: phase.phase,
            title: phase.title,
          });

          // Calculate delay per agent
          const delayPerAgent = Math.floor(phase.duration / (phase.agents.length * 2));

          // Process each agent in the phase
          for (const agent of phase.agents) {
            // Send analyzing status
            const analyzingMessage = AGENT_MESSAGES[agent as AgentType]?.analyzing || 'Procesando...';
            send('agent', {
              agent,
              status: 'analyzing' as AgentStatus,
              message: analyzingMessage,
            });

            await delay(delayPerAgent);

            // Send complete status with personalized message
            const completeTemplate = AGENT_MESSAGES[agent as AgentType]?.complete || 'Completado';
            const completeMessage = interpolateMessage(completeTemplate, userData);
            send('agent', {
              agent,
              status: 'complete' as AgentStatus,
              message: completeMessage,
            });

            await delay(delayPerAgent);
          }
        }

        // Send completion event
        send('complete', {
          message: 'Análisis completo',
          redirect: 'chat',
        });

        // Close the stream
        controller.close();
      } catch (error) {
        console.error('SSE Error:', error);
        send('error', { message: 'Error en el análisis' });
        controller.close();
      }
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
