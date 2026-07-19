using FluentValidation;
using SACRM.Domain.Enums;

namespace SACRM.Application.Followups;

public class FollowupUpdateRequest
{
    public DateTime DueAtUtc { get; set; }
    public FollowupStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class FollowupUpdateRequestValidator : AbstractValidator<FollowupUpdateRequest>
{
    public FollowupUpdateRequestValidator()
    {
        RuleFor(x => x.DueAtUtc).NotEqual(default(DateTime));
        RuleFor(x => x.Status).IsInEnum();
    }
}
