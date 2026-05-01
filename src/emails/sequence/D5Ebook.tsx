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

interface D5EbookProps {
  name?: string;
  shareId: string;
}

export default function D5Ebook({ name, shareId }: D5EbookProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const ebookUrl = `${baseUrl}/s/${shareId}/plan`;
  const offerUrl = `${baseUrl}/s/${shareId}?section=offer`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?shareId=${shareId}`;
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  return (
    <Html>
      <Head />
      <Preview>GENESIS escribió esto para ti</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
              <Text className="text-sm text-neutral-500 m-0">Día 5 • Bonus GENESIS</Text>
            </Section>

            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}GENESIS escribió esto para ti.
              </Text>

              <Text className="text-neutral-300 leading-relaxed">
                Hace 5 días viste quién puedes ser en 12 meses.
              </Text>
              <Text className="text-neutral-300 leading-relaxed mt-3">
                GENESIS analizó tus datos y creó un ebook personalizado sobre tu transformación.
                Es tuyo, sin costo: es parte de lo que recibes con NGX HYBRID.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={ebookUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Leer mi ebook
                </Button>
              </Section>

              <Section className="my-5 text-center">
                <Button
                  href={offerUrl}
                  className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver NGX HYBRID
                </Button>
              </Section>

              <Text className="text-xs text-neutral-500 mt-6 text-center">
                Si ya decidiste avanzar con HYBRID, este material te ayudará a empezar con claridad.
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
