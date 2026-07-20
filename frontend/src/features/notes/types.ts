export interface Note {
  id: number
  leadId: number
  content: string
  createdByUserId: number
  createdByUserName: string
  createdAtUtc: string
  updatedAtUtc: string | null
}
