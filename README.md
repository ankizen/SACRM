# SACRM — Sales CRM

Enterprise-grade Sales CRM (leads, pipeline, activities, followups, reports) built on ASP.NET Core + React, designed to run on Windows Server / IIS + SQL Server and to grow into WhatsApp, Email, and n8n automation without a rewrite.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full phased plan.

## Tech Stack

**Backend:** ASP.NET Core 10 Web API, Clean Architecture (Domain/Application/Infrastructure/WebApi), Entity Framework Core, SQL Server, JWT auth, FluentValidation, Swagger.

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod.

**Database:** Microsoft SQL Server (LocalDB for local dev, full SQL Server in production).

## Folder Structure

```
SACRM/
├── backend/
│   ├── src/
│   │   ├── SACRM.Domain/           entities, enums, no dependencies
│   │   ├── SACRM.Application/      use cases, DTOs, FluentValidation validators
│   │   ├── SACRM.Infrastructure/   EF Core DbContext, repositories, migrations
│   │   └── SACRM.WebApi/           controllers, Swagger, JWT, Program.cs
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/            router, providers
│       ├── features/       auth, dashboard, leads, ... (feature-folder pattern)
│       ├── components/ui/  shadcn/ui components
│       └── lib/            api client, utils
├── docs/ROADMAP.md
└── database/
```

## Running Locally

### Prerequisites
- .NET 10 SDK (this repo pins `10.0.302` via `global.json`)
- Node.js 24+ / npm
- SQL Server LocalDB (ships with Visual Studio, or install the "SQL Server Express LocalDB" component standalone)

### Backend

```bash
cd backend/src/SACRM.WebApi
dotnet user-secrets set "Jwt:Key" "<a long random string>"   # first time only, per machine
dotnet run
```

API runs at `http://localhost:5024`, Swagger UI at `http://localhost:5024/swagger`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. `frontend/.env.development` points it at the local API.

## Deployment

- **Frontend (dev/preview):** Vercel, deployed from GitHub.
- **Backend + Database (production):** Windows Server IIS + SQL Server. IIS hosting bundle setup notes land in Phase 6.

## Status

Phase 0 (roadmap + scaffold) complete. See [docs/ROADMAP.md](docs/ROADMAP.md) for what's next — each subsequent phase (DB schema, backend core, feature APIs, frontend foundation, feature screens, deploy prep) ships and is reviewed independently.
