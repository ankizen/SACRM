using FluentValidation;

namespace SACRM.Application.Settings;

public class LeadStageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public bool IsWonStage { get; set; }
    public bool IsLostStage { get; set; }
}

public class LeadStageUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public bool IsWonStage { get; set; }
    public bool IsLostStage { get; set; }
}

public class LeadStageUpsertRequestValidator : AbstractValidator<LeadStageUpsertRequest>
{
    public LeadStageUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x)
            .Must(x => !(x.IsWonStage && x.IsLostStage))
            .WithMessage("A stage cannot be both Won and Lost.");
    }
}
