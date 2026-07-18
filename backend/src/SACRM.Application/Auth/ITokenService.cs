using SACRM.Domain.Entities;

namespace SACRM.Application.Auth;

public record GeneratedAccessToken(string Token, DateTime ExpiresAtUtc);

public interface ITokenService
{
    GeneratedAccessToken GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string HashRefreshToken(string rawToken);
    TimeSpan RefreshTokenLifetime { get; }
}
