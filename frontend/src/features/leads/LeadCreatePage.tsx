import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LeadForm } from "./LeadForm"
import { useCreateLead } from "./hooks"
import { toLeadFormValues, type LeadFormSchema } from "./lead-schema"

export function LeadCreatePage() {
  const navigate = useNavigate()
  const createLead = useCreateLead()

  const handleSubmit = (values: LeadFormSchema) => {
    createLead.mutate(toLeadFormValues(values), {
      onSuccess: (lead) => {
        toast.success("Lead created")
        navigate(`/leads/${lead.id}`)
      },
      onError: () => toast.error("Could not create the lead. Check the form and try again."),
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Lead</h1>
      <p className="text-muted-foreground">Add a new lead to the pipeline.</p>

      <div className="mt-6 max-w-3xl">
        <LeadForm onSubmit={handleSubmit} isSubmitting={createLead.isPending} submitLabel="Create Lead" showDuplicateCheck />
      </div>
    </div>
  )
}
