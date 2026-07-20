import { useQuery } from "@tanstack/react-query"
import { reportsApi } from "./reports-api"
import type { ReportGroupBy } from "./types"

export function useLeadsSummary(groupBy: ReportGroupBy, from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", "leads-summary", groupBy, from, to],
    queryFn: () => reportsApi.leadsSummary(groupBy, from, to),
  })
}

export function useFollowupsSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", "followups-summary", from, to],
    queryFn: () => reportsApi.followupsSummary(from, to),
  })
}
