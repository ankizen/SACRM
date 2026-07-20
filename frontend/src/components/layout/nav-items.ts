import { BarChart3, CalendarClock, Kanban, LayoutDashboard, Settings, UserCog, Users } from "lucide-react"
import type { UserRole } from "@/features/auth/types"

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["MasterAdmin", "Admin", "Executive"] },
  { to: "/leads", label: "Leads", icon: Users, roles: ["MasterAdmin", "Admin", "Executive"] },
  { to: "/pipeline", label: "Pipeline", icon: Kanban, roles: ["MasterAdmin", "Admin", "Executive"] },
  { to: "/followups", label: "Followups", icon: CalendarClock, roles: ["MasterAdmin", "Admin", "Executive"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["MasterAdmin", "Admin"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["MasterAdmin", "Admin"] },
  { to: "/users", label: "Users", icon: UserCog, roles: ["MasterAdmin", "Admin"] },
]
