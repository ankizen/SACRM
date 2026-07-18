namespace SACRM.Domain.Entities;

public class City
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public int CountryId { get; set; }
    public Country Country { get; set; } = null!;
}
