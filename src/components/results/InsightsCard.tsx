import { Card, CardContent } from "@/components/shadcn/ui/card"

export function InsightsCard({ insightsText }: { insightsText?: string }) {
  if (!insightsText) return null
  return (
    <Card className="border-l-4 border-l-[#6D00FF] bg-card/50">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
          <span className="text-[#6D00FF]">📝</span> Nota del Entrenador
        </h3>
        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm">
          {insightsText}
        </p>
      </CardContent>
    </Card>
  )
}
