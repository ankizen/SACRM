import { api } from "@/lib/api"
import type { FollowupsSummary, LeadsSummaryReportItem, ReportGroupBy } from "./types"

export const reportsApi = {
  leadsSummary: (groupBy: ReportGroupBy, from?: string, to?: string) =>
    api
      .get<LeadsSummaryReportItem[]>("/reports/leads-summary", { params: { groupBy, from, to } })
      .then((r) => r.data),

  followupsSummary: (from?: string, to?: string) =>
    api.get<FollowupsSummary>("/reports/followups-summary", { params: { from, to } }).then((r) => r.data),
}
