namespace SACRM.Application.Reports;

public enum ReportGroupBy
{
    Stage,
    Source,
    Month,
    Executive
}

public class LeadsSummaryReportItem
{
    public string Key { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class FollowupsSummaryDto
{
    public int Completed { get; set; }
    public int Missed { get; set; }
    public int Upcoming { get; set; }
}
