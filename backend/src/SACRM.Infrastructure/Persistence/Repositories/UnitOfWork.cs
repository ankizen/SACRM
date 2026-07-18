using System.Collections.Concurrent;
using SACRM.Application.Common.Interfaces;

namespace SACRM.Infrastructure.Persistence.Repositories;

public class UnitOfWork(SacrmDbContext context) : IUnitOfWork
{
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    public IRepository<T> Repository<T>() where T : class =>
        (IRepository<T>)_repositories.GetOrAdd(typeof(T), _ => new EfRepository<T>(context));

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
