"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  addToast: (toast: { message: string; variant?: ToastVariant }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function iconForVariant(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-4 w-4" />;
    case "error":
    case "warning":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ message, variant = "default" }: { message: string; variant?: ToastVariant }) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    const timeout = setTimeout(() => removeToast(id), 4200);
    return () => {
      clearTimeout(timeout);
      removeToast(id);
    };
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-border/80 bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition`}
          >
            <span className={`mt-0.5 ${toast.variant === "success" ? "text-emerald-400" : toast.variant === "error" ? "text-red-400" : toast.variant === "warning" ? "text-amber-400" : "text-primary"}`}>
              {iconForVariant(toast.variant)}
            </span>
            <p className="flex-1 text-sm text-muted-foreground">{toast.message}</p>
            <button
              type="button"
              className="text-muted-foreground/70 transition hover:text-foreground"
              onClick={() => removeToast(toast.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}
