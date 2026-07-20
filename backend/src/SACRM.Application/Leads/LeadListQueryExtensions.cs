using SACRM.Domain.Entities;

namespace SACRM.Application.Leads;

public static class LeadListQueryExtensions
{
    /// <summary>
    /// Shared by the Lead list endpoint and Export so filter logic lives in exactly one place.
    /// </summary>
    public static IQueryable<Lead> ApplyFilters(this IQueryable<Lead> leads, LeadListQuery query)
    {
        leads = query.View switch
        {
            // Merge marks a duplicate IsDeleted too (it's out of the working pipeline either way),
            // so the Duplicate bucket must not exclude deleted rows or merged leads would vanish from both views.
            LeadView.Trash => leads.Where(l => l.IsDeleted && !l.IsDuplicate),
            LeadView.Duplicate => leads.Where(l => l.IsDuplicate),
            LeadView.All => leads,
            _ => leads.Where(l => !l.IsDeleted && !l.IsDuplicate)
        };

        if (query.LeadStageId is not null) leads = leads.Where(l => l.LeadStageId == query.LeadStageId);
        if (query.LeadSourceId is not null) leads = leads.Where(l => l.LeadSourceId == query.LeadSourceId);
        if (query.CountryId is not null) leads = leads.Where(l => l.CountryId == query.CountryId);
        if (query.Priority is not null) leads = leads.Where(l => l.Priority == query.Priority);
        if (query.AssignedToUserId is not null) leads = leads.Where(l => l.AssignedToUserId == query.AssignedToUserId);
        if (query.CreatedFrom is not null) leads = leads.Where(l => l.CreatedAtUtc >= query.CreatedFrom);
        if (query.CreatedTo is not null) leads = leads.Where(l => l.CreatedAtUtc <= query.CreatedTo);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            leads = leads.Where(l =>
                l.Name.Contains(term) ||
                l.Phone.Contains(term) ||
                (l.Email != null && l.Email.Contains(term)) ||
                (l.ShopName != null && l.ShopName.Contains(term)) ||
                (l.GstNumber != null && l.GstNumber.Contains(term)) ||
                (l.WhatsAppNumber != null && l.WhatsAppNumber.Contains(term)));
        }

        return leads;
    }
}
