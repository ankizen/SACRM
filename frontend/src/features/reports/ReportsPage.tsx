import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useFollowupsSummary, useLeadsSummary } from "./hooks"
import type { ReportGroupBy } from "./types"

const GROUP_BY_OPTIONS: { value: ReportGroupBy; label: string }[] = [
  { value: "Stage", label: "Lead Stage" },
  { value: "Source", label: "Lead Source" },
  { value: "Month", label: "Month" },
  { value: "Executive", label: "Executive" },
]

export function ReportsPage() {
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("Stage")
  const { data, isLoading } = useLeadsSummary(groupBy)
  const { data: followups } = useFollowupsSummary()

  const maxCount = Math.max(1, ...(data?.map((d) => d.count) ?? [0]))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <p className="text-muted-foreground">Lead and followup performance.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Leads Summary</CardTitle>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as ReportGroupBy)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUP_BY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    By {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-48 w-full" />}
            {!isLoading && data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No data for this grouping.</p>
            )}
            <div className="grid gap-3">
              {data?.map((item) => (
                <div key={item.key} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.key}</span>
                    <span className="font-medium tabular-nums">{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Followups</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold tabular-nums">{followups?.completed ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Missed</span>
              <span className="font-semibold tabular-nums text-destructive">{followups?.missed ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Upcoming</span>
              <span className="font-semibold tabular-nums">{followups?.upcoming ?? "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
