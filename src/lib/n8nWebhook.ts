export async function sendN8NWebhook(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  const legacyUrl = process.env.N8N_WEBHOOK_URL;
  const target = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${event}` : legacyUrl;

  if (!target) {
    return;
  }

  try {
    await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        event,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error(`[N8N] webhook failed: ${event}`, error);
  }
}

