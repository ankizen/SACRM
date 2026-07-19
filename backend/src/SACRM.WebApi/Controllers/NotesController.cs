using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Common.Models;
using SACRM.Application.Notes;
using SACRM.Domain.Entities;
using SACRM.Infrastructure.Persistence;

namespace SACRM.WebApi.Controllers;

[Route("api/leads/{leadId:int}/notes")]
public class NotesController(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    : LeadScopedControllerBase(unitOfWork, currentUser)
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<NoteDto>>> List(int leadId, [FromQuery] PagedRequest paging, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var query = UnitOfWork.Repository<Note>().Query()
            .Where(n => n.LeadId == leadId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .ToDtoQuery(UnitOfWork.Repository<User>().Query());

        var result = await query.ToPagedResultAsync(paging.PageNumber, paging.PageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create(int leadId, NoteUpsertRequest request, CancellationToken ct)
    {
        await EnsureLeadVisibleAsync(leadId, ct);

        var note = new Note { LeadId = leadId, Content = request.Content };
        await UnitOfWork.Repository<Note>().AddAsync(note, ct);
        await UnitOfWork.SaveChangesAsync(ct);

        var dto = await UnitOfWork.Repository<Note>().Query()
            .Where(n => n.Id == note.Id)
            .ToDtoQuery(UnitOfWork.Repository<User>().Query())
            .SingleAsync(ct);

        return CreatedAtAction(nameof(List), new { leadId }, dto);
    }

    [HttpPut("~/api/notes/{id:int}")]
    public async Task<IActionResult> Update(int id, NoteUpsertRequest request, CancellationToken ct)
    {
        var note = await UnitOfWork.Repository<Note>().GetByIdAsync(id, ct);
        if (note is null)
        {
            throw new NotFoundException(nameof(Note), id);
        }
        await EnsureLeadVisibleAsync(note.LeadId, ct);

        note.Content = request.Content;
        await UnitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("~/api/notes/{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var note = await UnitOfWork.Repository<Note>().GetByIdAsync(id, ct);
        if (note is null)
        {
            throw new NotFoundException(nameof(Note), id);
        }
        await EnsureLeadVisibleAsync(note.LeadId, ct);

        UnitOfWork.Repository<Note>().Remove(note);
        await UnitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}
