# NGX Vision — Rebrand del lead magnet (antes "NGX Transform")

**Fecha:** 2026-06-01 · **Estado:** aprobado, en implementación

## Context

El lead magnet viral (foto → proyección de transformación a 12 meses → GENESIS / NGX HYBRID) se llamaba **"NGX Transform"**. El founder decidió que ese nombre no convence y que `ngxgenesis.com` queda reservado para la **app principal (GENESIS)**. El lead magnet necesita identidad propia.

Tras un brainstorming guiado se aterrizó:
- **Arquitectura:** sub-marca NGX (cohesión con GENESIS/HYBRID/ASCEND).
- **Ángulo:** Futuro / Visión (encaja con la carta del futuro y el arco m0→m12).
- **Nombre:** **NGX Vision**.
- **Dominio:** **`ngxvision.app`** (`.com` está tomado; `.app` ~$9.99/año, se compra al ir a launch). Staging corre en `*.vercel.app` mientras tanto.

## Lugar en el funnel

**NGX Vision** (lead magnet, fachada viral) → **GENESIS** (la IA que genera y firma) → **NGX HYBRID** (programa) → **NGX ASCEND** (suscripción). GENESIS sigue siendo la voz; Vision es la puerta de entrada.

## Scope aplicado

**Reemplazos exactos (globales, seguros):**
- `"NGX Transform"` → `"NGX Vision"` en metadata/`<title>`/OG, privacy/terms, emails D0–D14 + transaccionales, copy de landing, prompt del agente realtime, `CLAUDE.md`/`README`/docs.
- `transform.ngxgenesis.com` → `ngxvision.app` (defaults de URL en emails, `ReferralCard`, `shareMessages`, `vercel.json`, `.env.example`, tests).
- Email sender → `NGX Vision <genesis@ngxvision.app>` (`emailConfig.ts` default y `.env.example` `RESEND_FROM_EMAIL`).

**Ediciones manuales (uso de "Transform" suelto, sin prefijo NGX):**
- `LandingTopNav` (lockup `NGX <span>Transform</span>` → `NGX Vision`), `LandingJourney` (copy + CTA "Empezar con NGX Vision" ×2), comentario en `HybridOfferV2`.

**Privacy/Terms:** el nombre del *servicio* pasa a "NGX Vision". El responsable legal / razón social sigue siendo dato del owner (env `NEXT_PUBLIC_LEGAL_*`), sin cambios aquí.

## Lo que NO cambia

- La palabra "transformación/transformation" como concepto (es de lo que trata el producto), ni verbos conjugados ("el sistema transforma").
- Nombres internos de archivos/símbolos (`ngxTransformCopy.ts`, `TransformationViewer2`, etc.) y rutas (`/s/[shareId]`).
- El repo `270aldo/ngx-transform` en GitHub (renombrar es opcional y posterior).
- `ngxgenesis.com` (reservado para la app principal).

## Verificación

`tsc` (0), `lint` (0 errores), `test` (116/116 baseline de main), `build` de producción.

## Follow-ups (no en este PR)

1. Comprar `ngxvision.app` (Vercel Domains) al preparar launch.
2. Verificar el dominio en Resend (SPF/DKIM) para enviar desde `genesis@ngxvision.app`.
3. Setear `NEXT_PUBLIC_APP_URL` / env por entorno en Vercel.
4. (Opcional) renombrar el repo de GitHub.
