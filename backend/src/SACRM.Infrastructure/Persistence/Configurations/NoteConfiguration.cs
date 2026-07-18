using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence.Configurations;

public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.Property(n => n.Content).IsRequired();

        builder.HasIndex(n => n.LeadId);

        builder.HasOne(n => n.Lead)
            .WithMany(l => l.Notes)
            .HasForeignKey(n => n.LeadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
