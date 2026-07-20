import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useFormatDate } from "@/lib/use-format-date"
import { useActivities, useCreateActivity } from "./hooks"
import { ACTIVITY_TYPES, type ActivityType } from "./types"

export function ActivitiesTab({ leadId }: { leadId: number }) {
  const { data, isLoading } = useActivities(leadId)
  const { formatDateTime } = useFormatDate()
  const createActivity = useCreateActivity(leadId)

  const [type, setType] = useState<ActivityType>("PhoneCall")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (!subject.trim()) return
    createActivity.mutate(
      { type, subject, description: description || undefined },
      {
        onSuccess: () => {
          setSubject("")
          setDescription("")
          toast.success("Activity logged")
        },
        onError: () => toast.error("Could not log the activity."),
      },
    )
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-2 rounded-md border p-4">
        <Label>Log an activity</Label>
        <div className="flex flex-wrap gap-2">
          <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 min-w-48"
          />
        </div>
        <Textarea
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        <div>
          <Button size="sm" onClick={handleSubmit} disabled={createActivity.isPending || !subject.trim()}>
            Log Activity
          </Button>
        </div>
      </div>

      {isLoading && <Skeleton className="h-24 w-full" />}

      {!isLoading && data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground">No activities logged yet.</p>
      )}

      <ul className="grid gap-3">
        {data?.items.map((activity) => (
          <li key={activity.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {activity.type} — {activity.subject}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(activity.occurredAtUtc)}
              </span>
            </div>
            {activity.description && <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>}
            <p className="mt-1 text-xs text-muted-foreground">by {activity.performedByUserName}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
