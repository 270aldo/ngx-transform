# Intake de contenido GENESIS — ESTADO: ✅ respondido y estructurado

> Aldo respondió este intake (sesión 2026-06-10). Las respuestas se estructuraron en la
> **fuente de verdad**: [`content.ts`](./content.ts) (KB consumida por voz + chat + UI) y
> [`founder-video-script.md`](./founder-video-script.md) (guion del video).
>
> **Para editar contenido del agente: edita `content.ts`, NO este archivo.** Este doc solo
> registra el estado y los datos reales que faltan por capturar.

## Qué quedó cubierto (en content.ts)
- Historia de Aldo + credibilidad + lo que NO quiere parecer → `FOUNDER`
- Qué es NGX, tesis, problema, para quién sí/no, valores → `NGX`
- Programa HYBRID: 4 fases (12 semanas), qué incluye, founding, coach, diagnóstico, para quién sí/no, diferenciación → `HYBRID`
- Postura de precio (no cobrar aquí; rango $199-499; founding $399/6mo/30 cupos; no escasez falsa) → `PRICING`
- Tono Verdad Directa (siempre/nunca/reglas) → `TONE`
- 13 FAQ / objeciones → `FAQ`
- Routing de lead caliente/tibio/frío con mensajes del agente → `LEAD_ROUTING`
- Disclaimer médico → `MEDICAL_DISCLAIMER`
- Guion del video del fundador → `founder-video-script.md`

## ⛔ Datos reales pendientes de capturar (bloquean partes de Fase 2/3)
Aldo dejó estos como `[INSERTAR]` — son valores reales, no contenido a redactar:
- **URL real de Calendly/booking** → env `NEXT_PUBLIC_CALENDLY_URL` (sin esto, el CTA "Agendar diagnóstico" queda deshabilitado). Bloquea el lead caliente.
- **Email de Aldo** para notificación de lead caliente. Bloquea Task #15 (orquestación in-app).
- **WhatsApp Business** (número o integración) → env `NEXT_PUBLIC_WHATSAPP_NUMBER` + notificación.
- **Destino de CRM/registro** (Google Sheet / Notion / CRM) con: nombre, email, teléfono, score Transform, objetivo.
- **Video del fundador**: grabar con el guion y poblar `NEXT_PUBLIC_HYBRID_VIDEO_URL`.
- **Cupos reales**: hoy la UI muestra "18/20" inventado (hallazgo #7). Decidir cifra real de Founding (30) o cambiar a "Cupo limitado por capacidad de revisión humana".
