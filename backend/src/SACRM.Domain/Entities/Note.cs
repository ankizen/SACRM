using SACRM.Domain.Common;

namespace SACRM.Domain.Entities;

public class Note : AuditableEntity
{
    public int LeadId { get; set; }
    public Lead Lead { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public ICollection<Attachment> Attachments { get; set; } = [];
}
