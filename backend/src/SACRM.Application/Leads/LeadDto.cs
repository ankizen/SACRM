namespace SACRM.Application.Leads;

public class LeadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? WhatsAppNumber { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Email { get; set; }
    public string? ShopName { get; set; }
    public string? Address { get; set; }
    public int? CityId { get; set; }
    public string? CityName { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public int? CountryId { get; set; }
    public string? CountryName { get; set; }
    public string? GstNumber { get; set; }
    public string? Website { get; set; }
    public int? LeadSourceId { get; set; }
    public string? LeadSourceName { get; set; }
    public int LeadStageId { get; set; }
    public string LeadStageName { get; set; } = string.Empty;
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public bool IsDuplicate { get; set; }
    public int? DuplicateOfLeadId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public string RowVersion { get; set; } = string.Empty;
}
