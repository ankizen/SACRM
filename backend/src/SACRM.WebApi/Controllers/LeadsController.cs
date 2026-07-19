using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Common.Models;
using SACRM.Application.Leads;
using SACRM.Domain.Entities;
using SACRM.Infrastructure.Persistence;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize]
public class LeadsController(IUnitOfWork unitOfWork, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<LeadListItemDto>>> List([FromQuery] LeadListQuery query, CancellationToken ct)
    {
        var leads = unitOfWork.Repository<Lead>().Query().ApplyScope(currentUser).ApplyFilters(query)
            .OrderByDescending(l => l.CreatedAtUtc);

        var result = await leads.ToListItemDtoQuery().ToPagedResultAsync(query.PageNumber, query.PageSize, ct);
        return Ok(result);
    }

    [HttpGet("duplicate-check")]
    public async Task<ActionResult<List<LeadListItemDto>>> DuplicateCheck(
        [FromQuery] string? phone, [FromQuery] string? email, [FromQuery] string? gstNumber, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(gstNumber))
        {
            return Ok(new List<LeadListItemDto>());
        }

        var query = unitOfWork.Repository<Lead>().Query().ApplyScope(currentUser)
            .Where(l => !l.IsDeleted && (
                (phone != null && l.Phone == phone) ||
                (email != null && l.Email == email) ||
                (gstNumber != null && l.GstNumber == gstNumber)));

        var matches = await query.ToListItemDtoQuery().Take(10).ToListAsync(ct);
        return Ok(matches);
    }

    [HttpPost("bulk-update")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> BulkUpdate(BulkUpdateLeadsRequest request, CancellationToken ct)
    {
        var repo = unitOfWork.Repository<Lead>();
        var leads = await repo.Query().Where(l => request.LeadIds.Contains(l.Id)).ToListAsync(ct);

        foreach (var lead in leads)
        {
            if (request.LeadStageId is not null) lead.LeadStageId = request.LeadStageId.Value;
            if (request.AssignedToUserId is not null) lead.AssignedToUserId = request.AssignedToUserId.Value;
        }

        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LeadDto>> Get(int id, CancellationToken ct)
    {
        var dto = await unitOfWork.Repository<Lead>().Query().ApplyScope(currentUser)
            .Where(l => l.Id == id)
            .ToDtoQuery()
            .SingleOrDefaultAsync(ct);

        if (dto is null)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<LeadDto>> Create(LeadCreateRequest request, CancellationToken ct)
    {
        var stageId = request.LeadStageId ?? await GetDefaultFreshStageIdAsync(ct);

        var lead = new Lead
        {
            Name = request.Name,
            Phone = request.Phone,
            WhatsAppNumber = request.WhatsAppNumber,
            AlternatePhone = request.AlternatePhone,
            Email = request.Email,
            ShopName = request.ShopName,
            Address = request.Address,
            CityId = request.CityId,
            State = request.State,
            ZipCode = request.ZipCode,
            CountryId = request.CountryId,
            GstNumber = request.GstNumber,
            Website = request.Website,
            LeadSourceId = request.LeadSourceId,
            LeadStageId = stageId,
            AssignedToUserId = request.AssignedToUserId,
            Priority = request.Priority,
            Remarks = request.Remarks
        };

        await unitOfWork.Repository<Lead>().AddAsync(lead, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var dto = await unitOfWork.Repository<Lead>().Query()
            .Where(l => l.Id == lead.Id)
            .ToDtoQuery()
            .SingleAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = lead.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<LeadDto>> Update(int id, LeadUpdateRequest request, CancellationToken ct)
    {
        var repo = unitOfWork.Repository<Lead>();
        var lead = await repo.Query().ApplyScope(currentUser).SingleOrDefaultAsync(l => l.Id == id, ct);
        if (lead is null)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        if (Convert.ToBase64String(lead.RowVersion) != request.RowVersion)
        {
            throw new ConflictException("This lead was modified by someone else. Reload and try again.");
        }

        lead.Name = request.Name;
        lead.Phone = request.Phone;
        lead.WhatsAppNumber = request.WhatsAppNumber;
        lead.AlternatePhone = request.AlternatePhone;
        lead.Email = request.Email;
        lead.ShopName = request.ShopName;
        lead.Address = request.Address;
        lead.CityId = request.CityId;
        lead.State = request.State;
        lead.ZipCode = request.ZipCode;
        lead.CountryId = request.CountryId;
        lead.GstNumber = request.GstNumber;
        lead.Website = request.Website;
        lead.LeadSourceId = request.LeadSourceId;
        if (request.LeadStageId is not null)
        {
            lead.LeadStageId = request.LeadStageId.Value;
        }
        lead.Priority = request.Priority;
        lead.Remarks = request.Remarks;

        await unitOfWork.SaveChangesAsync(ct);

        var dto = await repo.Query().Where(l => l.Id == id).ToDtoQuery().SingleAsync(ct);
        return Ok(dto);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var lead = await unitOfWork.Repository<Lead>().Query().SingleOrDefaultAsync(l => l.Id == id, ct);
        if (lead is null)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        lead.IsDeleted = true;
        lead.DeletedAtUtc = DateTime.UtcNow;
        lead.DeletedByUserId = currentUser.UserId;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:int}/restore")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Restore(int id, CancellationToken ct)
    {
        var lead = await unitOfWork.Repository<Lead>().Query().SingleOrDefaultAsync(l => l.Id == id, ct);
        if (lead is null)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        lead.IsDeleted = false;
        lead.DeletedAtUtc = null;
        lead.DeletedByUserId = null;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:int}/merge")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Merge(int id, MergeLeadRequest request, CancellationToken ct)
    {
        if (id == request.DuplicateLeadId)
        {
            throw new ConflictException("A lead cannot be merged into itself.");
        }

        var repo = unitOfWork.Repository<Lead>();
        var canonicalExists = await repo.Query().AnyAsync(l => l.Id == id, ct);
        if (!canonicalExists)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        var duplicate = await repo.Query().SingleOrDefaultAsync(l => l.Id == request.DuplicateLeadId, ct);
        if (duplicate is null)
        {
            throw new NotFoundException(nameof(Lead), request.DuplicateLeadId);
        }

        duplicate.IsDuplicate = true;
        duplicate.DuplicateOfLeadId = id;
        duplicate.IsDeleted = true;
        duplicate.DeletedAtUtc = DateTime.UtcNow;
        duplicate.DeletedByUserId = currentUser.UserId;

        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:int}/assign")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Assign(int id, AssignLeadRequest request, CancellationToken ct)
    {
        var lead = await unitOfWork.Repository<Lead>().Query().SingleOrDefaultAsync(l => l.Id == id, ct);
        if (lead is null)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        var executiveExists = await unitOfWork.Repository<User>().Query()
            .AnyAsync(u => u.Id == request.AssignedToUserId && u.IsActive, ct);
        if (!executiveExists)
        {
            throw new NotFoundException(nameof(User), request.AssignedToUserId);
        }

        lead.AssignedToUserId = request.AssignedToUserId;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{id:int}/timeline")]
    public async Task<ActionResult<PagedResult<LeadTimelineEntryDto>>> Timeline(
        int id, [FromQuery] PagedRequest paging, CancellationToken ct)
    {
        var leadExists = await unitOfWork.Repository<Lead>().Query().ApplyScope(currentUser).AnyAsync(l => l.Id == id, ct);
        if (!leadExists)
        {
            throw new NotFoundException(nameof(Lead), id);
        }

        var query = unitOfWork.Repository<LeadTimelineEntry>().Query()
            .Where(t => t.LeadId == id)
            .OrderByDescending(t => t.PerformedAtUtc)
            .Select(t => new LeadTimelineEntryDto
            {
                Id = t.Id,
                EventType = t.EventType.ToString(),
                FieldName = t.FieldName,
                OldValue = t.OldValue,
                NewValue = t.NewValue,
                Description = t.Description,
                PerformedByUserId = t.PerformedByUserId,
                PerformedByUserName = t.PerformedByUser.FullName,
                PerformedAtUtc = t.PerformedAtUtc
            });

        var result = await query.ToPagedResultAsync(paging.PageNumber, paging.PageSize, ct);
        return Ok(result);
    }

    private async Task<int> GetDefaultFreshStageIdAsync(CancellationToken ct)
    {
        var stage = await unitOfWork.Repository<LeadStage>().Query()
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .FirstOrDefaultAsync(ct);
        return stage?.Id ?? 1;
    }
}
