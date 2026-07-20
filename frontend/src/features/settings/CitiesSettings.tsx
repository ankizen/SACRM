import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/errors"
import { useCities, useCountries, useSaveCity } from "./lookups-hooks"
import type { City } from "./lookups-types"

export function CitiesSettings() {
  const { data: countries } = useCountries(true)
  const { data, isLoading } = useCities(undefined, true)
  const save = useSaveCity()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<City | null>(null)
  const [name, setName] = useState("")
  const [countryId, setCountryId] = useState("")
  const [isActive, setIsActive] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setName("")
    setCountryId("")
    setIsActive(true)
    setOpen(true)
  }

  const openEdit = (city: City) => {
    setEditing(city)
    setName(city.name)
    setCountryId(String(city.countryId))
    setIsActive(city.isActive)
    setOpen(true)
  }

  const handleSave = () => {
    if (!name.trim() || !countryId) return
    save.mutate(
      { id: editing?.id, values: { name, isActive, countryId: Number(countryId) } },
      {
        onSuccess: () => {
          toast.success(editing ? "City updated" : "City created")
          setOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error, "Could not save the city.")),
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
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit City" : "New City"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city-name">Name</Label>
                <Input id="city-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Country</Label>
                <Select value={countryId} onValueChange={setCountryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="city-active" />
                <Label htmlFor="city-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={save.isPending || !name.trim() || !countryId}>
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
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((city) => (
              <TableRow key={city.id}>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.countryName}</TableCell>
                <TableCell>
                  <Badge variant={city.isActive ? "default" : "secondary"}>
                    {city.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(city)}>
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
