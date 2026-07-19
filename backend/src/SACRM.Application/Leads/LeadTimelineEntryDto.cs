namespace SACRM.Application.Leads;

public class LeadTimelineEntryDto
{
    public int Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? FieldName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? Description { get; set; }
    public int PerformedByUserId { get; set; }
    public string PerformedByUserName { get; set; } = string.Empty;
    public DateTime PerformedAtUtc { get; set; }
}
