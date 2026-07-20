import { useState } from "react"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/AuthContext"
import { useCreateUser, useUpdateUser, useUsers } from "./hooks"

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const isMasterAdmin = currentUser?.role === "MasterAdmin"
  const assignableRoles: ("Admin" | "Executive")[] = isMasterAdmin ? ["Admin", "Executive"] : ["Executive"]

  const { data, isLoading } = useUsers(true, true)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"Admin" | "Executive">("Executive")

  const resetForm = () => {
    setFullName("")
    setEmail("")
    setPassword("")
    setRole("Executive")
  }

  const handleCreate = () => {
    if (!fullName.trim() || !email.trim() || password.length < 8) return
    createUser.mutate(
      { fullName, email, password, role },
      {
        onSuccess: () => {
          toast.success("User created")
          resetForm()
          setOpen(false)
        },
        onError: (error) => {
          if (isAxiosError(error) && error.response?.status === 409) {
            toast.error("A user with this email already exists.")
          } else {
            toast.error("Could not create the user.")
          }
        },
      },
    )
  }

  const toggleActive = (userId: number, fullNameValue: string, isActive: boolean) => {
    updateUser.mutate(
      { id: userId, values: { fullName: fullNameValue, isActive: !isActive } },
      { onError: () => toast.error("Could not update the user.") },
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            {isMasterAdmin ? "Manage Admin and Executive accounts." : "Manage Executive accounts."}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="user-name">Full Name</Label>
                <Input id="user-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-password">Temporary Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && password.length < 8 && (
                  <p className="text-sm text-destructive">Must be at least 8 characters.</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "Admin" | "Executive")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createUser.isPending || !fullName.trim() || !email.trim() || password.length < 8}
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-md border">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data
                ?.filter((u) => isMasterAdmin || u.role === "Executive")
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.lastLoginAtUtc ? new Date(u.lastLoginAtUtc).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.isActive}
                        onCheckedChange={() => toggleActive(u.id, u.fullName, u.isActive)}
                        disabled={u.id === currentUser?.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
