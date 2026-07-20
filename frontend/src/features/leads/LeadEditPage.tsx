import { useNavigate, useParams } from "react-router-dom"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { LeadForm } from "./LeadForm"
import { useLead, useUpdateLead } from "./hooks"
import { toLeadFormValues, type LeadFormSchema } from "./lead-schema"
import type { Lead } from "./types"

function toFormDefaults(lead: Lead): Partial<LeadFormSchema> {
  return {
    name: lead.name,
    phone: lead.phone,
    whatsAppNumber: lead.whatsAppNumber ?? "",
    alternatePhone: lead.alternatePhone ?? "",
    email: lead.email ?? "",
    shopName: lead.shopName ?? "",
    address: lead.address ?? "",
    cityId: lead.cityId ? String(lead.cityId) : undefined,
    state: lead.state ?? "",
    zipCode: lead.zipCode ?? "",
    countryId: lead.countryId ? String(lead.countryId) : undefined,
    gstNumber: lead.gstNumber ?? "",
    website: lead.website ?? "",
    leadSourceId: lead.leadSourceId ? String(lead.leadSourceId) : undefined,
    leadStageId: String(lead.leadStageId),
    assignedToUserId: lead.assignedToUserId ? String(lead.assignedToUserId) : undefined,
    priority: lead.priority,
    remarks: lead.remarks ?? "",
  }
}

export function LeadEditPage() {
  const { id } = useParams()
  const leadId = Number(id)
  const navigate = useNavigate()

  const { data: lead, isLoading } = useLead(leadId)
  const updateLead = useUpdateLead(leadId)

  const handleSubmit = (values: LeadFormSchema) => {
    if (!lead) return
    updateLead.mutate(
      { ...toLeadFormValues(values), rowVersion: lead.rowVersion },
      {
        onSuccess: () => {
          toast.success("Lead updated")
          navigate(`/leads/${leadId}`)
        },
        onError: (error) => {
          if (isAxiosError(error) && error.response?.status === 409) {
            toast.error("This lead was modified by someone else. Reload the page and try again.")
          } else {
            toast.error("Could not save changes. Check the form and try again.")
          }
        },
      },
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Lead</h1>
      <p className="text-muted-foreground">Update lead details.</p>

      <div className="mt-6 max-w-3xl">
        {isLoading || !lead ? (
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <LeadForm
            defaultValues={toFormDefaults(lead)}
            onSubmit={handleSubmit}
            isSubmitting={updateLead.isPending}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  )
}
