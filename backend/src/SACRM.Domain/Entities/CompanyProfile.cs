namespace SACRM.Domain.Entities;

public class CompanyProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? GstNumber { get; set; }
    public string? LogoUrl { get; set; }
    public string Timezone { get; set; } = "Asia/Kolkata";

    public DateTime? UpdatedAtUtc { get; set; }
    public int? UpdatedByUserId { get; set; }
}
