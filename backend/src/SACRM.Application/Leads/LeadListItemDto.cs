namespace SACRM.Application.Leads;

public class LeadListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? ShopName { get; set; }
    public string? CityName { get; set; }
    public int LeadStageId { get; set; }
    public string LeadStageName { get; set; } = string.Empty;
    public string? LeadSourceName { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public string Priority { get; set; } = string.Empty;
    public bool IsDuplicate { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
