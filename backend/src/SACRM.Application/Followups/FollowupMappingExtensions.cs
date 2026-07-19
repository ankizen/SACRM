namespace SACRM.Application.Followups;

public static class FollowupMappingExtensions
{
    public static IQueryable<FollowupDto> ToDtoQuery(this IQueryable<Domain.Entities.Followup> query) =>
        query.Select(f => new FollowupDto
        {
            Id = f.Id,
            LeadId = f.LeadId,
            LeadName = f.Lead.Name,
            DueAtUtc = f.DueAtUtc,
            Status = f.Status.ToString(),
            Notes = f.Notes,
            CompletedAtUtc = f.CompletedAtUtc,
            AssignedToUserId = f.AssignedToUserId,
            AssignedToUserName = f.AssignedToUser.FullName,
            CreatedAtUtc = f.CreatedAtUtc
        });
}
