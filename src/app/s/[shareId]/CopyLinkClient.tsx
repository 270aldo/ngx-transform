"use client";
import { Button } from "@/components/shadcn/ui/button";
import { useToast } from "@/components/ui/toast-provider";

export default function CopyLinkClient({ shareId }: { shareId: string }) {
  const { addToast } = useToast();
  const url = typeof window !== "undefined" ? `${location.origin}/s/${shareId}` : "";
  return (
    <Button variant="outline" onClick={async () => {
      try {
        await navigator.clipboard.writeText(url);
        addToast({ variant: "success", message: "Enlace copiado" });
      } catch {
        addToast({ variant: "error", message: "No se pudo copiar" });
      }
    }}>Copiar enlace</Button>
  );
}
