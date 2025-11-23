import * as React from "react";
import { Html, Head, Body, Container, Section, Text, Button, Tailwind } from "@react-email/components";

export default function ResultsEmail({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-neutral-950 text-neutral-100">
          <Container className="mx-auto my-6 p-6 bg-neutral-900 border border-neutral-800 rounded">
            <Section>
              <Text className="text-xl font-semibold text-white">Tus resultados NGX</Text>
              <Text className="text-neutral-300">Tu enlace privado a los resultados:</Text>
              <Section className="my-4">
                <Button href={url} className="bg-emerald-500 text-black px-4 py-2 rounded font-semibold">
                  Ver resultados
                </Button>
              </Section>
              <Text className="text-xs text-neutral-500">No es consejo médico. Si no solicitaste esto, ignora este correo.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
