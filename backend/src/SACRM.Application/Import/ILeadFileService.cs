namespace SACRM.Application.Import;

public interface ILeadFileService
{
    Task<(List<string> Headers, List<Dictionary<string, string>> Rows)> ParseAsync(
        Stream fileStream, string fileName, CancellationToken cancellationToken = default);

    Stream ExportToExcel(IEnumerable<LeadExportRow> rows);
    Stream ExportToCsv(IEnumerable<LeadExportRow> rows);
}
