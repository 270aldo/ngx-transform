/**
 * Genesis Internal Module Configuration
 * v11.0: 13 módulos internos agrupados en 4 capacidades (no expuestos al usuario)
 */

import type {
  AgentType,
  AgentMeta,
  PhaseConfig,
  QuickAction,
} from '@/types/genesis';

// ============================================
// COLORES DE AGENTES (EXACTOS - NO MODIFICAR)
// ============================================

export const AGENT_COLORS: Record<AgentType, string> = {
  GENESIS: '#6D00FF',  // Purple - Orquestador
  BLAZE:   '#FF4500',  // Red-Orange - Fuerza
  ATLAS:   '#F59E0B',  // Amber - Movilidad
  TEMPO:   '#8B5CF6',  // Violet - Cardio
  WAVE:    '#0EA5E9',  // Sky Blue - Recovery
  SAGE:    '#10B981',  // Emerald - Nutrición estrategia
  MACRO:   '#FF6347',  // Tomato - Macros tracking
  METABOL: '#14B8A6',  // Teal - Metabolismo
  NOVA:    '#D946EF',  // Fuchsia - Suplementos
  SPARK:   '#FBBF24',  // Yellow - Hábitos
  STELLA:  '#A855F7',  // Light Purple - Analytics
  LUNA:    '#6366F1',  // Indigo - Hormonal/Ciclos
  LOGOS:   '#6D00FF',  // Purple - Educación
} as const;

// ============================================
// UI COLORS
// ============================================

export const UI_COLORS = {
  bg: '#050505',
  card: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  statusSuccess: '#00FF88',
  statusWarning: '#FF4444',
  neutral: '#6366F1',
  highlight: '#FBBF24',
} as const;

// ============================================
// METADATOS DE AGENTES
// ============================================

export const AGENT_META: Record<AgentType, AgentMeta> = {
  GENESIS: {
    id: 'GENESIS',
    name: 'Genesis',
    color: AGENT_COLORS.GENESIS,
    icon: 'Brain',
    description: 'Orquestador principal del sistema',
    specialty: 'Coordinación y síntesis de análisis',
  },
  BLAZE: {
    id: 'BLAZE',
    name: 'Blaze',
    color: AGENT_COLORS.BLAZE,
    icon: 'Flame',
    description: 'Especialista en entrenamiento de fuerza',
    specialty: 'Rutinas de resistencia y potencia',
  },
  ATLAS: {
    id: 'ATLAS',
    name: 'Atlas',
    color: AGENT_COLORS.ATLAS,
    icon: 'Move',
    description: 'Experto en movilidad y prevención',
    specialty: 'Rangos articulares y corrección postural',
  },
  TEMPO: {
    id: 'TEMPO',
    name: 'Tempo',
    color: AGENT_COLORS.TEMPO,
    icon: 'Heart',
    description: 'Especialista en cardio y HIIT',
    specialty: 'VO2max y resistencia cardiovascular',
  },
  WAVE: {
    id: 'WAVE',
    name: 'Wave',
    color: AGENT_COLORS.WAVE,
    icon: 'Activity',
    description: 'Experto en recuperación y HRV',
    specialty: 'Descanso activo y regeneración',
  },
  SAGE: {
    id: 'SAGE',
    name: 'Sage',
    color: AGENT_COLORS.SAGE,
    icon: 'Leaf',
    description: 'Estratega nutricional',
    specialty: 'Planes alimenticios personalizados',
  },
  MACRO: {
    id: 'MACRO',
    name: 'Macro',
    color: AGENT_COLORS.MACRO,
    icon: 'PieChart',
    description: 'Calculador de macronutrientes',
    specialty: 'Distribución óptima de macros',
  },
  METABOL: {
    id: 'METABOL',
    name: 'Metabol',
    color: AGENT_COLORS.METABOL,
    icon: 'Zap',
    description: 'Analista metabólico',
    specialty: 'Tasa metabólica y termogénesis',
  },
  NOVA: {
    id: 'NOVA',
    name: 'Nova',
    color: AGENT_COLORS.NOVA,
    icon: 'Sparkles',
    description: 'Asesor de suplementación',
    specialty: 'Stack de suplementos personalizados',
  },
  SPARK: {
    id: 'SPARK',
    name: 'Spark',
    color: AGENT_COLORS.SPARK,
    icon: 'Sun',
    description: 'Coach de hábitos y mindset',
    specialty: 'Rutinas diarias y motivación',
  },
  STELLA: {
    id: 'STELLA',
    name: 'Stella',
    color: AGENT_COLORS.STELLA,
    icon: 'BarChart2',
    description: 'Analista de datos biométricos',
    specialty: 'Métricas y proyecciones',
  },
  LUNA: {
    id: 'LUNA',
    name: 'Luna',
    color: AGENT_COLORS.LUNA,
    icon: 'Moon',
    description: 'Especialista hormonal',
    specialty: 'Ciclos y optimización hormonal',
  },
  LOGOS: {
    id: 'LOGOS',
    name: 'Logos',
    color: AGENT_COLORS.LOGOS,
    icon: 'BookOpen',
    description: 'Educador y mentor',
    specialty: 'Conocimiento y fundamentos',
  },
} as const;

// ============================================
// CONFIGURACIÓN DE FASES DE ORQUESTACIÓN
// ============================================

export const ORCHESTRATION_PHASES: PhaseConfig[] = [
  {
    phase: 1,
    title: 'Analizando tu perfil',
    duration: 6000, // 6 segundos
    agents: ['GENESIS', 'STELLA', 'LOGOS'],
  },
  {
    phase: 2,
    title: 'Diseñando tu transformación',
    duration: 10000, // 10 segundos
    agents: ['BLAZE', 'TEMPO', 'ATLAS', 'SAGE', 'MACRO', 'METABOL'],
  },
  {
    phase: 3,
    title: 'Personalizando experiencia',
    duration: 6000, // 6 segundos
    agents: ['WAVE', 'SPARK', 'NOVA', 'LUNA'],
  },
];

// ============================================
// MENSAJES DE AGENTES (templates)
// ============================================

export const AGENT_MESSAGES: Record<AgentType, { analyzing: string; complete: string }> = {
  GENESIS: {
    analyzing: 'Iniciando orquestación de análisis...',
    complete: 'Orquestación completada',
  },
  STELLA: {
    analyzing: 'Procesando datos biométricos...',
    complete: 'Biometría analizada: {weight}kg detectado',
  },
  LOGOS: {
    analyzing: 'Evaluando historial de entrenamiento...',
    complete: 'Nivel {level} confirmado, {years} años de experiencia',
  },
  BLAZE: {
    analyzing: 'Calibrando protocolo de fuerza...',
    complete: 'Rutina de resistencia configurada',
  },
  TEMPO: {
    analyzing: 'Optimizando parámetros cardiovasculares...',
    complete: 'Protocolo HIIT personalizado',
  },
  ATLAS: {
    analyzing: 'Mapeando rangos articulares...',
    complete: 'Secuencia de movilidad lista',
  },
  SAGE: {
    analyzing: 'Calculando requerimientos nutricionales...',
    complete: 'Plan alimenticio para {goal}',
  },
  MACRO: {
    analyzing: 'Distribuyendo macronutrientes...',
    complete: 'Macros optimizados configurados',
  },
  METABOL: {
    analyzing: 'Analizando tasa metabólica basal...',
    complete: 'Metabolismo mapeado correctamente',
  },
  WAVE: {
    analyzing: 'Programando ciclos de recuperación...',
    complete: 'Protocolo de descanso activo listo',
  },
  SPARK: {
    analyzing: 'Creando rutinas de hábitos...',
    complete: 'Hábitos diarios establecidos',
  },
  NOVA: {
    analyzing: 'Evaluando necesidades de suplementación...',
    complete: 'Stack básico recomendado',
  },
  LUNA: {
    analyzing: 'Sincronizando ciclos biológicos...',
    complete: 'Ritmos circadianos optimizados',
  },
};

// ============================================
// QUICK ACTIONS INICIALES
// ============================================

export const INITIAL_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'workout',
    label: 'Mi entreno del Día 1',
    icon: 'Dumbbell',
    agent: 'BLAZE',
    widgetType: 'workout',
  },
  {
    id: 'nutrition',
    label: 'Mi nutrición de hoy',
    icon: 'Utensils',
    agent: 'SAGE',
    widgetType: 'meal',
  },
  {
    id: 'explain',
    label: '¿Por qué este plan?',
    icon: 'HelpCircle',
    agent: 'LOGOS',
    widgetType: 'insight',
  },
  {
    id: 'habits',
    label: 'Mi rutina matutina',
    icon: 'Sun',
    agent: 'SPARK',
    widgetType: 'checklist',
  },
];

// ============================================
// QUICK ACTIONS POR CONTEXTO
// ============================================

export const CONTEXTUAL_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  workout: [
    { id: 'nutrition', label: 'Mi nutrición', icon: 'Utensils', agent: 'SAGE', widgetType: 'meal' },
    { id: 'explain', label: '¿Por qué este plan?', icon: 'HelpCircle', agent: 'LOGOS', widgetType: 'insight' },
    { id: 'habits', label: 'Rutina matutina', icon: 'Sun', agent: 'SPARK', widgetType: 'checklist' },
  ],
  meal: [
    { id: 'workout', label: 'Ver entreno', icon: 'Dumbbell', agent: 'BLAZE', widgetType: 'workout' },
    { id: 'tips', label: 'Tips de prep', icon: 'ChefHat', agent: 'SAGE', widgetType: 'insight' },
    { id: 'supplements', label: 'Suplementos', icon: 'Pill', agent: 'NOVA', widgetType: 'insight' },
  ],
  insight: [
    { id: 'start', label: '¿Cómo empiezo?', icon: 'Play', agent: 'SPARK', widgetType: 'checklist' },
    { id: 'progression', label: 'Mi progresión', icon: 'TrendingUp', agent: 'STELLA', widgetType: 'insight' },
    { id: 'plan', label: 'Ver plan completo', icon: 'Calendar', agent: 'GENESIS' },
  ],
  checklist: [
    { id: 'workout', label: 'Mi entreno', icon: 'Dumbbell', agent: 'BLAZE', widgetType: 'workout' },
    { id: 'nutrition', label: 'Mi nutrición', icon: 'Utensils', agent: 'SAGE', widgetType: 'meal' },
    { id: 'plan', label: 'Ver plan completo', icon: 'Calendar', agent: 'GENESIS' },
  ],
};

// ============================================
// HELPERS
// ============================================

export function getAgentMeta(agent: AgentType): AgentMeta {
  return AGENT_META[agent];
}

export function getAgentColor(agent: AgentType): string {
  return AGENT_COLORS[agent];
}

export function interpolateMessage(
  template: string,
  data: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? key));
}

export function getPhaseAgents(phase: 1 | 2 | 3): AgentType[] {
  return ORCHESTRATION_PHASES.find(p => p.phase === phase)?.agents ?? [];
}

export function getTotalOrchestrationDuration(): number {
  return ORCHESTRATION_PHASES.reduce((acc, phase) => acc + phase.duration, 0);
}
