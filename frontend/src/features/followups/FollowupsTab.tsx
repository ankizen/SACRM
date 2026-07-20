import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useFormatDate } from "@/lib/use-format-date"
import { useCreateFollowup, useFollowups, useUpdateFollowup } from "./hooks"
import type { FollowupStatus } from "./types"

const STATUS_VARIANT: Record<FollowupStatus, "outline" | "default" | "destructive" | "secondary"> = {
  Pending: "outline",
  Completed: "default",
  Missed: "destructive",
  Cancelled: "secondary",
}

const STATUSES: FollowupStatus[] = ["Pending", "Completed", "Missed", "Cancelled"]

export function FollowupsTab({ leadId }: { leadId: number }) {
  const { data, isLoading } = useFollowups(leadId)
  const createFollowup = useCreateFollowup(leadId)
  const updateFollowup = useUpdateFollowup(leadId)
  const { formatDateTime } = useFormatDate()

  const [dueAt, setDueAt] = useState("")
  const [notes, setNotes] = useState("")

  const handleSchedule = () => {
    if (!dueAt) return
    createFollowup.mutate(
      { dueAtUtc: new Date(dueAt).toISOString(), notes: notes || undefined },
      {
        onSuccess: () => {
          setDueAt("")
          setNotes("")
          toast.success("Followup scheduled")
        },
        onError: () => toast.error("Could not schedule the followup."),
      },
    )
  }

  const handleStatusChange = (id: number, dueAtUtc: string, currentNotes: string | null, status: FollowupStatus) => {
    updateFollowup.mutate(
      { id, values: { dueAtUtc, status, notes: currentNotes ?? undefined } },
      { onError: () => toast.error("Could not update the followup.") },
    )
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-2 rounded-md border p-4">
        <Label>Schedule a followup</Label>
        <div className="flex flex-wrap gap-2">
          <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="w-56" />
        </div>
        <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <div>
          <Button size="sm" onClick={handleSchedule} disabled={createFollowup.isPending || !dueAt}>
            Schedule Followup
          </Button>
        </div>
      </div>

      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground">No followups scheduled.</p>
      )}

      <ul className="grid gap-3">
        {data?.items.map((followup) => (
          <li key={followup.id} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatDateTime(followup.dueAtUtc)}</span>
                <Badge variant={STATUS_VARIANT[followup.status]}>{followup.status}</Badge>
              </div>
              <Select
                value={followup.status}
                onValueChange={(v) =>
                  handleStatusChange(followup.id, followup.dueAtUtc, followup.notes, v as FollowupStatus)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {followup.notes && <p className="mt-1 text-sm text-muted-foreground">{followup.notes}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Assigned to {followup.assignedToUserName}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
