/**
 * Types for NGX Transform v4.0 Demo Page
 * State machine for 4-phase GENESIS experience
 */

/** Demo page phase state machine */
export type DemoPhase = 'voice_intro' | 'chat' | 'plan_ready' | 'cta';

/** User responses from voice intro questions (buttons, not text) */
export interface DemoUserResponses {
  trainingDays: '2-3' | '4' | '5+' | null;
  goal: 'muscle' | 'fat' | 'both' | null;
  equipment: 'gym' | 'home' | 'bodyweight' | null;
}

/** Complete demo context state */
export interface DemoContext {
  shareId: string;
  phase: DemoPhase;
  responses: DemoUserResponses;
  chatMessages: ChatMessage[];
  planGenerated: boolean;
  planPdfUrl: string | null;
  hasDownloaded: boolean;
  hasShared: boolean;
}

/** Agent status indicators */
export interface AgentStatus {
  blaze: 'pending' | 'loading' | 'complete';
  sage: 'pending' | 'loading' | 'complete';
  tempo: 'pending' | 'loading' | 'complete';
}

/** Chat message structure */
export interface ChatMessage {
  id: string;
  role: 'user' | 'genesis';
  content: string;
  timestamp: number;
  agentReports?: AgentReport[];
}

/** Agent report shown in chat (GENESIS reports what agents "said") */
export interface AgentReport {
  agent: 'blaze' | 'sage' | 'tempo';
  message: string;
}

/** Voice intro script segment */
export interface VoiceSegment {
  text: string;
  audioUrl?: string;
  duration?: number;
}

/** GENESIS voice intro response */
export interface GenesisVoiceResponse {
  audioUrl: string;
  transcript: string;
  duration: number;
}

/** Demo phase transition event */
export type DemoPhaseTransition =
  | { from: 'voice_intro'; to: 'chat'; trigger: 'questions_complete' }
  | { from: 'chat'; to: 'plan_ready'; trigger: 'plan_generated' }
  | { from: 'plan_ready'; to: 'cta'; trigger: 'download_or_share' };

/** Initial demo context factory */
export function createInitialDemoContext(shareId: string): DemoContext {
  return {
    shareId,
    phase: 'voice_intro',
    responses: {
      trainingDays: null,
      goal: null,
      equipment: null,
    },
    chatMessages: [],
    planGenerated: false,
    planPdfUrl: null,
    hasDownloaded: false,
    hasShared: false,
  };
}

/** Check if user has answered all voice intro questions */
export function hasCompletedVoiceIntro(responses: DemoUserResponses): boolean {
  return (
    responses.trainingDays !== null &&
    responses.goal !== null &&
    responses.equipment !== null
  );
}

/** Subscription tier types */
export type SubscriptionTier = 'ascend' | 'hybrid';

export interface SubscriptionOption {
  tier: SubscriptionTier;
  name: string;
  price: number;
  currency: 'USD';
  description: string;
  features: string[];
  hasHumanCoach: boolean;
  agentCount: 13; // Both tiers have 13 agents
}

/** Remarketing lead for escape valve */
export interface RemarketingLead {
  email: string;
  shareId: string;
  createdAt: Date;
  reminderDays: number;
  source: 'escape_valve';
}
