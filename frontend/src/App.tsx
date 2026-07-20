import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/app/query-client"
import { AppRouter } from "@/app/router"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/AuthContext"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
