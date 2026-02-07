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

interface D14FinalProps {
  name?: string;
  shareId: string;
  closeDateLabel?: string;
  waitlistUrl?: string;
}

export default function D14Final({
  name,
  shareId,
  closeDateLabel,
  waitlistUrl,
}: D14FinalProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const offerUrl = `${baseUrl}/s/${shareId}?section=offer`;
  const waitlist = waitlistUrl || process.env.NEXT_PUBLIC_WAITLIST_URL || `${baseUrl}/wizard`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  const closeLabel = closeDateLabel || "esta semana";

  return (
    <Html>
      <Head />
      <Preview>Última oportunidad: {closeLabel}</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
              <Text className="text-sm text-neutral-500 m-0">Día 14 • Cierre de cohorte</Text>
            </Section>

            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}última oportunidad: {closeLabel}.
              </Text>

              <Text className="text-neutral-300 leading-relaxed">
                La cohorte HYBRID cierra en los próximos días.
              </Text>
              <Text className="text-neutral-300 leading-relaxed mt-3">
                Si ya no te interesa, no volveremos a escribirte sobre esta apertura.
                Si sí te interesa, este es el último mensaje de esta secuencia.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={offerUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Aplicar ahora
                </Button>
              </Section>

              <Section className="my-5 text-center">
                <Button
                  href={waitlist}
                  className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Unirme a lista de espera
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
