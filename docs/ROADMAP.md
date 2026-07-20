# SACRM Roadmap

SACRM is a production-grade Sales CRM — not a demo. It must support future modules (WhatsApp Cloud API, Email, n8n automation, Tasks, Quotation/Invoice) without a rewrite, and must run on the existing Windows Server + IIS + SQL Server infrastructure.

Each phase below is scoped, built, and reviewed independently — work stops after every phase for explicit approval before the next one starts.

## Phase 0 — Roadmap & Scaffold ✅ (done)
Repo structure, ASP.NET Core 10 Clean Architecture solution (Domain/Application/Infrastructure/WebApi + test projects), React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui frontend, JWT/Swagger/CORS wiring, health-check endpoint, git init. No business logic yet — solution builds, frontend runs, both verified end-to-end.

## Phase 1 — Database Schema & Domain ✅ (done)
EF Core entities: Users/Roles (Master Admin / Admin / Executive), Leads, LeadTimeline (audit trail — who/when/old value/new value), Activities, Followups, Notes, Attachments, LeadSources, LeadStages, Countries/Cities, CompanyProfile, RefreshTokens. `InitialCreate` migration applied to LocalDB — 13 tables, 8 seeded default lead stages, indexes on Phone/Email/AssignedToUserId/LeadStageId/CreatedAtUtc/IsDeleted, optimistic concurrency (`RowVersion`) on Lead/User. No repositories, auth logic, or controllers yet.

## Phase 2 — Backend Core ✅ (done)
JWT auth (access + refresh tokens, rotation on refresh, revocation on logout), role-based authorization policies, generic repository + unit-of-work pattern, a FluentValidation `ValidationFilter` pipeline, global `IExceptionHandler`-based error handling, pagination conventions (`PagedRequest`/`PagedResult`), and an EF Core `SaveChanges` interceptor that auto-writes LeadTimeline entries (who/when/old/new) for every tracked Lead change and stamps Created/Updated audit fields on every `AuditableEntity`. `/api/auth/login|refresh|logout|me` implemented and verified end-to-end. A dev-only startup seeder bootstraps the first Master Admin from `Seed:MasterAdminEmail`/`Seed:MasterAdminPassword` user-secrets. No Lead CRUD endpoints yet — that's Phase 3.

## Phase 3 — Backend Feature APIs ✅ (done)
Leads CRUD + assign/transfer/merge/duplicate-detection; Import (Excel/CSV with column mapping + preview); Export (filtered); Activities/Followups/Notes/Attachments endpoints; Dashboard aggregation endpoints (today's leads, pipeline, conversion, followups); Reports endpoints; Settings endpoints (lead sources/stages/countries/cities/users); global search (phone/name/email/shop/GST/WhatsApp). Shipped as three checkpoints, each built and verified against LocalDB before the next started:

- **3a** — Lead CRUD (list/get/create/update/delete/restore), role-scoped so Executives only see their own assigned leads, assign/transfer, duplicate-check, bulk-update, Lead timeline read, global search, Settings lookup CRUD (LeadSources/LeadStages/Countries/Cities).
- **3b** — Activities, Followups (+ `/api/followups/today` and `/api/followups/pending`), Notes, Attachments (local-disk upload under `App_Data/uploads`, authorized download endpoint). The audit interceptor from Phase 2 now also auto-writes a LeadTimelineEntry when any of these four are created (or a Followup is marked Completed) — matching the spec's example timeline (Created → Assigned → Phone Call → Note Added → Stage Changed → Converted) without any controller having to remember to log it.
- **3c** — Import/Export (Excel via ClosedXML, CSV via CsvHelper — column-mapping preview, per-row validation, duplicate-skip on re-import), merge-duplicate action, Dashboard summary + executive-performance, Reports (grouped leads-summary + followups-summary), CompanyProfile settings (Master Admin only), Users management (Master Admin creates Admin/Executive; Admin can only create/manage Executives, matching the spec's "cannot create another Admin").

Found and fixed during 3c verification: merging a duplicate lead sets both `IsDuplicate` and `IsDeleted`, but the Duplicate list view was filtering out deleted rows — a merged lead vanished from both the Duplicate and Trash buckets. Fixed by making Trash mean "deleted and not a duplicate" and Duplicate mean "flagged duplicate" regardless of delete state, so the two buckets are mutually exclusive and nothing gets silently hidden.

## Phase 4 — Frontend Foundation ✅ (done)
Real login flow (`AuthContext` + `useAuth`), tokens in `localStorage`, an axios response interceptor that refreshes and retries on 401 with an in-flight guard (Phase 2's refresh endpoint rotates tokens, so concurrent 401s must share one refresh call), session bootstrap via `GET /api/auth/me` on load, role-guarded routes (`ProtectedRoute`/`RoleGuard`) replacing the Phase 0 placeholder router, and a shadcn/ui sidebar/topbar app shell with role-filtered navigation. The Dashboard screen now calls the real `/api/dashboard/summary` instead of the `/api/health` stub — the smallest genuine end-to-end proof that auth + role-scoping + data-fetching work together. `/leads`, `/reports`, `/settings`, `/users` are placeholder routes for Phase 5.

Verified end-to-end with a Playwright driver against both live servers: unauthenticated redirect to `/login`, Master Admin login shows all nav items and org-wide numbers, session persists across a reload, logout redirects back to `/login`, Executive login hides Reports/Settings/Users and is bounced from `/reports` if visited directly, and a corrupted access token recovers transparently via the refresh interceptor.

Two bugs found and fixed during verification: (1) `SidebarMenuButton`'s `tooltip` prop needs a `TooltipProvider` ancestor — the shadcn CLI's own install output had warned about this and it was missed; added in `AppShell`. (2) The bigger one — TanStack Query's `QueryClient` is a singleton for the app's lifetime, and without clearing it on login/logout, switching users in the same tab kept serving the *previous* user's cached dashboard numbers until they went stale (up to 30s) — Rahul's dashboard was silently showing the Master Admin's org-wide counts instead of his own scoped ones. Fixed with `queryClient.clear()` in both `login()` and `logout()`. Worth remembering for Phase 5: any cross-cutting client-side cache needs an explicit story for "the logged-in user changed."

## Phase 5 — Frontend Feature Screens (in progress — 5a done; 5b/5c next)
Dashboard, Lead list (server-side filters/search/pagination), Lead detail (timeline/activities/notes/attachments), Import/Export UI, Reports, Settings, User management (role-gated). Ships as three checkpoints like Phase 3:

- **5a ✅ — Leads core.** Lead list (`/leads`) with server-side search/stage/priority/assigned-to filters and view tabs (Active/Duplicate/Trash) synced to the URL via `useSearchParams`, bulk-select + bulk stage update (Admin+), a shared `LeadForm` (RHF + Zod) reused by `/leads/new` and `/leads/:id/edit` with a live duplicate-check on phone/email/GST blur, and `/leads/:id` detail with Assign/Delete/Restore/Merge actions (Admin+ gated) plus a working Timeline tab. Activities/Notes/Followups/Attachments tabs are stubbed for 5b. No `@tanstack/react-table` — filtering/sorting/pagination stay server-side (Phase 3a already owns that), the frontend just renders controlled inputs against the existing `<Table>`.

  Verified end-to-end with the same Playwright-driver approach as Phase 4 (no chromium-cli available): create → duplicate warning → save → Timeline shows Created, stage/priority edit → Timeline shows the change, assign → Timeline shows Assigned, delete → appears in Trash → restore, and an Executive session that only sees its own assigned leads with Assign/Delete/bulk controls not rendered and a 404 on someone else's lead ID typed directly into the URL.

  Also surfaced (not a bug, a behavior worth knowing): logging out from a specific page and back in redirects to *that* page again, not always `/dashboard` — the Phase 4 "return to originally-requested route" feature applies to every login, not just the unauthenticated-redirect case. The first version of the 5a test script assumed a hard-coded `/dashboard` landing and had to be corrected; no app change needed.
- **5b — Lead detail sub-resources.** Wire the Activities/Notes/Followups/Attachments tabs to Phase 3b's endpoints.
- **5c — Everything else.** Import/Export UI, Settings (lookup CRUD + CompanyProfile), Users management, Reports screens, richer Dashboard.

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
