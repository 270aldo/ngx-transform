"use client";
import { Button } from "@/components/shadcn/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/shadcn/ui/dialog";

export default function DeleteClient({ shareId }: { shareId: string }) {
  const { addToast } = useToast();

  async function onConfirm() {
    try {
      const res = await fetch(`/api/sessions/${shareId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo eliminar");
      addToast({ variant: "success", message: "Sesión eliminada" });
      location.href = "/";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error eliminando";
      addToast({ variant: "error", message: msg });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Eliminar sesión</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar sesión</DialogTitle>
          <DialogDescription>
            Esta acción eliminará tu sesión y archivos generados. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>Eliminar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
