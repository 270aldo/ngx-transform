# NGX Transform — MVP Fitness Visualization

Aplicación Next.js con Firebase, Gemini y “NanoBanana” (alias interno de Gemini 2.5 Flash Image) para visualizar una proyección realista del progreso físico. Diseño NGX: dark premium con acentos Electric Violet y Deep Purple, usando Josefin Sans e Inter.

## Estructura del repo
- app/ → proyecto Next.js (App Router)
  - src/app → páginas y rutas API
  - src/components → UI (OverlayImage, Minimap, Tabs, etc.)
  - next.config.ts → configuración (imágenes remotas, Turbopack root)

## Arquitectura
- Frontend: Next.js (App Router)
- Backend: Rutas API serverless (Vercel Functions)
- Datos y archivos: Firebase (Firestore + Storage)
- IA análisis: Google Gemini (2.5 Flash por defecto)
- IA imágenes: Gemini 2.5 Flash Image (alias “NanoBanana”), modelo `gemini-2.5-flash-image-preview`
- Emails: Resend

## Diseño NGX (UI)
- Paleta
  - Electric Violet: #6D00FF
  - Deep Purple: #5B21B6
  - Fondo: #0A0A0A, Texto: #E5E5E5
- Fuentes
  - Josefin Sans (primaria / display)
  - Inter (secundaria / body)
- Implementación:
  - Las fuentes se cargan en `app/src/app/layout.tsx` con variables `--font-ngx-sans` y `--font-ngx-alt`.
  - Estilos globales en `app/src/app/globals.css` usan estas variables y la paleta NGX.
  - Componentes como Tabs, OverlayImage y Minimap ya usan #6D00FF.

## Variables de entorno
Crea el archivo `app/.env.local` (solo local) con:

```dotenv path=/Users/aldoolivas/APP_NANO_NGX/app/.env.local start=1
# Cliente Firebase (públicas)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ngx-transformation.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ngx-transformation
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ngx-transformation.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin Firebase (servidor)
FIREBASE_PROJECT_ID=ngx-transformation
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ngx-transformation.iam.gserviceaccount.com
# Si la clave contiene saltos de línea, usa \n escapados
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini (texto/razonamiento y generación de imagen)
GEMINI_API_KEY=
# Modelo por defecto de análisis (opcional)
GEMINI_MODEL=gemini-2.5-flash
# Modelo de imágenes ("NanoBanana")
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview

# Email (opcional)
RESEND_API_KEY=

# Base pública de la app (útil en SSR para construir URLs absolutas)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Endpoints API (App Router)
- POST /api/analyze
  - Requiere: `GEMINI_API_KEY`
  - Entrada: `{ sessionId: string }`
  - Efecto: Genera insights (timeline y overlays) vía Gemini y guarda en Firestore.

- POST /api/generate-images
  - Requiere: `GEMINI_API_KEY` (usa el modelo de imagen `gemini-2.5-flash-image-preview` a través de `src/lib/nanobanana.ts`)
  - Entrada: `{ sessionId: string, steps?: ("m4"|"m8"|"m12")[] }`
  - Efecto: Genera imágenes transformadas (image-to-image) con Gemini 2.5 Flash Image, las sube a Storage y guarda paths en Firestore.

- POST /api/email
  - Requiere: `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL`
  - Entrada: `{ to: string, shareId: string }`
  - Efecto: Envía email con enlace compartible a resultados.

Rutas fuente:
- `app/src/app/api/analyze/route.ts`
- `app/src/app/api/generate-images/route.ts`
- `app/src/app/api/email/route.ts`

## Puesta en marcha (local)
1) Instalar dependencias
```bash path=null start=null
npm install --prefix app
```
2) Variables de entorno
- Copia y rellena `app/.env.local` con tus claves (ver sección anterior).

3) Desarrollo
```bash path=null start=null
npm run --prefix app dev
```
Abrir http://localhost:3000

4) Producción (local)
```bash path=null start=null
npm run --prefix app build && npm run --prefix app start -p 3003
```
Abrir http://localhost:3003

## Flujo funcional (alto nivel)
1) Lead + subida de imagen al Storage (cliente: Firebase Web SDK)
2) Creación de sesión en Firestore
3) Análisis con Gemini (gemini-2.5-flash) → insights + timeline + overlays
4) Generación de imágenes con “NanoBanana” (Gemini 2.5 Flash Image `gemini-2.5-flash-image-preview`) para m4/m8/m12 → guardado en Storage
5) Visualización de resultados (OverlayImage/Minimap + Tabs) y envío por email

## Componentes clave
- OverlayImage: hotspots interactivos con color de marca
- Minimap: vista mini con hotspots
- Tabs: selector m0/m4/m8/m12 con resalte Electric Violet
- Elementos base: Button, Input, Textarea, Progress, Skeleton/Spinner

## Roadmap inmediato
- Manejo de errores y estados de carga en UI
- Toasts de notificación
- Polling de resultados
- Moderación de imágenes
- Template de email más rico
- Cambiar preview a `next/image` en el wizard

## gsutil / gcloud (Firebase Storage)
Se instaló Google Cloud SDK y se configuró el proyecto `ngx-transformation` con un service account local.

- Bucket verificado: `gs://ngx-transformation.firebasestorage.app`
- Ejemplos:
```bash path=null start=null
# Listar contenido
gsutil ls gs://ngx-transformation.firebasestorage.app

# Subir un archivo
gsutil cp ./local-file.png gs://ngx-transformation.firebasestorage.app/uploads/local-file.png

# Sincronizar una carpeta
gsutil -m rsync -r ./dist gs://ngx-transformation.firebasestorage.app/dist
```

Notas de seguridad: no comprometer claves en el repo; usar `.env.local`. Para gcloud/gsutil se dejó el JSON en `$HOME/.config/gcloud/keys/` y variables en `~/.zshrc`.

## Estado actual del proyecto (2025-09-21)
- Instalado y configurado gcloud/gsutil; bucket verificado.
- .env.local actualizado: bucket, proyecto, client email, GEMINI_API_KEY, y modelo de imagen `gemini-2.5-flash-image-preview`.
- “NanoBanana” integrado en `app/src/lib/nanobanana.ts` llamando a la API oficial de Gemini (v1beta) para image-to-image.
- Build de Next.js pasa; se corrigieron:
  - Duplicados/`use client` en `src/app/demo/result/page.tsx`.
  - Duplicado de `ref` en `src/app/wizard/page.tsx`.
- Flujo end‑to‑end listo para pruebas con imagen real (puede requerir ajustar cuotas/uso del modelo preview).

## Siguientes pasos sugeridos
- Probar flujo real en dev con imagen <8MB (desactivar DEMO).
- Afinar prompts/`generationConfig` para consistencia visual.
- Manejo robusto de errores/tiempos de espera en `/api/generate-images`.
- Políticas de cache/control de acceso en Storage.
- Rotar service account key antes de ir a producción.

## Troubleshooting
- No ves los estilos NGX:
  - Asegura que `app/src/app/globals.css` está importado desde `layout.tsx`.
  - Reinicia el servidor de dev y limpia cachés del navegador.
  - Prueba un build de producción: `npm run --prefix app build && npm run --prefix app start -p 3003`.
- Imágenes remotas:
  - `app/next.config.ts` ya permite `storage.googleapis.com` y `firebasestorage.googleapis.com`.

---
NGX — estilo moderno, tech y minimalista. Diseño accesible y consistente con shadcn/ui + Tailwind.
