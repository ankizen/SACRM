export type ActivityType =
  | "PhoneCall"
  | "WhatsApp"
  | "Email"
  | "Meeting"
  | "Demo"
  | "Visit"
  | "Task"
  | "Reminder"
  | "CustomNote"

export const ACTIVITY_TYPES: ActivityType[] = [
  "PhoneCall",
  "WhatsApp",
  "Email",
  "Meeting",
  "Demo",
  "Visit",
  "Task",
  "Reminder",
  "CustomNote",
]

export interface Activity {
  id: number
  leadId: number
  type: ActivityType
  subject: string
  description: string | null
  performedByUserId: number
  performedByUserName: string
  occurredAtUtc: string
  createdAtUtc: string
}

export interface ActivityCreateRequest {
  type: ActivityType
  subject: string
  description?: string
}
