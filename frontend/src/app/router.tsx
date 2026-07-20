import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { ComingSoonPage } from "@/features/shared/ComingSoonPage"
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
          { path: "/leads", element: <ComingSoonPage title="Leads" /> },
          {
            element: <RoleGuard allowedRoles={["MasterAdmin", "Admin"]} />,
            children: [
              { path: "/reports", element: <ComingSoonPage title="Reports" /> },
              { path: "/settings", element: <ComingSoonPage title="Settings" /> },
              { path: "/users", element: <ComingSoonPage title="Users" /> },
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
