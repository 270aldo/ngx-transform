import { Card, CardContent } from "@/components/shadcn/ui/card"

export function InsightsCard({ insightsText }: { insightsText?: string }) {
  if (!insightsText) return null
  return (
    <Card>
      <CardContent className="whitespace-pre-wrap text-muted-foreground">
        {insightsText}
      </CardContent>
    </Card>
  )
}
