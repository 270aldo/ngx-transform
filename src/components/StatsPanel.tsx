"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  Dumbbell,
  Brain,
  Shield
} from "lucide-react";
import type { TimelineEntry } from "@/types/ai";
import type { TimelineStep } from "./TransformationViewer";

interface StatsPanelProps {
  entry: TimelineEntry;
  step: TimelineStep;
  insightsText: string;
}

const stepLabels: Record<TimelineStep, string> = {
  m0: "PUNTO DE PARTIDA",
  m4: "MES 4",
  m8: "MES 8",
  m12: "META FINAL",
};

const stepDescriptions: Record<TimelineStep, string> = {
  m0: "Tu línea base actual",
  m4: "Primera fase de adaptación",
  m8: "Consolidación de resultados",
  m12: "Transformación completa",
};

// Phase-specific content templates
const phaseContent: Record<TimelineStep, {
  focusTitle: string;
  focusDescription: string;
  focusIcon: typeof Flame;
  focusColor: string;
  milestones: string[];
  challenges: string[];
}> = {
  m0: {
    focusTitle: "Evaluación Inicial",
    focusDescription: "Este es tu punto de partida. Hemos analizado tu composición corporal actual, nivel de condición física y factores de estilo de vida para crear un plan personalizado que maximice tus resultados.",
    focusIcon: Target,
    focusColor: "text-violet-400",
    milestones: [],
    challenges: [],
  },
  m4: {
    focusTitle: "Fase de Adaptación",
    focusDescription: "Durante los primeros 4 meses tu cuerpo se adapta al nuevo estímulo. Es la fase donde construyes los cimientos: técnica correcta, hábitos sólidos y las primeras adaptaciones neuromusculares que preparan el terreno para cambios más visibles.",
    focusIcon: Flame,
    focusColor: "text-orange-400",
    milestones: [
      "Establecimiento de rutina consistente",
      "Adaptación neuromuscular inicial",
      "Mejora en la técnica de ejercicios",
      "Primeros cambios visibles en composición"
    ],
    challenges: [
      "Mantener consistencia los primeros 30 días",
      "Evitar sobreentrenamiento",
      "Ajustar nutrición a nuevas demandas"
    ],
  },
  m8: {
    focusTitle: "Fase de Consolidación",
    focusDescription: "Los meses 4 al 8 son donde los cambios se vuelven evidentes. Tu cuerpo ya está adaptado y ahora responde con mayor eficiencia. Es el momento de incrementar intensidad y volumen para acelerar la transformación.",
    focusIcon: TrendingUp,
    focusColor: "text-cyan-400",
    milestones: [
      "Ganancia muscular significativa",
      "Reducción notable de grasa corporal",
      "Aumento de fuerza en ejercicios base",
      "Hábitos completamente integrados"
    ],
    challenges: [
      "Superar mesetas de progreso",
      "Mantener motivación a largo plazo",
      "Optimizar recuperación"
    ],
  },
  m12: {
    focusTitle: "Transformación Completa",
    focusDescription: "Al mes 12 habrás completado una transformación integral. No solo tu físico será diferente, sino tu relación con el ejercicio y la nutrición. Este no es el final, es el nuevo estándar de tu vida.",
    focusIcon: Award,
    focusColor: "text-emerald-400",
    milestones: [
      "Físico completamente transformado",
      "Máximos niveles de rendimiento",
      "Mentalidad de atleta consolidada",
      "Estilo de vida permanente establecido"
    ],
    challenges: [
      "Mantener resultados a largo plazo",
      "Establecer nuevas metas",
      "Continuar evolución constante"
    ],
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

// Stat configuration with colors
const statConfig = [
  { key: "strength", label: "Fuerza", color: "#FF6B6B", icon: Dumbbell },
  { key: "aesthetics", label: "Estética", color: "#6D00FF", icon: Sparkles },
  { key: "endurance", label: "Resistencia", color: "#00D9FF", icon: Flame },
  { key: "mental", label: "Mental", color: "#00FF94", icon: Brain },
] as const;

export function StatsPanel({ entry, step, insightsText }: StatsPanelProps) {
  const stats = entry.stats || { strength: 0, aesthetics: 0, endurance: 0, mental: 0 };
  const phaseData = phaseContent[step];
  const FocusIcon = phaseData.focusIcon;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Phase Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            {stepLabels[step]}
          </span>
          <span className="text-xs text-neutral-500">•</span>
          <span className="text-xs text-neutral-500">{stepDescriptions[step]}</span>
        </div>
        {entry.title && (
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {entry.title}
          </h2>
        )}
        {entry.description && (
          <p className="text-sm text-neutral-400 leading-relaxed">
            {entry.description}
          </p>
        )}
      </motion.div>

      {/* Stats Grid - Compact Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {statConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={stats[stat.key]}
              color={stat.color}
              icon={Icon}
              delay={index * 0.1}
            />
          );
        })}
      </motion.div>

      {/* Phase Focus Card */}
      <motion.div variants={itemVariants} className="card p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0`}>
            <FocusIcon className={`w-5 h-5 ${phaseData.focusColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">
              {phaseData.focusTitle}
            </h4>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {entry.focus || phaseData.focusDescription}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mental Insight Card */}
      <motion.div variants={itemVariants} className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">
              Mentalidad Requerida
            </h4>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {entry.mental}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Milestones for m4/m8/m12 */}
      {step !== "m0" && phaseData.milestones.length > 0 && (
        <motion.div variants={itemVariants} className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Hitos a Alcanzar</h4>
          </div>
          <ul className="space-y-2">
            {phaseData.milestones.map((milestone, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                <ChevronRight className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                <span>{milestone}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Challenges for m4/m8/m12 */}
      {step !== "m0" && phaseData.challenges.length > 0 && (
        <motion.div variants={itemVariants} className="card p-4 border-amber-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Desafíos Clave</h4>
          </div>
          <ul className="space-y-2">
            {phaseData.challenges.map((challenge, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                <ChevronRight className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Expectations (only m0) */}
      {step === "m0" && entry.expectations && entry.expectations.length > 0 && (
        <motion.div variants={itemVariants} className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Expectativas</h4>
          </div>
          <ul className="space-y-2">
            {entry.expectations.map((exp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                <ChevronRight className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Risks (only m0) */}
      {step === "m0" && entry.risks && entry.risks.length > 0 && (
        <motion.div variants={itemVariants} className="card p-4 border-amber-500/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Riesgos a Considerar</h4>
          </div>
          <ul className="space-y-2">
            {entry.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                <ChevronRight className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Coach Analysis - Structured */}
      {step === "m0" && insightsText && (
        <motion.div variants={itemVariants}>
          <CoachInsights text={insightsText} />
        </motion.div>
      )}

      {/* Progress Summary for m4/m8/m12 */}
      {step !== "m0" && (
        <motion.div variants={itemVariants}>
          <ProgressSummary step={step} />
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color, icon: Icon, delay }: {
  label: string;
  value: number;
  color: string;
  icon: typeof Dumbbell;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="card p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-xs text-neutral-400 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-lg font-bold text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-neutral-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}

function CoachInsights({ text }: { text: string }) {
  const sections = parseInsights(text);

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-[var(--primary)]" />
        <h4 className="text-sm font-semibold text-white">Análisis del Coach</h4>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <div
            key={i}
            className={`${section.title ? 'pl-3 border-l-2 border-[var(--primary)]/30' : ''}`}
          >
            {section.title && (
              <h5 className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider mb-1.5">
                {section.title}
              </h5>
            )}
            <p className="text-sm text-neutral-400 leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressSummary({ step }: { step: TimelineStep }) {
  const summaries: Record<Exclude<TimelineStep, "m0">, {
    title: string;
    items: { icon: typeof Clock; label: string; value: string }[]
  }> = {
    m4: {
      title: "Progreso Esperado",
      items: [
        { icon: Clock, label: "Tiempo", value: "16 semanas" },
        { icon: Flame, label: "Intensidad", value: "Moderada-Alta" },
        { icon: TrendingUp, label: "Progreso", value: "25-35%" },
      ]
    },
    m8: {
      title: "Progreso Esperado",
      items: [
        { icon: Clock, label: "Tiempo", value: "32 semanas" },
        { icon: Flame, label: "Intensidad", value: "Alta" },
        { icon: TrendingUp, label: "Progreso", value: "60-70%" },
      ]
    },
    m12: {
      title: "Transformación Final",
      items: [
        { icon: Clock, label: "Tiempo", value: "52 semanas" },
        { icon: Flame, label: "Intensidad", value: "Óptima" },
        { icon: TrendingUp, label: "Progreso", value: "100%" },
      ]
    },
  };

  const data = summaries[step as Exclude<TimelineStep, "m0">];
  if (!data) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[var(--primary)]" />
        <h4 className="text-sm font-semibold text-white">{data.title}</h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {data.items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-neutral-800/50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-xs text-neutral-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to parse insights text into sections
function parseInsights(text: string): { title?: string; content: string }[] {
  // Try to split by common patterns
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length <= 2) {
    return [{ content: text }];
  }

  const sections: { title?: string; content: string }[] = [];
  let currentSection: { title?: string; content: string } | null = null;

  for (const line of lines) {
    // Check if line looks like a header
    const cleanLine = line.trim();
    const isHeader = (
      cleanLine.length < 60 &&
      (cleanLine.endsWith(':') ||
       cleanLine === cleanLine.toUpperCase() ||
       /^[A-ZÁÉÍÓÚÑ][^.!?]{0,40}:?$/.test(cleanLine) ||
       /^\d+\.\s/.test(cleanLine) ||
       /^[-•]\s/.test(cleanLine) === false && cleanLine.split(' ').length <= 5)
    );

    if (isHeader && cleanLine.length > 3) {
      if (currentSection && currentSection.content) {
        sections.push(currentSection);
      }
      currentSection = {
        title: cleanLine.replace(/:$/, '').replace(/^\d+\.\s*/, ''),
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? ' ' : '') + cleanLine;
    } else {
      currentSection = { content: cleanLine };
    }
  }

  if (currentSection && currentSection.content) {
    sections.push(currentSection);
  }

  // If parsing didn't produce good results, return as single block
  if (sections.length === 0 || sections.every(s => !s.content.trim())) {
    return [{ content: text }];
  }

  return sections;
}
