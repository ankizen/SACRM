using FluentValidation;

namespace SACRM.Application.Settings;

public class CompanyProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? GstNumber { get; set; }
    public string? LogoUrl { get; set; }
    public string Timezone { get; set; } = "Asia/Kolkata";
    public DateTime? UpdatedAtUtc { get; set; }
}

public class CompanyProfileUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? GstNumber { get; set; }
    public string? LogoUrl { get; set; }
    public string Timezone { get; set; } = "Asia/Kolkata";
}

public class CompanyProfileUpsertRequestValidator : AbstractValidator<CompanyProfileUpsertRequest>
{
    public CompanyProfileUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.GstNumber).Length(15).When(x => !string.IsNullOrWhiteSpace(x.GstNumber));
        RuleFor(x => x.Timezone)
            .NotEmpty()
            .Must(BeAValidTimeZone)
            .WithMessage("Timezone must be a valid IANA time zone identifier.");
    }

    private static bool BeAValidTimeZone(string timezone)
    {
        try
        {
            TimeZoneInfo.FindSystemTimeZoneById(timezone);
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
        catch (InvalidTimeZoneException)
        {
            return false;
        }
    }
}
