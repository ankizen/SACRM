using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Settings;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/countries")]
[Authorize]
public class CountriesController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CountryDto>>> List([FromQuery] bool includeInactive, CancellationToken ct)
    {
        var query = unitOfWork.Repository<Country>().Query();
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        var result = await query
            .OrderBy(c => c.Name)
            .Select(c => new CountryDto { Id = c.Id, Name = c.Name, IsActive = c.IsActive })
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<ActionResult<CountryDto>> Create(CountryUpsertRequest request, CancellationToken ct)
    {
        var entity = new Country { Name = request.Name, IsActive = request.IsActive };
        await unitOfWork.Repository<Country>().AddAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(List), null, new CountryDto { Id = entity.Id, Name = entity.Name, IsActive = entity.IsActive });
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Update(int id, CountryUpsertRequest request, CancellationToken ct)
    {
        var entity = await unitOfWork.Repository<Country>().GetByIdAsync(id, ct);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Country), id);
        }

        entity.Name = request.Name;
        entity.IsActive = request.IsActive;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}
