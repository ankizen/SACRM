import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PriorityBadge } from "@/components/shared/PriorityBadge"
import { StageBadge } from "@/components/shared/StageBadge"
import { useAuth } from "@/features/auth/AuthContext"
import { useLeadStages } from "@/features/settings/lookups-hooks"
import { useUsers } from "@/features/users/hooks"
import { useBulkUpdateLeads, useLeads } from "./hooks"
import type { LeadPriority, LeadView } from "./types"

const VIEW_TABS: { value: LeadView; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Duplicate", label: "Duplicate" },
  { value: "Trash", label: "Trash" },
]

const PRIORITIES: LeadPriority[] = ["Low", "Medium", "High", "Urgent"]

const ALL = "__all__"

export function LeadListPage() {
  const { user } = useAuth()
  const isAdminOrAbove = user?.role === "MasterAdmin" || user?.role === "Admin"
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const view = (searchParams.get("view") as LeadView) ?? "Active"
  const pageNumber = Number(searchParams.get("page") ?? "1")
  const leadStageId = searchParams.get("stage") ? Number(searchParams.get("stage")) : undefined
  const priority = (searchParams.get("priority") as LeadPriority) || undefined
  const assignedToUserId = searchParams.get("assignedTo") ? Number(searchParams.get("assignedTo")) : undefined
  const search = searchParams.get("search") ?? ""

  const [searchInput, setSearchInput] = useState(search)
  useEffect(() => setSearchInput(search), [search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null, page: null })
      }
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  function updateParams(patch: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    }
    setSearchParams(next)
  }

  const { data, isLoading } = useLeads({
    pageNumber,
    pageSize: 20,
    view,
    search: search || undefined,
    leadStageId,
    priority,
    assignedToUserId,
  })

  const { data: stages } = useLeadStages()
  const { data: users } = useUsers(isAdminOrAbove)
  const executives = users?.filter((u) => u.isActive) ?? []

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  useEffect(() => setSelectedIds([]), [view, pageNumber, search, leadStageId, priority, assignedToUserId])

  const bulkUpdate = useBulkUpdateLeads()

  const allSelected = (data?.items.length ?? 0) > 0 && selectedIds.length === data?.items.length
  const toggleAll = () => setSelectedIds(allSelected ? [] : (data?.items.map((l) => l.id) ?? []))
  const toggleOne = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage your sales pipeline.</p>
        </div>
        <Button asChild>
          <Link to="/leads/new">
            <Plus />
            New Lead
          </Link>
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => updateParams({ view: v, page: null })} className="mt-6">
        <TabsList>
          {VIEW_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, email, GST..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={leadStageId ? String(leadStageId) : ALL}
          onValueChange={(v) => updateParams({ stage: v === ALL ? null : v, page: null })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All stages</SelectItem>
            {stages?.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority ?? ALL}
          onValueChange={(v) => updateParams({ priority: v === ALL ? null : v, page: null })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAdminOrAbove && (
          <Select
            value={assignedToUserId ? String(assignedToUserId) : ALL}
            onValueChange={(v) => updateParams({ assignedTo: v === ALL ? null : v, page: null })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Everyone</SelectItem>
              {executives.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isAdminOrAbove && selectedIds.length > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-md border bg-muted/40 p-3">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Select
            onValueChange={(v) =>
              bulkUpdate.mutate(
                { leadIds: selectedIds, leadStageId: Number(v) },
                { onSuccess: () => setSelectedIds([]) },
              )
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Move to stage..." />
            </SelectTrigger>
            <SelectContent>
              {stages?.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Cancel
          </Button>
        </div>
      )}

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdminOrAbove && (
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isAdminOrAbove ? 9 : 8}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdminOrAbove ? 9 : 8} className="py-10 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                {isAdminOrAbove && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(lead.id)}
                      onCheckedChange={() => toggleOne(lead.id)}
                      aria-label={`Select ${lead.name}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.phone}</div>
                </TableCell>
                <TableCell>{lead.shopName ?? "—"}</TableCell>
                <TableCell>{lead.cityName ?? "—"}</TableCell>
                <TableCell>
                  <StageBadge name={lead.leadStageName} />
                </TableCell>
                <TableCell>{lead.leadSourceName ?? "—"}</TableCell>
                <TableCell>{lead.assignedToUserName ?? "Unassigned"}</TableCell>
                <TableCell>
                  <PriorityBadge priority={lead.priority} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(lead.createdAtUtc).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {data.pageNumber} of {data.totalPages} ({data.totalCount} leads)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pageNumber <= 1}
              onClick={() => updateParams({ page: data.pageNumber - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.pageNumber >= data.totalPages}
              onClick={() => updateParams({ page: data.pageNumber + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
