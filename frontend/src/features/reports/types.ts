export type ReportGroupBy = "Stage" | "Source" | "Month" | "Executive"

export interface LeadsSummaryReportItem {
  key: string
  count: number
}

export interface FollowupsSummary {
  completed: number
  missed: number
  upcoming: number
}
