# SACRM Smoke Test

A short critical-path checklist to run after any deploy (or against local dev) before calling it good. Not a substitute for the full Phase 3–5 verification already done during development — this is the "did the deploy actually work" pass.

Use a REST client (Postman/Insomnia) or `curl` for the API-only checks, and a real browser for the UI checks. Replace `{API}` with the backend base URL (e.g. `http://localhost:5024/api` locally, `https://api.yourdomain.com/api` in production) and `{APP}` with the frontend base URL (e.g. `http://localhost:5173` locally, the Vercel URL in production).

## 1. Backend is up

- [ ] `GET {API}/health` (or equivalent) returns 200. If Swagger is enabled (dev only), `{API-root}/swagger` loads.

## 2. Master Admin can log in

- [ ] `POST {API}/auth/login` with the Master Admin's seeded credentials (`Seed:MasterAdminEmail`/`Password`) returns 200 with an access token + refresh token.
- [ ] `GET {API}/auth/me` with the access token returns the Master Admin's profile with `role: "MasterAdmin"`.

If this fails on a fresh production deploy: confirm migrations were applied *before* the site was started (`docs/DEPLOYMENT.md` — "Database — apply migrations before first start"), and that `Seed:MasterAdminEmail`/`Password` were set before the first start.

## 3. Frontend loads and talks to the backend

- [ ] `{APP}/login` loads.
- [ ] Logging in as Master Admin lands on `/dashboard` and shows real (non-zero-looking, or correctly-zero-for-a-fresh-DB) summary numbers, not a stuck loading state or a CORS error in the browser console.
- [ ] Reloading the page keeps the session (no bounce back to `/login`).
- [ ] Logging out returns to `/login`.
- [ ] Deep-linking directly to `{APP}/leads` (typed URL, not clicked from the app) loads correctly rather than 404ing — this specifically catches a missing/broken Vercel SPA rewrite (`frontend/vercel.json`).

## 4. Core CRUD path (as Master Admin or Admin)

- [ ] Create a Lead (`/leads/new`), fill required fields, save. It appears in the Lead list.
- [ ] Open the Lead's detail page — the Timeline tab shows a "Created" entry.
- [ ] Edit the Lead's stage — the Timeline shows the stage-change entry.
- [ ] Log an Activity, add a Note, schedule a Followup, upload an Attachment on the Lead — each appears in its tab and produces a matching Timeline entry.
- [ ] Delete the Lead — it disappears from the Active view and appears under the Trash view; restore it and confirm it's back in Active.

## 5. Role scoping (create/use an Executive account)

- [ ] As Master Admin (or Admin), create a new Executive user via `/users`.
- [ ] Log in as that Executive. Confirm Reports/Settings/Users nav items are hidden.
- [ ] Confirm the Executive's Lead list only shows leads assigned to them (create/assign one first if the account is brand new).
- [ ] Typing another user's Lead ID directly into the URL as this Executive does not leak that lead's data.

## 6. Settings & lookups

- [ ] `/settings` loads Lead Sources / Lead Stages / Countries / Cities — for a fresh production deploy, confirm the starter seed data is present (6 lead sources, India + 8 cities) rather than empty dropdowns.
- [ ] Creating a lookup with a name that already exists returns a clean "already exists" error, not a generic failure.

## 7. Import/Export

- [ ] Export leads from `/leads` — file downloads with a non-zero size.
- [ ] Import a small CSV with at least Name + Phone mapped — leads appear in the list afterward.

## 8. Attachments persist

- [ ] An uploaded attachment can be downloaded back and matches what was uploaded (open it — don't just check the download succeeded).
- [ ] On IIS specifically: confirm the App Pool identity actually has write access to `Storage:UploadsPath` — an upload that succeeds locally but fails only in IIS is almost always a folder-permissions issue.

---

Local dev quick-reference (values live in `dotnet user-secrets list` for the `SACRM.WebApi` project, not committed): Master Admin email is `Seed:MasterAdminEmail`, password `Seed:MasterAdminPassword`.
