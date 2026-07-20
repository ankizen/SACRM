export type AttachmentCategory = "Document" | "Image" | "Quotation" | "Invoice" | "Catalogue" | "Other"

export const ATTACHMENT_CATEGORIES: AttachmentCategory[] = [
  "Document",
  "Image",
  "Quotation",
  "Invoice",
  "Catalogue",
  "Other",
]

export interface Attachment {
  id: number
  leadId: number
  fileName: string
  contentType: string
  sizeBytes: number
  category: AttachmentCategory
  uploadedByUserId: number
  uploadedByUserName: string
  uploadedAtUtc: string
}
