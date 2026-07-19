namespace SACRM.Application.Attachments;

public static class AttachmentMappingExtensions
{
    public static IQueryable<AttachmentDto> ToDtoQuery(this IQueryable<Domain.Entities.Attachment> query) =>
        query.Select(a => new AttachmentDto
        {
            Id = a.Id,
            LeadId = a.LeadId,
            FileName = a.FileName,
            ContentType = a.ContentType,
            SizeBytes = a.SizeBytes,
            Category = a.Category.ToString(),
            UploadedByUserId = a.UploadedByUserId,
            UploadedByUserName = a.UploadedByUser.FullName,
            UploadedAtUtc = a.UploadedAtUtc
        });
}
