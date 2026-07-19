using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Activities;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Common.Models;
using SACRM.Domain.Entities;
using SACRM.Infrastructure.Persistence;

namespace SACRM.WebApi.Controllers;

[Route("api/leads/{leadId:int}/activities")]
public class ActivitiesController(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    : LeadScopedControllerBase(unitOfWork, currentUser)
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ActivityDto>>> List(int leadId, [FromQuery] PagedRequest paging, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var query = UnitOfWork.Repository<Activity>().Query()
            .Where(a => a.LeadId == leadId)
            .OrderByDescending(a => a.OccurredAtUtc)
            .ToDtoQuery();

        var result = await query.ToPagedResultAsync(paging.PageNumber, paging.PageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityDto>> Create(int leadId, ActivityCreateRequest request, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var activity = new Activity
        {
            LeadId = leadId,
            Type = request.Type,
            Subject = request.Subject,
            Description = request.Description,
            PerformedByUserId = CurrentUser.UserId!.Value,
            OccurredAtUtc = request.OccurredAtUtc ?? DateTime.UtcNow
        };

        await UnitOfWork.Repository<Activity>().AddAsync(activity, ct);
        await UnitOfWork.SaveChangesAsync(ct);

        var dto = await UnitOfWork.Repository<Activity>().Query()
            .Where(a => a.Id == activity.Id)
            .ToDtoQuery()
            .SingleAsync(ct);

        return CreatedAtAction(nameof(List), new { leadId }, dto);
    }
}
