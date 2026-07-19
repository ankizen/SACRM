using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Settings;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/lead-stages")]
[Authorize]
public class LeadStagesController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LeadStageDto>>> List([FromQuery] bool includeInactive, CancellationToken ct)
    {
        var query = unitOfWork.Repository<LeadStage>().Query();
        if (!includeInactive)
        {
            query = query.Where(s => s.IsActive);
        }

        var result = await query
            .OrderBy(s => s.SortOrder)
            .Select(s => new LeadStageDto
            {
                Id = s.Id,
                Name = s.Name,
                IsActive = s.IsActive,
                SortOrder = s.SortOrder,
                IsWonStage = s.IsWonStage,
                IsLostStage = s.IsLostStage
            })
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<ActionResult<LeadStageDto>> Create(LeadStageUpsertRequest request, CancellationToken ct)
    {
        var entity = new LeadStage
        {
            Name = request.Name,
            IsActive = request.IsActive,
            SortOrder = request.SortOrder,
            IsWonStage = request.IsWonStage,
            IsLostStage = request.IsLostStage
        };
        await unitOfWork.Repository<LeadStage>().AddAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(List), null, new LeadStageDto
        {
            Id = entity.Id,
            Name = entity.Name,
            IsActive = entity.IsActive,
            SortOrder = entity.SortOrder,
            IsWonStage = entity.IsWonStage,
            IsLostStage = entity.IsLostStage
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Update(int id, LeadStageUpsertRequest request, CancellationToken ct)
    {
        var entity = await unitOfWork.Repository<LeadStage>().GetByIdAsync(id, ct);
        if (entity is null)
        {
            throw new NotFoundException(nameof(LeadStage), id);
        }

        entity.Name = request.Name;
        entity.IsActive = request.IsActive;
        entity.SortOrder = request.SortOrder;
        entity.IsWonStage = request.IsWonStage;
        entity.IsLostStage = request.IsLostStage;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}
