/**
 * Genesis Demo Types
 * v11.0: GENESIS es la única entidad visible al usuario
 * Los "agentes" son módulos internos agrupados en 4 capacidades
 */

// ============================================
// v11.0: CAPACIDADES DE GENESIS
// ============================================

export type GenesisCapability =
  | 'entrenamiento'  // Entrenamiento de Precisión
  | 'nutricion'      // Estrategia Nutricional
  | 'recuperacion'   // Biohacking y Recuperación
  | 'habitos';       // Arquitectura de Hábitos

// ============================================
// MÓDULOS INTERNOS (legacy: "agentes")
// No expuestos al usuario en v11.0
// ============================================

export type AgentType =
  | 'GENESIS'   // La única entidad visible
  | 'BLAZE'     // → Entrenamiento
  | 'ATLAS'     // → Entrenamiento
  | 'TEMPO'     // → Entrenamiento
  | 'WAVE'      // → Recuperación
  | 'SAGE'      // → Nutrición
  | 'MACRO'     // → Nutrición
  | 'METABOL'   // → Nutrición
  | 'NOVA'      // → Recuperación
  | 'SPARK'     // → Hábitos
  | 'STELLA'    // → Hábitos
  | 'LUNA'      // → Recuperación
  | 'LOGOS';    // → Hábitos

export type AgentStatus = 'pending' | 'analyzing' | 'complete';

export interface AgentMeta {
  id: AgentType;
  name: string;
  color: string;
  icon: string;
  description: string;
  specialty: string;
}

export interface AgentState {
  agent: AgentType;
  status: AgentStatus;
  message?: string;
  timestamp?: number;
}

// ============================================
// ORQUESTACIÓN
// ============================================

export type OrchestrationPhase = 1 | 2 | 3;

export interface PhaseConfig {
  phase: OrchestrationPhase;
  title: string;
  duration: number; // milliseconds
  agents: AgentType[];
}

export interface OrchestrationEvent {
  type: 'phase' | 'agent' | 'complete';
  data: PhaseEvent | AgentEvent | CompleteEvent;
}

export interface PhaseEvent {
  phase: OrchestrationPhase;
  title: string;
}

export interface AgentEvent {
  agent: AgentType;
  status: AgentStatus;
  message: string;
}

export interface CompleteEvent {
  message: string;
  redirect?: string;
}

// ============================================
// DEMO CHAT
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  agent: AgentType;
  widgetType?: WidgetType;
}

export interface DemoChatMessage {
  id: string;
  agent: AgentType;
  content: string;
  widget?: WidgetData;
  timestamp: number;
}

export interface DemoChatState {
  messages: DemoChatMessage[];
  remainingMessages: number;
  quickActions: QuickAction[];
  isComplete: boolean;
}

// ============================================
// WIDGETS A2UI
// ============================================

export type WidgetType =
  | 'workout'
  | 'meal'
  | 'insight'
  | 'checklist'
  | 'recipe'
  | 'sleep'
  | 'supplement'
  | 'timer'
  | 'quote';

export interface WidgetData {
  type: WidgetType;
  agent: AgentType;
  data: WorkoutData | MealData | InsightData | ChecklistData;
}

// Workout Widget
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest?: string;
  notes?: string;
}

export interface WorkoutData {
  title: string;
  category: string;
  duration: number; // minutes
  calories: number;
  exercises: Exercise[];
  coachNote?: string;
}

// Meal Plan Widget
export interface Meal {
  time: string;
  name: string;
  calories: number;
  isHighlight?: boolean;
}

export interface MealData {
  title: string;
  totalCalories: number;
  meals: Meal[];
}

// Insight Widget
export type TrendType = 'positive' | 'negative' | 'neutral';

export interface InsightData {
  title: string;
  trend: TrendType;
  trendValue?: string;
  insight: string;
  recommendation?: string;
}

// Checklist Widget
export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistData {
  title: string;
  items: ChecklistItem[];
}

// ============================================
// PLAN PREVIEW
// ============================================

export interface DayPlan {
  day: number;
  title: string;
  isLocked: boolean;
  workout?: WorkoutData;
  meals?: MealData;
  checklist?: ChecklistData;
}

export interface PlanPreviewData {
  days: DayPlan[];
  shareId: string;
}

// ============================================
// SSE STREAMING
// ============================================

export interface SSEMessage {
  event: string;
  data: string;
}

export interface GenesisSSEConfig {
  shareId: string;
  userProfile: {
    weight: number;
    level: string;
    goal: string;
    trainingYears: number;
  };
}
