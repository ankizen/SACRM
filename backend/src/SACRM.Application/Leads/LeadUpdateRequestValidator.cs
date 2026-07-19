using FluentValidation;

namespace SACRM.Application.Leads;

public class LeadUpdateRequestValidator : AbstractValidator<LeadUpdateRequest>
{
    public LeadUpdateRequestValidator()
    {
        Include(new LeadCreateRequestValidator());
        RuleFor(x => x.RowVersion).NotEmpty();
    }
}
