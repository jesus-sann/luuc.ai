# Architecture Documentation - Luuc.ai

This document provides a comprehensive overview of the Luuc.ai system architecture, data flows, and component hierarchy.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [System Architecture](#system-architecture)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Database Schema (ERD)](#database-schema-erd)
5. [Component Hierarchy](#component-hierarchy)
6. [Technology Stack](#technology-stack)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)

---

## System Overview

**Luuc.ai** is a legal document automation platform that enables law firms and legal professionals to:

1. **Generate** legal documents using AI-powered templates with company-specific context
2. **Review** legal documents for risks, compliance issues, and missing clauses
3. **Maintain** a knowledge base of approved documents and legal resources
4. **Collaborate** within companies with multi-tenant data isolation

**Key Design Principles:**
- Multi-tenant architecture with strict data isolation
- Context-aware document generation using company knowledge
- Production-ready security (RLS, input validation, prompt injection prevention)
- Scalable serverless architecture on Vercel + Supabase

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Browser    │  │    Mobile    │  │   Tablet     │             │
│  │   (React)    │  │  (Responsive)│  │ (Responsive) │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                     │
│         └─────────────────┴──────────────────┘                     │
│                           │                                        │
│                           ▼                                        │
│         ┌─────────────────────────────────────┐                   │
│         │      Next.js 14 App Router          │                   │
│         │  (React Server Components + Client) │                   │
│         └──────────────┬──────────────────────┘                   │
└────────────────────────┼───────────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────┼───────────────────────────────────────────┐
│                  APPLICATION LAYER (Vercel)                        │
├────────────────────────┼───────────────────────────────────────────┤
│                        │                                           │
│  ┌─────────────────────▼─────────────────────┐                    │
│  │         API Routes (/app/api/)            │                    │
│  ├───────────────────────────────────────────┤                    │
│  │  • /api/generate          (POST)          │                    │
│  │  • /api/generate-custom   (POST)          │                    │
│  │  • /api/review            (POST)          │                    │
│  │  • /api/documents         (GET, DELETE)   │                    │
│  │  • /api/user/profile      (GET, PUT)      │                    │
│  │  • /api/company/*         (CRUD)          │                    │
│  │  • /api/knowledge-base/*  (CRUD)          │                    │
│  └───────────┬───────────────┬───────────────┘                    │
│              │               │                                    │
│              │               │                                    │
│  ┌───────────▼───────┐  ┌───▼────────────────┐                   │
│  │  Middleware       │  │  Service Layer     │                   │
│  ├───────────────────┤  ├────────────────────┤                   │
│  │ • Auth Check      │  │ • lib/auth.ts      │                   │
│  │ • Rate Limiting   │  │ • lib/claude.ts    │                   │
│  │ • CORS            │  │ • lib/supabase.ts  │                   │
│  └───────────────────┘  │ • lib/company.ts   │                   │
│                         │ • lib/knowledge-   │                   │
│                         │   base.ts          │                   │
│                         │ • lib/validators.ts│                   │
│                         └──────┬──────┬──────┘                   │
└────────────────────────────────┼──────┼────────────────────────────┘
                                 │      │
                    ┌────────────┘      └────────────┐
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────┐  ┌─────────────────────────────┐
│     DATA LAYER (Supabase)        │  │  EXTERNAL SERVICES          │
├──────────────────────────────────┤  ├─────────────────────────────┤
│                                  │  │                             │
│  ┌────────────────────────────┐  │  │  ┌────────────────────────┐ │
│  │   PostgreSQL Database      │  │  │  │  Anthropic Claude API  │ │
│  ├────────────────────────────┤  │  │  ├────────────────────────┤ │
│  │ • users                    │  │  │  │ • Document Generation  │ │
│  │ • companies                │  │  │  │ • Document Analysis    │ │
│  │ • company_documents        │  │  │  │ • Model: claude-       │ │
│  │ • knowledge_base           │  │  │  │   sonnet-4-20250514    │ │
│  │ • knowledge_base_categories│  │  │  └────────────────────────┘ │
│  │ • documents                │  │  │                             │
│  │ • analyses                 │  │  └─────────────────────────────┘
│  │ • templates                │  │
│  │ • usage_logs               │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │   Supabase Auth            │  │
│  ├────────────────────────────┤  │
│  │ • Email/Password           │  │
│  │ • Magic Links              │  │
│  │ • OAuth (optional)         │  │
│  │ • Row Level Security (RLS) │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │   Supabase Storage         │  │
│  │   (Future: file storage)   │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Document Generation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Selects template
     │    + Fills variables
     ▼
┌──────────────────┐
│  Generate Form   │
│  (Client)        │
└────┬─────────────┘
     │
     │ 2. POST /api/generate
     │    { template, variables, companyId }
     ▼
┌──────────────────────────────────────────────┐
│  /api/generate Route Handler                 │
├──────────────────────────────────────────────┤
│  3. getCurrentUser() → Verify auth           │
│  4. Check tier limits (free: 10 docs)        │
│  5. Determine companyId                      │
└────┬─────────────────────────────────────────┘
     │
     │ 6. Fetch company context in parallel:
     │
     ├─────────────────┬──────────────────┬────────────────────┐
     ▼                 ▼                  ▼                    ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
│Get Approved │  │Get Company   │  │Get Knowledge    │  │              │
│ Documents   │  │Instructions  │  │Base Context     │  │              │
│(doc refs)   │  │(style rules) │  │(relevant docs)  │  │              │
└─────┬───────┘  └──────┬───────┘  └─────┬───────────┘  └──────────────┘
      │                 │                 │
      └─────────────────┴─────────────────┘
                        │
                        │ 7. Combine contexts
                        ▼
┌──────────────────────────────────────────────┐
│  generateDocumentWithContext()               │
│  (lib/claude.ts)                             │
├──────────────────────────────────────────────┤
│  8. Build system prompt with:                │
│     - Base legal expert instructions         │
│     - Company style instructions             │
│     - Reference documents context            │
│     - Knowledge base context                 │
│  9. Build user prompt with variables         │
└────┬─────────────────────────────────────────┘
     │
     │ 10. Call Anthropic Claude API
     ▼
┌──────────────────────────────────────────────┐
│  Anthropic Claude API                        │
│  (claude-sonnet-4-20250514)                  │
├──────────────────────────────────────────────┤
│  11. Generate document respecting:           │
│      - Company style guide                   │
│      - Reference document patterns           │
│      - Legal best practices                  │
└────┬─────────────────────────────────────────┘
     │
     │ 12. Return generated content
     ▼
┌──────────────────────────────────────────────┐
│  Save to Database                            │
├──────────────────────────────────────────────┤
│  13. saveDocument() → documents table        │
│  14. logUsage() → usage_logs table           │
└────┬─────────────────────────────────────────┘
     │
     │ 15. Return success response
     ▼
┌──────────────────┐
│  Client receives │
│  generated doc   │
└──────────────────┘
```

### 2. Document Review Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Upload document (PDF/DOCX/TXT)
     ▼
┌──────────────────┐
│  File Upload     │
│  Component       │
├──────────────────┤
│  2. Extract text │
│     from file    │
└────┬─────────────┘
     │
     │ 3. POST /api/review
     │    { content, filename, focusContext }
     ▼
┌──────────────────────────────────────────────┐
│  /api/review Route Handler                   │
├──────────────────────────────────────────────┤
│  4. getCurrentUser() → Verify auth           │
│  5. Check tier limits (free: 5 analyses)     │
│  6. Validate & sanitize input:               │
│     - validateAnalysisContent()              │
│     - validateFilename()                     │
│     - validateFocusContext()                 │
│     - validateFileSize()                     │
└────┬─────────────────────────────────────────┘
     │
     │ 7. Call analyzeDocument() with sanitized input
     ▼
┌──────────────────────────────────────────────┐
│  analyzeDocument()                           │
│  (lib/claude.ts)                             │
├──────────────────────────────────────────────┤
│  8. Build analysis prompt:                   │
│     - System: Legal expert analyst           │
│     - User: Document + focus context         │
│     - Request structured JSON response       │
└────┬─────────────────────────────────────────┘
     │
     │ 9. Call Anthropic Claude API
     ▼
┌──────────────────────────────────────────────┐
│  Anthropic Claude API                        │
├──────────────────────────────────────────────┤
│  10. Analyze document for:                   │
│      - Risk level (1-10 score)               │
│      - Critical clauses                      │
│      - Missing clauses                       │
│      - Compliance issues                     │
│  11. Return structured JSON                  │
└────┬─────────────────────────────────────────┘
     │
     │ 12. Parse JSON response
     ▼
┌──────────────────────────────────────────────┐
│  Save to Database                            │
├──────────────────────────────────────────────┤
│  13. saveAnalysis() → analyses table         │
│  14. logUsage() → usage_logs table           │
└────┬─────────────────────────────────────────┘
     │
     │ 15. Return analysis results
     ▼
┌──────────────────┐
│  Client displays │
│  risk panel with │
│  findings        │
└──────────────────┘
```

### 3. Knowledge Base Upload Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Select file or paste text
     │    + Choose category
     │    + Add tags
     ▼
┌──────────────────┐
│  KB Upload Form  │
└────┬─────────────┘
     │
     │ 2. POST /api/knowledge-base
     │    (multipart/form-data OR JSON)
     ▼
┌──────────────────────────────────────────────┐
│  /api/knowledge-base Route Handler           │
├──────────────────────────────────────────────┤
│  3. getCurrentUser() → Verify auth           │
│  4. Get company (required for KB)            │
│  5. Validate file:                           │
│     - Type: pdf, docx, txt, md               │
│     - Size: < 10MB                           │
│     - Content: > 50 chars (text upload)      │
└────┬─────────────────────────────────────────┘
     │
     │ 6. File upload OR text upload?
     │
     ├──────────────────┬──────────────────────┐
     │ FILE             │ TEXT                 │
     ▼                  ▼                      │
┌─────────────────┐  ┌──────────────────────┐ │
│Extract text from│  │Use provided text     │ │
│PDF/DOCX using   │  │directly              │ │
│pdf-parse/mammoth│  └──────────────────────┘ │
└─────┬───────────┘                           │
      │                                       │
      └───────────────────┬───────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────┐
│  uploadToKnowledgeBase() OR                  │
│  uploadTextToKnowledgeBase()                 │
│  (lib/knowledge-base.ts)                     │
├──────────────────────────────────────────────┤
│  7. Insert into knowledge_base table         │
│  8. Auto-increment category document_count   │
│     via trigger                              │
└────┬─────────────────────────────────────────┘
     │
     │ 9. Return saved document
     ▼
┌──────────────────┐
│  Client updates  │
│  KB list         │
└──────────────────┘
```

---

## Database Schema (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         auth.users (Supabase Auth)                  │
│─────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • email                                                             │
│ • encrypted_password                                                │
│ • created_at                                                        │
└───────────────┬─────────────────────────────────────────────────────┘
                │
                │ Trigger: on_auth_user_created
                │ → Creates row in public.users
                │
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         public.users                                 │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK, FK → auth.users.id)                                 │
│ • email (VARCHAR, UNIQUE, NOT NULL)                                 │
│ • name (VARCHAR)                                                    │
│ • company (VARCHAR) [deprecated - use company_id]                   │
│ • company_id (UUID, FK → companies.id)                              │
│ • role (owner | admin | member)                                     │
│ • plan (free | pro | enterprise) DEFAULT 'free'                     │
│ • usage_documents (INT) DEFAULT 0                                   │
│ • usage_analyses (INT) DEFAULT 0                                    │
│ • avatar_url (TEXT)                                                 │
│ • last_login (TIMESTAMPTZ)                                          │
│ • created_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│ • updated_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│                                                                     │
│ Indexes:                                                            │
│   - idx_users_email (email)                                         │
│   - idx_users_plan (plan)                                           │
│   - idx_users_company_id (company_id)                               │
│                                                                     │
│ RLS: Users can view/update own profile                              │
└─────┬─────────────────────────┬──────────────────────────────────────┘
      │                         │
      │ owner                   │ member/user
      │                         │
      ▼                         │
┌──────────────────────────────────────────────────────────────────────┐
│                         public.companies                             │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • name (VARCHAR, NOT NULL)                                          │
│ • user_id (UUID, FK → users.id) [owner]                             │
│ • industry (VARCHAR)                                                │
│ • description (TEXT)                                                │
│ • document_rules (JSONB) {style, language, tone, customInstructions}│
│ • status (active | inactive | suspended) DEFAULT 'active'           │
│ • created_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│ • updated_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│                                                                     │
│ Indexes:                                                            │
│   - idx_companies_user_id (user_id)                                 │
│   - idx_companies_status (status)                                   │
│                                                                     │
│ RLS: Users can view their own company or company they belong to     │
│                                                                     │
│ Trigger: create_default_kb_categories                               │
│   → Creates 5 default categories in knowledge_base_categories       │
└─────┬──────────────────────┬────────────────────────────────────────┘
      │                      │
      │                      │
      ▼                      ▼
┌──────────────────────┐  ┌────────────────────────────────────────────┐
│company_documents     │  │ knowledge_base                             │
├──────────────────────┤  ├────────────────────────────────────────────┤
│• id (UUID, PK)       │  │ • id (UUID, PK)                            │
│• company_id (FK)     │  │ • company_id (UUID, FK → companies.id)     │
│• title (VARCHAR)     │  │ • title (VARCHAR, NOT NULL)                │
│• content (TEXT)      │  │ • filename (VARCHAR)                       │
│• doc_type (VARCHAR)  │  │ • file_type (pdf|docx|txt|md|other)        │
│• category            │  │ • file_size (INT)                          │
│  (aprobado|borrador  │  │ • category (VARCHAR, NOT NULL)             │
│   |ejemplo)          │  │ • tags (TEXT[])                            │
│• uploaded_by (FK)    │  │ • content (TEXT, NOT NULL)                 │
│• views_count (INT)   │  │ • content_summary (TEXT)                   │
│• created_at          │  │ • metadata (JSONB)                         │
│• updated_at          │  │ • usage_count (INT) DEFAULT 0              │
│                      │  │ • last_used_at (TIMESTAMPTZ)               │
│Indexes:              │  │ • uploaded_by (UUID, FK → users.id)        │
│ - company_id         │  │ • created_at (TIMESTAMPTZ)                 │
│ - doc_type           │  │ • updated_at (TIMESTAMPTZ)                 │
│ - category           │  │                                            │
│                      │  │ Indexes:                                   │
│RLS: View/manage docs │  │  - idx_knowledge_base_company_id           │
│  from own company    │  │  - idx_knowledge_base_category             │
└──────────────────────┘  │  - idx_knowledge_base_tags (GIN)           │
                          │  - idx_knowledge_base_search (GIN, tsvector)│
      ┌───────────────────┤                                            │
      │                   │ RLS: View/manage KB docs from own company  │
      │                   └────────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  knowledge_base_categories                           │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • company_id (UUID, FK → companies.id)                              │
│ • name (VARCHAR, NOT NULL)                                          │
│ • slug (VARCHAR, NOT NULL)                                          │
│ • description (TEXT)                                                │
│ • icon (VARCHAR) DEFAULT 'folder'                                   │
│ • color (VARCHAR) DEFAULT '#3B82F6'                                 │
│ • display_order (INT) DEFAULT 0                                     │
│ • is_active (BOOLEAN) DEFAULT true                                  │
│ • document_count (INT) DEFAULT 0                                    │
│ • created_at (TIMESTAMPTZ)                                          │
│ • updated_at (TIMESTAMPTZ)                                          │
│                                                                     │
│ UNIQUE(company_id, slug)                                            │
│                                                                     │
│ Trigger: update_category_document_count                             │
│   → Auto-updates document_count when KB docs added/removed          │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                         public.documents                             │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • user_id (UUID, FK → users.id, CASCADE DELETE)                     │
│ • company_id (UUID, FK → companies.id)                              │
│ • title (VARCHAR, NOT NULL)                                         │
│ • doc_type (VARCHAR, NOT NULL)                                      │
│ • content (TEXT, NOT NULL)                                          │
│ • variables (JSONB) DEFAULT '{}'                                    │
│ • is_custom (BOOLEAN) DEFAULT false                                 │
│ • word_count (INT) DEFAULT 0                                        │
│ • created_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│ • updated_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│                                                                     │
│ Indexes:                                                            │
│   - idx_documents_user_id (user_id)                                 │
│   - idx_documents_company_id (company_id)                           │
│   - idx_documents_doc_type (doc_type)                               │
│   - idx_documents_created_at (created_at DESC)                      │
│                                                                     │
│ RLS: Users can view/insert/update/delete own documents              │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                         public.analyses                              │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • user_id (UUID, FK → users.id, CASCADE DELETE)                     │
│ • company_id (UUID, FK → companies.id)                              │
│ • filename (VARCHAR, NOT NULL)                                      │
│ • file_path (TEXT)                                                  │
│ • file_size (INT)                                                   │
│ • focus_context (TEXT)                                              │
│ • risk_score (DECIMAL(3,1)) CHECK (1-10)                            │
│ • summary (TEXT)                                                    │
│ • findings (JSONB) DEFAULT '[]'                                     │
│ • missing_clauses (JSONB) DEFAULT '[]'                              │
│ • observations (TEXT)                                               │
│ • created_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│                                                                     │
│ Indexes:                                                            │
│   - idx_analyses_user_id (user_id)                                  │
│   - idx_analyses_company_id (company_id)                            │
│   - idx_analyses_risk_score (risk_score)                            │
│   - idx_analyses_created_at (created_at DESC)                       │
│                                                                     │
│ RLS: Users can view/insert/delete own analyses                      │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                         public.templates                             │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • user_id (UUID, FK → users.id, CASCADE DELETE)                     │
│ • name (VARCHAR, NOT NULL)                                          │
│ • slug (VARCHAR, NOT NULL)                                          │
│ • description (TEXT)                                                │
│ • category (VARCHAR)                                                │
│ • variables (JSONB) DEFAULT '[]'                                    │
│ • system_prompt (TEXT)                                              │
│ • is_public (BOOLEAN) DEFAULT false                                 │
│ • usage_count (INT) DEFAULT 0                                       │
│ • created_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│ • updated_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│                                                                     │
│ UNIQUE(user_id, slug)                                               │
│                                                                     │
│ Indexes:                                                            │
│   - idx_templates_user_id (user_id)                                 │
│   - idx_templates_is_public (is_public)                             │
│                                                                     │
│ RLS: Users can view own + public templates                          │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                         public.usage_logs                            │
│──────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • user_id (UUID, FK → users.id, CASCADE DELETE)                     │
│ • action_type (generate | analyze | custom_generate)                │
│ • tokens_used (INT) DEFAULT 0                                       │
│ • model_used (VARCHAR)                                              │
│ • metadata (JSONB) DEFAULT '{}'                                     │
│ • created_at (TIMESTAMPTZ) DEFAULT NOW()                            │
│                                                                     │
│ Indexes:                                                            │
│   - idx_usage_logs_user_id (user_id)                                │
│   - idx_usage_logs_action_type (action_type)                        │
│   - idx_usage_logs_created_at (created_at DESC)                     │
│                                                                     │
│ RLS: Users can view/insert own logs                                 │
│                                                                     │
│ Trigger: increment_usage_on_log                                     │
│   → Updates users.usage_documents or users.usage_analyses           │
└──────────────────────────────────────────────────────────────────────┘
```

**Key Relationships:**

1. `auth.users` (1) → (1) `public.users` - Supabase auth integration
2. `users` (1) → (0..1) `companies` - User owns company
3. `users` (N) → (1) `companies` - Users belong to company (via company_id)
4. `companies` (1) → (N) `company_documents` - Company reference docs
5. `companies` (1) → (N) `knowledge_base` - Company knowledge base
6. `companies` (1) → (N) `knowledge_base_categories` - Custom categories
7. `users` (1) → (N) `documents` - User-generated documents
8. `users` (1) → (N) `analyses` - User-performed analyses
9. `users` (1) → (N) `templates` - User-created templates
10. `users` (1) → (N) `usage_logs` - User activity logs

---

## Component Hierarchy

```
app/
├── layout.tsx                        # Root layout with providers
│   └── Providers (Supabase, Auth, Toast)
│
├── page.tsx                          # Landing page
│   ├── Hero section
│   ├── Features showcase
│   ├── Pricing cards
│   └── CTA sections
│
├── (auth)/                           # Auth route group
│   ├── login/
│   │   └── LoginForm
│   ├── register/
│   │   └── RegisterForm
│   └── reset-password/
│       └── ResetPasswordForm
│
├── (dashboard)/                      # Protected dashboard routes
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard layout
│   │   │   ├── Sidebar component
│   │   │   ├── TopBar component
│   │   │   └── ErrorBoundary
│   │   │
│   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── StatsCards
│   │   │   ├── RecentDocuments
│   │   │   └── QuickActions
│   │   │
│   │   ├── generar/
│   │   │   └── page.tsx              # Generate documents
│   │   │       ├── TemplateCard []
│   │   │       └── GenerateForm
│   │   │           ├── FormFields
│   │   │           └── SubmitButton
│   │   │
│   │   ├── personalizado/
│   │   │   └── page.tsx              # Custom generation
│   │   │       └── CustomGenerateForm
│   │   │
│   │   ├── revisar/
│   │   │   └── page.tsx              # Review documents
│   │   │       ├── FileUpload component
│   │   │       ├── FocusContextInput
│   │   │       └── RiskPanel component
│   │   │           ├── RiskScore
│   │   │           ├── FindingsList
│   │   │           └── MissingClauses
│   │   │
│   │   ├── documentos/
│   │   │   └── page.tsx              # Document library
│   │   │       ├── DocumentFilters
│   │   │       ├── DocumentTable
│   │   │       └── DocumentActions
│   │   │
│   │   ├── empresa/
│   │   │   ├── configuracion/
│   │   │   │   └── page.tsx          # Company setup
│   │   │   │       ├── CompanyForm
│   │   │   │       └── DocumentRulesEditor
│   │   │   │
│   │   │   ├── documentos/
│   │   │   │   └── page.tsx          # Company reference docs
│   │   │   │       ├── UploadDocumentForm
│   │   │   │       └── DocumentList
│   │   │   │
│   │   │   └── conocimiento/
│   │   │       └── page.tsx          # Knowledge base
│   │   │           ├── CategoryTabs
│   │   │           ├── UploadKBForm
│   │   │           ├── SearchBar
│   │   │           └── KBDocumentGrid
│   │   │
│   │   └── perfil/
│   │       └── page.tsx              # User profile
│   │           ├── ProfileForm
│   │           └── PlanBadge
│   │
│   └── api/                          # API routes
│       ├── generate/
│       │   └── route.ts              # POST document generation
│       ├── generate-custom/
│       │   └── route.ts              # POST custom generation
│       ├── review/
│       │   └── route.ts              # POST document review
│       ├── documents/
│       │   └── route.ts              # GET, DELETE documents
│       ├── user/
│       │   └── profile/
│       │       └── route.ts          # GET, PUT profile
│       ├── company/
│       │   ├── setup/
│       │   │   └── route.ts          # GET, POST, PUT company
│       │   ├── documents/
│       │   │   └── route.ts          # GET, POST, DELETE company docs
│       │   └── stats/
│       │       └── route.ts          # GET company stats
│       └── knowledge-base/
│           ├── route.ts              # GET, POST KB docs
│           ├── [id]/
│           │   └── route.ts          # GET, PUT, DELETE specific doc
│           ├── categories/
│           │   └── route.ts          # GET, POST categories
│           └── stats/
│               └── route.ts          # GET KB stats
│
├── components/                       # Shared components
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   │
│   ├── error-boundary.tsx            # Error boundary wrapper
│   ├── file-upload.tsx               # File upload with drag & drop
│   ├── risk-panel.tsx                # Risk analysis display
│   ├── sidebar.tsx                   # Dashboard sidebar
│   └── template-card.tsx             # Template selection card
│
└── lib/                              # Utility libraries
    ├── auth.ts                       # getCurrentUser(), auth helpers
    ├── claude.ts                     # Claude API integration
    ├── company.ts                    # Company CRUD operations
    ├── knowledge-base.ts             # KB CRUD operations
    ├── supabase.ts                   # Database helper functions
    ├── supabase/
    │   ├── client.ts                 # Client-side Supabase
    │   ├── server.ts                 # Server-side Supabase
    │   └── middleware.ts             # Auth middleware
    ├── templates.ts                  # Template definitions
    ├── utils.ts                      # General utilities (cn, etc.)
    ├── validators.ts                 # Input validation & sanitization
    └── logger.ts                     # Structured logging
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.5
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.4
- **Component Library:** Radix UI primitives (shadcn/ui)
- **Icons:** Lucide React
- **State Management:** React hooks + Server Components
- **Forms:** Native React controlled components
- **File Upload:** react-dropzone

### Backend
- **Runtime:** Node.js 22 (Vercel serverless)
- **API:** Next.js API Routes (App Router)
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **ORM:** Supabase client (direct SQL)
- **AI/ML:** Anthropic Claude API (claude-sonnet-4-20250514)
- **File Processing:** pdf-parse, mammoth (DOCX)

### Infrastructure
- **Hosting:** Vercel (serverless deployment)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Vercel Edge Network
- **DNS:** Vercel DNS
- **SSL:** Automatic via Vercel

### DevOps
- **CI/CD:** GitHub Actions (defined in .github/workflows/)
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint + Next.js config
- **Type Checking:** TypeScript strict mode
- **Version Control:** Git + GitHub

---

## Security Architecture

### 1. Authentication & Authorization
- **Supabase Auth:** Email/password + magic links
- **JWT Tokens:** Secure, short-lived access tokens
- **Row-Level Security (RLS):** Database-level access control
- **Session Management:** Secure cookie-based sessions

### 2. Data Isolation (Multi-Tenant)
- **Company-based RLS:** All tables enforce company_id isolation
- **User-based RLS:** Personal documents isolated per user
- **No cross-tenant leaks:** Enforced at database level

### 3. Input Validation
- **lib/validators.ts:** Centralized validation functions
  - `validateAnalysisContent()` - Prevents XSS, SQL injection
  - `validateFilename()` - Path traversal protection
  - `validateFocusContext()` - Prompt injection prevention
  - `validateFileSize()` - Prevents DoS via large files

### 4. API Security
- **Rate Limiting:** Tier-based limits (free: 10 docs, 5 analyses)
- **CORS:** Restricted to production domain
- **HTTPS Only:** Enforced by Vercel
- **Environment Variables:** Secrets stored in Vercel dashboard

### 5. Prompt Injection Prevention
- All user inputs to Claude API are sanitized
- Focus context limited to safe patterns
- System prompts are hardcoded (not user-controlled)

### 6. Database Security
- **Encrypted at Rest:** Supabase encryption
- **Encrypted in Transit:** SSL/TLS connections
- **Service Role Key:** Server-side only, never exposed to client
- **Prepared Statements:** Via Supabase client (prevents SQL injection)

---

## Scalability Considerations

### Current Architecture (MVP)
- **Serverless:** Auto-scales with Vercel
- **Database:** Supabase shared plan (upgradeable)
- **Expected Load:** 100-1000 users, 10k requests/day

### Bottlenecks Identified
1. **Claude API Rate Limits:** Anthropic tier-based limits
2. **Database Connections:** Supabase connection pooling needed at scale
3. **File Processing:** Large PDFs processed synchronously (blocking)

### Scaling Strategy

#### Phase 1: 1K-10K users
- Upgrade Supabase to Pro (connection pooling)
- Implement Redis caching for:
  - User sessions
  - Company context (frequently used)
  - Knowledge base search results
- Add CDN for static assets

#### Phase 2: 10K-100K users
- Move file processing to background jobs (Vercel cron + queue)
- Implement database read replicas (Supabase)
- Add Cloudflare in front for DDoS protection
- Implement vector embeddings for semantic search (pgvector)

#### Phase 3: 100K+ users
- Microservices architecture:
  - Separate document generation service
  - Separate analysis service
  - API gateway (Kong/Tyk)
- Multiple region deployment (Vercel + Supabase multi-region)
- Dedicated Claude API enterprise tier
- Object storage for document files (S3/Supabase Storage)

### Performance Optimizations
- **React Server Components:** Reduce client bundle size
- **Edge Functions:** Deploy auth checks to edge (Vercel Edge Runtime)
- **Database Indexes:** Optimized for common queries
- **Lazy Loading:** Code splitting for dashboard routes
- **Prefetching:** Next.js automatic prefetching for navigation

---

## Future Architecture Enhancements

1. **Real-time Collaboration:** Supabase Realtime for multi-user editing
2. **Document Versioning:** Track changes, rollback capability
3. **Webhook System:** Notify external systems of events
4. **Audit Logs:** Comprehensive activity tracking
5. **Advanced Analytics:** Usage patterns, document insights
6. **Mobile App:** React Native with same backend
7. **Email Notifications:** Transactional emails (Resend/SendGrid)
8. **Document Storage:** Move from DB to object storage at scale
