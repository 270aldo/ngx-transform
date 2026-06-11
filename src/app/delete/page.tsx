"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status =
  | "idle"
  | "deleting"
  | "success"
  | "error"
  | "requesting"
  | "requested";

function DeleteContent() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get("shareId");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // NEVER auto-delete on load: email scanners / link prefetchers would follow
  // the link and destroy the user's data. Deletion requires an explicit click.
  const onConfirm = async () => {
    if (!shareId || !token) return;
    setStatus("deleting");
    setMessage("");
    try {
      const res = await fetch(`/api/sessions/${shareId}`, {
        method: "DELETE",
        headers: { "X-Delete-Token": token },
      });
      if (!res.ok) {
        if (res.status === 403) {
          setStatus("error");
          setMessage(
            "Este enlace ya no es válido. Puedes pedir uno nuevo a tu correo.",
          );
          return;
        }
        throw new Error("No se pudo eliminar. Intenta de nuevo.");
      }
      setStatus("success");
      setMessage("Tus datos fueron eliminados.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Error al eliminar.");
    }
  };

  const onRequestLink = async () => {
    if (!shareId) return;
    setStatus("requesting");
    setMessage("");
    try {
      await fetch(`/api/sessions/${shareId}/request-delete`, { method: "POST" });
      setStatus("requested");
      setMessage("Si la sesión existe, enviamos el enlace al correo asociado.");
    } catch {
      setStatus("error");
      setMessage("No se pudo enviar el enlace. Intenta más tarde.");
    }
  };

  if (!shareId) {
    return (
      <>
        <h1 className="text-2xl font-semibold">Eliminar mis datos</h1>
        <p className="text-sm text-neutral-400">
          Falta el identificador de sesión en el enlace.
        </p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <h1 className="text-2xl font-semibold">Datos eliminados</h1>
        <p className="text-sm text-neutral-400">{message}</p>
        <Link
          href="/"
          className="inline-block text-sm text-[#6D00FF] underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Eliminar mis datos</h1>
      <p className="text-sm text-neutral-400">
        Se eliminará tu foto original, las imágenes generadas y tu perfil. Esta
        acción no se puede deshacer.
      </p>
      {message && <p className="text-sm text-neutral-300">{message}</p>}

      {token ? (
        <button
          onClick={onConfirm}
          disabled={status === "deleting"}
          className="rounded-full bg-[#6D00FF] px-5 py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
        >
          {status === "deleting"
            ? "Eliminando..."
            : "Eliminar definitivamente mis datos"}
        </button>
      ) : (
        <p className="text-sm text-neutral-400">
          Este enlace no incluye un token de borrado.
        </p>
      )}

      {(!token || status === "error") && status !== "requested" && (
        <button
          onClick={onRequestLink}
          disabled={status === "requesting"}
          className="block w-full text-sm text-[#6D00FF] underline underline-offset-4 disabled:opacity-60"
        >
          {status === "requesting"
            ? "Enviando..."
            : "Enviarme el enlace de borrado a mi correo"}
        </button>
      )}
    </>
  );
}

export default function DeletePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md space-y-4 text-center">
        <Suspense
          fallback={
            <>
              <h1 className="text-2xl font-semibold">Eliminar mis datos</h1>
              <p className="text-sm text-neutral-400">Cargando...</p>
            </>
          }
        >
          <DeleteContent />
        </Suspense>
      </div>
    </div>
  );
}
