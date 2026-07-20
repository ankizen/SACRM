import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useAuth } from "@/features/auth/AuthContext"
import { useLeadSources, useLeadStages } from "@/features/settings/lookups-hooks"
import type { DashboardSummary, ExecutivePerformance } from "./types"

type Tone = "primary" | "success" | "danger" | "warning"

const TONE_STYLES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

// hrefBuilder returns null while the data it needs (e.g. a stage id resolved by name) hasn't
// loaded yet -- the tile still renders, just isn't clickable for a moment rather than linking
// somewhere wrong.
const STAT_TILES: {
  key: keyof DashboardSummary
  label: string
  icon: LucideIcon
  tone: Tone
  hrefBuilder: (ctx: { freshStageId?: number; pipelineStageId?: number }) => string | null
}[] = [
  {
    key: "todaysLeads",
    label: "Today's Leads",
    icon: CalendarDays,
    tone: "primary",
    hrefBuilder: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      return `/leads?createdFrom=${start.toISOString()}&createdTo=${end.toISOString()}`
    },
  },
  {
    key: "freshLeads",
    label: "Fresh Leads",
    icon: Sparkles,
    tone: "primary",
    hrefBuilder: ({ freshStageId }) => (freshStageId ? `/leads?stage=${freshStageId}` : null),
  },
  {
    key: "pipelineLeads",
    label: "Pipeline",
    icon: TrendingUp,
    tone: "primary",
    hrefBuilder: ({ pipelineStageId }) => (pipelineStageId ? `/leads?stage=${pipelineStageId}` : null),
  },
  {
    key: "convertedLeads",
    label: "Converted",
    icon: CheckCircle2,
    tone: "success",
    hrefBuilder: () => "/leads?wonStage=true",
  },
  {
    key: "lostLeads",
    label: "Lost",
    icon: XCircle,
    tone: "danger",
    hrefBuilder: () => "/leads?lostStage=true",
  },
  {
    key: "todaysFollowups",
    label: "Today's Followups",
    icon: Clock,
    tone: "warning",
    hrefBuilder: () => "/followups?tab=today",
  },
  {
    key: "pendingFollowups",
    label: "Pending Followups",
    icon: AlarmClock,
    tone: "warning",
    hrefBuilder: () => "/followups?tab=pending",
  },
]

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdminOrAbove = user?.role === "MasterAdmin" || user?.role === "Admin"

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get<DashboardSummary>("/dashboard/summary")).data,
  })

  const { data: performance, isLoading: isPerformanceLoading } = useQuery({
    queryKey: ["dashboard-executive-performance"],
    queryFn: async () => (await api.get<ExecutivePerformance[]>("/dashboard/executive-performance")).data,
    enabled: isAdminOrAbove,
  })

  const { data: stages } = useLeadStages()
  const { data: sources } = useLeadSources()
  const freshStageId = stages?.find((s) => s.name === "Fresh")?.id
  const pipelineStageId = stages?.find((s) => s.name === "Pipeline")?.id
  const sourceIdByName = new Map(sources?.map((s) => [s.name, s.id]))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        {user?.role === "Executive" ? "Your leads and followups." : "Overview across the team."}
      </p>

      {isError && <p className="mt-6 text-sm text-destructive">Could not load the dashboard summary.</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : STAT_TILES.map((tile) => {
              const href = tile.hrefBuilder({ freshStageId, pipelineStageId })
              const card = (
                <Card
                  className={cn(
                    "h-full transition-shadow",
                    href && "cursor-pointer hover:shadow-md hover:ring-primary/20",
                  )}
                >
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{tile.label}</CardTitle>
                    <div
                      className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_STYLES[tile.tone])}
                    >
                      <tile.icon className="size-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold tabular-nums">{data?.[tile.key] as number}</p>
                  </CardContent>
                </Card>
              )
              return href ? (
                <Link key={tile.key} to={href}>
                  {card}
                </Link>
              ) : (
                <div key={tile.key}>{card}</div>
              )
            })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {data && data.leadSourceBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Lead Source</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1">
              {data.leadSourceBreakdown.map((item) => {
                const sourceId = sourceIdByName.get(item.sourceName)
                const rowContent = (
                  <>
                    <span className="text-muted-foreground">{item.sourceName}</span>
                    <span className="flex items-center gap-1 font-medium tabular-nums">
                      {item.count}
                      {sourceId && <ChevronRight className="size-3.5 text-muted-foreground" />}
                    </span>
                  </>
                )
                return sourceId ? (
                  <Link
                    key={item.sourceName}
                    to={`/leads?source=${sourceId}`}
                    className="flex items-center justify-between rounded-md px-2 py-1 text-sm -mx-2 hover:bg-muted"
                  >
                    {rowContent}
                  </Link>
                ) : (
                  <div key={item.sourceName} className="flex items-center justify-between px-2 py-1 text-sm">
                    {rowContent}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {isAdminOrAbove && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Executive Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isPerformanceLoading && <Skeleton className="h-32 w-full" />}
              {!isPerformanceLoading && performance?.length === 0 && (
                <p className="text-sm text-muted-foreground">No leads assigned yet.</p>
              )}
              {performance && performance.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Executive</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Converted</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map((row) => (
                      <TableRow
                        key={row.userId}
                        className="cursor-pointer"
                        onClick={() => navigate(`/leads?assignedTo=${row.userId}`)}
                      >
                        <TableCell>{row.userName}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.totalLeads}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.convertedLeads}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.conversionRatePercent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
