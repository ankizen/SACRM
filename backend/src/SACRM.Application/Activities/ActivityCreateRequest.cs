using FluentValidation;
using SACRM.Domain.Enums;

namespace SACRM.Application.Activities;

public class ActivityCreateRequest
{
    public ActivityType Type { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? OccurredAtUtc { get; set; }
}

public class ActivityCreateRequestValidator : AbstractValidator<ActivityCreateRequest>
{
    public ActivityCreateRequestValidator()
    {
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
    }
}
