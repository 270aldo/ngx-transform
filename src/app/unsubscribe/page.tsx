"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("Procesando tu solicitud...");

  useEffect(() => {
    const email = searchParams.get("email");
    const shareId = searchParams.get("shareId");
    const reason = searchParams.get("reason");

    if (!email && !shareId) {
      setStatus("error");
      setMessage("Faltan datos para procesar la baja.");
      return;
    }

    setStatus("loading");
    fetch(`/api/unsubscribe?${new URLSearchParams({
      ...(email ? { email } : {}),
      ...(shareId ? { shareId } : {}),
      ...(reason ? { reason } : {}),
    }).toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al procesar la baja");
        }
        return res.json();
      })
      .then(() => {
        setStatus("success");
        setMessage("Tu baja fue procesada. Ya no recibirás correos.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Error al procesar la baja");
      });
  }, [searchParams]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Preferencias de Email</h1>
      <p className="text-sm text-neutral-400">{message}</p>
      {status === "success" && (
        <Link href="/" className="inline-block text-sm text-[#6D00FF] underline underline-offset-4">
          Volver al inicio
        </Link>
      )}
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <Suspense fallback={
          <>
            <h1 className="text-2xl font-semibold">Preferencias de Email</h1>
            <p className="text-sm text-neutral-400">Procesando tu solicitud...</p>
          </>
        }>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  );
}
