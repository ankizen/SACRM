using FluentValidation;

namespace SACRM.Application.Leads;

public class AssignLeadRequest
{
    public int AssignedToUserId { get; set; }
}

public class AssignLeadRequestValidator : AbstractValidator<AssignLeadRequest>
{
    public AssignLeadRequestValidator()
    {
        RuleFor(x => x.AssignedToUserId).GreaterThan(0);
    }
}
