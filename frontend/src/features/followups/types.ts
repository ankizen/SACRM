export type FollowupStatus = "Pending" | "Completed" | "Missed" | "Cancelled"

export interface Followup {
  id: number
  leadId: number
  leadName: string
  dueAtUtc: string
  status: FollowupStatus
  notes: string | null
  completedAtUtc: string | null
  assignedToUserId: number
  assignedToUserName: string
  createdAtUtc: string
}

export interface FollowupCreateRequest {
  dueAtUtc: string
  notes?: string
  assignedToUserId?: number
}

export interface FollowupUpdateRequest {
  dueAtUtc: string
  status: FollowupStatus
  notes?: string
}
