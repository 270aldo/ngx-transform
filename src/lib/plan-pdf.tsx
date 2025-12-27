import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";

// Register custom fonts (using system fonts as fallback)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

// NGX Brand Colors
const COLORS = {
  primary: "#6D00FF",
  primaryLight: "#B98CFF",
  background: "#0A0A0A",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: {
    orange: "#FB923C",
    emerald: "#34D399",
    blue: "#60A5FA",
  },
};

// Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    padding: 40,
    fontFamily: "Inter",
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.primary,
  },
  logoSubtext: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.primaryLight,
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: COLORS.text,
  },
  cardBadge: {
    fontSize: 10,
    color: COLORS.primary,
    backgroundColor: "#6D00FF20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardContent: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  exerciseName: {
    fontSize: 11,
    color: COLORS.text,
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  habitCheckbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 3,
    marginRight: 10,
  },
  habitText: {
    fontSize: 11,
    color: COLORS.text,
  },
  agentNote: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  agentNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  agentIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  agentName: {
    fontSize: 9,
    fontWeight: 600,
  },
  agentNoteText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  footerText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  footerBrand: {
    fontSize: 9,
    color: COLORS.primary,
  },
});

// Types
export interface PlanDay {
  dayNumber: number;
  dayName: string;
  type: "training" | "rest" | "active_recovery";
  focus?: string;
  exercises?: Array<{
    name: string;
    sets: string;
    reps: string;
    rest?: string;
    notes?: string;
  }>;
  habits: string[];
  nutrition?: string;
  mindset?: string;
  agentNotes?: {
    agent: "blaze" | "sage" | "tempo";
    note: string;
  };
}

export interface WeekPlan {
  weekNumber: number;
  userName: string;
  goal: string;
  level: string;
  structure: string;
  days: PlanDay[];
  weeklyFocus: string;
  progressMetrics: string[];
}

// Helper to get agent color
function getAgentColor(agent: "blaze" | "sage" | "tempo"): string {
  const colors = {
    blaze: COLORS.accent.orange,
    sage: COLORS.accent.emerald,
    tempo: COLORS.accent.blue,
  };
  return colors[agent];
}

// Cover Page Component
const CoverPage = ({ plan, today }: { plan: WeekPlan; today: string }) => (
  <Page size="A4" style={styles.page}>
    {/* Header */}
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>NGX GENESIS</Text>
        <Text style={styles.logoSubtext}>Tu Sistema de Transformación</Text>
      </View>
      <Text style={styles.dateText}>{today}</Text>
    </View>

    {/* Title */}
    <Text style={styles.title}>Plan Semana {plan.weekNumber}</Text>
    <Text style={styles.subtitle}>
      {plan.userName} • {plan.goal} • Nivel {plan.level}
    </Text>

    {/* Weekly Focus */}
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Enfoque Semanal</Text>
        <Text style={styles.cardBadge}>{plan.structure}</Text>
      </View>
      <Text style={styles.cardContent}>{plan.weeklyFocus}</Text>
    </View>

    {/* Progress Metrics */}
    <Text style={styles.sectionTitle}>Métricas a Trackear</Text>
    <View style={styles.card}>
      {plan.progressMetrics.map((metric, index) => (
        <View key={index} style={styles.habitItem}>
          <View style={styles.habitCheckbox} />
          <Text style={styles.habitText}>{metric}</Text>
        </View>
      ))}
    </View>

    {/* Footer */}
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Generado por GENESIS</Text>
      <Text style={styles.footerBrand}>NGX GENESIS</Text>
    </View>
  </Page>
);

// Day Page Component
const DayPage = ({ day }: { day: PlanDay }) => {
  const typeLabel =
    day.type === "training"
      ? "Entrenamiento"
      : day.type === "active_recovery"
      ? "Recuperación Activa"
      : "Descanso";

  const typeBadgeStyle = {
    ...styles.cardBadge,
    backgroundColor:
      day.type === "training"
        ? "#6D00FF20"
        : day.type === "active_recovery"
        ? "#34D39920"
        : "#FB923C20",
    color:
      day.type === "training"
        ? COLORS.primary
        : day.type === "active_recovery"
        ? COLORS.accent.emerald
        : COLORS.accent.orange,
  };

  return (
    <Page size="A4" style={styles.page}>
      {/* Day Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Día {day.dayNumber}</Text>
          <Text style={styles.logoSubtext}>{day.dayName}</Text>
        </View>
        <Text style={typeBadgeStyle}>{typeLabel}</Text>
      </View>

      {/* Focus */}
      {day.focus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enfoque del Día</Text>
          <Text style={styles.cardContent}>{day.focus}</Text>
        </View>
      )}

      {/* Exercises */}
      {day.exercises && day.exercises.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Ejercicios</Text>
          <View style={styles.card}>
            {day.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} x {exercise.reps}
                  {exercise.rest ? ` • ${exercise.rest}` : ""}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Habits */}
      <Text style={styles.sectionTitle}>Hábitos del Día</Text>
      <View style={styles.card}>
        {day.habits.map((habit, index) => (
          <View key={index} style={styles.habitItem}>
            <View style={styles.habitCheckbox} />
            <Text style={styles.habitText}>{habit}</Text>
          </View>
        ))}
      </View>

      {/* Nutrition */}
      {day.nutrition && (
        <>
          <Text style={styles.sectionTitle}>Nutrición</Text>
          <View style={styles.card}>
            <Text style={styles.cardContent}>{day.nutrition}</Text>
          </View>
        </>
      )}

      {/* Mindset */}
      {day.mindset && (
        <>
          <Text style={styles.sectionTitle}>Mindset</Text>
          <View style={styles.card}>
            <Text style={styles.cardContent}>{day.mindset}</Text>
          </View>
        </>
      )}

      {/* Agent Note */}
      {day.agentNotes && (
        <View style={styles.agentNote}>
          <View style={styles.agentNoteHeader}>
            <View
              style={{
                ...styles.agentIcon,
                backgroundColor: getAgentColor(day.agentNotes.agent),
              }}
            />
            <Text
              style={{
                ...styles.agentName,
                color: getAgentColor(day.agentNotes.agent),
              }}
            >
              {day.agentNotes.agent.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.agentNoteText}>"{day.agentNotes.note}"</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Generado por GENESIS</Text>
        <Text style={styles.footerBrand}>NGX GENESIS</Text>
      </View>
    </Page>
  );
};

// PDF Document Component
const PlanDocument = ({ plan }: { plan: WeekPlan }) => {
  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <CoverPage plan={plan} today={today} />
      {plan.days.map((day) => (
        <DayPage key={day.dayNumber} day={day} />
      ))}
    </Document>
  );
};

// Generate PDF Blob
export async function generatePlanPDF(plan: WeekPlan): Promise<Blob> {
  const pdfBlob = await pdf(<PlanDocument plan={plan} />).toBlob();
  return pdfBlob;
}

// Generate sample plan for testing
export function generateSamplePlan(
  userName: string,
  goal: string,
  level: string,
  trainingDays: number
): WeekPlan {
  const dayNames = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const isUpperLower = trainingDays >= 4;
  const structure = isUpperLower ? "Upper/Lower" : "Full Body";

  const days: PlanDay[] = dayNames.map((dayName, index) => {
    const dayNumber = index + 1;
    const isTrainingDay =
      trainingDays === 2
        ? [1, 4].includes(dayNumber)
        : trainingDays === 3
        ? [1, 3, 5].includes(dayNumber)
        : trainingDays === 4
        ? [1, 2, 4, 5].includes(dayNumber)
        : [1, 2, 3, 5, 6].includes(dayNumber);

    const isActiveRecovery =
      !isTrainingDay && (dayNumber === 3 || dayNumber === 6);

    if (isTrainingDay) {
      const isUpperDay = isUpperLower
        ? dayNumber === 1 || dayNumber === 4
        : false;
      const focus = isUpperLower
        ? isUpperDay
          ? "Tren Superior - Empuje y Tracción"
          : "Tren Inferior - Fuerza y Potencia"
        : "Full Body - Movimientos Compuestos";

      return {
        dayNumber,
        dayName,
        type: "training",
        focus,
        exercises: isUpperDay || !isUpperLower
          ? [
              { name: "Press de Banca", sets: "4", reps: "8-10", rest: "90s" },
              { name: "Remo con Barra", sets: "4", reps: "8-10", rest: "90s" },
              { name: "Press Militar", sets: "3", reps: "10-12", rest: "60s" },
              { name: "Dominadas", sets: "3", reps: "8-10", rest: "60s" },
              { name: "Curl de Bíceps", sets: "3", reps: "12-15", rest: "45s" },
              { name: "Extensión de Tríceps", sets: "3", reps: "12-15", rest: "45s" },
            ]
          : [
              { name: "Sentadilla", sets: "4", reps: "6-8", rest: "120s" },
              { name: "Peso Muerto Rumano", sets: "4", reps: "8-10", rest: "90s" },
              { name: "Prensa de Piernas", sets: "3", reps: "10-12", rest: "60s" },
              { name: "Curl Femoral", sets: "3", reps: "12-15", rest: "45s" },
              { name: "Elevación de Talones", sets: "4", reps: "15-20", rest: "45s" },
            ],
        habits: [
          "8 horas de sueño mínimo",
          "2.5L de agua",
          "Proteína en cada comida",
          "10 minutos de movilidad",
        ],
        nutrition:
          goal === "muscle"
            ? "Superávit calórico moderado (+300-500 kcal). Prioriza proteína post-entreno."
            : goal === "fat"
            ? "Déficit calórico moderado (-300-500 kcal). Mantén proteína alta."
            : "Calorías en mantenimiento. Ajusta según energía.",
        mindset:
          "Enfócate en la conexión mente-músculo. Cada repetición cuenta.",
        agentNotes: {
          agent: "blaze",
          note: `Tu estructura ${structure} está diseñada para maximizar la recuperación entre sesiones similares.`,
        },
      };
    }

    if (isActiveRecovery) {
      return {
        dayNumber,
        dayName,
        type: "active_recovery",
        focus: "Recuperación Activa - Movilidad y Cardio Ligero",
        habits: [
          "20-30 minutos de caminata",
          "15 minutos de stretching",
          "Foam rolling",
          "Meditación 10 minutos",
        ],
        mindset:
          "La recuperación es parte del proceso. Tu cuerpo se adapta mientras descansas.",
        agentNotes: {
          agent: "tempo",
          note:
            "La recuperación activa mejora el flujo sanguíneo sin estresar el sistema nervioso.",
        },
      };
    }

    return {
      dayNumber,
      dayName,
      type: "rest",
      habits: [
        "9 horas de sueño",
        "Hidratación óptima",
        "Comidas nutritivas",
        "Tiempo de calidad personal",
      ],
      mindset:
        "El descanso completo es cuando tu cuerpo construye músculo y se fortalece.",
      agentNotes: {
        agent: "sage",
        note:
          "Los días de descanso son estratégicos, no opcionales. Aprovéchalos.",
      },
    };
  });

  return {
    weekNumber: 1,
    userName,
    goal:
      goal === "muscle"
        ? "Ganar Músculo"
        : goal === "fat"
        ? "Perder Grasa"
        : "Recomposición",
    level: level.charAt(0).toUpperCase() + level.slice(1),
    structure,
    days,
    weeklyFocus:
      "Esta semana establece las bases. Enfócate en aprender los movimientos y crear el hábito de entrenar consistentemente.",
    progressMetrics: [
      "Peso corporal (mañana, en ayunas)",
      "Fotos de progreso (frente, lado, espalda)",
      "Repeticiones máximas en ejercicios principales",
      "Horas de sueño promedio",
      "Nivel de energía subjetivo (1-10)",
    ],
  };
}
