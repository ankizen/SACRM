using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using SACRM.Application.Attachments;

namespace SACRM.Infrastructure.Storage;

/// <summary>
/// Stores files on local disk under App_Data (not statically served by IIS/Kestrel).
/// The only way to retrieve a file is the authorized attachment download endpoint.
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootPath;

    public LocalFileStorageService(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredPath = configuration["Storage:UploadsPath"] ?? "App_Data/uploads";
        _rootPath = Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.Combine(environment.ContentRootPath, configuredPath);
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(int leadId, string fileName, Stream content, CancellationToken cancellationToken = default)
    {
        var safeFileName = Path.GetFileName(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}-{safeFileName}";
        var relativePath = $"{leadId}/{uniqueFileName}";
        var fullPath = Path.Combine(_rootPath, leadId.ToString(), uniqueFileName);

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var fileStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write);
        await content.CopyToAsync(fileStream, cancellationToken);

        return relativePath;
    }

    public Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolveFullPath(storagePath);
        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return Task.FromResult(stream);
    }

    public void Delete(string storagePath)
    {
        var fullPath = ResolveFullPath(storagePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    private string ResolveFullPath(string storagePath) =>
        Path.Combine(_rootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));
}
