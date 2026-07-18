using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence.Configurations;

public class FollowupConfiguration : IEntityTypeConfiguration<Followup>
{
    public void Configure(EntityTypeBuilder<Followup> builder)
    {
        builder.Property(f => f.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(f => new { f.DueAtUtc, f.AssignedToUserId, f.Status });

        builder.HasOne(f => f.Lead)
            .WithMany(l => l.Followups)
            .HasForeignKey(f => f.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.AssignedToUser)
            .WithMany()
            .HasForeignKey(f => f.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
