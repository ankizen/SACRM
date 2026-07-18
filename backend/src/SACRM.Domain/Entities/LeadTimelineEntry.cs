using SACRM.Domain.Enums;

namespace SACRM.Domain.Entities;

public class LeadTimelineEntry
{
    public int Id { get; set; }

    public int LeadId { get; set; }
    public Lead Lead { get; set; } = null!;

    public LeadTimelineEventType EventType { get; set; }
    public string? FieldName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? Description { get; set; }

    public int PerformedByUserId { get; set; }
    public User PerformedByUser { get; set; } = null!;
    public DateTime PerformedAtUtc { get; set; }
}
