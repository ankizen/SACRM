import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/features/auth/AuthContext"
import { useCompanyProfile, useSaveCompanyProfile } from "./company-profile-hooks"

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "Asia/Dhaka", label: "Bangladesh (UTC+06:00)" },
  { value: "Asia/Kathmandu", label: "Nepal (UTC+05:45)" },
  { value: "Asia/Dubai", label: "UAE (UTC+04:00)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+08:00)" },
  { value: "Europe/London", label: "UK (UTC+00:00/+01:00)" },
  { value: "America/New_York", label: "US Eastern (UTC-05:00/-04:00)" },
  { value: "America/Los_Angeles", label: "US Pacific (UTC-08:00/-07:00)" },
  { value: "UTC", label: "UTC" },
]

export function CompanyProfileSettings() {
  const { user } = useAuth()
  const canEdit = user?.role === "MasterAdmin"

  const { data, isLoading } = useCompanyProfile()
  const save = useSaveCompanyProfile()

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    gstNumber: "",
    timezone: "Asia/Kolkata",
  })

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        gstNumber: data.gstNumber ?? "",
        timezone: data.timezone || "Asia/Kolkata",
      })
    }
  }, [data])

  const handleSave = () => {
    if (!form.name.trim()) return
    save.mutate(form, {
      onSuccess: () => toast.success("Company profile saved"),
      onError: () => toast.error("Could not save the company profile."),
    })
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full max-w-lg" />
  }

  return (
    <div className="grid max-w-lg gap-4">
      {!canEdit && <p className="text-sm text-muted-foreground">Only a Master Admin can edit company details.</p>}

      <div className="grid gap-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={!canEdit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="company-address">Address</Label>
        <Textarea
          id="company-address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          disabled={!canEdit}
          rows={2}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company-phone">Phone</Label>
          <Input
            id="company-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-email">Email</Label>
          <Input
            id="company-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-website">Website</Label>
          <Input
            id="company-website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-gst">GST Number</Label>
          <Input
            id="company-gst"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Timezone</Label>
          <Select
            value={form.timezone}
            onValueChange={(v) => setForm({ ...form, timezone: v })}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for "today" calculations (dashboard, followups) and how dates are displayed.
          </p>
        </div>
      </div>

      {canEdit && (
        <div>
          <Button onClick={handleSave} disabled={save.isPending || !form.name.trim()}>
            Save
          </Button>
        </div>
      )}
    </div>
  )
}
