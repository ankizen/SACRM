# SACRM Deployment Guide

Target architecture (per the project spec): backend on Windows Server + IIS + SQL Server, frontend on Vercel.

## Backend — Windows Server + IIS

### Prerequisites (one-time, on the server)

1. **SQL Server** reachable from the server (a real instance/edition — not LocalDB, which is dev-only and single-user).
2. **.NET 10 Hosting Bundle** installed (not just the SDK) — this is what registers the ASP.NET Core Module V2 (ANCM) with IIS. Download from the official .NET download page, run the installer, then run `net stop was /y` followed by `net start w3svc` (or just reboot) so IIS picks up the module.
3. **IIS** with the Web Server role installed, plus the standard static content / request filtering role services.

### Publish

From a machine with the .NET 10 SDK (this can be your dev machine — you don't need the SDK on the server, only the Hosting Bundle):

```
dotnet publish backend/src/SACRM.WebApi/SACRM.WebApi.csproj -c Release -o ./publish
```

Copy the contents of `./publish` to the server, e.g. `C:\inetpub\sacrm-api`. This includes `web.config` (already committed at `backend/src/SACRM.WebApi/web.config` and copied into publish output automatically) — it's configured for in-process hosting and points IIS at `SACRM.WebApi.dll`.

### Configure production settings

`appsettings.Production.json` is **not** committed (see `.gitignore`) — copy the template and fill in real values on the server:

```
copy appsettings.Production.json.example appsettings.Production.json
```

Edit `appsettings.Production.json` (or set the equivalent values as IIS/App Pool environment variables — `ConnectionStrings__DefaultConnection`, `Jwt__Key`, etc., using `__` as the section separator, which also avoids putting secrets in a file on disk):

| Key | Value |
|---|---|
| `ConnectionStrings:DefaultConnection` | Real SQL Server connection string |
| `Jwt:Key` | A random secret, 32+ characters — generate one, don't reuse the dev value |
| `Jwt:Issuer` / `Jwt:Audience` | Can keep `SACRM` / `SACRM.Client`, must match what the frontend expects (it doesn't — only the backend validates these) |
| `Cors:AllowedOrigins` | Your real Vercel URL(s), e.g. `["https://sacrm.vercel.app"]` |
| `Storage:UploadsPath` | Where attachments are written on the server's disk — defaults to `App_Data/uploads` relative to the site root |
| `Seed:MasterAdminEmail` / `Seed:MasterAdminPassword` | The first login-capable account — see "First deploy" below |

Also set the `ASPNETCORE_ENVIRONMENT` environment variable to `Production` on the App Pool (IIS Manager → Application Pools → your pool → Advanced Settings, or via `appcmd`/`web.config`'s `<environmentVariable>` block, already templated in `web.config`).

### Database — apply migrations before first start

**This step must run before the IIS site is started for the first time (and before any subsequent deploy that adds a migration).** The app deliberately does **not** auto-apply migrations outside the Development environment — `Program.cs` only runs `Database.MigrateAsync()` when `ASPNETCORE_ENVIRONMENT=Development`. Running schema changes automatically on every IIS app-pool recycle is what most production outages from "surprise migrations" look like; a real deploy applies them as a deliberate, reviewable step instead.

From a machine with the .NET SDK and `dotnet-ef` installed, pointed at the production database:

```
dotnet ef database update --project backend/src/SACRM.Infrastructure --startup-project backend/src/SACRM.WebApi --connection "<production connection string>"
```

Only after this succeeds should the IIS site/App Pool be started (or recycled, for a deploy that added migrations).

### First deploy — bootstrapping the Master Admin

There is no self-registration endpoint in SACRM by design — every Admin/Executive account is created by a Master Admin from inside the app (`/users`). That means the *very first* account has to come from somewhere else: the startup seeder.

Unlike `Database.MigrateAsync()`, the seed step (`DbInitializer.SeedMasterAdminAsync` + `SeedLookupsAsync`) runs in **every** environment, including Production — each seed is internally guarded by an "only if the table is empty" check, so it's a safe no-op on every start after the first. It does require the schema to already exist, which is why migrations must run first (see above).

So, on first deploy only:

1. Set `Seed:MasterAdminEmail` and `Seed:MasterAdminPassword` in `appsettings.Production.json` (or as App Pool env vars).
2. Apply migrations (previous section).
3. Start the site. On this first start, the app creates the Master Admin account and seeds starter Lead Sources (Website, Referral, Cold Call, WhatsApp Inquiry, Walk-in, Social Media) and a starter Country/City list (India + 8 metros), all logged to `logs\stdout` (per `web.config`'s `stdoutLogEnabled`).
4. Log in as the Master Admin, confirm the account works, then remove `Seed:MasterAdminEmail`/`Seed:MasterAdminPassword` from the config (optional — leaving them is harmless since the seed is a no-op once a user exists, but there's no reason to leave a password sitting in config after it's been used).
5. Use the app's own Users screen to create real Admin/Executive accounts from here on.

If `Seed:MasterAdminEmail`/`Seed:MasterAdminPassword` are missing on a database with zero users, the app logs a warning and starts anyway with no usable login — set them and restart (or re-recycle the App Pool) to retry.

### Uploaded attachments

Attachments are written to disk under `Storage:UploadsPath` (default `App_Data/uploads`, relative to the site root) — not served as static IIS content and not covered by `web.config`'s handler mapping, so no extra lockdown rule is needed. Make sure the App Pool identity has write access to this folder, and that it's included in your backup strategy (it's real user data, not something migrations recreate).

## Frontend — Vercel

1. Import the repo into Vercel, with **Root Directory** set to `frontend`.
2. Framework preset: Vite (auto-detected).
3. Environment variable: `VITE_API_URL` = your backend's public URL + `/api`, e.g. `https://api.yourdomain.com/api`. (Locally this comes from `frontend/.env.development`; production needs its own value pointed at the real IIS-hosted backend, not `localhost`.)
4. `frontend/vercel.json` is already committed with a SPA rewrite (`/(.*) → /index.html`) — without it, refreshing or deep-linking to any client-side route (e.g. `/leads/5`) 404s, since Vercel's static file server has no route for it and only React Router does.
5. Deploy. Once you have the real Vercel URL, go back to the backend's `Cors:AllowedOrigins` and set it — CORS is origin-specific, so this can't be filled in until the frontend URL is known.

## Deploy ordering (first time, end to end)

1. Provision SQL Server, create an empty `SACRM` database.
2. Apply migrations (`dotnet ef database update`, pointed at production).
3. Publish the backend, configure `appsettings.Production.json` (including `Seed:MasterAdminEmail`/`Password`), start the IIS site.
4. Confirm the Master Admin can log in directly against the API (e.g. via Swagger disabled in Production, so use a REST client or curl against `/api/auth/login`) — see `docs/SMOKE_TEST.md`.
5. Deploy the frontend to Vercel with `VITE_API_URL` pointed at the live backend.
6. Update the backend's `Cors:AllowedOrigins` to the real Vercel URL and restart the App Pool.
7. Run through `docs/SMOKE_TEST.md` against the live stack.
