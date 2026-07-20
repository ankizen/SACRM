using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Dashboard;
using SACRM.Application.Leads;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(IUnitOfWork unitOfWork, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary(CancellationToken ct)
    {
        var timezone = await unitOfWork.Repository<CompanyProfile>().Query()
            .Select(p => p.Timezone)
            .FirstOrDefaultAsync(ct);
        var (todayStart, todayEnd) = CompanyClock.GetTodayRangeUtc(timezone);

        var leads = unitOfWork.Repository<Lead>().Query().ApplyScope(currentUser).Where(l => !l.IsDeleted && !l.IsDuplicate);

        var stageCounts = await leads
            .GroupBy(l => new { l.LeadStage.Name, l.LeadStage.IsWonStage, l.LeadStage.IsLostStage })
            .Select(g => new { g.Key.Name, g.Key.IsWonStage, g.Key.IsLostStage, Count = g.Count() })
            .ToListAsync(ct);

        var followups = unitOfWork.Repository<Followup>().Query();
        if (currentUser.Role == nameof(UserRole.Executive))
        {
            followups = followups.Where(f => f.AssignedToUserId == currentUser.UserId);
        }

        var now = DateTime.UtcNow;

        var summary = new DashboardSummaryDto
        {
            TodaysLeads = await leads.CountAsync(l => l.CreatedAtUtc >= todayStart && l.CreatedAtUtc < todayEnd, ct),
            FreshLeads = stageCounts.Where(s => s.Name == "Fresh").Sum(s => s.Count),
            PipelineLeads = stageCounts.Where(s => s.Name == "Pipeline").Sum(s => s.Count),
            ConvertedLeads = stageCounts.Where(s => s.IsWonStage).Sum(s => s.Count),
            LostLeads = stageCounts.Where(s => s.IsLostStage).Sum(s => s.Count),
            TodaysFollowups = await followups.CountAsync(
                f => f.Status == FollowupStatus.Pending && f.DueAtUtc >= todayStart && f.DueAtUtc < todayEnd, ct),
            PendingFollowups = await followups.CountAsync(f => f.Status == FollowupStatus.Pending && f.DueAtUtc < now, ct),
            LeadSourceBreakdown = await leads
                .GroupBy(l => l.LeadSource != null ? l.LeadSource.Name : "Unknown")
                .Select(g => new LeadSourceBreakdownItem { SourceName = g.Key, Count = g.Count() })
                .ToListAsync(ct)
        };

        return Ok(summary);
    }

    [HttpGet("executive-performance")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<ActionResult<List<ExecutivePerformanceDto>>> ExecutivePerformance(CancellationToken ct)
    {
        var result = await unitOfWork.Repository<Lead>().Query()
            .Where(l => !l.IsDeleted && !l.IsDuplicate && l.AssignedToUserId != null)
            .GroupBy(l => new { l.AssignedToUserId, l.AssignedToUser!.FullName })
            .Select(g => new ExecutivePerformanceDto
            {
                UserId = g.Key.AssignedToUserId!.Value,
                UserName = g.Key.FullName,
                TotalLeads = g.Count(),
                ConvertedLeads = g.Count(l => l.LeadStage.IsWonStage),
                LostLeads = g.Count(l => l.LeadStage.IsLostStage)
            })
            .ToListAsync(ct);

        foreach (var item in result)
        {
            item.ConversionRatePercent = item.TotalLeads == 0 ? 0 : Math.Round(item.ConvertedLeads * 100.0 / item.TotalLeads, 1);
        }

        return Ok(result);
    }
}
