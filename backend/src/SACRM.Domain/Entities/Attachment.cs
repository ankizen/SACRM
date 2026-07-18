using SACRM.Domain.Common;
using SACRM.Domain.Enums;

namespace SACRM.Domain.Entities;

public class Attachment : AuditableEntity
{
    public int LeadId { get; set; }
    public Lead Lead { get; set; } = null!;

    public int? NoteId { get; set; }
    public Note? Note { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public AttachmentCategory Category { get; set; } = AttachmentCategory.Document;

    public int UploadedByUserId { get; set; }
    public User UploadedByUser { get; set; } = null!;
    public DateTime UploadedAtUtc { get; set; }
}
