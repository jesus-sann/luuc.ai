# Luuc.ai

**Luuc.ai** is an AI-powered legal document platform built for Latin American companies and law firms. It automates the drafting and review of legal documents using AI trained on Colombian and regional regulations, replacing hours of manual work with seconds of generation.

Live at: [luuc-ai.vercel.app](https://luuc-ai.vercel.app)

---

## What it does

Luuc.ai gives legal teams three core capabilities:

### 1. Document Generation
Generate professional legal documents from templates or from a natural language description. The AI produces ready-to-sign DOCX and PDF output with proper formatting, headers, and clauses — not plain text.

Supported templates: NDA, Employment Contract, Services Agreement, Lease Agreement, Corporate Minutes, Power of Attorney. Free-form generation available for any other document type.

Custom instructions let users control tone, add specific clauses, or specify jurisdiction before generating.

### 2. Document Analysis
Upload a PDF, DOCX, or TXT contract and get an automated risk report. The AI assigns a risk score (0–100), categorizes findings by severity (High / Medium / Low), and provides specific recommendations for each issue — missing clauses, risky terms, unusual obligations.

### 3. Knowledge Base
Upload the company's approved contracts, policies, and internal documents. The AI uses them as context when generating new documents, learning the firm's specific style, preferred clauses, and standard terms. The more you upload, the more it sounds like you.

---

## Who it's for

**Corporate legal departments** at companies with 50–500 employees handling 20–50 contracts per month. Currently overloaded with routine drafting, no budget for US enterprise LegalTech, and needing Spanish-language tools.

**Law firms** (5–50 lawyers) in Colombia and Latin America that want to increase output per associate without hiring. Generate first drafts in seconds, review 5x faster.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (serverless, deployed on Vercel) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (email/password + magic link) |
| AI | Google Gemini 2.0 Flash (default), Anthropic Claude, Groq Llama (swappable via `AI_PROVIDER`) |
| Export | docx (DOCX generation), jsPDF (PDF rendering) |
| Email | Resend (transactional — team invitations) |
| Rate limiting | PostgreSQL-backed (cross-serverless-instance via Supabase RPC) |
| i18n | next-intl (Spanish / English UI) |
| Monitoring | Sentry (error tracking) |

---

## Architecture

Multi-tenant SaaS. Every company's data is fully isolated at the database level using Supabase Row Level Security (RLS) — no company can ever access another's documents, knowledge base, or team.

```
Browser
  └─ Next.js App (Vercel)
       ├─ /api/generate        → AI document generation (streaming)
       ├─ /api/review          → AI document analysis (streaming)
       ├─ /api/documents       → Document CRUD
       ├─ /api/knowledge-base  → KB file management
       ├─ /api/invitations     → Team invite flow
       └─ /api/company         → Company setup & stats
            └─ Supabase (PostgreSQL + Auth + Storage)
                  └─ AI Provider (Gemini / Claude / Llama)
```

All API routes are protected by:
- JWT session validation (Supabase Auth)
- Company-scoped data access (RLS + application-level tenant checks)
- PostgreSQL-backed rate limiting (enforced globally across serverless instances)
- Input validation (Zod schemas + sanitization)

---

## Pages and features

### Public
| Route | Purpose |
|---|---|
| `/` | Marketing homepage |
| `/precios` | Pricing page |
| `/seguridad` | Security & compliance page |
| `/terminos` | Terms of service |
| `/privacidad` | Privacy policy |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |
| `/invite/[token]` | Accept team invitation |

### Dashboard (authenticated)
| Route | Purpose |
|---|---|
| `/dashboard` | Home — recent documents, usage stats |
| `/crear` | Choose a document template |
| `/crear/[template]` | Generate from template |
| `/crear/personalizado` | Generate from free-form description |
| `/redactar` | Same as /crear (alias) |
| `/revisar` | Upload a document for risk analysis |
| `/documentos` | Document history |
| `/knowledge-base` | Manage company knowledge base |
| `/configuracion` | Account settings hub |
| `/configuracion/perfil` | User profile |
| `/configuracion/empresa` | Company profile |
| `/configuracion/equipo` | Team members & invitations |
| `/configuracion/seguridad` | Password change |
| `/configuracion/planes` | Subscription & billing |
| `/configuracion/documentos` | Document preferences |

---

## Data model

Core tables in PostgreSQL:

| Table | Purpose |
|---|---|
| `users` | User profiles, roles, plan |
| `companies` | Company profiles, per-tenant |
| `documents` | Generated documents with content and metadata |
| `analyses` | Document analysis results with risk scores and findings |
| `knowledge_base` | Uploaded company context files |
| `knowledge_base_categories` | KB organization |
| `invitations` | Pending team invitations |
| `audit_logs` | All sensitive operations (who, what, when, IP) |
| `usage_logs` | AI usage per user for billing and analytics |
| `rate_limits` | Cross-instance rate limiting state |

---

## Security

- **Tenant isolation** — RLS policies enforce company-scoped access on every table. A user from Company A cannot read Company B's documents even with a valid JWT.
- **Encryption** — AES-256 at rest (Supabase), TLS 1.3 in transit.
- **Rate limiting** — PostgreSQL-backed atomic rate limits enforced globally (not per-instance).
- **Audit trail** — All document access, generation, and analysis logged with user ID, IP, and timestamp.
- **AI privacy** — Documents are not used to train models. Anthropic DPA in place.
- **Compliance** — Aligned with GDPR, Colombia Ley 1581 (Habeas Data), SOC 2 and ISO 27001 infrastructure controls.
- **Input validation** — Zod schemas on all API inputs. Prompt injection mitigations on AI routes. MIME-type verification on file uploads.
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, COOP, CORP on all responses.

---

## AI provider system

The AI layer is abstracted behind a single interface in `lib/ai-provider.ts`. The active provider is set via the `AI_PROVIDER` environment variable:

```
AI_PROVIDER=google    → Gemini 2.0 Flash   (default, cost-efficient)
AI_PROVIDER=anthropic → Claude Sonnet 4.x  (highest quality)
AI_PROVIDER=groq      → Llama 3.x          (free tier testing)
```

Switching providers requires only changing the env var — no code changes. All three providers stream responses for real-time UX.

---

## Onboarding

New users go through a guided setup:

1. **Welcome** — introduces the platform
2. **Company setup** — name, country, sector
3. **Interactive tour** — spotlight highlights for Create, Review, and Knowledge Base
4. **First action** — prompted to generate their first NDA

Target: first document in under 5 minutes from registration.

---

## Document export

Generated documents are exported as:

- **DOCX** — structured Word document with styles, headers, page numbers, and proper legal formatting. Uses the `docx` library server-side.
- **PDF** — rendered PDF ready for signature. Uses `jsPDF`.

Both formats preserve clause structure and professional appearance — not raw text dumps.

---

## Team & roles

Companies can invite team members by email. Four roles:

| Role | Can do |
|---|---|
| Owner | Everything, including deleting the company |
| Admin | Manage team, invite/remove members, access all documents |
| Member | Create and review documents |
| Viewer | Read-only access to documents |

Invitations expire after 7 days and are single-use.

---

## Roadmap (from February 2026)

**Q1 2026** — Document versioning, comments and annotations, OAuth (Google/Microsoft), shared template library

**Q2 2026** — SSO (SAML/OIDC), audit reports (PDF export), custom branding, public API, Slack/Teams integration

**Q3 2026** — Contract comparison, clause library, deadline tracking, analytics dashboard, AI chat assistant

---

## Running locally

```bash
git clone https://github.com/jesus-sann/luuc.ai.git
cd luuc.ai
npm install
cp .env.example .env.local   # fill in SUPABASE and AI keys
npm run dev
```

Requires: Node.js 18+, a Supabase project with migrations applied (run all files in `/supabase/` in order), and at least one AI provider key.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AI_PROVIDER=google
GOOGLE_AI_API_KEY=...
```

---

## Company

**Luuc.ai S.A.S.** — Colombia, founded 2025. Pre-seed / bootstrap stage. Built for the Latin American legal market.
