using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Leads;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController(IUnitOfWork unitOfWork, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LeadListItemDto>>> Search([FromQuery] string q, CancellationToken ct)
    {
        var term = q?.Trim() ?? string.Empty;
        if (term.Length < 2)
        {
            return Ok(new List<LeadListItemDto>());
        }

        var results = await unitOfWork.Repository<Lead>().Query().ApplyScope(currentUser)
            .Where(l => !l.IsDeleted && (
                l.Name.Contains(term) ||
                l.Phone.Contains(term) ||
                (l.Email != null && l.Email.Contains(term)) ||
                (l.ShopName != null && l.ShopName.Contains(term)) ||
                (l.GstNumber != null && l.GstNumber.Contains(term)) ||
                (l.WhatsAppNumber != null && l.WhatsAppNumber.Contains(term))))
            .ToListItemDtoQuery()
            .Take(25)
            .ToListAsync(ct);

        return Ok(results);
    }
}
