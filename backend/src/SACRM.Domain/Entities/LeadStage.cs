namespace SACRM.Domain.Entities;

public class LeadStage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public bool IsWonStage { get; set; }
    public bool IsLostStage { get; set; }
}
