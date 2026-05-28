# Next Session Brief: Visual Refinement, User Experience, and Lead Magnet Value

Fecha: 2026-05-25

Estado del proyecto: desarrollo. La lista formal de pendientes de producción/legal/comercial vive en `docs/PRODUCTION_LAUNCH_AUDIT_2026-05-25.md`. Este documento guarda memoria del siguiente bloque de trabajo: refinamiento visual final, prueba de funcionamiento y rediseño de la experiencia que recibe el usuario.

## Objetivo de la próxima sesión

Cerrar la experiencia de NGX Transform como lead magnet premium:

- Debe emocionar al usuario.
- Debe entregar valor real antes de pedir conversión.
- Debe capturar lead con fricción mínima y confianza suficiente.
- Debe hacer que el resultado sea compartible sin exponer información sensible por accidente.
- Debe conectar naturalmente con NGX HYBRID como el siguiente paso comercial.

## Principio central

NGX Transform no debe sentirse como una app genérica de fitness ni como un simple generador de before/after. Debe sentirse como una experiencia cinematográfica y personalizada que le muestra al usuario:

1. Donde está hoy.
2. Qué potencial visible puede alcanzar.
3. Qué lo está frenando.
4. Qué puede hacer en los próximos 7 días.
5. Cómo NGX HYBRID puede convertir esa visión en ejecución real.

## Arco emocional recomendado

1. Curiosidad: "Quiero ver mi transformación".
2. Confianza: "Puedo subir mi foto y entiendo qué se comparte".
3. Anticipación: "El sistema está analizando algo personal, no un formulario genérico".
4. Impacto: "Este resultado se siente como yo, pero con una versión posible de mí".
5. Valor: "Me llevo insights y acciones concretas, aunque no compre hoy".
6. Identidad: "Quiero guardar o compartir esto".
7. Conversión: "Si quiero lograrlo de verdad, NGX HYBRID es el siguiente paso lógico".

## Rediseño de lo que se entrega al usuario

Replantear el resultado como un "Transformation Report" o "Vision Report", no solo como una galería de imágenes. El entregable ideal debe incluir:

- Hero visual con la línea temporal HOY, MES 4, MES 8, MES 12.
- Diagnóstico breve: 3 hallazgos personalizados sobre cuerpo, hábitos y recuperación.
- Principal cuello de botella: una frase clara sobre el factor que más limita el progreso.
- Plan de arranque: Día 1 completo y accionable.
- Roadmap de 7 días: días 2-7 bloqueados o resumidos, con suficiente valor visible para generar deseo.
- Share pack: versión compartible que no incluya PII ni detalles sensibles por defecto.
- CTA comercial: NGX HYBRID como ejecución continua, no como paywall agresivo.

## Foco por pantalla

### Landing

- Promesa directa y visual: transformación personalizada con foto real.
- Mostrar el producto desde el primer viewport, no solo texto aspiracional.
- CTA único y dominante hacia el wizard.
- Prueba social o contador si está activo, pero sin distraer.
- Explicar privacidad en una línea clara cerca del momento de subida de foto, no con bloque legal largo.

### Wizard

- Reducir sensación de formulario.
- Cada paso debe sentirse como parte de un escaneo personal.
- El email capture debe explicar el beneficio: guardar resultado, enviar reporte, recuperar enlace.
- El paso de foto debe comunicar claramente:
  - qué se usa,
  - qué se comparte,
  - cómo se puede borrar,
  - que no hay resultado médico ni garantía física.
- Evitar preguntas que parezcan invasivas sin razón visible.

### Loading / Processing

- Convertir la espera en parte del valor.
- Mostrar etapas que correspondan al resultado final: perfil, foto, hábitos, roadmap, reporte.
- Evitar mensajes falsamente clínicos o demasiado médicos.
- Mantenerlo cinematográfico, pero creíble.

### Results

- La primera pantalla debe dar impacto visual inmediato.
- El usuario debe entender rápido qué está viendo y cómo navegar.
- Antes del CTA, debe haber valor concreto:
  - insight personalizado,
  - estadística o delta,
  - recomendación accionable,
  - mini plan.
- La versión pública debe respetar share scope: no exponer original, perfil o insights sensibles si el usuario no lo permite.

### Plan Preview

- Día 1 debe ser realmente usable.
- Días bloqueados deben mostrar estructura y valor, no solo blur decorativo.
- Comparación "sin GENESIS / con GENESIS" debe vender claridad y acompañamiento, no promesas irreales.

### Offer / CTA

- La conversión debe sentirse como continuidad natural:
  - "Ya viste la visión. Ahora ejecutémosla contigo."
- Definir una ruta comercial primaria:
  - booking,
  - WhatsApp,
  - checkout,
  - o waitlist.
- No mezclar demasiados CTAs al mismo nivel.

## Dirección visual recomendada

- Premium, cinematográfica y emocional, pero usable.
- Imagen y resultado como protagonistas; menos paneles decorativos.
- Mobile-first para resultados y share.
- Contraste fuerte, tipografía contenida en componentes compactos.
- Evitar que todo se sienta como una sola paleta morada; usar color por función:
  - violeta para GENESIS / marca,
  - verde para nutrición / avance,
  - naranja para entrenamiento / energía,
  - azul para recuperación / claridad.
- No usar claims médicos, diagnósticos clínicos ni promesas garantizadas.
- Mantener disclaimer breve y visible: proyección generada por IA para motivación y planificación, no resultado garantizado.

## Prueba funcional recomendada

Ejecutar una prueba completa de experiencia:

1. Landing en desktop y mobile.
2. Wizard completo con foto.
3. Creación de sesión.
4. Análisis con Gemini o modo mock controlado si las keys no están listas.
5. Generación o carga de imágenes.
6. Página de resultados como owner.
7. Página pública como visitante.
8. Share scope: original, insights y profile data.
9. Delete token.
10. Email de resultados y unsubscribe si Resend está configurado.
11. Booking / WhatsApp / checkout según la ruta comercial activa.
12. Health endpoint, cron cleanup y logs de errores.

## Decisiones que necesita el owner

No inventar estos datos. Marcar como `NECESITA_DATO_DEL_OWNER` si faltan:

- Nombre legal exacto de la entidad.
- Domicilio legal o jurisdicción aplicable.
- Email legal / privacidad / soporte.
- Política final de retención de fotos y resultados.
- Ruta comercial principal: booking, WhatsApp, checkout o waitlist.
- URLs finales de booking, WhatsApp, soporte y NGX HYBRID.
- Nivel permitido de exposición pública de la foto original.
- Copy final de promesa comercial.
- Disclaimer legal final revisado por abogado.

## Plan recomendado para la próxima sesión

1. Auditoría UX rápida de pantallas actuales.
2. Definir la experiencia objetivo por etapas.
3. Crear conceptos visuales para:
   - landing first viewport,
   - wizard foto/consentimiento,
   - loading,
   - results report,
   - plan preview,
   - offer CTA,
   - mobile results/share.
4. Elegir dirección visual.
5. Implementar cambios de alto impacto primero.
6. Ejecutar prueba funcional completa.
7. Registrar delta final contra `docs/RELEASE_CHECKLIST.md` y `docs/PRODUCTION_LAUNCH_AUDIT_2026-05-25.md`.

## Qué evitar

- Empezar con polish visual suelto sin revisar el arco completo.
- Agregar features nuevas antes de simplificar la experiencia.
- Esconder todo el valor detrás del CTA.
- Convertir el resultado en un dashboard frío.
- Usar lenguaje de diagnóstico médico o promesas garantizadas.
- Exponer foto original o datos sensibles como parte del share viral por defecto sin consentimiento claro.
- Multiplicar CTAs comerciales equivalentes sin prioridad.

