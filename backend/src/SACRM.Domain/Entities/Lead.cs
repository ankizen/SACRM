using SACRM.Domain.Common;
using SACRM.Domain.Enums;

namespace SACRM.Domain.Entities;

public class Lead : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? WhatsAppNumber { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Email { get; set; }
    public string? ShopName { get; set; }
    public string? Address { get; set; }

    public int? CityId { get; set; }
    public City? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public int? CountryId { get; set; }
    public Country? Country { get; set; }

    public string? GstNumber { get; set; }
    public string? Website { get; set; }

    public int? LeadSourceId { get; set; }
    public LeadSource? LeadSource { get; set; }

    public int LeadStageId { get; set; }
    public LeadStage LeadStage { get; set; } = null!;

    public int? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    public LeadPriority Priority { get; set; } = LeadPriority.Medium;
    public string? Remarks { get; set; }

    public bool IsDuplicate { get; set; }
    public int? DuplicateOfLeadId { get; set; }
    public Lead? DuplicateOfLead { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public int? DeletedByUserId { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public ICollection<LeadTimelineEntry> TimelineEntries { get; set; } = [];
    public ICollection<Activity> Activities { get; set; } = [];
    public ICollection<Followup> Followups { get; set; } = [];
    public ICollection<Note> Notes { get; set; } = [];
    public ICollection<Attachment> Attachments { get; set; } = [];
}
