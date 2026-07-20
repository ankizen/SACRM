import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PriorityBadge } from "@/components/shared/PriorityBadge"
import { StageBadge } from "@/components/shared/StageBadge"
import { useAuth } from "@/features/auth/AuthContext"
import { useUsers } from "@/features/users/hooks"
import { ActivitiesTab } from "@/features/activities/ActivitiesTab"
import { NotesTab } from "@/features/notes/NotesTab"
import { FollowupsTab } from "@/features/followups/FollowupsTab"
import { AttachmentsTab } from "@/features/attachments/AttachmentsTab"
import { useAssignLead, useDeleteLead, useLead, useLeadTimeline, useMergeLead, useRestoreLead } from "./hooks"

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 break-words">{value || "—"}</span>
    </div>
  )
}

export function LeadDetailPage() {
  const { id } = useParams()
  const leadId = Number(id)
  const { user } = useAuth()
  const isAdminOrAbove = user?.role === "MasterAdmin" || user?.role === "Admin"

  const { data: lead, isLoading } = useLead(leadId)
  const { data: users } = useUsers(isAdminOrAbove)
  const assignLead = useAssignLead()
  const deleteLead = useDeleteLead()
  const restoreLead = useRestoreLead()
  const mergeLead = useMergeLead()

  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [duplicateLeadId, setDuplicateLeadId] = useState("")

  if (isLoading || !lead) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-64 w-full max-w-2xl" />
      </div>
    )
  }

  const handleAssign = (userId: string) => {
    assignLead.mutate(
      { id: leadId, assignedToUserId: Number(userId) },
      { onSuccess: () => toast.success("Lead assigned"), onError: () => toast.error("Could not assign the lead.") },
    )
  }

  const handleDelete = () => {
    deleteLead.mutate(leadId, {
      onSuccess: () => toast.success("Lead moved to Trash"),
      onError: () => toast.error("Could not delete the lead."),
    })
  }

  const handleRestore = () => {
    restoreLead.mutate(leadId, {
      onSuccess: () => toast.success("Lead restored"),
      onError: () => toast.error("Could not restore the lead."),
    })
  }

  const handleMerge = () => {
    const parsed = Number(duplicateLeadId)
    if (!parsed) return
    mergeLead.mutate(
      { id: leadId, duplicateLeadId: parsed },
      {
        onSuccess: () => {
          toast.success("Lead merged")
          setMergeDialogOpen(false)
          setDuplicateLeadId("")
        },
        onError: () => toast.error("Could not merge — check the duplicate lead ID."),
      },
    )
  }

  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link to="/leads">
          <ArrowLeft />
          Back to Leads
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <StageBadge name={lead.leadStageName} />
            <PriorityBadge priority={lead.priority} />
            {lead.isDeleted && <span className="text-sm text-destructive">(Trashed)</span>}
          </div>
          <p className="text-muted-foreground">{lead.phone}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to={`/leads/${leadId}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>

          {isAdminOrAbove && (
            <>
              <Select onValueChange={handleAssign}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {users
                    ?.filter((u) => u.isActive)
                    .map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Merge Duplicate</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Merge a duplicate into this lead</DialogTitle>
                    <DialogDescription>
                      The duplicate lead will be flagged and moved out of the active pipeline, linked back to this
                      lead.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Label htmlFor="duplicateLeadId">Duplicate Lead ID</Label>
                    <Input
                      id="duplicateLeadId"
                      type="number"
                      value={duplicateLeadId}
                      onChange={(e) => setDuplicateLeadId(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleMerge} disabled={mergeLead.isPending}>
                      Merge
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {lead.isDeleted ? (
                <Button variant="outline" onClick={handleRestore}>
                  Restore
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow label="Email" value={lead.email} />
            <DetailRow label="WhatsApp" value={lead.whatsAppNumber} />
            <DetailRow label="Alternate Phone" value={lead.alternatePhone} />
            <DetailRow label="Shop Name" value={lead.shopName} />
            <DetailRow label="Address" value={lead.address} />
            <DetailRow label="City" value={lead.city} />
            <DetailRow label="State" value={lead.state} />
            <DetailRow label="Country" value={lead.countryName} />
            <DetailRow label="Zip Code" value={lead.zipCode} />
            <DetailRow label="GST Number" value={lead.gstNumber} />
            <DetailRow label="Website" value={lead.website} />
            <DetailRow label="Source" value={lead.leadSourceName} />
            <DetailRow label="Assigned To" value={lead.assignedToUserName ?? "Unassigned"} />
            <DetailRow label="Remarks" value={lead.remarks} />
            <DetailRow label="Created" value={new Date(lead.createdAtUtc).toLocaleString()} />
          </CardContent>
        </Card>

        <div className="min-w-0 lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList className="max-w-full justify-start overflow-x-auto">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="followups">Followups</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <TimelineTab leadId={leadId} />
            </TabsContent>
            <TabsContent value="activities">
              <ActivitiesTab leadId={leadId} />
            </TabsContent>
            <TabsContent value="notes">
              <NotesTab leadId={leadId} />
            </TabsContent>
            <TabsContent value="followups">
              <FollowupsTab leadId={leadId} />
            </TabsContent>
            <TabsContent value="attachments">
              <AttachmentsTab leadId={leadId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function TimelineTab({ leadId }: { leadId: number }) {
  const { data, isLoading } = useLeadTimeline(leadId)

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!data || data.items.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <ol className="mt-4 grid gap-4">
      {data.items.map((entry) => (
        <li key={entry.id} className="border-l-2 pl-4">
          <p className="text-sm font-medium">{entry.description ?? entry.eventType}</p>
          {entry.fieldName && (
            <p className="text-xs text-muted-foreground">
              {entry.fieldName}: {entry.oldValue ?? "—"} → {entry.newValue ?? "—"}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {entry.performedByUserName} · {new Date(entry.performedAtUtc).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  )
}
