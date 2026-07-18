using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence.Configurations;

public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.Property(l => l.Name).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Phone).IsRequired().HasMaxLength(20);
        builder.Property(l => l.WhatsAppNumber).HasMaxLength(20);
        builder.Property(l => l.AlternatePhone).HasMaxLength(20);
        builder.Property(l => l.Email).HasMaxLength(256);
        builder.Property(l => l.ShopName).HasMaxLength(200);
        builder.Property(l => l.State).HasMaxLength(100);
        builder.Property(l => l.ZipCode).HasMaxLength(20);
        builder.Property(l => l.GstNumber).HasMaxLength(15);
        builder.Property(l => l.Website).HasMaxLength(256);
        builder.Property(l => l.Priority).HasConversion<string>().HasMaxLength(20);
        builder.Property(l => l.RowVersion).IsRowVersion();

        builder.HasIndex(l => l.Phone);
        builder.HasIndex(l => l.Email);
        builder.HasIndex(l => l.AssignedToUserId);
        builder.HasIndex(l => l.LeadStageId);
        builder.HasIndex(l => l.CreatedAtUtc);
        builder.HasIndex(l => l.IsDeleted);

        builder.HasOne(l => l.LeadStage)
            .WithMany()
            .HasForeignKey(l => l.LeadStageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.LeadSource)
            .WithMany()
            .HasForeignKey(l => l.LeadSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.City)
            .WithMany()
            .HasForeignKey(l => l.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.Country)
            .WithMany()
            .HasForeignKey(l => l.CountryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.AssignedToUser)
            .WithMany()
            .HasForeignKey(l => l.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.DuplicateOfLead)
            .WithMany()
            .HasForeignKey(l => l.DuplicateOfLeadId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
