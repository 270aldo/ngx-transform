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

interface D7ConversionProps {
  name?: string;
  shareId: string;
  bookingUrl?: string;
}

export default function D7Conversion({
  name,
  shareId,
  bookingUrl,
}: D7ConversionProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://transform.ngxgenesis.com";
  const resultsUrl = `${baseUrl}/s/${shareId}`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;
  const ctaUrl =
    bookingUrl || process.env.NEXT_PUBLIC_BOOKING_URL || "https://ngxgenesis.com";

  return (
    <Html>
      <Head />
      <Preview>¿Listo para hacer esto real? 🚀</Preview>
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
                {name ? `${name}, ` : ""}una semana después...
              </Text>

              {/* Message */}
              <Text className="text-neutral-300 leading-relaxed">
                Hace 7 días viste tu potencial. Viste cómo podrías verte en 12
                meses si te comprometes con el proceso.
              </Text>

              <Text className="text-neutral-300 leading-relaxed mt-4">
                La pregunta es: ¿qué has hecho desde entonces?
              </Text>

              {/* Stats box */}
              <Section className="my-6 bg-gradient-to-r from-violet-900/20 to-transparent border border-violet-500/30 rounded-xl p-6">
                <Text className="text-violet-400 text-sm font-semibold m-0 mb-2">
                  TU PROYECCIÓN
                </Text>
                <Text className="text-2xl text-white font-bold m-0 mb-2">
                  12 meses para transformarte
                </Text>
                <Text className="text-neutral-400 text-sm m-0">
                  Pero solo si empiezas hoy.
                </Text>
              </Section>

              {/* The offer - v11.0: Capacidades de GENESIS */}
              <Text className="text-white font-semibold mb-4">
                GENESIS te ofrece:
              </Text>

              <Section className="space-y-3">
                {[
                  {
                    icon: "🔥",
                    title: "Entrenamiento de Precisión",
                    desc: "Optimización de carga y volumen en tiempo real",
                  },
                  {
                    icon: "🥗",
                    title: "Estrategia Nutricional",
                    desc: "Timing de nutrientes para salud muscular",
                  },
                  {
                    icon: "⚡",
                    title: "Biohacking y Recuperación",
                    desc: "Monitoreo de HRV y ciclos de sueño",
                  },
                  {
                    icon: "🧠",
                    title: "Arquitectura de Hábitos",
                    desc: "Sistemas de consistencia 24/7",
                  },
                ].map((capability, i) => (
                  <Section
                    key={i}
                    className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg"
                  >
                    <Text className="text-2xl m-0">{capability.icon}</Text>
                    <div>
                      <Text className="text-white font-semibold text-sm m-0">
                        {capability.title}
                      </Text>
                      <Text className="text-neutral-500 text-xs m-0">
                        {capability.desc}
                      </Text>
                    </div>
                  </Section>
                ))}
              </Section>

              <Text className="text-neutral-400 text-sm mt-4">
                Un sistema unificado de Performance & Longevity para tu
                transformación completa.
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={ctaUrl}
                  className="bg-gradient-to-r from-[#FF6B35] to-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Conocer NGX ASCEND
                </Button>
              </Section>

              {/* Trust badges */}
              <Section className="flex justify-center gap-6 text-xs text-neutral-500">
                <span>✓ Sin tarjeta requerida</span>
                <span>✓ Cancela cuando quieras</span>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              {/* Closing */}
              <Text className="text-neutral-500 text-sm">
                Tu transformación{" "}
                <a href={resultsUrl} className="text-violet-400">
                  sigue disponible
                </a>
                . Pero recuerda: ver tu potencial no es lo mismo que
                alcanzarlo.
              </Text>

              <Text className="text-white text-sm mt-4 italic">
                &ldquo;El mejor momento para empezar era hace 7 días. El segundo
                mejor momento es ahora.&rdquo;
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                NGX Transform | De la visualización a la realización
              </Text>
              <Text className="text-xs text-neutral-700 mt-2">
                Si no deseas recibir más emails de esta secuencia, simplemente
                responde con &ldquo;UNSUBSCRIBE&rdquo; o
                {" "}
                <a href={unsubscribeUrl} className="underline text-neutral-400">
                  da clic aquí
                </a>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
