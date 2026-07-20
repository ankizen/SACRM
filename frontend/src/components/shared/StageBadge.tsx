import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StageBadgeProps {
  name: string
  isWonStage?: boolean
  isLostStage?: boolean
}

export function StageBadge({ name, isWonStage, isLostStage }: StageBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        isWonStage && "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400",
        isLostStage && "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {name}
    </Badge>
  )
}
