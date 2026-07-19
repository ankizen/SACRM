namespace SACRM.Application.Leads;

public class LeadUpdateRequest : LeadCreateRequest
{
    public string RowVersion { get; set; } = string.Empty;
}
