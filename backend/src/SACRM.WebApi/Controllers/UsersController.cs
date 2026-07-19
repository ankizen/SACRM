using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACRM.Application.Auth;
using SACRM.Application.Common.Exceptions;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Users;
using SACRM.Domain.Entities;
using SACRM.Domain.Enums;

namespace SACRM.WebApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Policy = "AdminOrAbove")]
public class UsersController(IUnitOfWork unitOfWork, ICurrentUserService currentUser, IPasswordHasher passwordHasher) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> List([FromQuery] bool includeInactive, CancellationToken ct)
    {
        var query = unitOfWork.Repository<User>().Query();
        if (!includeInactive)
        {
            query = query.Where(u => u.IsActive);
        }

        var result = await query
            .OrderBy(u => u.FullName)
            .Select(u => ToDto(u))
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> Get(int id, CancellationToken ct)
    {
        var dto = await unitOfWork.Repository<User>().Query()
            .Where(u => u.Id == id)
            .Select(u => ToDto(u))
            .SingleOrDefaultAsync(ct);

        if (dto is null)
        {
            throw new NotFoundException(nameof(User), id);
        }

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(UserCreateRequest request, CancellationToken ct)
    {
        EnsureCanManageRole(request.Role);

        var emailTaken = await unitOfWork.Repository<User>().Query().AnyAsync(u => u.Email == request.Email, ct);
        if (emailTaken)
        {
            throw new ConflictException("A user with this email already exists.");
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHasher.Hash(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = request.Role,
            IsActive = true,
            CreatedByUserId = currentUser.UserId,
            CreatedAtUtc = DateTime.UtcNow
        };

        await unitOfWork.Repository<User>().AddAsync(user, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = user.Id }, ToDto(user));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserUpdateRequest request, CancellationToken ct)
    {
        var user = await unitOfWork.Repository<User>().GetByIdAsync(id, ct);
        if (user is null)
        {
            throw new NotFoundException(nameof(User), id);
        }

        EnsureCanManageRole(user.Role);

        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.IsActive = request.IsActive;

        await unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>
    /// MasterAdmin manages Admin and Executive accounts; Admin may only manage Executives
    /// (spec: Admin "Cannot create another Admin").
    /// </summary>
    private void EnsureCanManageRole(UserRole targetRole)
    {
        if (currentUser.Role == nameof(UserRole.Admin) && targetRole != UserRole.Executive)
        {
            throw new ForbiddenAccessException("Admins can only manage Executive accounts.");
        }
    }

    private static UserDto ToDto(User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        PhoneNumber = u.PhoneNumber,
        Role = u.Role.ToString(),
        IsActive = u.IsActive,
        LastLoginAtUtc = u.LastLoginAtUtc,
        CreatedAtUtc = u.CreatedAtUtc
    };
}
