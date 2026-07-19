namespace SACRM.Application.Attachments;

public interface IFileStorageService
{
    Task<string> SaveAsync(int leadId, string fileName, Stream content, CancellationToken cancellationToken = default);
    Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default);
    void Delete(string storagePath);
}
