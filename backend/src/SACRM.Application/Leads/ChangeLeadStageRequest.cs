using FluentValidation;

namespace SACRM.Application.Leads;

public class ChangeLeadStageRequest
{
    public int LeadStageId { get; set; }
}

public class ChangeLeadStageRequestValidator : AbstractValidator<ChangeLeadStageRequest>
{
    public ChangeLeadStageRequestValidator()
    {
        RuleFor(x => x.LeadStageId).GreaterThan(0);
    }
}
