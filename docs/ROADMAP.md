# SACRM Roadmap

SACRM is a production-grade Sales CRM — not a demo. It must support future modules (WhatsApp Cloud API, Email, n8n automation, Tasks, Quotation/Invoice) without a rewrite, and must run on the existing Windows Server + IIS + SQL Server infrastructure.

Each phase below is scoped, built, and reviewed independently — work stops after every phase for explicit approval before the next one starts.

## Phase 0 — Roadmap & Scaffold ✅ (done)
Repo structure, ASP.NET Core 10 Clean Architecture solution (Domain/Application/Infrastructure/WebApi + test projects), React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui frontend, JWT/Swagger/CORS wiring, health-check endpoint, git init. No business logic yet — solution builds, frontend runs, both verified end-to-end.

## Phase 1 — Database Schema & Domain ✅ (done)
EF Core entities: Users/Roles (Master Admin / Admin / Executive), Leads, LeadTimeline (audit trail — who/when/old value/new value), Activities, Followups, Notes, Attachments, LeadSources, LeadStages, Countries/Cities, CompanyProfile, RefreshTokens. `InitialCreate` migration applied to LocalDB — 13 tables, 8 seeded default lead stages, indexes on Phone/Email/AssignedToUserId/LeadStageId/CreatedAtUtc/IsDeleted, optimistic concurrency (`RowVersion`) on Lead/User. No repositories, auth logic, or controllers yet.

## Phase 2 — Backend Core ✅ (done)
JWT auth (access + refresh tokens, rotation on refresh, revocation on logout), role-based authorization policies, generic repository + unit-of-work pattern, a FluentValidation `ValidationFilter` pipeline, global `IExceptionHandler`-based error handling, pagination conventions (`PagedRequest`/`PagedResult`), and an EF Core `SaveChanges` interceptor that auto-writes LeadTimeline entries (who/when/old/new) for every tracked Lead change and stamps Created/Updated audit fields on every `AuditableEntity`. `/api/auth/login|refresh|logout|me` implemented and verified end-to-end. A dev-only startup seeder bootstraps the first Master Admin from `Seed:MasterAdminEmail`/`Seed:MasterAdminPassword` user-secrets. No Lead CRUD endpoints yet — that's Phase 3.

## Phase 3 — Backend Feature APIs (in progress — 3a, 3b done; 3c next)
Leads CRUD + assign/transfer/merge/duplicate-detection; Import (Excel/CSV with column mapping + preview); Export (filtered); Activities/Followups/Notes/Attachments endpoints; Dashboard aggregation endpoints (today's leads, pipeline, conversion, followups); Reports endpoints; Settings endpoints (lead sources/stages/countries/cities/users); global search (phone/name/email/shop/GST/WhatsApp). Ships as three checkpoints (see plan file / commit history for the reasoning):

- **3a ✅** — Lead CRUD (list/get/create/update/delete/restore), role-scoped so Executives only see their own assigned leads, assign/transfer, duplicate-check, bulk-update, Lead timeline read, global search, Settings lookup CRUD (LeadSources/LeadStages/Countries/Cities).
- **3b ✅** — Activities, Followups (+ `/api/followups/today` and `/api/followups/pending`), Notes, Attachments (local-disk upload under `App_Data/uploads`, authorized download endpoint). The audit interceptor from Phase 2 now also auto-writes a LeadTimelineEntry when any of these four are created (or a Followup is marked Completed) — matching the spec's example timeline (Created → Assigned → Phone Call → Note Added → Stage Changed → Converted) without any controller having to remember to log it.
- **3c** — Import/Export (Excel/CSV with column mapping + preview), merge-duplicate action, Dashboard summary, Reports (grouped aggregation), CompanyProfile settings, minimal Users management (Master Admin creates Admin/Executive).

## Phase 4 — Frontend Foundation
TanStack Query client wired to the real API with a JWT-refresh Axios interceptor, React Router route tree with role-based guards (replacing the Phase 0 placeholder router), auth context, shadcn/ui app shell (sidebar/topbar layout), real login flow.

## Phase 5 — Frontend Feature Screens
Dashboard, Lead list (server-side filters/search/pagination), Lead detail (timeline/activities/notes/attachments), Import/Export UI, Reports, Settings, User management (role-gated).

## Phase 6 — Polish & Deploy Prep
Responsiveness pass, IIS deployment config (`web.config`, hosting bundle notes), Vercel config for the frontend preview, seed data script, smoke test checklist.

## Future (not scheduled)
WhatsApp Cloud API, Email integration, Google Calendar, n8n webhooks, Quotation/Invoice module, PWA/offline, Dark mode, full Audit Log UI, Webhooks/public API.

## Roles & Permissions (reference)

| | Master Admin | Admin | Executive |
|---|---|---|---|
| Create/delete Admin | ✅ | ❌ | ❌ |
| Create/delete Executive | ✅ | ✅ | ❌ |
| View all leads | ✅ | ✅ | own only |
| Assign/transfer leads | ✅ | ✅ | ❌ |
| Import/export | ✅ | ✅ | ❌ |
| Reports & dashboard | ✅ | ✅ | own performance only |
| Settings | ✅ | ❌ | ❌ |

## Lead Stages
Fresh → Pipeline → Follow Up → Demo → Negotiation → Converted / Lost / Hold

## Lead Fields (reference)
Name, Phone, WhatsApp, Alternate Phone, Email, Shop Name, Address, City, State, Zip, Country, GST, Website, Lead Source, Assigned Executive, Priority, Lead Status, Remarks.
