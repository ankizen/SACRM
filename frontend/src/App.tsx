import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/app/query-client"
import { AppRouter } from "@/app/router"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
