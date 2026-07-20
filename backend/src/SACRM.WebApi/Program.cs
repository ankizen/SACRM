using System.Text;
using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SACRM.Application.Attachments;
using SACRM.Application.Auth;
using SACRM.Application.Common.Interfaces;
using SACRM.Application.Import;
using SACRM.Infrastructure.Auth;
using SACRM.Infrastructure.Import;
using SACRM.Infrastructure.Persistence;
using SACRM.Infrastructure.Persistence.Interceptors;
using SACRM.Infrastructure.Persistence.Repositories;
using SACRM.Infrastructure.Storage;
using SACRM.WebApi.Filters;
using SACRM.WebApi.Middleware;
using SACRM.WebApi.Serialization;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCorsPolicy";

const string StatusPageHtml = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SACRM API</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #eaf1fb 0%, #f7f9fd 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .card {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 20px 50px -20px rgba(30, 41, 59, 0.25);
        padding: 48px 56px;
        text-align: center;
        max-width: 420px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #16a34a;
        margin-bottom: 20px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
        color: #0f172a;
      }
      p {
        margin: 0;
        color: #64748b;
        font-size: 15px;
        line-height: 1.5;
      }
    </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span>API is online</div>
        <h1>SACRM API is Running</h1>
        <p>The backend service is online and accepting requests.</p>
      </div>
    </body>
    </html>
    """;

builder.Services.AddControllers(options => options.Filters.Add<ValidationFilter>())
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    });
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<AuditableEntitySaveChangesInterceptor>();
builder.Services.AddDbContext<SacrmDbContext>((sp, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.AddInterceptors(sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>());
});

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasherService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<ILeadFileService, LeadFileService>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "SACRM API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter a valid JWT access token."
    });
    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer", null), new List<string>() }
    });
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("MasterAdminOnly", policy => policy.RequireRole("MasterAdmin"))
    .AddPolicy("AdminOrAbove", policy => policy.RequireRole("MasterAdmin", "Admin"))
    .AddPolicy("ExecutiveOrAbove", policy => policy.RequireRole("MasterAdmin", "Admin", "Executive"));

var app = builder.Build();

// Behind a reverse proxy that terminates TLS (IIS/ARR, or Traefik in front of the
// Docker/Coolify deploy) the app only ever sees plain HTTP internally -- without this,
// UseHttpsRedirection below can't tell the original request was HTTPS and would try to
// redirect it again. KnownNetworks/KnownProxies are cleared because the proxy's IP isn't
// fixed/known in advance in a container setup.
var forwardedHeaderOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeaderOptions.KnownIPNetworks.Clear();
forwardedHeaderOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeaderOptions);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "SACRM API v1"));
}

app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

// A friendly status page at the bare domain root -- with only MapControllers() mapped,
// visiting https://api.crm.swarnapp.com/ directly in a browser 404'd with nothing useful.
// This is just a static confirmation page; /api/health remains the real machine-readable check.
app.MapGet("/", () => Results.Content(StatusPageHtml, "text/html"));

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    // Auto-migrate only in Development. A "real" production deploy (see docs/DEPLOYMENT.md)
    // runs `dotnet ef database update` as an explicit step instead of on every app start.
    using var migrationScope = app.Services.CreateScope();
    await migrationScope.ServiceProvider.GetRequiredService<SacrmDbContext>().Database.MigrateAsync();
}
else if (app.Configuration.GetValue<bool>("RunMigrationsOnStartup"))
{
    // Opt-in for containerized/Coolify deploys (see docs/DOCKER.md), which redeploy from a
    // fresh image often -- an explicit deploy step isn't practical there the way it is for a
    // long-lived IIS server. Retries because the bundled SQL Server container can still be
    // initializing when this container starts; without a retry this would just crash-loop.
    using var migrationScope = app.Services.CreateScope();
    var db = migrationScope.ServiceProvider.GetRequiredService<SacrmDbContext>();
    var migrationLogger = migrationScope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    for (var attempt = 1; ; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            break;
        }
        catch (Exception ex) when (attempt < 10)
        {
            migrationLogger.LogWarning(ex, "Startup migration attempt {Attempt} failed, retrying in 5s...", attempt);
            await Task.Delay(TimeSpan.FromSeconds(5));
        }
    }
}

// Seeding runs in every environment -- each step is a no-op once its table has data,
// and it's what lets a fresh production deployment log in at all (there's no self-registration
// endpoint by design; Admins/Executives are only ever created by a Master Admin). This assumes
// migrations have already been applied -- see the deployment ordering in docs/DEPLOYMENT.md.
using (var seedScope = app.Services.CreateScope())
{
    var services = seedScope.ServiceProvider;
    var dbContext = services.GetRequiredService<SacrmDbContext>();
    await DbInitializer.SeedMasterAdminAsync(
        dbContext,
        services.GetRequiredService<IPasswordHasher>(),
        services.GetRequiredService<IConfiguration>(),
        services.GetRequiredService<ILogger<Program>>());
    await DbInitializer.SeedLookupsAsync(dbContext, services.GetRequiredService<ILogger<Program>>());
}

app.Run();

public partial class Program;
