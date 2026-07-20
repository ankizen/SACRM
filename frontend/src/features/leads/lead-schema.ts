import { z } from "zod"
import type { LeadFormValues } from "./types"

export const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().min(1, "Phone is required").max(20),
  whatsAppNumber: z.string().max(20).optional().or(z.literal("")),
  alternatePhone: z.string().max(20).optional().or(z.literal("")),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  shopName: z.string().max(200).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  cityId: z.string().optional(),
  state: z.string().max(100).optional().or(z.literal("")),
  zipCode: z.string().max(20).optional().or(z.literal("")),
  countryId: z.string().optional(),
  gstNumber: z.union([z.string().length(15, "GST number must be 15 characters"), z.literal("")]).optional(),
  website: z.string().max(256).optional().or(z.literal("")),
  leadSourceId: z.string().optional(),
  leadStageId: z.string().optional(),
  assignedToUserId: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  remarks: z.string().optional().or(z.literal("")),
})

export type LeadFormSchema = z.infer<typeof leadFormSchema>

export function toLeadFormValues(values: LeadFormSchema): LeadFormValues {
  return {
    name: values.name,
    phone: values.phone,
    whatsAppNumber: values.whatsAppNumber || undefined,
    alternatePhone: values.alternatePhone || undefined,
    email: values.email || undefined,
    shopName: values.shopName || undefined,
    address: values.address || undefined,
    cityId: values.cityId ? Number(values.cityId) : undefined,
    state: values.state || undefined,
    zipCode: values.zipCode || undefined,
    countryId: values.countryId ? Number(values.countryId) : undefined,
    gstNumber: values.gstNumber || undefined,
    website: values.website || undefined,
    leadSourceId: values.leadSourceId ? Number(values.leadSourceId) : undefined,
    leadStageId: values.leadStageId ? Number(values.leadStageId) : undefined,
    assignedToUserId: values.assignedToUserId ? Number(values.assignedToUserId) : undefined,
    priority: values.priority,
    remarks: values.remarks || undefined,
  }
}
