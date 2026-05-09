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
import { buildUnsubscribeUrl } from "@/lib/unsubscribeToken";

interface D1ReminderProps {
  name?: string;
  shareId: string;
}

export default function D1Reminder({ name, shareId }: D1ReminderProps) {
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
      <Preview>¿Ya viste tu transformación completa? 👀</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A] text-neutral-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl">
            {/* Header */}
            <Section className="text-center mb-8">
              <Img src={logoUrl} alt="NGX Genesis" width="140" className="mx-auto mb-3" />
            </Section>

            {/* Main Card */}
            <Section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              {/* Greeting */}
              <Text className="text-xl text-white mb-4">
                {name ? `Hey ${name},` : "Hey,"}
              </Text>

              {/* Message */}
              <Text className="text-neutral-300 leading-relaxed">
                Tu transformación sigue esperándote.
              </Text>

              <Text className="text-neutral-300 leading-relaxed mt-4">
                Ayer generamos tu proyección de 12 semanas basada en tu perfil
                único. Si aún no la has explorado completamente, hay mucho más
                que ver:
              </Text>

              {/* Features list */}
              <Section className="my-6 bg-neutral-800/50 rounded-xl p-4">
                <Text className="text-white font-semibold mb-2">
                  Lo que te espera:
                </Text>
                <ul className="text-sm text-neutral-400 pl-4 m-0">
                  <li className="mb-2">
                    Análisis detallado de tu potencial físico
                  </li>
                  <li className="mb-2">
                    Evaluación de tu estado mental y recomendaciones
                  </li>
                  <li className="mb-2">
                    Timeline interactivo mes a mes
                  </li>
                  <li>
                    Vista previa de tu plan de entrenamiento
                  </li>
                </ul>
              </Section>

              {/* Quote */}
              <Text className="text-neutral-500 italic border-l-2 border-violet-500 pl-4 my-6">
                &ldquo;El potencial sin acción es solo fantasía. La transformación
                real comienza cuando decides dar el primer paso.&rdquo;
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={resultsUrl}
                  className="bg-[#6D00FF] text-white px-8 py-4 rounded-xl font-semibold text-base"
                >
                  Ver análisis completo
                </Button>
              </Section>

              <Hr className="border-neutral-800 my-6" />

              {/* PS */}
              <Text className="text-sm text-neutral-500">
                PD: Tu link es privado y solo tú puedes acceder. No caduca.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
              <Text className="text-xs text-neutral-600">
                NGX Transform | Tu potencial visualizado
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
