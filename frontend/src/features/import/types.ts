export interface LeadImportPreview {
  headers: string[]
  sampleRows: Record<string, string>[]
}

export interface LeadImportRowError {
  rowNumber: number
  error: string
}

export interface LeadImportResult {
  totalRows: number
  created: number
  skippedDuplicates: number
  failed: number
  errors: LeadImportRowError[]
}

export const SUPPORTED_FIELDS = [
  "Name",
  "Phone",
  "WhatsAppNumber",
  "AlternatePhone",
  "Email",
  "ShopName",
  "Address",
  "City",
  "State",
  "ZipCode",
  "GstNumber",
  "Website",
  "Remarks",
  "Priority",
] as const
