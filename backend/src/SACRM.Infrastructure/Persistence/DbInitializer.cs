using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SACRM.Application.Auth;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedMasterAdminAsync(
        SacrmDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (await context.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var email = configuration["Seed:MasterAdminEmail"];
        var password = configuration["Seed:MasterAdminPassword"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "No users exist and Seed:MasterAdminEmail/Seed:MasterAdminPassword are not configured. " +
                "Set them via 'dotnet user-secrets set' to bootstrap the first Master Admin account.");
            return;
        }

        var masterAdmin = new User
        {
            FullName = "Master Admin",
            Email = email,
            PasswordHash = passwordHasher.Hash(password),
            Role = UserRole.MasterAdmin,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        context.Users.Add(masterAdmin);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded initial Master Admin account for {Email}.", email);
    }

    /// <summary>
    /// Starter Lead Sources and a Country, so a fresh deployment's Lead form and filters
    /// aren't empty dropdowns on day one. Each table is seeded independently ("only if
    /// empty") so re-running after an admin has customized one list doesn't touch it, and
    /// doesn't block seeding the others.
    /// </summary>
    public static async Task SeedLookupsAsync(SacrmDbContext context, ILogger logger, CancellationToken cancellationToken = default)
    {
        if (!await context.LeadSources.AnyAsync(cancellationToken))
        {
            string[] sources = ["Website", "Referral", "Cold Call", "WhatsApp Inquiry", "Walk-in", "Social Media"];
            for (var i = 0; i < sources.Length; i++)
            {
                context.LeadSources.Add(new LeadSource { Name = sources[i], IsActive = true, SortOrder = i + 1 });
            }

            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Seeded {Count} starter lead sources.", sources.Length);
        }

        if (!await context.Countries.AnyAsync(cancellationToken))
        {
            context.Countries.Add(new Country { Name = "India", IsActive = true });
            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Seeded India as a starter country.");
        }
    }
}
