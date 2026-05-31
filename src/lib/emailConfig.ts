export function getConfiguredFromEmail(context: string): string | null {
  const configured = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

  if (configured) {
    if (
      process.env.NODE_ENV === "production" &&
      /@resend\.dev\b/i.test(configured)
    ) {
      console.error(`[${context}] resend.dev sender is not allowed in production`);
      return null;
    }
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "NGX Transform <transform@ngxgenesis.com>";
}
