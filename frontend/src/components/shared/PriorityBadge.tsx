import { Badge } from "@/components/ui/badge"
import type { LeadPriority } from "@/features/leads/types"

const VARIANT: Record<LeadPriority, "outline" | "secondary" | "default" | "destructive"> = {
  Low: "outline",
  Medium: "secondary",
  High: "default",
  Urgent: "destructive",
}

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return <Badge variant={VARIANT[priority]}>{priority}</Badge>
}
