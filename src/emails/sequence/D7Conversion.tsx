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
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const offerUrl = `${baseUrl}/s/${shareId}?section=offer`;
  const coachUrl =
    bookingUrl ||
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "https://calendly.com/ngx-genesis";
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  return (
    <Html>
      <Head />
      <Preview>Tu plaza en la próxima cohorte está abierta</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
              <Text className="text-sm text-neutral-400 m-0">Secuencia HYBRID</Text>
            </Section>

            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}tu plaza en la próxima cohorte está abierta.
              </Text>

              <Text className="text-neutral-300 leading-relaxed">
                Tu transformación visual ya te mostró el potencial. Ahora toca ejecutar con un sistema real de 12 semanas.
              </Text>

              <Section className="my-6 border border-violet-500/35 rounded-xl p-5 bg-violet-900/10">
                <Text className="text-violet-300 text-xs uppercase tracking-widest font-semibold m-0 mb-3">
                  NGX HYBRID
                </Text>
                <Text className="text-neutral-200 text-sm m-0 mb-2">• Sistema GENESIS que adapta tu plan cada semana</Text>
                <Text className="text-neutral-200 text-sm m-0 mb-2">• Coach humano para validar ejecución y adherencia</Text>
                <Text className="text-neutral-200 text-sm m-0 mb-2">• 3 fases progresivas con checkpoints semanales</Text>
                <Text className="text-neutral-200 text-sm m-0">• Tracking de fuerza, energía y progreso medible</Text>
              </Section>

              <Section className="my-6 border border-white/10 rounded-xl p-5 bg-neutral-800/50">
                <Text className="text-white font-semibold m-0 mb-2">Bonus incluido</Text>
                <Text className="text-neutral-300 text-sm m-0">Ebook Conversacional GENESIS</Text>
                <Text className="text-neutral-500 text-xs m-0 mt-1">Valor: $197 • Incluido en tu cohorte</Text>
              </Section>

              <Section className="my-6 border border-emerald-500/25 rounded-xl p-5 bg-emerald-500/5">
                <Text className="text-emerald-300 text-sm font-semibold m-0 mb-1">Garantía de progreso</Text>
                <Text className="text-neutral-300 text-sm m-0">Progreso medible en 30 días o +4 semanas sin costo.</Text>
              </Section>

              <Section className="text-center my-8">
                <Button
                  href={offerUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Aplicar a NGX HYBRID
                </Button>
              </Section>

              <Section className="text-center my-5">
                <Button
                  href={coachUrl}
                  className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Agendar llamada con un coach
                </Button>
              </Section>

              <Section className="text-center mt-4">
                <Text className="text-xs text-neutral-500 m-0">Garantía de progreso • Coach humano incluido • Cancela cuando quieras</Text>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              <Text className="text-neutral-500 text-sm">
                Si no deseas continuar, puedes ignorar este mensaje. Si quieres ejecutar tu transformación, entra aquí: {" "}
                <a href={offerUrl} className="text-violet-300">ver oferta HYBRID</a>.
              </Text>
            </Section>

            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                NGX Transform | Funnel HYBRID-only
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
