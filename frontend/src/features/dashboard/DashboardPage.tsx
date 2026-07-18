import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

interface HealthResponse {
  status: string
  timestampUtc: string
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await api.get<HealthResponse>("/health")).data,
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">SACRM scaffold — feature screens land in Phase 5.</p>

      <Card className="mt-6 max-w-sm">
        <CardHeader>
          <CardTitle>Backend connectivity</CardTitle>
          <CardDescription>GET /api/health</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Checking...</p>}
          {isError && <p className="text-sm text-destructive">Could not reach the API.</p>}
          {data && (
            <p className="text-sm">
              Status: <span className="font-medium">{data.status}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
