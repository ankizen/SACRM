using SACRM.Application.Common.Interfaces;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.Application.Leads;

public static class LeadAccessScope
{
    /// <summary>
    /// Executives only ever see leads assigned to them; Admin/MasterAdmin see everything.
    /// Applied to every Lead-reading query so the rule lives in exactly one place.
    /// </summary>
    public static IQueryable<Lead> ApplyScope(this IQueryable<Lead> query, ICurrentUserService currentUser)
    {
        if (currentUser.Role == nameof(UserRole.Executive))
        {
            return query.Where(l => l.AssignedToUserId == currentUser.UserId);
        }

        return query;
    }
}
