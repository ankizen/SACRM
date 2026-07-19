namespace SACRM.Application.Attachments;

public class AttachmentDto
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string Category { get; set; } = string.Empty;
    public int UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = string.Empty;
    public DateTime UploadedAtUtc { get; set; }
}
