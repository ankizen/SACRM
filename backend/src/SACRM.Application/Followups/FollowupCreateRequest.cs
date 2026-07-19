using FluentValidation;

namespace SACRM.Application.Followups;

public class FollowupCreateRequest
{
    public DateTime DueAtUtc { get; set; }
    public string? Notes { get; set; }
    public int? AssignedToUserId { get; set; }
}

public class FollowupCreateRequestValidator : AbstractValidator<FollowupCreateRequest>
{
    public FollowupCreateRequestValidator()
    {
        RuleFor(x => x.DueAtUtc).NotEqual(default(DateTime));
    }
}
