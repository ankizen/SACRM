using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Common.Models;
using SACRM.Application.Followups;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;
using SACRM.Infrastructure.Persistence;

namespace SACRM.WebApi.Controllers;

[Route("api/leads/{leadId:int}/followups")]
public class FollowupsController(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    : LeadScopedControllerBase(unitOfWork, currentUser)
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<FollowupDto>>> List(int leadId, [FromQuery] PagedRequest paging, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var query = UnitOfWork.Repository<Followup>().Query()
            .Where(f => f.LeadId == leadId)
            .OrderBy(f => f.DueAtUtc)
            .ToDtoQuery();

        var result = await query.ToPagedResultAsync(paging.PageNumber, paging.PageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<FollowupDto>> Create(int leadId, FollowupCreateRequest request, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var followup = new Followup
        {
            LeadId = leadId,
            DueAtUtc = request.DueAtUtc,
            Notes = request.Notes,
            AssignedToUserId = request.AssignedToUserId ?? CurrentUser.UserId!.Value,
            Status = FollowupStatus.Pending
        };

        await UnitOfWork.Repository<Followup>().AddAsync(followup, ct);
        await UnitOfWork.SaveChangesAsync(ct);

        var dto = await UnitOfWork.Repository<Followup>().Query()
            .Where(f => f.Id == followup.Id)
            .ToDtoQuery()
            .SingleAsync(ct);

        return CreatedAtAction(nameof(List), new { leadId }, dto);
    }

    [HttpPut("~/api/followups/{id:int}")]
    public async Task<IActionResult> Update(int id, FollowupUpdateRequest request, CancellationToken ct)
    {
        var followup = await UnitOfWork.Repository<Followup>().GetByIdAsync(id, ct);
        if (followup is null)
        {
            throw new NotFoundException(nameof(Followup), id);
        }
        await EnsureLeadVisibleAsync(followup.LeadId, ct);

        followup.DueAtUtc = request.DueAtUtc;
        followup.Status = request.Status;
        followup.Notes = request.Notes;
        if (request.Status == FollowupStatus.Completed && followup.CompletedAtUtc is null)
        {
            followup.CompletedAtUtc = DateTime.UtcNow;
        }

        await UnitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("~/api/followups/today")]
    public async Task<ActionResult<List<FollowupDto>>> Today(CancellationToken ct)
    {
        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1);

        var query = ApplyExecutiveScope(UnitOfWork.Repository<Followup>().Query()
            .Where(f => f.Status == FollowupStatus.Pending && f.DueAtUtc >= todayStart && f.DueAtUtc < todayEnd));

        var result = await query.OrderBy(f => f.DueAtUtc).ToDtoQuery().ToListAsync(ct);
        return Ok(result);
    }

    [HttpGet("~/api/followups/pending")]
    public async Task<ActionResult<List<FollowupDto>>> Pending(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var query = ApplyExecutiveScope(UnitOfWork.Repository<Followup>().Query()
            .Where(f => f.Status == FollowupStatus.Pending && f.DueAtUtc < now));

        var result = await query.OrderBy(f => f.DueAtUtc).ToDtoQuery().ToListAsync(ct);
        return Ok(result);
    }

    private IQueryable<Followup> ApplyExecutiveScope(IQueryable<Followup> query) =>
        CurrentUser.Role == nameof(UserRole.Executive)
            ? query.Where(f => f.AssignedToUserId == CurrentUser.UserId)
            : query;
}
