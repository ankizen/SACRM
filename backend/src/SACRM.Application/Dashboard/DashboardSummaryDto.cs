namespace SACRM.Application.Dashboard;

public class DashboardSummaryDto
{
    public int TodaysLeads { get; set; }
    public int FreshLeads { get; set; }
    public int PipelineLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int LostLeads { get; set; }
    public int TodaysFollowups { get; set; }
    public int PendingFollowups { get; set; }
    public List<LeadSourceBreakdownItem> LeadSourceBreakdown { get; set; } = [];
}

public class LeadSourceBreakdownItem
{
    public string SourceName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ExecutivePerformanceDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int TotalLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int LostLeads { get; set; }
    public double ConversionRatePercent { get; set; }
}
