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
} from "@react-email/components";

interface D3PlanProps {
  name?: string;
  shareId: string;
}

export default function D3Plan({ name, shareId }: D3PlanProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://transform.ngxgenesis.com";
  const planUrl = `${baseUrl}/plan/${shareId}`;
  const resultsUrl = `${baseUrl}/s/${shareId}`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;

  return (
    <Html>
      <Head />
      <Preview>Tu plan personalizado de 7 días está listo 📋</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            {/* Header */}
            <Section className="text-center mb-8">
              <Text className="text-2xl font-bold text-white m-0">
                NGX TRANSFORM
              </Text>
            </Section>

            {/* Main Card */}
            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              {/* Greeting */}
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}tu plan de acción está listo.
              </Text>

              {/* Message */}
              <Text className="text-neutral-300 leading-relaxed">
                Viste tu potencial. Ahora es momento de empezar a construirlo.
              </Text>

              <Text className="text-neutral-300 leading-relaxed mt-4">
                Hemos generado un plan de 7 días diseñado específicamente para
                tu perfil y objetivos. No es un plan genérico - está basado en
                tu análisis.
              </Text>

              {/* Plan preview */}
              <Section className="my-6 border border-neutral-700 rounded-xl overflow-hidden">
                {/* Day preview cards */}
                {[1, 2, 3].map((day) => (
                  <Section
                    key={day}
                    className={`p-4 ${
                      day < 3 ? "border-b border-neutral-700" : ""
                    }`}
                  >
                    <Text className="text-violet-400 text-xs font-semibold m-0 mb-1">
                      DÍA {day}
                    </Text>
                    <Text className="text-white text-sm m-0">
                      {day === 1 && "Evaluación y primer entrenamiento"}
                      {day === 2 && "Hábitos fundamentales"}
                      {day === 3 && "Intensidad progresiva"}
                    </Text>
                  </Section>
                ))}
                <Section className="p-4 bg-neutral-800/50">
                  <Text className="text-neutral-500 text-xs m-0 text-center">
                    + 4 días más de entrenamiento y hábitos
                  </Text>
                </Section>
              </Section>

              {/* What's included */}
              <Text className="text-white font-semibold mb-2">
                Cada día incluye:
              </Text>
              <ul className="text-sm text-neutral-400 pl-4 m-0">
                <li className="mb-2">💪 Rutina de entrenamiento detallada</li>
                <li className="mb-2">🥗 Guía de nutrición</li>
                <li className="mb-2">🧘 Hábito del día</li>
                <li>🎯 Tip de mentalidad</li>
              </ul>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={planUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver plan completo
                </Button>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              {/* Secondary CTA */}
              <Text className="text-sm text-neutral-500 text-center">
                ¿Aún no has visto tu transformación?{" "}
                <a href={resultsUrl} className="text-violet-400">
                  Ver resultados
                </a>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                NGX Transform | El primer paso hacia tu mejor versión
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
