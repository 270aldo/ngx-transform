"use client"

import { Card, CardContent } from "@/components/shadcn/ui/card"
import { Button } from "@/components/shadcn/ui/button"
import EmailClient from "@/app/s/[shareId]/EmailClient"
import CopyLinkClient from "@/app/s/[shareId]/CopyLinkClient"
import DeleteClient from "@/app/s/[shareId]/DeleteClient"

export function ActionsCard({ shareId, bookingUrl }: { shareId: string; bookingUrl?: string }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <EmailClient shareId={shareId} />
          <CopyLinkClient shareId={shareId} />
        </div>
        {bookingUrl && (
          <a href={bookingUrl} target="_blank" rel="noreferrer">
            <Button className="w-full" variant="secondary">Reservar asesoría</Button>
          </a>
        )}
        <DeleteClient shareId={shareId} />
      </CardContent>
    </Card>
  )
}
