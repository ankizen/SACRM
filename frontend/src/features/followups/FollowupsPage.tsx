import { Link, useSearchParams } from "react-router-dom"
import { CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useFormatDate } from "@/lib/use-format-date"
import { usePendingFollowups, useTodaysFollowups } from "./hooks"
import type { Followup } from "./types"

function FollowupsTable({ data, isLoading, emptyMessage }: { data?: Followup[]; isLoading: boolean; emptyMessage: string }) {
  const { formatDateTime } = useFormatDate()

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!data || data.length === 0) {
    return <EmptyState icon={CalendarClock} title="Nothing here" description={emptyMessage} />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lead</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((followup) => (
          <TableRow key={followup.id}>
            <TableCell>
              <Link to={`/leads/${followup.leadId}`} className="font-medium text-primary hover:underline">
                {followup.leadName}
              </Link>
            </TableCell>
            <TableCell>{formatDateTime(followup.dueAtUtc)}</TableCell>
            <TableCell>{followup.assignedToUserName}</TableCell>
            <TableCell className="max-w-xs truncate text-muted-foreground">{followup.notes ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function FollowupsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") === "pending" ? "pending" : "today"

  const { data: today, isLoading: isTodayLoading } = useTodaysFollowups()
  const { data: pending, isLoading: isPendingLoading } = usePendingFollowups()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Followups</h1>
      <p className="text-muted-foreground">Scheduled callbacks and reminders.</p>

      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })} className="mt-6">
        <TabsList>
          <TabsTrigger value="today">Today ({today?.length ?? "—"})</TabsTrigger>
          <TabsTrigger value="pending">Overdue ({pending?.length ?? "—"})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mt-4">
        <CardContent>
          {tab === "today" ? (
            <FollowupsTable data={today} isLoading={isTodayLoading} emptyMessage="No followups due today." />
          ) : (
            <FollowupsTable data={pending} isLoading={isPendingLoading} emptyMessage="No overdue followups." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
