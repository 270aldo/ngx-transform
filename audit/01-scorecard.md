# Scorecard — NGX Vision (1-10 por área)

> Calificación de due diligence: 8-10 = comprable tal cual; 6-7 = sólido con deuda manejable; 4-5 = funciona pero frena el negocio; 1-3 = riesgo activo.
> Cada score sale de los hallazgos verificados en [02-hallazgos.md](02-hallazgos.md); evidencia archivo:línea en cada uno.

| Área | Score | Justificación (una línea) |
|---|---|---|
| **Arquitectura** | **6** | Separación limpia (todo dato pasa por backend, deny-all en Firestore) y patrones server-component correctos, pero el funnel diseñado no es el real, hay dos sistemas de plan paralelos y el loop viral/identidad quedaron desconectados del producto. |
| **Código** | **6** | TypeScript strict + zod casi universal y servicios bien factorizados, contra ~34% de componentes muertos, 3 tablas de precios desincronizadas, fallos silenciosos (errores a console y HTTP 200 engañosos) y duplicación de auth interna en 5 sabores. |
| **Seguridad** | **7** | No encontramos IDOR entre usuarios autenticados; ownership consistente, HMAC en webhook, timing-safe en secretos y anti-spoofing de IP — restan 'unsafe-inline' en CSP, fotos sin validación de contenido real (SVG con JS) y Next.js con CVEs sin parchar (la peor mancha, arreglo trivial). |
| **Datos** | **5** | Modelo razonable e índices definidos, pero retención infinita de fotos corporales/datos de salud, borrado incompleto (reporte/PDF/secuencia sobreviven), derechos ARCO inejecutables y cero libro de órdenes de pagos. |
| **Deploy-Ops** | **3.5** | CI decente (lint+types+build+unit), pero producción está ciega (Sentry inerte, sin DSN, sin uptime), los 2 crons críticos no tienen disparador, no hay staging ni validación central de env vars — el área más débil del repo. |
| **Frontend** | **5.5** | Server components y signed URLs bien usados, pero 10.8MB de animación decorativa en la pantalla de espera móvil, cero code-splitting, cero error.tsx/loading.tsx y el CTA principal bloqueado por popup-blocker en iOS. |
| **UX** | **5** | Wizard pulido y resultados con jerarquía clara, pero la pantalla de carga atrapa usuarios sin salida (estado 'partial'), la recuperación multi-dispositivo es un callejón sin salida y hay copy de developers visible en la zona de compra. |

## Sub-áreas auditadas (detalle)

| Sub-área | Score | Justificación |
|---|---|---|
| Pagos (MercadoPago) | **4** | La validación del webhook es ejemplar (firma, monto, idempotencia), pero no hay fulfillment, ni libro de órdenes, ni manejo de reembolsos, y se vende suscripción sin recurrencia implementada. |
| Capa de IA | **6** | Spend limiter fail-closed y jobs reanudables existen (raro en esta etapa), pero el limitador cuenta mal el gasto real, no hay timeouts, los quality gates son decorativos y una env var mal puesta brickea la generación. |
| Tests | **5** | 34 archivos en CI con buenos tests de pagos, pero 13 son "grep de texto", los tests de authz A-vs-B no corren en CI y las protecciones de costo no tienen ni un test ejecutable. |
| Dependencias | **6** | Stack moderno y overrides conscientes de CVEs, contra Next.js 5 parches atrás, el SDK de IA abandonado (repo archivado) y sin Dependabot/Renovate. |
| Documentación | **2** | CLAUDE.md/AGENTS.md describen un producto eliminado (3 APIs, 15+ componentes fantasma) y omiten lo que genera dinero (MercadoPago no aparece en ningún doc principal); README es lo único confiable. |

**Promedio ponderado de las 7 áreas principales: ~5.4/10** — producto pre-lanzamiento con buena base de seguridad estructural y deuda concentrada en operación, pagos y cierre de loops de producto.
