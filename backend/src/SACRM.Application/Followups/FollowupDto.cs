namespace SACRM.Application.Followups;

public class FollowupDto
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string LeadName { get; set; } = string.Empty;
    public DateTime DueAtUtc { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public int AssignedToUserId { get; set; }
    public string AssignedToUserName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
