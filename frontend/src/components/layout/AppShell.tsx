import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useFollowupNotifications } from "@/features/notifications/use-followup-notifications"
import { AppSidebar } from "./AppSidebar"
import { Topbar } from "./Topbar"

export function AppShell() {
  useFollowupNotifications()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <Topbar />
          <main className="min-w-0 flex-1 overflow-auto bg-muted/40">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
