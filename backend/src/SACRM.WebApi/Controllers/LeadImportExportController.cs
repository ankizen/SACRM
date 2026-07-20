using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Import;
using SACRM.Application.Leads;
using SACRM.Domain.Entities;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize(Policy = "AdminOrAbove")]
public class LeadImportExportController(IUnitOfWork unitOfWork, ICurrentUserService currentUser, ILeadFileService fileService)
    : ControllerBase
{
    private const long MaxImportFileSizeBytes = 10 * 1024 * 1024;

    [HttpPost("import/preview")]
    [RequestSizeLimit(MaxImportFileSizeBytes)]
    public async Task<ActionResult<LeadImportPreviewDto>> Preview(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            throw new ConflictException("No file was uploaded.");
        }

        await using var stream = file.OpenReadStream();
        var (headers, rows) = await fileService.ParseAsync(stream, file.FileName, ct);

        return Ok(new LeadImportPreviewDto
        {
            Headers = headers,
            SampleRows = rows.Take(5).ToList()
        });
    }

    [HttpPost("import")]
    [RequestSizeLimit(MaxImportFileSizeBytes)]
    public async Task<ActionResult<LeadImportResultDto>> Import(
        IFormFile file, [FromForm] string mapping, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            throw new ConflictException("No file was uploaded.");
        }

        Dictionary<string, string> fieldMapping;
        try
        {
            fieldMapping = JsonSerializer.Deserialize<Dictionary<string, string>>(mapping) ?? [];
        }
        catch (JsonException)
        {
            throw new ConflictException("The 'mapping' field must be a JSON object of { excelHeader: leadFieldName }.");
        }

        await using var stream = file.OpenReadStream();
        var (_, rows) = await fileService.ParseAsync(stream, file.FileName, ct);

        var validator = new LeadCreateRequestValidator();
        var result = new LeadImportResultDto { TotalRows = rows.Count };

        var defaultStageId = await unitOfWork.Repository<LeadStage>().Query()
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .Select(s => s.Id)
            .FirstOrDefaultAsync(ct);

        var rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;

            var request = LeadImportMapper.MapRow(row, fieldMapping);
            var validationResult = await validator.ValidateAsync(request, ct);
            if (!validationResult.IsValid)
            {
                result.Failed++;
                result.Errors.Add(new LeadImportRowError
                {
                    RowNumber = rowNumber,
                    Error = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage))
                });
                continue;
            }

            var isDuplicate = await unitOfWork.Repository<Lead>().Query()
                .AnyAsync(l => l.Phone == request.Phone && !l.IsDeleted, ct);
            if (isDuplicate)
            {
                result.SkippedDuplicates++;
                continue;
            }

            var lead = new Lead
            {
                Name = request.Name,
                Phone = request.Phone,
                WhatsAppNumber = request.WhatsAppNumber,
                AlternatePhone = request.AlternatePhone,
                Email = request.Email,
                ShopName = request.ShopName,
                Address = request.Address,
                State = request.State,
                ZipCode = request.ZipCode,
                GstNumber = request.GstNumber,
                Website = request.Website,
                Remarks = request.Remarks,
                Priority = request.Priority,
                LeadStageId = defaultStageId
            };

            await unitOfWork.Repository<Lead>().AddAsync(lead, ct);
            result.Created++;
        }

        await unitOfWork.SaveChangesAsync(ct);
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] LeadListQuery query, [FromQuery] string format, CancellationToken ct)
    {
        var rows = await unitOfWork.Repository<Lead>().Query()
            .ApplyScope(currentUser)
            .ApplyFilters(query)
            .OrderByDescending(l => l.CreatedAtUtc)
            .Select(l => new LeadExportRow
            {
                Id = l.Id,
                Name = l.Name,
                Phone = l.Phone,
                Email = l.Email,
                ShopName = l.ShopName,
                City = l.City,
                State = l.State,
                Country = l.Country != null ? l.Country.Name : null,
                LeadSource = l.LeadSource != null ? l.LeadSource.Name : null,
                LeadStage = l.LeadStage.Name,
                AssignedTo = l.AssignedToUser != null ? l.AssignedToUser.FullName : null,
                Priority = l.Priority.ToString(),
                CreatedAtUtc = l.CreatedAtUtc
            })
            .ToListAsync(ct);

        if (string.Equals(format, "csv", StringComparison.OrdinalIgnoreCase))
        {
            var csvStream = fileService.ExportToCsv(rows);
            return File(csvStream, "text/csv", "leads.csv");
        }

        var excelStream = fileService.ExportToExcel(rows);
        return File(excelStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "leads.xlsx");
    }
}
