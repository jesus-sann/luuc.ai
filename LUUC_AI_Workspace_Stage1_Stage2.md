# Luuc.ai — Immigration Firm Workspace
## Stage 1 & Stage 2 Implementation Plan

**Version:** 2.0  
**Date:** June 2026  
**Purpose:** Convert Luuc.ai into a private, dedicated workspace for immigration law firms — validated with one pilot firm before scaling.

---

## What already exists

Before listing what needs to be built, it is critical to understand what Luuc.ai already delivers out of the box. Most of Stage 1 is already production-ready.

| Capability | Status | Where |
|---|---|---|
| Multi-tenant isolation (RLS, company scoping) | ✅ Live | `supabase/fix-rls-multi-tenant.sql` |
| User roles (Admin, Member, Viewer) | ✅ Live | `supabase/companies.sql`, `invitations.sql` |
| Knowledge base (upload, categorize, search, AI context) | ✅ Live | `app/(dashboard)/knowledge-base/` |
| Document generation — templates + free-form | ✅ Live | `app/(dashboard)/crear/` |
| Document analysis / risk review | ✅ Live | `app/(dashboard)/revisar/` |
| Document history, CRUD, DOCX/PDF export | ✅ Live | `app/(dashboard)/documentos/` |
| Team invitations and role management | ✅ Live | `app/(dashboard)/configuracion/equipo/` |
| File upload with MIME validation | ✅ Live | `app/api/parse-file/route.ts` |
| Audit log infrastructure (write path) | ✅ Live | `lib/audit-log.ts`, `supabase/audit-logs.sql` |
| Settings — profile, company, team, security | ✅ Live | `app/(dashboard)/configuracion/` |
| Onboarding wizard + interactive tour | ✅ Live | `components/onboarding-wizard.tsx` |
| Security headers, rate limiting, input validation | ✅ Live | `next.config.js`, `lib/rate-limit.ts` |

**The platform is not a prototype — it is production-deployed on Vercel with full auth, RLS, and AI generation working.**

---

## Stage 1 — Immigration Workspace Activation

**Goal:** One pilot immigration firm is onboarded, configured, and using the platform to generate real documents faster than before.

**What Stage 1 is NOT:** Building new architecture. Stage 1 is configuring and extending what already exists with immigration-specific content and two missing pieces.

---

### 1.1 Immigration document templates

**What needs to be built:** Add 6 immigration-specific templates to `lib/templates.ts`. Each template defines the form fields shown to the paralegal and the AI instruction set. No new API routes, no schema changes — plug into the existing generation flow.

Templates to add:

| Template | Key Fields |
|---|---|
| Cover Letter (consular) | Applicant name, visa category, consulate, officer name, petition basis, supporting evidence list |
| Cover Letter (USCIS) | Applicant name, receipt number, form type, filing basis, brief facts |
| Personal Declaration | First-person, sworn format — full name, country of birth, entry date, chronological facts, relief sought |
| Legal Argument Brief | Issue, legal standard (statute/regulation), facts, argument, conclusion |
| Evidence Summary | Exhibit list (repeatable rows: exhibit label, document type, relevance) |
| Case Summary | Client name, A-number, visa type, case stage, key dates, current status, next steps |

Each template connects to the existing `app/(dashboard)/crear/[template]/page.tsx` route. Paralegals fill a structured form — no open prompt box. The AI uses the firm's knowledge base automatically.

**Acceptance criteria:** A paralegal can generate a cover letter for a B-2 visa case in under 3 minutes from a blank form, exported as DOCX.

---

### 1.2 Attorney role

**What needs to be built:** Add `attorney` to the role system.

Changes required:
- `supabase/companies.sql` — add `attorney` to the role CHECK constraint
- `supabase/invitations.sql` — add `attorney` to the invitation role enum
- `lib/types.ts` — update `UserRole` type
- `app/(dashboard)/configuracion/equipo/` — show Attorney as an invitable role

Attorney permissions in Stage 1: same as Member (create and review documents). The approval workflow comes in Stage 2.

**Acceptance criteria:** Admin can invite someone as Attorney. Their role badge displays correctly in the team page.

---

### 1.3 Activity log UI

**What needs to be built:** The audit log writes to `audit_logs` table on every sensitive action. The read side does not exist yet.

Changes required:
- `app/api/audit-logs/route.ts` — GET endpoint, admin-only, paginated, filtered by date and user
- `app/(dashboard)/configuracion/actividad/page.tsx` — table showing: date, time, user, role, action, document affected

**Acceptance criteria:** Admin opens the Activity Log page and sees every document generation, review, and login event for their firm, with user attribution.

---

### 1.4 Firm knowledge state

**What needs to be built:** A summary view showing what the firm has uploaded to its knowledge base and how the AI is using it. The stats API already exists — only the UI is missing.

Changes required:
- `app/(dashboard)/knowledge-base/estado/page.tsx` — dashboard showing: total documents uploaded, categories breakdown, which documents are marked as model/reference, last upload date, generation count by template this month

This answers the question "Is our knowledge base working?" for the firm admin.

**Acceptance criteria:** Admin can see at a glance what's in their knowledge base and whether it's being used by the generation engine.

---

### 1.5 Guided multi-step form engine

**What needs to be built:** The current template form is a single page with all fields visible at once. For immigration documents — which require 8–15 structured fields — this is overwhelming for paralegals.

A multi-step wizard component is needed:
- `components/document-form-wizard.tsx` — step-by-step form with progress indicator, field-level validation per step, back/next navigation, summary review before generating
- The existing template definitions in `lib/templates.ts` gain a `steps` array that groups fields into logical sections

Example steps for a Cover Letter:
1. Client info (name, A-number, nationality)
2. Case info (visa type, petition basis, filing office)
3. Evidence (supporting documents, key facts)
4. Output preferences (tone, language, length)
5. Review and generate

**Acceptance criteria:** A paralegal with no AI experience completes a cover letter form without confusion. No field asks for a "prompt."

---

### Stage 1 — What is explicitly out of scope

These will not be built in Stage 1:

- Document approval workflow (Stage 2)
- Version history (Stage 2)
- Inline comments and annotations (Stage 2)
- Case/matter tracking (Stage 2)
- Analytics dashboard (Stage 2)
- Any third-party integrations

---

### Stage 1 success criteria

| Criterion | How to verify |
|---|---|
| Firm can log in and access their private workspace | Login → Dashboard shows firm name and zero data from other firms |
| Paralegals can generate a cover letter in under 5 minutes | Timed end-to-end test with a real paralegal |
| Knowledge base learns the firm's style | Generate same document before and after uploading 5 reference files — output should reflect the firm's tone |
| Admin can see all activity | Activity log shows every action, attributable to the correct user |
| DOCX export works for all 6 templates | Download and open each exported file in Word — formatting must be clean |

---

## Stage 2 — Advanced Collaboration and Legal Workflow

**Goal:** The firm has validated the core loop (generate → review → export). Stage 2 adds the legal validation layer: Attorney review, approval gates, versioning, case tracking, and productivity measurement.

**Stage 2 does not start until Stage 1 is fully validated with the pilot firm.**

---

### 2.1 Document approval workflow

A document moves through states: `draft → in_review → approved → final`.

What needs to be built:
- New DB table: `document_approvals` — `(id, document_id, submitted_by, assigned_to, status, comments, submitted_at, reviewed_at)`
- API routes: `POST /api/documents/[id]/submit` (paralegal submits for review), `POST /api/documents/[id]/approve` (attorney approves or returns with comments), `GET /api/documents/[id]/approval-status`
- Status badge on document cards (draft / pending review / approved / returned)
- Attorney inbox: a filtered view showing documents waiting for their review
- Paralegal notification when a document is returned or approved

**Acceptance criteria:** A paralegal submits a declaration for attorney review. The attorney sees it in their inbox, leaves a comment, and returns it. The paralegal revises and resubmits. The attorney approves. The document is locked.

---

### 2.2 Version history

Every time a document is regenerated or edited, a version is saved.

What needs to be built:
- New DB table: `document_versions` — `(id, document_id, version_number, content, created_by, created_at, change_note)`
- The current document update path (`PATCH /api/documents/[id]`) saves the previous content as a version before overwriting
- `app/(dashboard)/documentos/[id]/versiones/page.tsx` — list of versions with author, date, and a restore button
- Side-by-side diff view between any two versions

**Acceptance criteria:** A paralegal edits a legal argument brief three times. The attorney can view all three versions and restore version 2 if needed.

---

### 2.3 Inline comments and annotations

Attorneys and admins can leave comments tied to specific sections of a document.

What needs to be built:
- New DB table: `document_comments` — `(id, document_id, user_id, content, anchor_text, resolved, created_at, resolved_at)`
- Comment thread panel in the document detail view
- Resolve/unresolve toggle on each comment
- Comment count badge on document list cards

**Acceptance criteria:** Attorney opens a cover letter, highlights a paragraph, adds "This argument is too weak — cite INA 214(b) here," and marks it as unresolved. The paralegal sees the comment, edits the document, and marks it resolved.

---

### 2.4 Case and matter tracking

A case is the central organizing unit. Documents, approvals, and activity belong to a case.

What needs to be built:
- New DB table: `cases` — `(id, company_id, case_number, client_name, a_number, visa_type, case_type, status, assigned_attorney, assigned_paralegal, priority, deadline, created_at, updated_at)`
- `documents` table: add `case_id FK` column
- Full CRUD API: `app/api/cases/route.ts`, `app/api/cases/[id]/route.ts`
- Case list page with filters by attorney, status, visa type, and deadline
- Case detail page showing: client info, case status, all linked documents, assigned team, deadline countdown
- Assign documents to a case when generating or from document history

**Acceptance criteria:** Admin creates a case "Rodriguez — H-1B Extension." A paralegal generates a cover letter and assigns it to that case. The attorney opens the case and sees all documents, their approval status, and the filing deadline.

---

### 2.5 Analytics and productivity metrics

What needs to be built:
- `app/api/analytics/route.ts` — aggregates from `audit_logs` and `documents`: documents generated per attorney/paralegal, average time from draft to approval, template usage frequency, case throughput by month
- `app/(dashboard)/analytics/page.tsx` — admin-only dashboard with charts

**Acceptance criteria:** The firm's managing partner can see how many documents each paralegal generated last month and which templates are used most.

---

### 2.6 Full audit trail UI

The write infrastructure already exists. Stage 2 surfaces it fully.

Extends what Stage 1 built (the activity log) with:
- Filter by document, case, user, action type, and date range
- Export to CSV for compliance reporting
- Immutable display (no delete or edit actions available, clearly communicated)

**Acceptance criteria:** In a compliance review, the firm can export a complete audit trail for any case in CSV format within 2 minutes.

---

## Sequencing

```
Stage 1 (activate)
├── [EASY]   1.1 Immigration templates → 6 new entries in lib/templates.ts
├── [EASY]   1.2 Attorney role → 3 file changes, no schema migration
├── [MEDIUM] 1.3 Activity log UI → 1 API route + 1 page
├── [MEDIUM] 1.4 Knowledge state dashboard → 1 page (stats API exists)
└── [HARD]   1.5 Multi-step form wizard → new component + template step definitions

Stage 2 (advance) — only after Stage 1 validated with pilot firm
├── [HARD]   2.1 Approval workflow → new table + state machine + UI
├── [HARD]   2.2 Version history → new table + diff viewer
├── [HARD]   2.3 Inline comments → new table + comment panel
├── [HARD]   2.4 Case tracking → new table + full CRUD + document linking
└── [HARD]   2.5 Analytics + extended audit trail → aggregation queries + dashboard
```

Start Stage 1 with 1.1 and 1.2 (both deliverable in one session). Do 1.3 and 1.4 in parallel. Do 1.5 last — it touches the generation flow and needs the templates defined first.

---

## What is permanently out of scope

These will not be built regardless of stage:

- FOIA request workflow
- Court filing integrations (PACER, etc.)
- E-signature (use DocuSign or Adobe Sign externally)
- Client-facing portal (clients do not log into Luuc.ai)
- Billing per case or client invoicing
- Any integration with immigration case management software (INSZoom, LawLogix, etc.)

---

## Security posture (already in place)

The following security controls are already live and do not need to be built:

- Row Level Security on all tables — firms are fully isolated at the DB layer
- Service role key never exposed to the browser
- MIME-type validation on all file uploads
- PostgreSQL-backed rate limiting (cross-serverless-instance)
- Security headers: CSP, HSTS, X-Frame-Options, COOP, CORP
- Input validation with Zod on all API routes
- Audit log on every sensitive operation (write path)
- Prompt injection mitigations on AI generation routes
- All documents encrypted at rest (AES-256) and in transit (TLS 1.3)

The platform is built to handle confidential attorney-client information from day one.
