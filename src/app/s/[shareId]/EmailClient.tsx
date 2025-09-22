"use client";
import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { useToast } from "@/components/ui/toast-provider";

export default function EmailClient({ shareId }: { shareId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!email) return;
      setLoading(true);
      try {
        const res = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, shareId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "No se pudo enviar el email");
        addToast({ variant: "success", message: "Email enviado" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error enviando email";
        addToast({ variant: "error", message: msg });
      } finally { setLoading(false); }
    }} className="flex gap-2">
      <Input placeholder="tu@email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="w-56" />
      <Button disabled={loading}>{loading ? "Enviando..." : "Enviar"}</Button>
    </form>
  );
}
