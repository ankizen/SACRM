using FluentValidation;

namespace SACRM.Application.Settings;

public class CountryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CountryUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class CountryUpsertRequestValidator : AbstractValidator<CountryUpsertRequest>
{
    public CountryUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
