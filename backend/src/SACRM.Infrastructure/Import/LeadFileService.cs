using System.Globalization;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using SACRM.Application.Import;

namespace SACRM.Infrastructure.Import;

public class LeadFileService : ILeadFileService
{
    public async Task<(List<string> Headers, List<Dictionary<string, string>> Rows)> ParseAsync(
        Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        return extension switch
        {
            ".csv" => await ParseCsvAsync(fileStream, cancellationToken),
            ".xlsx" => ParseExcel(fileStream),
            _ => throw new NotSupportedException($"Unsupported file type '{extension}'. Use .xlsx or .csv.")
        };
    }

    private static async Task<(List<string>, List<Dictionary<string, string>>)> ParseCsvAsync(
        Stream stream, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null
        });

        await csv.ReadAsync();
        csv.ReadHeader();
        var headers = csv.HeaderRecord?.ToList() ?? [];

        var rows = new List<Dictionary<string, string>>();
        while (await csv.ReadAsync())
        {
            cancellationToken.ThrowIfCancellationRequested();
            var row = new Dictionary<string, string>();
            foreach (var header in headers)
            {
                row[header] = csv.GetField(header) ?? string.Empty;
            }
            rows.Add(row);
        }

        return (headers, rows);
    }

    private static (List<string>, List<Dictionary<string, string>>) ParseExcel(Stream stream)
    {
        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheets.First();
        var firstRow = worksheet.FirstRowUsed();
        if (firstRow is null)
        {
            return ([], []);
        }

        var headers = firstRow.Cells()
            .Select(c => c.GetString().Trim())
            .Where(h => !string.IsNullOrEmpty(h))
            .ToList();

        var rows = new List<Dictionary<string, string>>();
        foreach (var dataRow in worksheet.RowsUsed().Skip(1))
        {
            var row = new Dictionary<string, string>();
            for (var i = 0; i < headers.Count; i++)
            {
                row[headers[i]] = dataRow.Cell(i + 1).GetString();
            }
            rows.Add(row);
        }

        return (headers, rows);
    }

    private static readonly string[] ExportColumns =
        ["Id", "Name", "Phone", "Email", "Shop Name", "City", "State", "Country", "Lead Source", "Lead Stage", "Assigned To", "Priority", "Created"];

    public Stream ExportToExcel(IEnumerable<LeadExportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Leads");

        for (var i = 0; i < ExportColumns.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = ExportColumns[i];
        }

        var rowIndex = 2;
        foreach (var row in rows)
        {
            worksheet.Cell(rowIndex, 1).Value = row.Id;
            worksheet.Cell(rowIndex, 2).Value = row.Name;
            worksheet.Cell(rowIndex, 3).Value = row.Phone;
            worksheet.Cell(rowIndex, 4).Value = row.Email;
            worksheet.Cell(rowIndex, 5).Value = row.ShopName;
            worksheet.Cell(rowIndex, 6).Value = row.City;
            worksheet.Cell(rowIndex, 7).Value = row.State;
            worksheet.Cell(rowIndex, 8).Value = row.Country;
            worksheet.Cell(rowIndex, 9).Value = row.LeadSource;
            worksheet.Cell(rowIndex, 10).Value = row.LeadStage;
            worksheet.Cell(rowIndex, 11).Value = row.AssignedTo;
            worksheet.Cell(rowIndex, 12).Value = row.Priority;
            worksheet.Cell(rowIndex, 13).Value = row.CreatedAtUtc.ToString("yyyy-MM-dd");
            rowIndex++;
        }

        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;
        return stream;
    }

    public Stream ExportToCsv(IEnumerable<LeadExportRow> rows)
    {
        var stream = new MemoryStream();
        var writer = new StreamWriter(stream, leaveOpen: true);
        using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture, leaveOpen: true))
        {
            foreach (var column in ExportColumns)
            {
                csv.WriteField(column);
            }
            csv.NextRecord();

            foreach (var row in rows)
            {
                csv.WriteField(row.Id);
                csv.WriteField(row.Name);
                csv.WriteField(row.Phone);
                csv.WriteField(row.Email);
                csv.WriteField(row.ShopName);
                csv.WriteField(row.City);
                csv.WriteField(row.State);
                csv.WriteField(row.Country);
                csv.WriteField(row.LeadSource);
                csv.WriteField(row.LeadStage);
                csv.WriteField(row.AssignedTo);
                csv.WriteField(row.Priority);
                csv.WriteField(row.CreatedAtUtc.ToString("yyyy-MM-dd"));
                csv.NextRecord();
            }
        }

        writer.Flush();
        stream.Position = 0;
        return stream;
    }
}
