# Plan de remediación — sprints de 1 semana, ordenados por riesgo

> Regla de oro: **no actives cobros reales antes de cerrar el Sprint 1**, y no inviertas en tráfico pagado antes de cerrar el Sprint 2. Cada item referencia su hallazgo (#NN en [02-hallazgos.md](02-hallazgos.md)) y su prompt de fix ([fixes/](fixes/)).

## Tarea 0 (hoy, 1 hora, no es código)
Verificar en el dashboard de Vercel/n8n lo que el repo no puede ver — esto decide la urgencia real de varios hallazgos marcados [NO VERIFICABLE]:
- [ ] ¿Existen en Vercel producción: `SENTRY_DSN`, `FF_NB_PRO`/`GEMINI_IMAGE_MODEL`, `RESEND_FROM_EMAIL`, `MP_ACCESS_TOKEN`/`MP_WEBHOOK_SECRET`, `CRON_API_KEY`, datos legales `NEXT_PUBLIC_LEGAL_*`?
- [ ] ¿Hay algún scheduler externo (n8n / Vercel crons en dashboard) llamando a `/api/cron/cleanup` y `/api/email/sequence`?
- [ ] ¿Qué plan de Upstash está contratado?

---

## Sprint 1 — "No cobres a ciegas" (pagos + visibilidad) 🔴
*Objetivo: que un peso cobrado siempre se entregue, se registre y se vea.*

| Item | Hallazgos | Fix | Esfuerzo |
|---|---|---|---|
| Fulfillment del pago: email de bienvenida + alerta n8n desde el webhook (incl. pending→approved) | 🔴 #53, #1014 | fix-01 | 1-3d |
| Libro de órdenes: colección `payments` append-only por paymentId + excluir sesiones pagadas del cron | 🟠 #55 | fix-03 | 1-3d |
| Mismatch de SKU/monto → `needs_review` + alerta (hoy: pago real rechazado con 409 y perdido) | 🟠 #56 | fix-04 | 1-3d |
| Reembolsos/contracargos: procesar refund/charged_back (hoy la idempotencia los descarta) | 🟠 #54 | fix-02 | 1-3d |
| Sentry vivo (instrumentation.ts + DSN + alertas) + monitor de uptime | 🟠 #82 | fix-11 | <1d |
| Next.js → 16.2.9 (CVEs) | 🟠 #92 | fix-12 | <1d |
| Copy honesto de SKUs: quitar "Renovable / $X mes" mientras no haya recurrencia | 🟡 #1013 | fix-05 | <1d |

**Criterio de salida:** pago de prueba en sandbox → email de bienvenida recibido + alerta interna + doc en `payments` + reembolso de prueba reflejado. Sentry recibe un error de prueba desde prod.

## Sprint 2 — "No pierdas al usuario que ya pagaste con IA" (funnel + recuperación) 🟠
*Objetivo: que ningún lead con costo de IA invertido muera en silencio.*

| Item | Hallazgos | Fix | Esfuerzo |
|---|---|---|---|
| Pantalla de carga: tratar `partial`, errores siempre visibles con retry, timeout de polling + telemetría | 🟠 #11, #62, #72 | fix-20 | 1-3d |
| Footgun 503: validación al arranque de flags/modelo de imagen | 🟠 #10 | fix-15 | <1d |
| Timeouts en todas las llamadas a Gemini + maxDuration en analyze | 🟠 #12 | fix-16 | <1d |
| CTA Calendly/WhatsApp: window.open síncrono (iOS) | 🟠 #64 | fix-22 | <1d |
| Magic link de recuperación en emails (re-ancla ownership multi-dispositivo) | 🟠 #1007, #1009, #73 | fix-08 | 1-3d |
| RESEND_FROM_EMAIL + copy condicional del "enlace enviado" | 🟡 #74 | fix-19 | <1d |
| Upstash plan pago + telemetría fuera de Redis | 🟠 #85 | fix-23 | <1d |
| error.tsx/not-found.tsx/loading.tsx | 🟡 #65 | — | <1d |

**Criterio de salida:** simular fallo de 1 imagen → el usuario llega a resultados con 2; abrir email en otro navegador → ve sus resultados como dueño; tocar CTA en iPhone → abre Calendly.

## Sprint 3 — "Cumplimiento y datos" (LFPDPPP) 🟠
*Objetivo: poder responder una queja de usuario o del INAI sin pánico.*

| Item | Hallazgos | Fix | Esfuerzo |
|---|---|---|---|
| Crons agendados (cleanup + secuencia) con guard anti-duplicados y transacción | 🟠 #22, #32 | fix-19, fix-10 | 1-3d |
| Borrado completo: transform_reports, reports/, email_sequences, leads al hacer DELETE | 🟠 #21 | fix-10 | 1-3d |
| Retención: TTL para sesiones completadas + sweep de uploads/ huérfanos | 🟠 #23 | fix-10 | 1-3d |
| ARCO ejecutable: link de borrado firmado en el email (deleteToken hoy nunca se entrega) | 🟠 #1008 | fix-09 | 1-3d |
| Datos legales en Vercel + aviso de privacidad: transferencias reales (MP, n8n, Sentry) + consentimiento expreso de datos de salud en el wizard + opt-in de marketing respetado en código | 🟢 #20, 🟡 #24, #28, #25 | — | 1-3d |

**Criterio de salida:** borrar una sesión de prueba → cero rastros en Firestore/Storage y la secuencia se detiene; el aviso de privacidad nombra responsable real y transferencias reales.

## Sprint 4 — "Frena el gasto y prueba lo que protege el dinero" 🟠
*Objetivo: que los frenos financieros y de seguridad estén medidos y probados.*

| Item | Hallazgos | Fix | Esfuerzo |
|---|---|---|---|
| Spend limiter honesto: precios reales, gasto por intento, una sola tabla de precios | 🟠 #9, #15 | fix-14 | 1-3d |
| Tests de spendLimiter + lock de jobs bajo concurrencia | 🟠 #101 | fix-25 | 1-3d |
| CI con gate de emulador (los tests A-vs-B que hoy solo corren a mano) + fallar en vez de skip | 🟠 #100 | fix-24 | 1-3d |
| Grep-tests de seguridad → tests de handler reales | 🟠 #102 | fix-26 | 1sem (empezar) |
| Quality gates: cablear retry correctivo + arreglar bug de tamaño | 🟠 #13 | fix-17 | 1-3d |

**Criterio de salida:** CI rojo si se rompe la authz o el límite de gasto; el costo contabilizado por sesión coincide ±10% con la factura de Gemini de prueba.

## Sprint 5 — "Decide el producto: viral, plan y suscripción" 🟠
*Objetivo: cerrar las 3 promesas de producto que el código no cumple — conectarlas o eliminarlas (decisión de fundador, el costo de mantener fachadas es real).*

| Item | Hallazgos | Fix | Esfuerzo |
|---|---|---|---|
| Loop de referidos: conectar end-to-end (?ref= → atribución → recompensa) **o** borrar | 🟠 #1000, 🟡 #1002 | fix-28 | 1sem / 1-3d |
| Share-to-unlock + social pack: conectar **o** borrar (3 subsistemas + 7 endpoints muertos) | 🟠 #1001, 🟡 #1003, #1004 | fix-29 | 1sem / 1-3d |
| Plan real: el PDF usa el plan IA guardado; macros con peso/bodyType reales; decidir entrega post-compra | 🟠 #14, 🟡 #30, #31, #1005 | fix-18 | 1-3d |
| Suscripciones: integrar /preapproval de MP para monthly **o** consolidar pagos únicos por periodo + entitlement con vigencia | 🟠 #1011, #1012 | fix-05, fix-06 | >1sem |
| Tests de flujos núcleo (sessions, analyze) | 🟠 #103 | fix-27 | 1-3d |

**Criterio de salida:** cero subsistemas fachada: todo lo que existe en el código tiene un consumidor real, y todo lo que promete la UI tiene código que lo cumple.

## Sprint 6 — "Higiene y velocidad" 🟡
| Item | Hallazgos | Esfuerzo |
|---|---|---|
| Peso móvil: orb.riv optimizado + next/dynamic en componentes pesados (fix-21) | 🟠 #63, 🟡 #66 | 1-3d |
| Migrar SDK abandonado → @google/genai (fix-13) | 🟠 #93 | 1-3d |
| Borrar ~33 componentes muertos + kit ui duplicado + recharts/playwright sin uso | 🟡 #68, 🟢 #96, #97 | 1-3d |
| Documentación: reescribir CLAUDE.md desde el código real (hoy describe un producto eliminado y omite los pagos); archivar STATUS_REPORT/PLAN; sacar ~40MB de imágenes QA del repo | drift | 1-3d |
| Dependabot/Renovate + revisar pnpm.overrides | 🟡 #99, #94 | <1d |
| Accesibilidad: sliders con nombre/foco, contrastes | 🟡 #69 | 1-3d |
| Resto de MEDIOS/BAJOS por área (env validation central, formato de error único, transacciones, dedup de auth interna) | varios | 1sem |

---

### Resumen de capacidad
~6 semanas-persona para llegar a "cobrando con confianza, midiendo, sin fachadas". Si solo hay tiempo para DOS semanas: Sprint 1 + Sprint 2 tal cual — son los que convierten el producto de "demo bonita con caja registradora desconectada" a "negocio que cobra, entrega y se entera cuando algo falla".
