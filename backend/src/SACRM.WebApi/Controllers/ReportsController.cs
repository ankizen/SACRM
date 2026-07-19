using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Reports;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Policy = "AdminOrAbove")]
public class ReportsController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet("leads-summary")]
    public async Task<ActionResult<List<LeadsSummaryReportItem>>> LeadsSummary(
        [FromQuery] ReportGroupBy groupBy, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var query = unitOfWork.Repository<Lead>().Query().Where(l => !l.IsDeleted && !l.IsDuplicate);
        if (from is not null)
        {
            query = query.Where(l => l.CreatedAtUtc >= from);
        }
        if (to is not null)
        {
            query = query.Where(l => l.CreatedAtUtc <= to);
        }

        var result = groupBy switch
        {
            ReportGroupBy.Stage => await query
                .GroupBy(l => l.LeadStage.Name)
                .Select(g => new LeadsSummaryReportItem { Key = g.Key, Count = g.Count() })
                .ToListAsync(ct),

            ReportGroupBy.Source => await query
                .GroupBy(l => l.LeadSource != null ? l.LeadSource.Name : "Unknown")
                .Select(g => new LeadsSummaryReportItem { Key = g.Key, Count = g.Count() })
                .ToListAsync(ct),

            ReportGroupBy.Executive => await query
                .Where(l => l.AssignedToUserId != null)
                .GroupBy(l => l.AssignedToUser!.FullName)
                .Select(g => new LeadsSummaryReportItem { Key = g.Key, Count = g.Count() })
                .ToListAsync(ct),

            ReportGroupBy.Month => await query
                .GroupBy(l => new { l.CreatedAtUtc.Year, l.CreatedAtUtc.Month })
                .Select(g => new LeadsSummaryReportItem { Key = g.Key.Year + "-" + g.Key.Month, Count = g.Count() })
                .ToListAsync(ct),

            _ => []
        };

        return Ok(result.OrderByDescending(r => r.Count).ToList());
    }

    [HttpGet("followups-summary")]
    public async Task<ActionResult<FollowupsSummaryDto>> FollowupsSummary(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var query = unitOfWork.Repository<Followup>().Query();
        if (from is not null)
        {
            query = query.Where(f => f.CreatedAtUtc >= from);
        }
        if (to is not null)
        {
            query = query.Where(f => f.CreatedAtUtc <= to);
        }

        var now = DateTime.UtcNow;
        var dto = new FollowupsSummaryDto
        {
            Completed = await query.CountAsync(f => f.Status == FollowupStatus.Completed, ct),
            Missed = await query.CountAsync(f => f.Status == FollowupStatus.Pending && f.DueAtUtc < now, ct),
            Upcoming = await query.CountAsync(f => f.Status == FollowupStatus.Pending && f.DueAtUtc >= now, ct)
        };

        return Ok(dto);
    }
}
