import { useQuery } from "@tanstack/react-query"
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
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
import type { DashboardSummary, ExecutivePerformance } from "./types"

type Tone = "primary" | "success" | "danger" | "warning"

const TONE_STYLES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const STAT_TILES: { key: keyof DashboardSummary; label: string; icon: LucideIcon; tone: Tone }[] = [
  { key: "todaysLeads", label: "Today's Leads", icon: CalendarDays, tone: "primary" },
  { key: "freshLeads", label: "Fresh Leads", icon: Sparkles, tone: "primary" },
  { key: "pipelineLeads", label: "Pipeline", icon: TrendingUp, tone: "primary" },
  { key: "convertedLeads", label: "Converted", icon: CheckCircle2, tone: "success" },
  { key: "lostLeads", label: "Lost", icon: XCircle, tone: "danger" },
  { key: "todaysFollowups", label: "Today's Followups", icon: Clock, tone: "warning" },
  { key: "pendingFollowups", label: "Pending Followups", icon: AlarmClock, tone: "warning" },
]

export function DashboardPage() {
  const { user } = useAuth()
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
          : STAT_TILES.map((tile) => (
              <Card key={tile.key}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{tile.label}</CardTitle>
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_STYLES[tile.tone])}>
                    <tile.icon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tabular-nums">{data?.[tile.key] as number}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {data && data.leadSourceBreakdown.length > 0 && (
          <Card>
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
                      <TableRow key={row.userId}>
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
