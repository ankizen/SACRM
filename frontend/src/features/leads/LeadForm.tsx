import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCities, useCountries, useLeadSources, useLeadStages } from "@/features/settings/lookups-hooks"
import { useUsers } from "@/features/users/hooks"
import { useAuth } from "@/features/auth/AuthContext"
import { useDuplicateCheck } from "./hooks"
import { leadFormSchema, type LeadFormSchema } from "./lead-schema"
import type { LeadListItem } from "./types"

interface LeadFormProps {
  defaultValues?: Partial<LeadFormSchema>
  onSubmit: (values: LeadFormSchema) => void
  isSubmitting: boolean
  submitLabel: string
  showDuplicateCheck?: boolean
}

const NONE = "__none__"
const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const

export function LeadForm({ defaultValues, onSubmit, isSubmitting, submitLabel, showDuplicateCheck }: LeadFormProps) {
  const { user } = useAuth()
  const isAdminOrAbove = user?.role === "MasterAdmin" || user?.role === "Admin"

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { priority: "Medium", ...defaultValues },
  })

  const countryId = watch("countryId")
  const { data: sources } = useLeadSources()
  const { data: stages } = useLeadStages()
  const { data: countries } = useCountries()
  const { data: cities } = useCities(countryId ? Number(countryId) : undefined)
  const { data: users } = useUsers(isAdminOrAbove)

  const duplicateCheck = useDuplicateCheck()
  const [duplicates, setDuplicates] = useState<LeadListItem[]>([])

  const runDuplicateCheck = async () => {
    if (!showDuplicateCheck) return
    const phone = watch("phone")
    const email = watch("email")
    const gstNumber = watch("gstNumber")
    if (!phone && !email && !gstNumber) return
    const result = await duplicateCheck.mutateAsync({
      phone: phone || undefined,
      email: email || undefined,
      gstNumber: gstNumber || undefined,
    })
    setDuplicates(result)
  }

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} className="grid gap-6">
      {duplicates.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-400">Possible duplicate</p>
            <ul className="mt-1 list-inside list-disc text-muted-foreground">
              {duplicates.map((d) => (
                <li key={d.id}>
                  <Link to={`/leads/${d.id}`} className="underline">
                    {d.name}
                  </Link>{" "}
                  — {d.phone}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" {...register("phone")} onBlur={runDuplicateCheck} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsAppNumber">WhatsApp Number</Label>
            <Input id="whatsAppNumber" {...register("whatsAppNumber")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input id="alternatePhone" {...register("alternatePhone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} onBlur={runDuplicateCheck} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input id="shopName" {...register("shopName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input id="gstNumber" {...register("gstNumber")} onBlur={runDuplicateCheck} />
            {errors.gstNumber && <p className="text-sm text-destructive">{errors.gstNumber.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} rows={2} />
          </div>
          <div className="grid gap-2">
            <Label>Country</Label>
            <Select
              value={watch("countryId") ?? NONE}
              onValueChange={(v) => {
                setValue("countryId", v === NONE ? undefined : v)
                setValue("cityId", undefined)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {countries?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>City</Label>
            <Select
              value={watch("cityId") ?? NONE}
              onValueChange={(v) => setValue("cityId", v === NONE ? undefined : v)}
              disabled={!countryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {cities?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input id="zipCode" {...register("zipCode")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CRM Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Lead Source</Label>
            <Select
              value={watch("leadSourceId") ?? NONE}
              onValueChange={(v) => setValue("leadSourceId", v === NONE ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {sources?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Lead Stage</Label>
            <Select
              value={watch("leadStageId") ?? NONE}
              onValueChange={(v) => setValue("leadStageId", v === NONE ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Defaults to Fresh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {stages?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select
              value={watch("priority")}
              onValueChange={(v) => setValue("priority", v as LeadFormSchema["priority"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdminOrAbove && (
            <div className="grid gap-2">
              <Label>Assigned To</Label>
              <Select
                value={watch("assignedToUserId") ?? NONE}
                onValueChange={(v) => setValue("assignedToUserId", v === NONE ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {users
                    ?.filter((u) => u.isActive)
                    .map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" {...register("remarks")} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
