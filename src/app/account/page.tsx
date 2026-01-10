"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebaseClient";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?next=/account");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-sm text-neutral-400">Cargando cuenta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">Cuenta NGX</p>
          <h1 className="text-3xl font-semibold">Mi cuenta</h1>
          <p className="text-sm text-neutral-400">Administra tu acceso y seguridad.</p>
        </header>

        <Card className="p-6 glass-panel rounded-2xl space-y-4">
          <div>
            <p className="text-xs text-neutral-500">Email</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/dashboard")}>Ir al dashboard</Button>
            <Button
              variant="outline"
              className="border-white/10"
              onClick={async () => {
                await signOut(getClientAuth());
                router.push("/auth");
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </Card>

        <Card className="p-6 glass-panel rounded-2xl space-y-2">
          <p className="text-sm font-semibold">Más ajustes pronto</p>
          <p className="text-xs text-neutral-400">
            Estamos preparando controles avanzados de privacidad y preferencias.
          </p>
        </Card>
      </div>
    </div>
  );
}
