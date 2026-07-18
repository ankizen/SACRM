using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence.Configurations;

public class LeadTimelineEntryConfiguration : IEntityTypeConfiguration<LeadTimelineEntry>
{
    public void Configure(EntityTypeBuilder<LeadTimelineEntry> builder)
    {
        builder.Property(t => t.EventType).HasConversion<string>().HasMaxLength(30);
        builder.Property(t => t.FieldName).HasMaxLength(100);
        builder.Property(t => t.Description).HasMaxLength(1000);

        builder.HasIndex(t => new { t.LeadId, t.PerformedAtUtc });

        builder.HasOne(t => t.Lead)
            .WithMany(l => l.TimelineEntries)
            .HasForeignKey(t => t.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.PerformedByUser)
            .WithMany()
            .HasForeignKey(t => t.PerformedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
