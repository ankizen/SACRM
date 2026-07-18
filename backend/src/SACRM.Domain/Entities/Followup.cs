using SACRM.Domain.Common;
using SACRM.Domain.Enums;

namespace SACRM.Domain.Entities;

public class Followup : AuditableEntity
{
    public int LeadId { get; set; }
    public Lead Lead { get; set; } = null!;

    public DateTime DueAtUtc { get; set; }
    public FollowupStatus Status { get; set; } = FollowupStatus.Pending;
    public string? Notes { get; set; }
    public DateTime? CompletedAtUtc { get; set; }

    public int AssignedToUserId { get; set; }
    public User AssignedToUser { get; set; } = null!;
}
