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
}
