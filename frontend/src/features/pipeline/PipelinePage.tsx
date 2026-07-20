import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PriorityBadge } from "@/components/shared/PriorityBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Kanban } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/AuthContext"
import { useLeadStages } from "@/features/settings/lookups-hooks"
import { useLeads } from "@/features/leads/hooks"
import type { LeadListItem } from "@/features/leads/types"
import { useChangeLeadStage } from "./hooks"

function LeadCard({ lead, showAssignee }: { lead: LeadListItem; showAssignee: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn("touch-none", isDragging && "z-10 opacity-60")}
    >
      <Card className="cursor-grab gap-2 py-3 shadow-sm active:cursor-grabbing">
        <CardContent className="grid gap-1 px-3">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/leads/${lead.id}`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-sm font-medium hover:underline"
            >
              {lead.name}
            </Link>
            <PriorityBadge priority={lead.priority} />
          </div>
          <p className="text-xs text-muted-foreground">{lead.shopName || lead.phone}</p>
          {showAssignee && (
            <p className="text-xs text-muted-foreground">{lead.assignedToUserName ?? "Unassigned"}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StageColumn({
  stageId,
  name,
  isWonStage,
  isLostStage,
  leads,
  showAssignee,
}: {
  stageId: number
  name: string
  isWonStage: boolean
  isLostStage: boolean
  leads: LeadListItem[]
  showAssignee: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-muted/40 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span
          className={cn(
            "text-sm font-medium",
            isWonStage && "text-green-700 dark:text-green-400",
            isLostStage && "text-destructive",
          )}
        >
          {name}
        </span>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} showAssignee={showAssignee} />
        ))}
      </div>
    </div>
  )
}

export function PipelinePage() {
  const { user } = useAuth()
  const isAdminOrAbove = user?.role === "MasterAdmin" || user?.role === "Admin"

  const { data: stages, isLoading: isStagesLoading } = useLeadStages()
  const { data, isLoading: isLeadsLoading } = useLeads({ view: "Active", pageNumber: 1, pageSize: 200 })
  const changeStage = useChangeLeadStage()

  // Optimistic per-lead stage override so a drag feels instant instead of waiting on the
  // server round-trip; cleared for a lead once the underlying query re-fetches in agreement.
  const [overrides, setOverrides] = useState<Record<number, number>>({})

  const leadsByStage = useMemo(() => {
    const map = new Map<number, LeadListItem[]>()
    for (const lead of data?.items ?? []) {
      const effectiveStageId = overrides[lead.id] ?? lead.leadStageId
      const bucket = map.get(effectiveStageId) ?? []
      bucket.push(lead)
      map.set(effectiveStageId, bucket)
    }
    return map
  }, [data, overrides])

  const handleDragEnd = (event: DragEndEvent) => {
    const leadId = Number(event.active.id)
    const targetStageId = event.over ? Number(event.over.id) : null
    if (!targetStageId) return

    const lead = data?.items.find((l) => l.id === leadId)
    const currentStageId = overrides[leadId] ?? lead?.leadStageId
    if (!lead || currentStageId === targetStageId) return

    setOverrides((prev) => ({ ...prev, [leadId]: targetStageId }))
    changeStage.mutate(
      { id: leadId, leadStageId: targetStageId },
      {
        onError: () => {
          toast.error("Could not move the lead. Reload and try again.")
          setOverrides((prev) => {
            const next = { ...prev }
            delete next[leadId]
            return next
          })
        },
      },
    )
  }

  const isLoading = isStagesLoading || isLeadsLoading

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
      <p className="text-muted-foreground">Drag a lead to move it between stages.</p>

      {isLoading ? (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      ) : !stages || stages.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Kanban} title="No lead stages configured" description="Add stages in Settings first." />
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {[...stages]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((stage) => (
                <StageColumn
                  key={stage.id}
                  stageId={stage.id}
                  name={stage.name}
                  isWonStage={stage.isWonStage}
                  isLostStage={stage.isLostStage}
                  leads={leadsByStage.get(stage.id) ?? []}
                  showAssignee={isAdminOrAbove}
                />
              ))}
          </div>
        </DndContext>
      )}
    </div>
  )
}
