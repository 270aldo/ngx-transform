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
  Hr,
  Img,
} from "@react-email/components";

interface D3PlanProps {
  name?: string;
  shareId: string;
}

export default function D3Plan({ name, shareId }: D3PlanProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const planUrl = `${baseUrl}/plan/${shareId}`;
  const offerUrl = `${baseUrl}/s/${shareId}?section=offer`;
  const resultsUrl = `${baseUrl}/s/${shareId}`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  return (
    <Html>
      <Head />
      <Preview>Tu plan personalizado de 7 días está listo</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
              <Text className="text-sm text-neutral-500 m-0">Plan 7 días</Text>
            </Section>

            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}tu plan de acción está listo.
              </Text>

              <Text className="text-neutral-300 leading-relaxed">
                Tu plan de 7 días es solo un preview. El sistema completo de 12 semanas está en NGX HYBRID.
              </Text>

              <Section className="my-6 border border-neutral-700 rounded-xl overflow-hidden">
                {[1, 2, 3].map((day) => (
                  <Section
                    key={day}
                    className={`p-4 ${day < 3 ? "border-b border-neutral-700" : ""}`}
                  >
                    <Text className="text-violet-400 text-xs font-semibold m-0 mb-1">DÍA {day}</Text>
                    <Text className="text-white text-sm m-0">
                      {day === 1 && "Evaluación y primer entrenamiento"}
                      {day === 2 && "Hábitos fundamentales"}
                      {day === 3 && "Intensidad progresiva"}
                    </Text>
                  </Section>
                ))}
                <Section className="p-4 bg-neutral-800/50">
                  <Text className="text-neutral-500 text-xs m-0 text-center">
                    + 4 días más de entrenamiento y hábitos personalizados
                  </Text>
                </Section>
              </Section>

              <Section className="text-center my-8">
                <Button
                  href={planUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver plan completo
                </Button>
              </Section>

              <Section className="text-center my-5">
                <Button
                  href={offerUrl}
                  className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver sistema HYBRID de 12 semanas
                </Button>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              <Text className="text-sm text-neutral-500 text-center">
                ¿Aún no revisas todo? <a href={resultsUrl} className="text-violet-300">Volver a resultados</a>
              </Text>
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
