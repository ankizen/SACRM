using Microsoft.EntityFrameworkCore;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Persistence;

public class SacrmDbContext(DbContextOptions<SacrmDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<LeadSource> LeadSources => Set<LeadSource>();
    public DbSet<LeadStage> LeadStages => Set<LeadStage>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadTimelineEntry> LeadTimelineEntries => Set<LeadTimelineEntry>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Followup> Followups => Set<Followup>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<CompanyProfile> CompanyProfiles => Set<CompanyProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SacrmDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
