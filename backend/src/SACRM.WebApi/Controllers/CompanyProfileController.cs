using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Settings;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/company-profile")]
[Authorize]
public class CompanyProfileController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CompanyProfileDto?>> Get(CancellationToken ct)
    {
        var profile = await unitOfWork.Repository<CompanyProfile>().Query()
            .Select(c => ToDto(c))
            .FirstOrDefaultAsync(ct);

        return Ok(profile);
    }

    [HttpPut]
    [Authorize(Policy = "MasterAdminOnly")]
    public async Task<ActionResult<CompanyProfileDto>> Upsert(CompanyProfileUpsertRequest request, CancellationToken ct)
    {
        var repo = unitOfWork.Repository<CompanyProfile>();
        var profile = await repo.Query().FirstOrDefaultAsync(ct);

        if (profile is null)
        {
            profile = new CompanyProfile();
            await repo.AddAsync(profile, ct);
        }

        profile.Name = request.Name;
        profile.Address = request.Address;
        profile.Phone = request.Phone;
        profile.Email = request.Email;
        profile.Website = request.Website;
        profile.GstNumber = request.GstNumber;
        profile.LogoUrl = request.LogoUrl;
        profile.UpdatedAtUtc = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(ct);

        return Ok(ToDto(profile));
    }

    private static CompanyProfileDto ToDto(CompanyProfile c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Address = c.Address,
        Phone = c.Phone,
        Email = c.Email,
        Website = c.Website,
        GstNumber = c.GstNumber,
        LogoUrl = c.LogoUrl,
        UpdatedAtUtc = c.UpdatedAtUtc
    };
}
