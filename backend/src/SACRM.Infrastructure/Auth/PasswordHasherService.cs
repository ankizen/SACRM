using Microsoft.AspNetCore.Identity;
using SACRM.Application.Auth;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Auth;

public class PasswordHasherService : IPasswordHasher
{
    private readonly PasswordHasher<User> _innerHasher = new();

    public string Hash(string password) => _innerHasher.HashPassword(null!, password);

    public bool Verify(string hashedPassword, string providedPassword) =>
        _innerHasher.VerifyHashedPassword(null!, hashedPassword, providedPassword)
            is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
}
