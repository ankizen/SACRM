using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Attachments;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.WebApi.Controllers;

public class AttachmentUploadRequest
{
    public IFormFile File { get; set; } = null!;
    public AttachmentCategory Category { get; set; } = AttachmentCategory.Document;
}

[Route("api/leads/{leadId:int}/attachments")]
public class AttachmentsController(IUnitOfWork unitOfWork, ICurrentUserService currentUser, IFileStorageService fileStorage)
    : LeadScopedControllerBase(unitOfWork, currentUser)
{
    private const long MaxFileSizeBytes = 20 * 1024 * 1024;

    [HttpGet]
    public async Task<ActionResult<List<AttachmentDto>>> List(int leadId, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var result = await UnitOfWork.Repository<Attachment>().Query()
            .Where(a => a.LeadId == leadId)
            .OrderByDescending(a => a.UploadedAtUtc)
            .ToDtoQuery()
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpPost]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<ActionResult<AttachmentDto>> Upload(int leadId, [FromForm] AttachmentUploadRequest request, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        if (request.File is null || request.File.Length == 0)
        {
            throw new ConflictException("No file was uploaded.");
        }

        await using var stream = request.File.OpenReadStream();
        var storagePath = await fileStorage.SaveAsync(leadId, request.File.FileName, stream, ct);

        var attachment = new Attachment
        {
            LeadId = leadId,
            FileName = request.File.FileName,
            ContentType = request.File.ContentType,
            SizeBytes = request.File.Length,
            StoragePath = storagePath,
            Category = request.Category,
            UploadedByUserId = CurrentUser.UserId!.Value,
            UploadedAtUtc = DateTime.UtcNow
        };

        await UnitOfWork.Repository<Attachment>().AddAsync(attachment, ct);
        await UnitOfWork.SaveChangesAsync(ct);

        var dto = await UnitOfWork.Repository<Attachment>().Query()
            .Where(a => a.Id == attachment.Id)
            .ToDtoQuery()
            .SingleAsync(ct);

        return CreatedAtAction(nameof(List), new { leadId }, dto);
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int leadId, int id, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var attachment = await UnitOfWork.Repository<Attachment>().Query()
            .SingleOrDefaultAsync(a => a.Id == id && a.LeadId == leadId, ct);
        if (attachment is null)
        {
            throw new NotFoundException(nameof(Attachment), id);
        }

        var stream = await fileStorage.OpenReadAsync(attachment.StoragePath, ct);
        return File(stream, attachment.ContentType, attachment.FileName);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int leadId, int id, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var attachment = await UnitOfWork.Repository<Attachment>().Query()
            .SingleOrDefaultAsync(a => a.Id == id && a.LeadId == leadId, ct);
        if (attachment is null)
        {
            throw new NotFoundException(nameof(Attachment), id);
        }

        fileStorage.Delete(attachment.StoragePath);
        UnitOfWork.Repository<Attachment>().Remove(attachment);
        await UnitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}
