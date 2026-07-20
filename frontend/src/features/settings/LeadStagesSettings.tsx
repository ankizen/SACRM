import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { StageBadge } from "@/components/shared/StageBadge"
import { getErrorMessage } from "@/lib/errors"
import { useLeadStages, useSaveLeadStage } from "./lookups-hooks"
import type { LeadStage } from "./lookups-types"

export function LeadStagesSettings() {
  const { data, isLoading } = useLeadStages(true)
  const save = useSaveLeadStage()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LeadStage | null>(null)
  const [name, setName] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isWonStage, setIsWonStage] = useState(false)
  const [isLostStage, setIsLostStage] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setName("")
    setSortOrder((data?.length ?? 0) + 1)
    setIsActive(true)
    setIsWonStage(false)
    setIsLostStage(false)
    setOpen(true)
  }

  const openEdit = (stage: LeadStage) => {
    setEditing(stage)
    setName(stage.name)
    setSortOrder(stage.sortOrder)
    setIsActive(stage.isActive)
    setIsWonStage(stage.isWonStage)
    setIsLostStage(stage.isLostStage)
    setOpen(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    save.mutate(
      { id: editing?.id, values: { name, isActive, sortOrder, isWonStage, isLostStage } },
      {
        onSuccess: () => {
          toast.success(editing ? "Lead stage updated" : "Lead stage created")
          setOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error, "Could not save the lead stage.")),
      },
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus />
              Add Lead Stage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Lead Stage" : "New Lead Stage"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stage-name">Name</Label>
                <Input id="stage-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage-sort">Sort Order</Label>
                <Input
                  id="stage-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="stage-active" />
                <Label htmlFor="stage-active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isWonStage}
                  onCheckedChange={(v) => {
                    setIsWonStage(v)
                    if (v) setIsLostStage(false)
                  }}
                  id="stage-won"
                />
                <Label htmlFor="stage-won">Won stage (e.g. Converted)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isLostStage}
                  onCheckedChange={(v) => {
                    setIsLostStage(v)
                    if (v) setIsWonStage(false)
                  }}
                  id="stage-lost"
                />
                <Label htmlFor="stage-lost">Lost stage</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={save.isPending || !name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data
              ?.sort((a, b) => a.sortOrder - b.sortOrder)
              .map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>
                    <StageBadge name={stage.name} isWonStage={stage.isWonStage} isLostStage={stage.isLostStage} />
                  </TableCell>
                  <TableCell>{stage.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={stage.isActive ? "default" : "secondary"}>
                      {stage.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(stage)}>
                      <Pencil className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
