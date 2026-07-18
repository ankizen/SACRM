# SACRM Roadmap

SACRM is a production-grade Sales CRM — not a demo. It must support future modules (WhatsApp Cloud API, Email, n8n automation, Tasks, Quotation/Invoice) without a rewrite, and must run on the existing Windows Server + IIS + SQL Server infrastructure.

Each phase below is scoped, built, and reviewed independently — work stops after every phase for explicit approval before the next one starts.

## Phase 0 — Roadmap & Scaffold ✅ (done)
Repo structure, ASP.NET Core 10 Clean Architecture solution (Domain/Application/Infrastructure/WebApi + test projects), React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui frontend, JWT/Swagger/CORS wiring, health-check endpoint, git init. No business logic yet — solution builds, frontend runs, both verified end-to-end.

## Phase 1 — Database Schema & Domain
EF Core entities: Users/Roles (Master Admin / Admin / Executive), Leads, LeadTimeline (audit trail — who/when/old value/new value), Activities, Followups, Notes, Attachments, LeadSources, LeadStages, Company/Settings. Migrations against LocalDB. Indexes on Phone, Email, AssignedExecutiveId, Status, CreatedDate — the columns Filters/Search hit hardest.

## Phase 2 — Backend Core
JWT auth (access + refresh tokens), role-based authorization policies, repository + unit-of-work pattern, FluentValidation pipeline, global exception handling, pagination/filtering/sorting conventions, an EF Core `SaveChanges` interceptor that auto-writes LeadTimeline entries (who/when/old/new) for every tracked change — this is what makes the audit trail automatic instead of something every feature has to remember to call.

## Phase 3 — Backend Feature APIs
Leads CRUD + assign/transfer/merge/duplicate-detection; Import (Excel/CSV with column mapping + preview); Export (filtered); Activities/Followups/Notes/Attachments endpoints; Dashboard aggregation endpoints (today's leads, pipeline, conversion, followups); Reports endpoints; Settings endpoints (lead sources/stages/countries/cities/users); global search (phone/name/email/shop/GST/WhatsApp).

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
