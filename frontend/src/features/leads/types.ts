export type LeadPriority = "Low" | "Medium" | "High" | "Urgent"
export type LeadView = "Active" | "Trash" | "Duplicate" | "All"

export interface LeadListItem {
  id: number
  name: string
  phone: string
  email: string | null
  shopName: string | null
  city: string | null
  leadStageId: number
  leadStageName: string
  leadSourceName: string | null
  assignedToUserId: number | null
  assignedToUserName: string | null
  priority: LeadPriority
  isDuplicate: boolean
  isDeleted: boolean
  createdAtUtc: string
}

export interface Lead {
  id: number
  name: string
  phone: string
  whatsAppNumber: string | null
  alternatePhone: string | null
  email: string | null
  shopName: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  countryId: number | null
  countryName: string | null
  gstNumber: string | null
  website: string | null
  leadSourceId: number | null
  leadSourceName: string | null
  leadStageId: number
  leadStageName: string
  assignedToUserId: number | null
  assignedToUserName: string | null
  priority: LeadPriority
  remarks: string | null
  isDuplicate: boolean
  duplicateOfLeadId: number | null
  isDeleted: boolean
  createdAtUtc: string
  createdByUserId: number
  updatedAtUtc: string | null
  rowVersion: string
}

export interface LeadFormValues {
  name: string
  phone: string
  whatsAppNumber?: string
  alternatePhone?: string
  email?: string
  shopName?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  countryId?: number
  gstNumber?: string
  website?: string
  leadSourceId?: number
  leadStageId?: number
  assignedToUserId?: number
  priority: LeadPriority
  remarks?: string
}

export type { PagedResult } from "@/lib/types"

export interface LeadListQuery {
  pageNumber?: number
  pageSize?: number
  search?: string
  leadStageId?: number
  leadSourceId?: number
  countryId?: number
  priority?: LeadPriority
  assignedToUserId?: number
  view?: LeadView
  createdFrom?: string
  createdTo?: string
  wonStage?: boolean
  lostStage?: boolean
}

export interface LeadTimelineEntry {
  id: number
  eventType: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  description: string | null
  performedByUserId: number
  performedByUserName: string
  performedAtUtc: string
}
