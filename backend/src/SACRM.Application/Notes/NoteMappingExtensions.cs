using SACRM.Domain.Entities;

namespace SACRM.Application.Notes;

public static class NoteMappingExtensions
{
    /// <summary>
    /// Note only carries the plain AuditableEntity.CreatedByUserId (no navigation property),
    /// so the author's name comes from an explicit join against Users instead.
    /// </summary>
    public static IQueryable<NoteDto> ToDtoQuery(this IQueryable<Note> notes, IQueryable<User> users) =>
        notes.Join(users, n => n.CreatedByUserId, u => u.Id, (n, u) => new NoteDto
        {
            Id = n.Id,
            LeadId = n.LeadId,
            Content = n.Content,
            CreatedByUserId = n.CreatedByUserId,
            CreatedByUserName = u.FullName,
            CreatedAtUtc = n.CreatedAtUtc,
            UpdatedAtUtc = n.UpdatedAtUtc
        });
}
