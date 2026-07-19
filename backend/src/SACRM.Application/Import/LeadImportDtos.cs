namespace SACRM.Application.Import;

public class LeadImportPreviewDto
{
    public List<string> Headers { get; set; } = [];
    public List<Dictionary<string, string>> SampleRows { get; set; } = [];
    public string[] SupportedFields { get; set; } = LeadImportMapper.SupportedFields;
}

public class LeadImportRowError
{
    public int RowNumber { get; set; }
    public string Error { get; set; } = string.Empty;
}

public class LeadImportResultDto
{
    public int TotalRows { get; set; }
    public int Created { get; set; }
    public int SkippedDuplicates { get; set; }
    public int Failed { get; set; }
    public List<LeadImportRowError> Errors { get; set; } = [];
}

public class LeadExportRow
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? ShopName { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? LeadSource { get; set; }
    public string LeadStage { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
