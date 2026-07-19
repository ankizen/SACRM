using FluentValidation;

namespace SACRM.Application.Settings;

public class LeadSourceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}

public class LeadSourceUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}

public class LeadSourceUpsertRequestValidator : AbstractValidator<LeadSourceUpsertRequest>
{
    public LeadSourceUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
