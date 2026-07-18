using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SACRM.Application.Common.Interfaces;
using SACRM.Domain.Common;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.Infrastructure.Persistence.Interceptors;

public class AuditableEntitySaveChangesInterceptor(ICurrentUserService currentUserService) : SaveChangesInterceptor
{
    private static readonly HashSet<string> IgnoredProperties =
    [
        nameof(Lead.Id),
        nameof(Lead.RowVersion),
        nameof(AuditableEntity.CreatedAtUtc),
        nameof(AuditableEntity.CreatedByUserId),
        nameof(AuditableEntity.UpdatedAtUtc),
        nameof(AuditableEntity.UpdatedByUserId)
    ];

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        ProcessChanges(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        ProcessChanges(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ProcessChanges(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var utcNow = DateTime.UtcNow;
        var userId = currentUserService.UserId;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAtUtc = utcNow;
                    entry.Entity.CreatedByUserId = userId ?? entry.Entity.CreatedByUserId;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAtUtc = utcNow;
                    entry.Entity.UpdatedByUserId = userId;
                    break;
            }
        }

        if (userId is not null)
        {
            WriteLeadTimelineEntries(context, utcNow, userId.Value);
        }
    }

    private static void WriteLeadTimelineEntries(DbContext context, DateTime utcNow, int userId)
    {
        foreach (var entry in context.ChangeTracker.Entries<Lead>().ToList())
        {
            if (entry.State == EntityState.Added)
            {
                context.Add(new LeadTimelineEntry
                {
                    Lead = entry.Entity,
                    EventType = LeadTimelineEventType.Created,
                    Description = "Lead created",
                    PerformedByUserId = userId,
                    PerformedAtUtc = utcNow
                });
                continue;
            }

            if (entry.State != EntityState.Modified)
            {
                continue;
            }

            foreach (var property in entry.Properties)
            {
                if (!property.IsModified || IgnoredProperties.Contains(property.Metadata.Name))
                {
                    continue;
                }

                var oldValue = property.OriginalValue?.ToString();
                var newValue = property.CurrentValue?.ToString();
                if (oldValue == newValue)
                {
                    continue;
                }

                var (eventType, description) = property.Metadata.Name switch
                {
                    nameof(Lead.LeadStageId) => (LeadTimelineEventType.StageChanged, "Stage changed"),
                    nameof(Lead.AssignedToUserId) => string.IsNullOrEmpty(oldValue)
                        ? (LeadTimelineEventType.Assigned, "Lead assigned")
                        : (LeadTimelineEventType.Reassigned, "Lead reassigned"),
                    _ => (LeadTimelineEventType.FieldUpdated, $"{property.Metadata.Name} updated")
                };

                context.Add(new LeadTimelineEntry
                {
                    Lead = entry.Entity,
                    EventType = eventType,
                    FieldName = property.Metadata.Name,
                    OldValue = oldValue,
                    NewValue = newValue,
                    Description = description,
                    PerformedByUserId = userId,
                    PerformedAtUtc = utcNow
                });
            }
        }
    }
}
