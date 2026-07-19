using FluentValidation;

namespace SACRM.Application.Leads;

public class LeadCreateRequestValidator : AbstractValidator<LeadCreateRequest>
{
    public LeadCreateRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.WhatsAppNumber).MaximumLength(20);
        RuleFor(x => x.AlternatePhone).MaximumLength(20);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.ShopName).MaximumLength(200);
        RuleFor(x => x.State).MaximumLength(100);
        RuleFor(x => x.ZipCode).MaximumLength(20);
        RuleFor(x => x.GstNumber).Length(15).When(x => !string.IsNullOrWhiteSpace(x.GstNumber));
        RuleFor(x => x.Website).MaximumLength(256);
        RuleFor(x => x.Priority).IsInEnum();
    }
}
