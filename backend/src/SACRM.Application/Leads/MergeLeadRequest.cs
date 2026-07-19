using FluentValidation;

namespace SACRM.Application.Leads;

public class MergeLeadRequest
{
    public int DuplicateLeadId { get; set; }
}

public class MergeLeadRequestValidator : AbstractValidator<MergeLeadRequest>
{
    public MergeLeadRequestValidator()
    {
        RuleFor(x => x.DuplicateLeadId).GreaterThan(0);
    }
}
