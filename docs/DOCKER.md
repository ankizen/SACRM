# SACRM — Docker / Coolify (iteration deploy)

This is the fast path for testing SACRM on a real URL while it's still being built out — a self-contained backend (API + SQL Server) deployed via Coolify, with the frontend on Vercel. For the eventual "real" production deployment (dedicated Windows Server + IIS), see `docs/DEPLOYMENT.md` instead — that path stays unchanged and unaffected by any of this.

## What's in here

- `backend/Dockerfile` — multi-stage build (.NET 10 SDK → ASP.NET runtime), builds `SACRM.WebApi` and its project references.
- `docker-compose.yml` (repo root) — two services: `sqlserver` (official Microsoft image) and `api` (built from the Dockerfile above). No frontend service — that stays on Vercel, it's a static build with no server runtime to containerize.
- `.env.example` (repo root) — copy to `.env` and fill in real values. `.env` is already covered by `.gitignore`'s `.env` rule, so it never gets committed.

## Local test run

```
cp .env.example .env
# edit .env with real values
docker compose up -d --build
curl http://localhost:8080/api/health
```

The `api` service listens on `8080` internally and is published to the host at the same port for local testing. On the first `up`, the container runs migrations and seeds the Master Admin + starter lookups automatically (see "Startup migrations" below) — no separate `dotnet ef database update` step needed here, unlike the IIS path.

## Deploying on Coolify

1. In Coolify, create a new resource pointing at the `ankizen/SACRM` GitHub repo, type **Docker Compose**, using `docker-compose.yml` at the repo root.
2. Set the same keys from `.env.example` as environment variables in Coolify's UI for the `api` service (`MSSQL_SA_PASSWORD`, `JWT_KEY`, `SEED_MASTER_ADMIN_EMAIL`, `SEED_MASTER_ADMIN_PASSWORD`, `FRONTEND_URL`) — generate real random values for the password/key, don't reuse the placeholders.
3. Set the `api` service's public domain (`api.crm.swarnapp.com` or whatever Coolify assigns) — Coolify's Traefik layer handles TLS automatically (Let's Encrypt), the container itself only ever speaks plain HTTP on port 8080 internally.
4. Health check path: `/api/health` (already implemented, returns 200).
5. Once the frontend is deployed on Vercel, come back and set `FRONTEND_URL` to the real Vercel URL and redeploy the `api` service — CORS will reject every other origin otherwise.

## Startup migrations — why this differs from the IIS path

`docs/DEPLOYMENT.md`'s IIS path deliberately keeps `dotnet ef database update` as a manual, explicit step before the site starts — appropriate for a long-lived server where migrations should be a deliberate, reviewable action.

That doesn't fit a fast-iterating Coolify deploy that gets rebuilt from a fresh image on every push. So `Program.cs` has a second, explicit opt-in: setting `RunMigrationsOnStartup=true` (already set in `docker-compose.yml`'s `api` service) makes the container apply pending migrations automatically on boot, with a short retry loop (10 attempts, 5s apart) in case the bundled `sqlserver` container is still initializing when `api` starts. This flag defaults to unset/false, so it has zero effect on the IIS/Development paths — nothing about the existing production-safety behavior changed.

## Data persistence

Both SQL Server's data directory and uploaded attachments are on named Docker volumes (`sqlserver-data`, `api-uploads`) — they survive `docker compose down` / container redeploys, but **not** `docker compose down -v` or deleting the underlying volume in Coolify. This is a testing/iteration setup, not a backed-up production database — don't treat data in it as durable until the real IIS deployment is live.
