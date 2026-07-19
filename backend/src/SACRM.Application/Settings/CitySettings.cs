using FluentValidation;

namespace SACRM.Application.Settings;

public class CityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;
}

public class CityUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int CountryId { get; set; }
}

public class CityUpsertRequestValidator : AbstractValidator<CityUpsertRequest>
{
    public CityUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CountryId).GreaterThan(0);
    }
}
