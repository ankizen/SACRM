using Microsoft.EntityFrameworkCore;
using SACRM.Application.Common.Interfaces;

namespace SACRM.Infrastructure.Persistence.Repositories;

public class EfRepository<T>(SacrmDbContext context) : IRepository<T> where T : class
{
    private readonly DbSet<T> _set = context.Set<T>();

    public IQueryable<T> Query() => _set.AsQueryable();

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _set.FindAsync([id], cancellationToken);

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        await _set.AddAsync(entity, cancellationToken);

    public void Update(T entity) => _set.Update(entity);

    public void Remove(T entity) => _set.Remove(entity);
}
