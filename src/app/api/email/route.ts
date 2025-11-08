import { NextResponse } from "next/server";
import { emailRequestSchema } from "@/lib/validators";
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = emailRequestSchema.parse(payload);

    if (!resend) {
      console.warn("RESEND_API_KEY no configurada, se omite envío real");
      return NextResponse.json({ ok: true, simulated: true });
    }

    await resend.emails.send({
      from: "NGX Transform <no-reply@ngx-transform.dev>",
      to: data.to,
      subject: "Tus resultados NGX Transform",
      text: `Puedes consultar tus resultados en ${process.env.NEXT_PUBLIC_BASE_URL || "https://ngx-transform.app"}/s/${data.shareId}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/email", err);
    const status = err instanceof Error && "issues" in err ? 400 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error interno" }, { status });
  }
}
