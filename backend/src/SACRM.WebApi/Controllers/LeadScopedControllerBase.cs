using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Leads;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

/// <summary>
/// Base for controllers nested under a Lead (Activities/Followups/Notes/Attachments).
/// Centralizes the "is this lead visible to me" check every one of them needs.
/// </summary>
[ApiController]
[Authorize]
public abstract class LeadScopedControllerBase(IUnitOfWork unitOfWork, ICurrentUserService currentUser) : ControllerBase
{
    protected IUnitOfWork UnitOfWork { get; } = unitOfWork;
    protected ICurrentUserService CurrentUser { get; } = currentUser;

    protected async Task EnsureLeadVisibleAsync(int leadId, CancellationToken cancellationToken)
    {
        var exists = await UnitOfWork.Repository<Lead>().Query().ApplyScope(CurrentUser)
            .AnyAsync(l => l.Id == leadId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException(nameof(Lead), leadId);
        }
    }
}
