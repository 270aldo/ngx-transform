"use client";
import Link from "next/link";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get("shareId");
  const token = searchParams.get("token");
  const reason = searchParams.get("reason");
  const missingParams = !shareId || !token;
  const [status, setStatus] = useState<Status>(missingParams ? "error" : "loading");
  const [message, setMessage] = useState(
    missingParams ? "Faltan datos para procesar la baja." : "Procesando tu solicitud..."
  );

  useEffect(() => {
    if (missingParams) {
      return;
    }

    fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shareId,
        token,
        ...(reason ? { reason } : {}),
      }),
    })
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
  }, [missingParams, reason, shareId, token]);

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
