using SACRM.Application.Common.Models;
using SACRM.Domain.Enums;

namespace SACRM.Application.Leads;

public enum LeadView
{
    Active,
    Trash,
    Duplicate,
    All
}

public class LeadListQuery : PagedRequest
{
    public string? Search { get; set; }
    public int? LeadStageId { get; set; }
    public int? LeadSourceId { get; set; }
    public int? CityId { get; set; }
    public int? CountryId { get; set; }
    public LeadPriority? Priority { get; set; }
    public int? AssignedToUserId { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public LeadView View { get; set; } = LeadView.Active;
}
