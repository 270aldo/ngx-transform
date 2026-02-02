import { Metadata } from "next";
import Link from "next/link";

const UPDATED_AT = "2 de febrero de 2026";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export const metadata: Metadata = {
  title: "Términos de Servicio | NGX Transform",
  description: "Condiciones de uso del Servicio NGX Transform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">NGX Transform</p>
          <h1 className="text-3xl font-semibold">Términos de Servicio</h1>
          <p className="text-sm text-neutral-400">Última actualización: {UPDATED_AT}</p>
        </header>

        <section className="space-y-3 text-sm text-neutral-300">
          <p>
            Estos Términos regulan el acceso y uso de NGX Transform (“NGX”, “Servicio”). Al utilizar el Servicio aceptas
            estos Términos. Si no estás de acuerdo, no utilices el Servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Requisitos</h2>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Debes ser mayor de 18 años o contar con autorización legal.</li>
            <li>La información que compartes debe ser veraz y de tu propiedad o con permiso.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Uso del Servicio</h2>
          <p className="text-sm text-neutral-300">
            NGX ofrece proyecciones y planes generados por IA con fines informativos y motivacionales. No constituyen
            asesoría médica, nutricional ni profesional. Consulta a un especialista antes de iniciar cambios intensos en
            tu entrenamiento o dieta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Imágenes generadas por IA</h2>
          <p className="text-sm text-neutral-300">
            Las imágenes de transformación que genera el Servicio son{" "}
            <strong className="text-white">creaciones de inteligencia artificial</strong>.
            No son fotografías de resultados reales. No son predicciones de
            resultados que vayas a obtener. Son proyecciones generadas por IA
            con fines <strong className="text-white">motivacionales y de entretenimiento</strong>.
          </p>
          <p className="text-sm text-neutral-300">
            Los resultados reales dependen de genética, alimentación, constancia,
            calidad de entrenamiento y muchos otros factores individuales. Ningún
            resultado específico está garantizado ni implícito.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contenido del usuario</h2>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Conservas la titularidad de tus fotos y datos.</li>
            <li>Nos otorgas una licencia limitada para procesar tu contenido y generar resultados.</li>
            <li>No debes subir contenido ilegal, ofensivo o que viole derechos de terceros.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Uso prohibido</h2>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Intentar acceder a datos de terceros o vulnerar la seguridad.</li>
            <li>Usar el Servicio para fines ilegales o abusivos.</li>
            <li>Interferir con la disponibilidad o el rendimiento del Servicio.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Propiedad intelectual</h2>
          <p className="text-sm text-neutral-300">
            El Servicio, sus marcas, interfaces y contenido generado pertenecen a NGX o sus licenciantes. No se otorgan
            derechos adicionales fuera de los expresamente indicados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Disponibilidad</h2>
          <p className="text-sm text-neutral-300">
            Podemos modificar, suspender o descontinuar el Servicio en cualquier momento. Intentaremos avisar con
            anticipación cuando sea posible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Limitación de responsabilidad</h2>
          <p className="text-sm text-neutral-300">
            En la máxima medida permitida por la ley, NGX no será responsable por daños indirectos, incidentales o
            consecuentes derivados del uso del Servicio. El Servicio se proporciona “tal cual”.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Indemnización</h2>
          <p className="text-sm text-neutral-300">
            Te comprometes a indemnizar a NGX frente a reclamaciones relacionadas con el uso indebido del Servicio o la
            infracción de estos Términos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Ley aplicable y jurisdicción</h2>
          <p className="text-sm text-neutral-300">
            Estos Términos se rigen por las leyes aplicables de los Estados Unidos Mexicanos.
            Para cualquier controversia derivada del uso del Servicio, las partes se someten
            a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando
            a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contacto</h2>
          <p className="text-sm text-neutral-300">
            Si tienes dudas sobre estos Términos, contáctanos:
            {SUPPORT_EMAIL ? (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="ml-1 text-[#6D00FF] underline">
                {SUPPORT_EMAIL}
              </a>
            ) : (
              <span className="ml-1 text-neutral-400">usa el canal de contacto publicado en el sitio</span>
            )}
            .
          </p>
        </section>

        <footer className="pt-6 border-t border-white/10 text-sm text-neutral-400">
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-white">Volver al inicio</Link>
            <Link href="/privacy" className="hover:text-white">Política de Privacidad</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
