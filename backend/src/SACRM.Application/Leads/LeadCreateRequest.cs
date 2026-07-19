using SACRM.Domain.Enums;

namespace SACRM.Application.Leads;

public class LeadCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? WhatsAppNumber { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Email { get; set; }
    public string? ShopName { get; set; }
    public string? Address { get; set; }
    public int? CityId { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public int? CountryId { get; set; }
    public string? GstNumber { get; set; }
    public string? Website { get; set; }
    public int? LeadSourceId { get; set; }
    public int? LeadStageId { get; set; }
    public int? AssignedToUserId { get; set; }
    public LeadPriority Priority { get; set; } = LeadPriority.Medium;
    public string? Remarks { get; set; }
}
