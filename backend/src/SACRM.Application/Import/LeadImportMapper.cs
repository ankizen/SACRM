using SACRM.Application.Leads;
using SACRM.Domain.Enums;

namespace SACRM.Application.Import;

/// <summary>
/// Maps a parsed spreadsheet row onto a LeadCreateRequest using a client-supplied
/// {excelHeader: leadFieldName} mapping, so it can be validated with the same
/// LeadCreateRequestValidator that a normal Create call uses.
/// </summary>
public static class LeadImportMapper
{
    public static readonly string[] SupportedFields =
    [
        "Name", "Phone", "WhatsAppNumber", "AlternatePhone", "Email", "ShopName",
        "Address", "State", "ZipCode", "GstNumber", "Website", "Remarks", "Priority"
    ];

    public static LeadCreateRequest MapRow(Dictionary<string, string> row, Dictionary<string, string> mapping)
    {
        var request = new LeadCreateRequest();

        foreach (var (excelHeader, fieldName) in mapping)
        {
            if (!row.TryGetValue(excelHeader, out var value) || string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            switch (fieldName)
            {
                case "Name": request.Name = value; break;
                case "Phone": request.Phone = value; break;
                case "WhatsAppNumber": request.WhatsAppNumber = value; break;
                case "AlternatePhone": request.AlternatePhone = value; break;
                case "Email": request.Email = value; break;
                case "ShopName": request.ShopName = value; break;
                case "Address": request.Address = value; break;
                case "State": request.State = value; break;
                case "ZipCode": request.ZipCode = value; break;
                case "GstNumber": request.GstNumber = value; break;
                case "Website": request.Website = value; break;
                case "Remarks": request.Remarks = value; break;
                case "Priority":
                    if (Enum.TryParse<LeadPriority>(value, ignoreCase: true, out var priority))
                    {
                        request.Priority = priority;
                    }
                    break;
            }
        }

        return request;
    }
}
