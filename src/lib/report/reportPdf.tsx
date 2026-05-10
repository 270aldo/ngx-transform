import React from "react";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { ReportMilestone, ReportStats, SeasonVisionReport } from "@/lib/report/reportSchema";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    backgroundColor: "#07030d",
    color: "#f8f5ff",
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#b996ff",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 700,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 1.45,
    color: "#d9d0e8",
    marginBottom: 16,
  },
  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#12091c",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: "#b996ff",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 4,
  },
  body: {
    fontSize: 10.5,
    lineHeight: 1.55,
    color: "#eee7f8",
  },
  muted: {
    color: "#afa2be",
  },
  statGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  statBox: {
    flexGrow: 1,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: 8,
  },
  statLabel: {
    fontSize: 7.5,
    color: "#afa2be",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ffffff",
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flexGrow: 1,
    flexBasis: 0,
  },
  divider: {
    borderTop: "1px solid rgba(255,255,255,0.12)",
    marginVertical: 12,
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#eee7f8",
    marginBottom: 5,
  },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 24,
    fontSize: 8,
    color: "#7e728c",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const STAT_LABELS: Record<keyof ReportStats, string> = {
  strength: "Fuerza",
  aesthetics: "Composicion",
  endurance: "Resistencia",
  mental: "Mental",
};

function StatGrid({ stats }: { stats: ReportStats }) {
  return (
    <View style={styles.statGrid}>
      {(Object.keys(STAT_LABELS) as Array<keyof ReportStats>).map((key) => (
        <View key={key} style={styles.statBox}>
          <Text style={styles.statLabel}>{STAT_LABELS[key]}</Text>
          <Text style={styles.statValue}>{stats[key]}</Text>
        </View>
      ))}
    </View>
  );
}

function ReportFooter({ report }: { report: SeasonVisionReport }) {
  return (
    <View style={styles.footer} fixed>
      <Text>NGX Transform - {report.subject}</Text>
      <Text>{report.shareId}</Text>
    </View>
  );
}

function MilestoneCard({ milestone }: { milestone: ReportMilestone }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardLabel}>{milestone.label}</Text>
          <Text style={styles.cardTitle}>{milestone.title}</Text>
        </View>
        <Text style={[styles.body, styles.muted]}>{milestone.subtitle}</Text>
      </View>
      <Text style={styles.body}>{milestone.narrative}</Text>
      <View style={styles.divider} />
      <Text style={styles.body}>{milestone.observation}</Text>
      <StatGrid stats={milestone.stats} />
    </View>
  );
}

function BulletList({ items, fallback }: { items: string[]; fallback: string }) {
  const safeItems = items.length ? items : [fallback];
  return (
    <View>
      {safeItems.map((item, index) => (
        <Text key={`${item}-${index}`} style={styles.listItem}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

export function SeasonReportDocument({ report }: { report: SeasonVisionReport }) {
  return (
    <Document
      title={`NGX Season Vision Report ${report.shareId}`}
      author="NGX"
      subject="Season Vision Report"
      creator="GENESIS"
      producer="NGX Transform"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>GENESIS - Season Vision Report</Text>
          <Text style={styles.title}>Tu direccion fisica, convertida en reporte.</Text>
          <Text style={styles.subtitle}>{report.summary}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{report.baseline.label}</Text>
          <Text style={styles.cardTitle}>Baseline</Text>
          <Text style={styles.body}>{report.baseline.summary}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{report.baseline.dominantObservation}</Text>
          {report.baseline.muscleHealthScore !== null && (
            <Text style={[styles.body, { marginTop: 8 }]}>
              Muscle Health Score: {report.baseline.muscleHealthScore}/100
            </Text>
          )}
          {report.baseline.bottleneck && (
            <Text style={[styles.body, { marginTop: 4 }]}>Cuello de botella: {report.baseline.bottleneck.label}</Text>
          )}
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>Riesgos</Text>
            <BulletList items={report.baseline.risks} fallback="Mantener estructura antes que volumen excesivo." />
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>Expectativas</Text>
            <BulletList
              items={report.baseline.expectations}
              fallback="El progreso depende de adherencia, recuperacion y ejecucion semanal."
            />
          </View>
        </View>

        <ReportFooter report={report} />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Visualizaciones</Text>
          <Text style={styles.title}>Tres Seasons, una direccion.</Text>
          <Text style={styles.subtitle}>
            GENESIS conserva compatibilidad interna con los assets existentes, pero el reporte visible opera como Season
            1, Season 2 y Season 3.
          </Text>
        </View>

        {report.visualizations.map((milestone) => (
          <MilestoneCard key={milestone.key} milestone={milestone} />
        ))}

        <ReportFooter report={report} />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Ejecucion</Text>
          <Text style={styles.title}>Convertir vision en sistema.</Text>
          <Text style={styles.subtitle}>{report.actionPlan.primaryRecommendation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Levers</Text>
          <BulletList items={report.actionPlan.trainingLevers} fallback="Medir, ajustar y sostener la progresion." />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Siguiente paso</Text>
          <Text style={styles.body}>{report.actionPlan.nextStep}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Disclaimer</Text>
          <Text style={styles.body}>{report.disclaimer}</Text>
        </View>

        <ReportFooter report={report} />
      </Page>
    </Document>
  );
}

export async function renderSeasonReportPDF(report: SeasonVisionReport): Promise<Buffer> {
  const blob = await pdf(<SeasonReportDocument report={report} />).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
