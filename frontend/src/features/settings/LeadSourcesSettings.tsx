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
import { getErrorMessage } from "@/lib/errors"
import { useLeadSources, useSaveLeadSource } from "./lookups-hooks"
import type { LeadSource } from "./lookups-types"

export function LeadSourcesSettings() {
  const { data, isLoading } = useLeadSources(true)
  const save = useSaveLeadSource()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LeadSource | null>(null)
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setName("")
    setIsActive(true)
    setOpen(true)
  }

  const openEdit = (source: LeadSource) => {
    setEditing(source)
    setName(source.name)
    setIsActive(source.isActive)
    setOpen(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    save.mutate(
      { id: editing?.id, values: { name, isActive, sortOrder: editing?.sortOrder ?? 0 } },
      {
        onSuccess: () => {
          toast.success(editing ? "Lead source updated" : "Lead source created")
          setOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error, "Could not save the lead source.")),
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
              Add Lead Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Lead Source" : "New Lead Source"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source-name">Name</Label>
                <Input id="source-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="source-active" />
                <Label htmlFor="source-active">Active</Label>
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
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((source) => (
              <TableRow key={source.id}>
                <TableCell>{source.name}</TableCell>
                <TableCell>
                  <Badge variant={source.isActive ? "default" : "secondary"}>
                    {source.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(source)}>
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
