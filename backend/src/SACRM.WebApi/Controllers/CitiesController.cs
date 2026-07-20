using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Settings;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/cities")]
[Authorize]
public class CitiesController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CityDto>>> List(
        [FromQuery] int? countryId, [FromQuery] bool includeInactive, CancellationToken ct)
    {
        var query = unitOfWork.Repository<City>().Query();
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }
        if (countryId is not null)
        {
            query = query.Where(c => c.CountryId == countryId);
        }

        var result = await query
            .OrderBy(c => c.Name)
            .Select(c => new CityDto { Id = c.Id, Name = c.Name, IsActive = c.IsActive, CountryId = c.CountryId, CountryName = c.Country.Name })
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<ActionResult<CityDto>> Create(CityUpsertRequest request, CancellationToken ct)
    {
        var nameTaken = await unitOfWork.Repository<City>().Query()
            .AnyAsync(c => c.CountryId == request.CountryId && c.Name == request.Name, ct);
        if (nameTaken)
        {
            throw new ConflictException($"A city named '{request.Name}' already exists in this country.");
        }

        var entity = new City { Name = request.Name, IsActive = request.IsActive, CountryId = request.CountryId };
        await unitOfWork.Repository<City>().AddAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var dto = await unitOfWork.Repository<City>().Query()
            .Where(c => c.Id == entity.Id)
            .Select(c => new CityDto { Id = c.Id, Name = c.Name, IsActive = c.IsActive, CountryId = c.CountryId, CountryName = c.Country.Name })
            .SingleAsync(ct);

        return CreatedAtAction(nameof(List), null, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrAbove")]
    public async Task<IActionResult> Update(int id, CityUpsertRequest request, CancellationToken ct)
    {
        var entity = await unitOfWork.Repository<City>().GetByIdAsync(id, ct);
        if (entity is null)
        {
            throw new NotFoundException(nameof(City), id);
        }

        var nameTaken = await unitOfWork.Repository<City>().Query()
            .AnyAsync(c => c.CountryId == request.CountryId && c.Name == request.Name && c.Id != id, ct);
        if (nameTaken)
        {
            throw new ConflictException($"A city named '{request.Name}' already exists in this country.");
        }

        entity.Name = request.Name;
        entity.IsActive = request.IsActive;
        entity.CountryId = request.CountryId;
        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}
