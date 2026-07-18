using SACRM.Domain.Common;
using SACRM.Domain.Enums;

namespace SACRM.Domain.Entities;

public class Activity : AuditableEntity
{
    public int LeadId { get; set; }
    public Lead Lead { get; set; } = null!;

    public ActivityType Type { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int PerformedByUserId { get; set; }
    public User PerformedByUser { get; set; } = null!;
    public DateTime OccurredAtUtc { get; set; }
}
