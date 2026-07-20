import type { LucideIcon } from "lucide-react"

function EmptyTrayIllustration() {
  return (
    <svg viewBox="0 0 96 96" fill="none" className="size-16" aria-hidden="true">
      <circle cx="48" cy="48" r="46" className="fill-primary/5" />
      <path
        d="M24 44 L34 20 H62 L72 44"
        className="stroke-primary/40"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 44 H36 L40 50 H56 L60 44 H74 V68 A4 4 0 0 1 70 72 H26 A4 4 0 0 1 22 68 Z"
        className="fill-background stroke-primary"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="34" r="3" className="fill-primary/30" />
    </svg>
  )
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {Icon ? (
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="size-7 text-primary" />
        </div>
      ) : (
        <EmptyTrayIllustration />
      )}
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
