import { Metadata } from "next";
import Link from "next/link";

const UPDATED_AT = "2 de febrero de 2026";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

// TODO: Reemplazar con datos reales antes de lanzamiento
const RESPONSABLE_NOMBRE = "[NOMBRE COMPLETO DEL RESPONSABLE]";
const RESPONSABLE_DOMICILIO = "[DOMICILIO DEL RESPONSABLE]";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | NGX Transform",
  description:
    "Aviso de privacidad integral de NGX Transform conforme a la LFPDPPP.",
};

export default function PrivacyPage() {
  const contacto = SUPPORT_EMAIL ? (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#6D00FF] underline">
      {SUPPORT_EMAIL}
    </a>
  ) : (
    <span className="text-neutral-400">
      el canal de contacto publicado en el sitio
    </span>
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">
            NGX Transform
          </p>
          <h1 className="text-3xl font-semibold">
            Aviso de Privacidad Integral
          </h1>
          <p className="text-sm text-neutral-400">
            Última actualización: {UPDATED_AT}
          </p>
        </header>

        {/* ── I. Identidad del responsable ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            I. Identidad del responsable
          </h2>
          <p className="text-sm text-neutral-300">
            {RESPONSABLE_NOMBRE}, con domicilio en {RESPONSABLE_DOMICILIO},
            es responsable del tratamiento de tus datos personales a través del
            sitio web y aplicación denominados &quot;NGX Transform&quot;
            (en adelante, el &quot;Servicio&quot;).
          </p>
          <p className="text-sm text-neutral-300">
            Contacto para asuntos de privacidad: {contacto}.
          </p>
        </section>

        {/* ── II. Datos personales que recabamos ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            II. Datos personales que recabamos
          </h2>

          <h3 className="text-base font-medium text-neutral-200">
            Datos ordinarios
          </h3>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Datos de cuenta y contacto: dirección de correo electrónico e identificadores de sesión.</li>
            <li>Datos de perfil: edad, sexo, altura, peso, nivel de entrenamiento, objetivo y tiempo disponible.</li>
            <li>Contenido generado: análisis de IA, planes de entrenamiento y nutrición, y respuestas del asistente.</li>
            <li>Datos técnicos: dirección IP, tipo de navegador, eventos de uso y métricas de rendimiento.</li>
          </ul>

          <h3 className="text-base font-medium text-neutral-200">
            Datos sensibles
          </h3>
          <p className="text-sm text-neutral-300">
            Recabamos los siguientes datos que la LFPDPPP considera sensibles:
          </p>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>
              <strong>Imágenes corporales:</strong> fotografías del cuerpo que
              constituyen datos biométricos y pueden revelar información sobre tu
              estado de salud.
            </li>
            <li>
              <strong>Indicadores de bienestar:</strong> nivel de estrés
              autopercibido, calidad de sueño y autodisciplina, que pueden
              reflejar condiciones relacionadas con la salud.
            </li>
            <li>
              <strong>Tipo de cuerpo y zona de enfoque:</strong> somatotipo y
              áreas corporales de interés que, combinados con otros datos,
              pueden considerarse datos de salud.
            </li>
          </ul>
          <p className="text-sm text-neutral-300">
            Al marcar la casilla de consentimiento y utilizar el Servicio,
            otorgas tu <strong>consentimiento expreso</strong> para el
            tratamiento de estos datos sensibles conforme a las finalidades
            descritas en el presente aviso.
          </p>
        </section>

        {/* ── III. Finalidades del tratamiento ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            III. Finalidades del tratamiento
          </h2>

          <h3 className="text-base font-medium text-neutral-200">
            Finalidades primarias (necesarias)
          </h3>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Crear tu cuenta y autenticar tu identidad.</li>
            <li>Generar análisis biométricos, proyecciones de transformación e imágenes personalizadas.</li>
            <li>Crear y entregar tu plan personalizado de 7 días (entrenamiento, nutrición, hábitos).</li>
            <li>Operar el asistente GENESIS y sus capacidades de IA.</li>
            <li>Garantizar la seguridad del Servicio: prevención de abuso, fraude y cumplimiento de límites de uso.</li>
          </ul>

          <h3 className="text-base font-medium text-neutral-200">
            Finalidades secundarias (no necesarias)
          </h3>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Envío de comunicaciones de marketing, recordatorios y secuencias de email nurture.</li>
            <li>Remarketing y análisis de conversión.</li>
            <li>Estadísticas agregadas y mejora del Servicio.</li>
          </ul>
          <p className="text-sm text-neutral-300">
            Si no deseas que tus datos sean tratados para las finalidades
            secundarias, puedes manifestarlo enviando un correo a {contacto} con
            el asunto &quot;Finalidades secundarias&quot;, o utilizando el
            enlace de baja incluido en nuestras comunicaciones. La negativa para
            el tratamiento con fines secundarios no afectará la prestación del
            Servicio.
          </p>
        </section>

        {/* ── IV. Transferencias de datos ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            IV. Transferencias de datos
          </h2>
          <p className="text-sm text-neutral-300">
            Para cumplir con las finalidades descritas, tus datos pueden ser
            transferidos a los siguientes terceros:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-neutral-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 font-medium text-neutral-200">Destinatario</th>
                  <th className="py-2 pr-4 font-medium text-neutral-200">Finalidad</th>
                  <th className="py-2 font-medium text-neutral-200">País</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-2 pr-4">Google LLC (Firebase, Gemini)</td>
                  <td className="py-2 pr-4">Almacenamiento, autenticación y procesamiento de IA</td>
                  <td className="py-2">Estados Unidos</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Resend Inc.</td>
                  <td className="py-2 pr-4">Envío de correos transaccionales y de marketing</td>
                  <td className="py-2">Estados Unidos</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">ElevenLabs Inc.</td>
                  <td className="py-2 pr-4">Generación de voz para el asistente GENESIS</td>
                  <td className="py-2">Estados Unidos</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Upstash Inc.</td>
                  <td className="py-2 pr-4">Control de límites de uso (rate limiting)</td>
                  <td className="py-2">Estados Unidos</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Vercel Inc.</td>
                  <td className="py-2 pr-4">Hosting y distribución del Servicio</td>
                  <td className="py-2">Estados Unidos</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-300">
            Estas transferencias se realizan al amparo del artículo 37 de la
            LFPDPPP por ser necesarias para la ejecución del Servicio que
            solicitas. No vendemos ni comercializamos tus datos personales.
          </p>
        </section>

        {/* ── V. Derechos ARCO ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            V. Derechos ARCO
          </h2>
          <p className="text-sm text-neutral-300">
            Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al
            tratamiento de tus datos personales (derechos ARCO), así como a
            revocar tu consentimiento en cualquier momento.
          </p>

          <h3 className="text-base font-medium text-neutral-200">
            Procedimiento
          </h3>
          <ol className="space-y-2 text-sm text-neutral-300 list-decimal list-inside">
            <li>
              Envía tu solicitud a {contacto} con el asunto
              &quot;Derechos ARCO&quot;.
            </li>
            <li>
              Incluye: tu nombre completo, correo electrónico asociado a tu
              cuenta, descripción del derecho que deseas ejercer, y en su caso
              los documentos que acrediten tu identidad.
            </li>
            <li>
              Responderemos en un plazo máximo de <strong>20 días hábiles</strong> contados
              a partir de la recepción de tu solicitud completa.
            </li>
            <li>
              Si tu solicitud es procedente, la haremos efectiva dentro de los
              <strong> 15 días hábiles</strong> siguientes a la fecha en que se
              comunique la respuesta.
            </li>
          </ol>
          <p className="text-sm text-neutral-300">
            También puedes darte de baja de comunicaciones de marketing en
            cualquier momento mediante el enlace de &quot;Cancelar
            suscripción&quot; incluido en cada correo, o visitando la
            página{" "}
            <Link href="/unsubscribe" className="text-[#6D00FF] underline">
              /unsubscribe
            </Link>
            .
          </p>
        </section>

        {/* ── VI. Revocación del consentimiento ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            VI. Revocación del consentimiento
          </h2>
          <p className="text-sm text-neutral-300">
            Puedes revocar tu consentimiento para el tratamiento de tus datos
            en cualquier momento, sin efecto retroactivo. Para ello, envía un
            correo a {contacto} con el asunto &quot;Revocación de
            consentimiento&quot; indicando tu nombre y correo electrónico
            asociado a tu cuenta. La revocación puede implicar la
            imposibilidad de continuar prestándote el Servicio.
          </p>
        </section>

        {/* ── VII. Medidas de seguridad ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            VII. Medidas de seguridad
          </h2>
          <p className="text-sm text-neutral-300">
            Implementamos medidas de seguridad administrativas, técnicas y
            físicas para proteger tus datos contra daño, pérdida, alteración,
            destrucción, acceso o tratamiento no autorizado, incluyendo:
          </p>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Control de acceso basado en autenticación y tokens seguros.</li>
            <li>Cifrado en tránsito (HTTPS/TLS) y URLs firmadas con expiración.</li>
            <li>Límites de uso por IP y cuenta para prevenir abuso.</li>
            <li>Reglas de almacenamiento que restringen acceso a datos solo al propietario.</li>
            <li>Política de seguridad de contenido (CSP) y encabezados de protección.</li>
          </ul>
          <p className="text-sm text-neutral-300">
            Ningún sistema es 100% seguro. Si detectamos una vulneración de
            seguridad que afecte tus datos, te lo notificaremos conforme a la
            legislación aplicable.
          </p>
        </section>

        {/* ── VIII. Cookies y tecnologías similares ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            VIII. Cookies y tecnologías similares
          </h2>
          <p className="text-sm text-neutral-300">
            Utilizamos cookies y almacenamiento local del navegador para:
          </p>
          <ul className="space-y-2 text-sm text-neutral-300 list-disc list-inside">
            <li>Autenticación y mantenimiento de sesión.</li>
            <li>Preferencias del usuario.</li>
            <li>Métricas de rendimiento y análisis de uso.</li>
          </ul>
          <p className="text-sm text-neutral-300">
            Puedes desactivar las cookies desde la configuración de tu navegador.
            Ten en cuenta que esto puede afectar el funcionamiento del Servicio.
          </p>
        </section>

        {/* ── IX. Conservación de datos ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            IX. Conservación de datos
          </h2>
          <p className="text-sm text-neutral-300">
            Conservamos tus datos personales conforme a los siguientes plazos:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-neutral-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 font-medium text-neutral-200">Dato</th>
                  <th className="py-2 font-medium text-neutral-200">Plazo de conservación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-2 pr-4">Fotografía original</td>
                  <td className="py-2">30 días desde la generación de resultados</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Imágenes generadas por IA</td>
                  <td className="py-2">12 meses o hasta solicitud de eliminación</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Correo electrónico</td>
                  <td className="py-2">Hasta cancelación de suscripción + 30 días</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Datos de perfil (biométricos, objetivos)</td>
                  <td className="py-2">12 meses o hasta solicitud de eliminación</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Indicadores de bienestar (estrés, sueño, disciplina)</td>
                  <td className="py-2">90 días</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Página de resultados compartible</td>
                  <td className="py-2">12 meses</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-300">
            Una vez cumplidos estos plazos, procederemos a la supresión,
            bloqueo o disociación de los datos conforme a la legislación
            aplicable.
          </p>
        </section>

        {/* ── X. Uso del Servicio por menores ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            X. Uso del Servicio por menores
          </h2>
          <p className="text-sm text-neutral-300">
            El Servicio no está dirigido a menores de 18 años. No recabamos
            intencionalmente datos de menores. Si eres padre o tutor y
            consideras que un menor nos ha proporcionado datos personales,
            contáctanos a {contacto} para que procedamos a su eliminación.
          </p>
        </section>

        {/* ── XI. Modificaciones al aviso ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            XI. Modificaciones al aviso de privacidad
          </h2>
          <p className="text-sm text-neutral-300">
            Nos reservamos el derecho de modificar este aviso de privacidad para
            adaptarlo a cambios legislativos, jurisprudenciales, políticas
            internas o nuevas necesidades del Servicio. Cualquier modificación
            será publicada en esta página con la fecha de última actualización.
            Te recomendamos revisarlo periódicamente.
          </p>
        </section>

        {/* ── XII. Autoridad ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            XII. Autoridad competente
          </h2>
          <p className="text-sm text-neutral-300">
            Si consideras que tu derecho a la protección de datos personales ha
            sido vulnerado, puedes acudir al Instituto Nacional de Transparencia,
            Acceso a la Información y Protección de Datos Personales (INAI):{" "}
            <a
              href="https://home.inai.org.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6D00FF] underline"
            >
              www.inai.org.mx
            </a>
            .
          </p>
        </section>

        <footer className="pt-6 border-t border-white/10 text-sm text-neutral-400">
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-white">
              Volver al inicio
            </Link>
            <Link href="/terms" className="hover:text-white">
              Términos de Servicio
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
