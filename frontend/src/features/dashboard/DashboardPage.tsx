import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useAuth } from "@/features/auth/AuthContext"
import type { DashboardSummary } from "./types"

const STAT_TILES: { key: keyof DashboardSummary; label: string }[] = [
  { key: "todaysLeads", label: "Today's Leads" },
  { key: "freshLeads", label: "Fresh Leads" },
  { key: "pipelineLeads", label: "Pipeline" },
  { key: "convertedLeads", label: "Converted" },
  { key: "lostLeads", label: "Lost" },
  { key: "todaysFollowups", label: "Today's Followups" },
  { key: "pendingFollowups", label: "Pending Followups" },
]

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get<DashboardSummary>("/dashboard/summary")).data,
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        {user?.role === "Executive" ? "Your leads and followups." : "Overview across the team."}
      </p>

      {isError && (
        <p className="mt-6 text-sm text-destructive">Could not load the dashboard summary.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : STAT_TILES.map((tile) => (
              <Card key={tile.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{tile.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tabular-nums">{data?.[tile.key] as number}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {data && data.leadSourceBreakdown.length > 0 && (
        <Card className="mt-6 max-w-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Lead Source</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {data.leadSourceBreakdown.map((item) => (
              <div key={item.sourceName} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.sourceName}</span>
                <span className="font-medium tabular-nums">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
