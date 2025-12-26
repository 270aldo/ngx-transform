# AGENTS — NGX Transform

Guía rápida para agentes. Última actualización: 2025-12-25.

## Qué cambió / estado
- gcloud/gsutil instalados y bucket `gs://ngx-transformation.firebasestorage.app` verificado.
- `.env.local` ya incluye bucket, client email, GEMINI_API_KEY y modelo de imagen `gemini-2.5-flash-image-preview`.
- Integrado "NanoBanana" en `app/src/lib/nanobanana.ts` usando la API oficial de Gemini v1beta para image-to-image.
- Build de Next.js pasa; corregidos warnings de `use client` y refs duplicados en wizard/demo.
- Flujo end-to-end listo para pruebas con imagen real (<8MB), pero requiere cuotas/modelo preview habilitado.

## Estructura del repo
- `app/` proyecto Next.js (App Router)
- `app/src/app` rutas, páginas y API (`.../api/*/route.ts`)
- `app/src/components` UI (OverlayImage, Minimap, Tabs, ui/*)
- `app/src/lib` servicios/helpers (Firebase, Gemini, Storage)
- `app/src/emails` templates React Email
- `app/public` assets; `app/next.config.ts` imágenes remotas; `app/eslint.config.mjs`, `app/tsconfig.json`

## Stack y servicios
- Next.js 16.0.7 + React 19 + Tailwind v4.
- IA texto: Gemini 2.5 Flash (`GEMINI_MODEL` opcional).
- IA imágenes: Gemini 2.5 Flash Image preview (`gemini-2.5-flash-image-preview`, alias NanoBanana).
- Datos/archivos: Firebase (Firestore + Storage bucket `ngx-transformation` / `firebasestorage.app`).
- Emails: Resend.

## Comandos (ejecutar desde `app/`)
- `pnpm dev` (o `npm run dev`) — dev server.
- `pnpm build` — build prod.
- `pnpm start -p 3003` — servidor prod local.
- `pnpm lint` — ESLint.

## Variables de entorno mínimas (`app/.env.local`)
- Cliente Firebase: `NEXT_PUBLIC_FIREBASE_*` (API key, auth domain, project id, storage bucket, messaging sender, app id).
- Admin Firebase: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (escapar saltos de línea con `\n`).
- Gemini: `GEMINI_API_KEY`, opcional `GEMINI_MODEL=gemini-2.5-flash`, `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview`.
- Email: `RESEND_API_KEY` (opcional), `NEXT_PUBLIC_BASE_URL`.

## Endpoints y rutas clave
- `POST /api/analyze` → insights Gemini; usa `src/lib/gemini.ts`.
- `POST /api/generate-images` → transforma imagen (m4/m8/m12) con NanoBanana; `src/lib/nanobanana.ts`.
- `POST /api/email` → envía resultados; requiere `RESEND_API_KEY`.
- Páginas: `/` landing, `/wizard` formulario, `/demo/result` demo full UI (sin APIs), `/s/[shareId]` resultados compartidos, `/email/preview` template.

## Flujo funcional
1) Usuario sube foto + datos → Storage/Firestore.
2) `/api/analyze` genera timeline e insights con Gemini 2.5 Flash.
3) `/api/generate-images` produce m4/m8/m12 (image-to-image) y guarda en Storage.
4) UI muestra OverlayImage/Minimap/Tabs; opcionalmente `/api/email` envía enlace compartible.

## Diseño NGX
- Colores: Electric Violet `#6D00FF`, Deep Purple `#5B21B6`, fondo `#0A0A0A`, texto `#E5E5E5`.
- Fuentes: Josefin Sans (display) + Inter (body) cargadas en `app/src/app/layout.tsx` como `--font-ngx-sans` y `--font-ngx-alt`.
- Estilos globales en `app/src/app/globals.css`; componentes clave (OverlayImage, Minimap, Tabs) ya usan la paleta.

## Pendientes inmediatos
- Manejo robusto de errores/cargas en UI, toasts y polling de resultados.
- Moderación de imágenes y mejores prompts/config en NanoBanana.
- Ajustar `/api/generate-images` para timeouts/retries.
- Mejorar template de email y usar `next/image` en wizard preview.

## Tips de seguridad
- No subir secretos al repo; usa `app/.env.local` (ver `.env.example`).
- Claves de Firebase admin deben escapar `\n`.
- Hosts de imágenes remotas ya whitelisted en `next.config.ts` (Firebase Storage, GCS); añade otros si es necesario.
