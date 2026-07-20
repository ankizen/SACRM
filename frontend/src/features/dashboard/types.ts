export interface LeadSourceBreakdownItem {
  sourceName: string
  count: number
}

export interface DashboardSummary {
  todaysLeads: number
  freshLeads: number
  pipelineLeads: number
  convertedLeads: number
  lostLeads: number
  todaysFollowups: number
  pendingFollowups: number
  leadSourceBreakdown: LeadSourceBreakdownItem[]
}
