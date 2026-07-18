using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence.Configurations;

public class LeadStageConfiguration : IEntityTypeConfiguration<LeadStage>
{
    public void Configure(EntityTypeBuilder<LeadStage> builder)
    {
        builder.Property(s => s.Name).IsRequired().HasMaxLength(50);
        builder.HasIndex(s => s.Name).IsUnique();

        builder.HasData(
            new LeadStage { Id = 1, Name = "Fresh", SortOrder = 1, IsActive = true },
            new LeadStage { Id = 2, Name = "Pipeline", SortOrder = 2, IsActive = true },
            new LeadStage { Id = 3, Name = "Follow Up", SortOrder = 3, IsActive = true },
            new LeadStage { Id = 4, Name = "Demo", SortOrder = 4, IsActive = true },
            new LeadStage { Id = 5, Name = "Negotiation", SortOrder = 5, IsActive = true },
            new LeadStage { Id = 6, Name = "Converted", SortOrder = 6, IsActive = true, IsWonStage = true },
            new LeadStage { Id = 7, Name = "Lost", SortOrder = 7, IsActive = true, IsLostStage = true },
            new LeadStage { Id = 8, Name = "Hold", SortOrder = 8, IsActive = true }
        );
    }
}
