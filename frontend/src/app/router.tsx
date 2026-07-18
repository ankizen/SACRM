import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
