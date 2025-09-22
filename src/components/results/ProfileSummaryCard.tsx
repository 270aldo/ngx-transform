import { Card, CardContent } from "@/components/shadcn/ui/card"

export function ProfileSummaryCard({ profile }: { profile: {
  age: number
  sex: "male" | "female" | "other"
  heightCm: number
  weightKg: number
  level: "novato" | "intermedio" | "avanzado"
  goal: "definicion" | "masa" | "mixto"
  weeklyTime: number
  notes?: string
} }) {
  const items = [
    { k: "Edad", v: profile.age },
    { k: "Sexo", v: profile.sex },
    { k: "Altura", v: profile.heightCm + " cm" },
    { k: "Peso", v: profile.weightKg + " kg" },
    { k: "Nivel", v: profile.level },
    { k: "Objetivo", v: profile.goal },
    { k: "Horas/sem", v: profile.weeklyTime },
  ]
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="text-sm font-semibold">Perfil</div>
        <ul className="text-sm text-muted-foreground space-y-1">
          {items.map((it) => (
            <li key={it.k} className="flex justify-between gap-2">
              <span className="text-foreground/80">{it.k}</span>
              <span>{it.v}</span>
            </li>
          ))}
          {profile.notes && (
            <li className="pt-2 border-t border-border/60">
              <div className="text-foreground/80">Notas</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{profile.notes}</div>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
