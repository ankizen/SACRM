import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { LeadListPage } from "@/features/leads/LeadListPage"
import { LeadCreatePage } from "@/features/leads/LeadCreatePage"
import { LeadEditPage } from "@/features/leads/LeadEditPage"
import { LeadDetailPage } from "@/features/leads/LeadDetailPage"
import { FollowupsPage } from "@/features/followups/FollowupsPage"
import { ReportsPage } from "@/features/reports/ReportsPage"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { UsersPage } from "@/features/users/UsersPage"
import { ProtectedRoute } from "@/components/routing/ProtectedRoute"
import { RoleGuard } from "@/components/routing/RoleGuard"
import { AppShell } from "@/components/layout/AppShell"

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/leads", element: <LeadListPage /> },
          { path: "/leads/new", element: <LeadCreatePage /> },
          { path: "/leads/:id", element: <LeadDetailPage /> },
          { path: "/leads/:id/edit", element: <LeadEditPage /> },
          { path: "/followups", element: <FollowupsPage /> },
          {
            element: <RoleGuard allowedRoles={["MasterAdmin", "Admin"]} />,
            children: [
              { path: "/reports", element: <ReportsPage /> },
              { path: "/settings", element: <SettingsPage /> },
              { path: "/users", element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
