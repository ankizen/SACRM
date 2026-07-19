using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Settings;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/lead-sources")]
[Authorize]
public class LeadSourcesController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LeadSourceDto>>> List([FromQuery] bool includeInactive, CancellationToken ct)
    {
        var query = unitOfWork.Repository<LeadSource>().Query();
        if (!includeInactive)
        {
            query = query.Where(s => s.IsActive);
        }

        var result = await query
            .OrderBy(s => s.SortOrder)
            .Select(s => new LeadSourceDto { Id = s.Id, Name = s.Name, IsActive = s.IsActive, SortOrder = s.SortOrder })
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<ActionResult<LeadSourceDto>> Create(LeadSourceUpsertRequest request, CancellationToken ct)
    {
        var entity = new LeadSource { Name = request.Name, IsActive = request.IsActive, SortOrder = request.SortOrder };
        await unitOfWork.Repository<LeadSource>().AddAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(List), null,
            new LeadSourceDto { Id = entity.Id, Name = entity.Name, IsActive = entity.IsActive, SortOrder = entity.SortOrder });
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Update(int id, LeadSourceUpsertRequest request, CancellationToken ct)
    {
        var entity = await unitOfWork.Repository<LeadSource>().GetByIdAsync(id, ct);
        if (entity is null)
        {
            throw new NotFoundException(nameof(LeadSource), id);
        }

        entity.Name = request.Name;
        entity.IsActive = request.IsActive;
        entity.SortOrder = request.SortOrder;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}
