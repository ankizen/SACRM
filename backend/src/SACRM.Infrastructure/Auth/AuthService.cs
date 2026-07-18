using Microsoft.EntityFrameworkCore;
using SACRM.Application.Auth;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Domain.Entities;

namespace SACRM.Infrastructure.Auth;

public class AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, ITokenService tokenService) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var users = unitOfWork.Repository<User>();
        var user = await users.Query().SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null || !user.IsActive || !passwordHasher.Verify(user.PasswordHash, request.Password))
        {
            throw new InvalidCredentialsException();
        }

        user.LastLoginAtUtc = DateTime.UtcNow;
        users.Update(user);

        var (response, _) = await IssueTokensAsync(user, ipAddress, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var tokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var tokens = unitOfWork.Repository<RefreshToken>();

        var existingToken = await tokens.Query()
            .Include(t => t.User)
            .SingleOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (existingToken is null || !existingToken.IsActive || !existingToken.User.IsActive)
        {
            throw new InvalidCredentialsException("Invalid or expired refresh token.");
        }

        existingToken.RevokedAtUtc = DateTime.UtcNow;
        tokens.Update(existingToken);

        var (response, newToken) = await IssueTokensAsync(existingToken.User, ipAddress, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        existingToken.ReplacedByTokenId = newToken.Id;
        tokens.Update(existingToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return response;
    }

    public async Task LogoutAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var tokens = unitOfWork.Repository<RefreshToken>();

        var existingToken = await tokens.Query().SingleOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);
        if (existingToken is null || existingToken.RevokedAtUtc is not null)
        {
            return;
        }

        existingToken.RevokedAtUtc = DateTime.UtcNow;
        tokens.Update(existingToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<(AuthResponse Response, RefreshToken TokenEntity)> IssueTokensAsync(
        User user, string? ipAddress, CancellationToken cancellationToken)
    {
        var accessToken = tokenService.GenerateAccessToken(user);
        var rawRefreshToken = tokenService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenService.HashRefreshToken(rawRefreshToken),
            ExpiresAtUtc = DateTime.UtcNow.Add(tokenService.RefreshTokenLifetime),
            CreatedAtUtc = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        await unitOfWork.Repository<RefreshToken>().AddAsync(refreshToken, cancellationToken);

        var response = new AuthResponse
        {
            AccessToken = accessToken.Token,
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            RefreshToken = rawRefreshToken,
            User = new CurrentUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString()
            }
        };

        return (response, refreshToken);
    }
}
