using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.Property(a => a.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Subject).IsRequired().HasMaxLength(200);

        builder.HasIndex(a => new { a.LeadId, a.OccurredAtUtc });

        builder.HasOne(a => a.Lead)
            .WithMany(l => l.Activities)
            .HasForeignKey(a => a.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.PerformedByUser)
            .WithMany()
            .HasForeignKey(a => a.PerformedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
