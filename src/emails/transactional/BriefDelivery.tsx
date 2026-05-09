import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Tailwind,
  Img,
  Preview,
  Hr,
} from "@react-email/components";
import { buildUnsubscribeUrl } from "@/lib/unsubscribeToken";
import type { Bottleneck } from "@/types/ai";

interface BriefDeliveryProps {
  name?: string;
  shareId: string;
  m0ImageUrl?: string;
  m12ImageUrl?: string;
  bottleneck?: Bottleneck;
  bottleneckLabel?: string;
  dominantError?: string;
  leverages?: string[];
  muscleHealthScore?: number;
  biologicalAge?: number;
  chronologicalAge?: number;
  metabolicRisk?: "BAJO" | "MEDIO" | "ALTO";
}

export default function BriefDelivery({
  name,
  shareId,
  m0ImageUrl,
  m12ImageUrl,
  bottleneckLabel,
  dominantError,
  leverages,
  muscleHealthScore,
  biologicalAge,
  chronologicalAge,
  metabolicRisk,
}: BriefDeliveryProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const resultsUrl = `${baseUrl}/s/${shareId}`;
  const roadmapUrl = `${baseUrl}/s/${shareId}#season-roadmap`;
  const hybridOfferUrl = `${baseUrl}/s/${shareId}#hybrid-offer`;
  const unsubscribeUrl = buildUnsubscribeUrl(baseUrl, shareId);
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  const ageDelta =
    biologicalAge !== undefined && chronologicalAge !== undefined
      ? biologicalAge - chronologicalAge
      : null;

  const hasLeverages = Array.isArray(leverages) && leverages.length > 0;

  return (
    <Html>
      <Head />
      <Preview>Tu brief NGX Transform — diagnóstico + roadmap</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            <Section className="text-center mb-8">
              <Img
                src={logoUrl}
                alt="NGX Genesis"
                width="140"
                className="mx-auto mb-3"
              />
              <Text className="text-sm text-neutral-500 m-0">
                Brief personal · NGX Transform
              </Text>
            </Section>

            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <Text className="text-xl text-white mb-2">
                {name ? `${name}, ` : ""}aquí tu brief.
              </Text>
              <Text className="text-sm text-neutral-400 leading-relaxed mb-6">
                Lo que vimos, qué significa, y qué haríamos si esto fuera una
                temporada real. Sin presión: decide cuando quieras.
              </Text>

              {m0ImageUrl && m12ImageUrl && (
                <Section className="my-6">
                  <table
                    className="w-full"
                    cellPadding={0}
                    cellSpacing={0}
                  >
                    <tr>
                      <td className="w-1/2 pr-2">
                        <Img
                          src={m0ImageUrl}
                          alt="HOY"
                          className="rounded-lg w-full"
                        />
                        <Text className="text-center text-xs text-neutral-500 mt-2">
                          HOY
                        </Text>
                      </td>
                      <td className="w-1/2 pl-2">
                        <Img
                          src={m12ImageUrl}
                          alt="SEMANA 12"
                          className="rounded-lg w-full"
                        />
                        <Text className="text-center text-xs text-neutral-500 mt-2">
                          SEMANA 12 — POTENCIAL
                        </Text>
                      </td>
                    </tr>
                  </table>
                </Section>
              )}

              {(muscleHealthScore !== undefined || ageDelta !== null) && (
                <Section className="my-6 bg-neutral-950 border border-neutral-800 rounded-xl p-5">
                  <Text className="text-[10px] uppercase tracking-widest text-neutral-500 m-0">
                    Lectura inicial
                  </Text>
                  <table className="w-full mt-3" cellPadding={0} cellSpacing={0}>
                    <tr>
                      {muscleHealthScore !== undefined && (
                        <td className="w-1/3 align-top">
                          <Text className="text-2xl text-white font-bold m-0">
                            {muscleHealthScore}
                            <span className="text-base text-neutral-500 ml-1">
                              /100
                            </span>
                          </Text>
                          <Text className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">
                            Indicador
                          </Text>
                        </td>
                      )}
                      {ageDelta !== null && biologicalAge !== undefined && (
                        <td className="w-1/3 align-top">
                          <Text className="text-2xl text-white font-bold m-0">
                            {biologicalAge}
                          </Text>
                          <Text className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">
                            Edad biológica est.
                          </Text>
                          <Text className="text-[10px] text-amber-400 mt-1">
                            {ageDelta > 0
                              ? `+${ageDelta} sobre cronológica`
                              : `${ageDelta} bajo cronológica`}
                          </Text>
                        </td>
                      )}
                      {metabolicRisk && (
                        <td className="w-1/3 align-top">
                          <Text className="text-base text-white font-bold m-0">
                            {metabolicRisk}
                          </Text>
                          <Text className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">
                            Riesgo metabólico
                          </Text>
                        </td>
                      )}
                    </tr>
                  </table>
                </Section>
              )}

              {bottleneckLabel && (
                <Section className="my-6 bg-neutral-950 border border-[#6D00FF]/30 rounded-xl p-5">
                  <Text className="text-[10px] uppercase tracking-widest text-[#B894FF] m-0">
                    Tu palanca principal
                  </Text>
                  <Text className="text-base text-white font-bold mt-2 mb-2">
                    {bottleneckLabel}
                  </Text>
                  {dominantError && (
                    <Text className="text-sm text-neutral-300 leading-relaxed m-0">
                      {dominantError}
                    </Text>
                  )}
                </Section>
              )}

              {hasLeverages && (
                <Section className="my-6">
                  <Text className="text-[10px] uppercase tracking-widest text-neutral-500 m-0">
                    Tus 3 palancas accionables
                  </Text>

                  {/* Palanca #1 destacada como "Empieza por aquí" — un solo
                      punto de inicio claro reduce fricción cognitiva. */}
                  <Section className="mt-3 bg-[#6D00FF]/10 border border-[#6D00FF]/30 rounded-xl p-4">
                    <Text className="text-[10px] uppercase tracking-widest text-[#B894FF] m-0">
                      Empieza por aquí
                    </Text>
                    <Text className="text-sm text-white leading-relaxed mt-2 m-0">
                      {leverages![0]}
                    </Text>
                  </Section>

                  {leverages!.length > 1 && (
                    <Section className="mt-4">
                      <Text className="text-[10px] uppercase tracking-widest text-neutral-500 m-0">
                        Después
                      </Text>
                      <ol className="text-sm text-neutral-300 mt-2 pl-5 leading-relaxed">
                        {leverages!.slice(1, 3).map((lever, idx) => (
                          <li key={idx} className="mb-2">
                            {lever}
                          </li>
                        ))}
                      </ol>
                    </Section>
                  )}
                </Section>
              )}

              <Hr className="border-neutral-800 my-6" />

              <Text className="text-sm text-neutral-300 leading-relaxed">
                Tu temporada en NGX HYBRID se vería así:
              </Text>

              <Section className="my-4 bg-neutral-950 border border-neutral-800 rounded-xl p-5">
                <Text className="text-xs text-neutral-400 m-0">
                  <strong className="text-white">Fase 1 · Fundación</strong>{" "}
                  (sem 1-3) — Baseline, técnica, mínimos viables.
                </Text>
                <Text className="text-xs text-neutral-400 m-0 mt-2">
                  <strong className="text-white">
                    Fase 2 · Construcción
                  </strong>{" "}
                  (sem 4-7) — Progresión trazable, ajustes con datos.
                </Text>
                <Text className="text-xs text-neutral-400 m-0 mt-2">
                  <strong className="text-white">
                    Fase 3 · Optimización
                  </strong>{" "}
                  (sem 8-11) — Refinar lo que funciona, consolidar.
                </Text>
                <Text className="text-xs text-neutral-400 m-0 mt-2">
                  <strong className="text-white">Fase 4 · Evaluación</strong>{" "}
                  (sem 12) — Medir, decidir, sostener o upgrade.
                </Text>
              </Section>

              <Section className="text-center my-8">
                <Button
                  href={hybridOfferUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver opciones de entrada
                </Button>
                <Text className="text-xs text-neutral-500 mt-3">
                  Sin presión — solo decide cuando tengas claridad.
                </Text>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              <Text className="text-sm text-neutral-500">
                ¿Quieres revisar la visualización completa? Sigue accesible
                aquí:
              </Text>
              <Text className="text-sm">
                <a
                  href={resultsUrl}
                  className="text-[#B894FF] underline"
                >
                  Ver mi transformación
                </a>
                {" · "}
                <a
                  href={roadmapUrl}
                  className="text-[#B894FF] underline"
                >
                  Ver roadmap
                </a>
              </Text>
            </Section>

            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                Brief enviado a petición tuya desde NGX Transform.
                <br />
                <a
                  href={unsubscribeUrl}
                  className="underline text-neutral-400"
                >
                  Darme de baja
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
