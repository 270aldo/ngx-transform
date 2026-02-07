import * as React from "react";
import { Html, Head, Body, Container, Section, Text, Button, Tailwind, Img } from "@react-email/components";

export default function ResultsEmail({ url }: { url: string }) {
  let origin = "https://transform.ngxgenesis.com";
  let unsubscribeUrl = "";
  try {
    const parsed = new URL(url);
    origin = parsed.origin;
    const parts = parsed.pathname.split("/");
    const shareId = parts.length >= 3 ? parts[2] : "";
    if (shareId) {
      unsubscribeUrl = `${parsed.origin}/unsubscribe?shareId=${shareId}`;
    }
  } catch {
    // ignore malformed URL
  }
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-neutral-950 text-neutral-100">
          <Container className="mx-auto my-6 p-6 bg-neutral-900 border border-neutral-800 rounded">
            <Section>
              <Img src={`${origin}/images/brand/logo.svg`} alt="NGX Genesis" width="140" className="mx-auto mb-4" />
              <Text className="text-xl font-semibold text-white">Tus resultados NGX</Text>
              <Text className="text-neutral-300">Tu enlace privado a los resultados:</Text>
              <Section className="my-4">
                <Button href={url} className="bg-emerald-500 text-black px-4 py-2 rounded font-semibold">
                  Ver resultados
                </Button>
              </Section>
              <Text className="text-xs text-neutral-500">
                No es consejo médico. Si no solicitaste esto, ignora este correo.
                {unsubscribeUrl ? (
                  <>
                    {" "}
                    <a href={unsubscribeUrl} className="underline text-neutral-400">Darme de baja</a>
                  </>
                ) : null}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
