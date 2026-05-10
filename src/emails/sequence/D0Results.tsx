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

interface D0ResultsProps {
  name?: string;
  shareId: string;
  m0ImageUrl?: string;
  m12ImageUrl?: string;
}

export default function D0Results({
  name,
  shareId,
  m0ImageUrl,
  m12ImageUrl,
}: D0ResultsProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";
  const resultsUrl = `${baseUrl}/s/${shareId}`;
  const unsubscribeUrl = buildUnsubscribeUrl(baseUrl, shareId);
  const logoUrl = `${baseUrl}/images/brand/logo.svg`;

  return (
    <Html>
      <Head />
      <Preview>Tu Season Vision Report está listo</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            {/* Header */}
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
              <Text className="text-sm text-neutral-500 m-0">
                Tu Season Vision Report
              </Text>
            </Section>

            {/* Main Card */}
            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              {/* Greeting */}
              <Text className="text-xl text-white mb-4">
                {name ? `${name}, ` : ""}tu transformación está lista.
              </Text>

              {/* Before/After Preview */}
              {m0ImageUrl && m12ImageUrl && (
                <Section className="my-6">
                  <table className="w-full" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td className="w-1/2 pr-2">
                        <Img
                          src={m0ImageUrl}
                          alt="Punto de partida"
                          className="rounded-lg w-full"
                        />
                        <Text className="text-center text-xs text-neutral-500 mt-2">
                          Punto de partida
                        </Text>
                      </td>
                      <td className="w-1/2 pl-2">
                        <Img
                          src={m12ImageUrl}
                          alt="Season 3"
                          className="rounded-lg w-full"
                        />
                        <Text className="text-center text-xs text-neutral-500 mt-2">
                          Season 3
                        </Text>
                      </td>
                    </tr>
                  </table>
                </Section>
              )}

              {/* Message */}
              <Text className="text-neutral-300 leading-relaxed">
                Acabas de ver tu visión de temporada. Este no es solo un
                filtro - es una proyección basada en tu perfil, tus metas y
                la ciencia del entrenamiento.
              </Text>

              <Text className="text-neutral-300 leading-relaxed mt-4">
                ¿Listo para ver la experiencia completa?
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={resultsUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver mi transformación completa
                </Button>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              {/* Features hint */}
              <Text className="text-sm text-neutral-500">
                En tu página de resultados encontrarás:
              </Text>
              <ul className="text-sm text-neutral-400 mt-2 pl-4">
                <li>Timeline completo: Punto de partida → Season 1 → Season 2 → Season 3</li>
                <li>Análisis mental y físico</li>
                <li>Tu plan personalizado de 7 días</li>
              </ul>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                Este email fue enviado por NGX Transform.
                <br />
                Si no solicitaste esto, puedes ignorar este correo.
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
