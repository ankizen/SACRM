# Build context is the repository root (see docker-compose.yml) so this can COPY
# sibling projects via their real relative paths, matching the ProjectReferences below.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy just the .csproj files first so `dotnet restore` is cached across builds
# unless a dependency actually changes -- avoids re-restoring on every source edit.
COPY backend/src/SACRM.Domain/SACRM.Domain.csproj backend/src/SACRM.Domain/
COPY backend/src/SACRM.Application/SACRM.Application.csproj backend/src/SACRM.Application/
COPY backend/src/SACRM.Infrastructure/SACRM.Infrastructure.csproj backend/src/SACRM.Infrastructure/
COPY backend/src/SACRM.WebApi/SACRM.WebApi.csproj backend/src/SACRM.WebApi/
RUN dotnet restore backend/src/SACRM.WebApi/SACRM.WebApi.csproj

COPY backend/src/ backend/src/
RUN dotnet publish backend/src/SACRM.WebApi/SACRM.WebApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Coolify's reverse proxy (Traefik) terminates TLS and forwards to this port over
# plain HTTP inside the private network -- the app doesn't need to know its own
# public hostname or handle certs itself.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

USER $APP_UID
ENTRYPOINT ["dotnet", "SACRM.WebApi.dll"]
