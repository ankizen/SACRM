namespace SACRM.Application.Activities;

public static class ActivityMappingExtensions
{
    public static IQueryable<ActivityDto> ToDtoQuery(this IQueryable<Domain.Entities.Activity> query) =>
        query.Select(a => new ActivityDto
        {
            Id = a.Id,
            LeadId = a.LeadId,
            Type = a.Type.ToString(),
            Subject = a.Subject,
            Description = a.Description,
            PerformedByUserId = a.PerformedByUserId,
            PerformedByUserName = a.PerformedByUser.FullName,
            OccurredAtUtc = a.OccurredAtUtc,
            CreatedAtUtc = a.CreatedAtUtc
        });
}
