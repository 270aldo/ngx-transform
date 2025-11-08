"use client";

export function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/70 border-t-transparent align-middle"
      role="status"
      aria-label="Cargando"
    />
  );
}
