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
  Preview,
  Img,
} from "@react-email/components";

interface D10UrgencyProps {
  name?: string;
  shareId: string;
  cohortLabel?: string;
  spotsLeft?: number;
  spotsTotal?: number;
}

export default function D10Urgency({
  name,
  shareId,
  cohortLabel,
  spotsLeft,
  spotsTotal,
}: D10UrgencyProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const offerUrl = `${baseUrl}/s/${shareId}?section=offer`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  const monthLabel = cohortLabel || process.env.NEXT_PUBLIC_COHORT_LABEL || "la próxima";
  const total = spotsTotal ?? Number(process.env.NEXT_PUBLIC_COHORT_SPOTS_TOTAL || "20");
  const left = spotsLeft ?? Number(process.env.NEXT_PUBLIC_COHORT_SPOTS_LEFT || "18");

  return (
    <Html>
      <Head />
      <Preview>Quedan pocas plazas para la cohorte de {monthLabel}</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
              <Text className="text-sm text-neutral-500 m-0">Día 10 • Prioridad de cierre</Text>
            </Section>

            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}quedan pocas plazas para la cohorte de {monthLabel}.
              </Text>

              <Text className="text-neutral-300 leading-relaxed">
                Tu resultado ya está listo y el siguiente paso es claro: convertir esa proyección en progreso real con NGX HYBRID.
              </Text>

              <Section className="my-6 rounded-xl border border-violet-500/35 bg-violet-900/10 p-5">
                <Text className="text-violet-300 text-xs uppercase tracking-widest font-semibold m-0 mb-2">Disponibilidad</Text>
                <Text className="text-white text-2xl font-semibold m-0">{left}/{total} plazas</Text>
                <Text className="text-neutral-400 text-sm m-0 mt-1">Cierre de cohorte en curso</Text>
              </Section>

              <Text className="text-neutral-300 text-sm m-0">
                Incluye sistema GENESIS, coach humano, bonus Ebook Conversacional y garantía de progreso medible.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={offerUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Asegurar mi plaza
                </Button>
              </Section>
            </Section>

            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                NGX Transform
                <br />
                <a href={unsubscribeUrl} className="underline text-neutral-400">Darme de baja</a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
