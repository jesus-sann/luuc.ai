# LUUC.AI — Sprint Plan: Landing Page Redesign & Demo Chat

**Version:** 1.0
**Date:** 2026-01-31
**Status:** AWAITING FOUNDER APPROVAL
**Estimated Effort:** 2 weeks (split across security hardening + feature development)

---

## Executive Summary

This sprint delivers a redesigned landing page with an interactive demo chat feature that allows visitors to experience Luuc.ai's legal document generation capabilities without registration. The plan addresses critical security vulnerabilities before adding new functionality, implements a cost-effective demo using Claude Haiku with multi-layer abuse prevention, and consolidates UX redundancies across the platform.

**Key Deliverables:**
1. Security mitigations for existing P0 vulnerabilities (BLOCKER — must complete first)
2. New landing page with professional design and demo chat interface
3. Demo API endpoint with Haiku model, caching, and abuse prevention
4. Code quality improvements: dead code removal, handler consolidation, validation additions
5. UX improvements: merged flows, Spanish translations, accessibility fixes

**Risk Level:** MEDIUM — Demo feature introduces new abuse vectors, mitigated by multi-layer defense strategy

**Cost Impact:** +$17/month at 1,000 demo uses/day (with Haiku + caching) vs. $855/month with Sonnet

---

## Phase A: Security Mitigations (BLOCKERS — Before Any New Code)

**Status:** CRITICAL — These vulnerabilities exist NOW in production code
**Timeline:** Complete before Phase B begins
**Owner:** Engineer + Security agents

### P0 — Production Blockers (Must Fix)

| # | Vulnerability | Current Impact | Fix Required |
|---|--------------|----------------|--------------|
| 1 | **supabaseAdmin RLS Bypass** | User-facing queries in `/api/user/profile`, `/api/company/[id]` use service role client, bypassing RLS. Allows cross-tenant data access. | Replace `supabaseAdmin` with user-scoped `supabase` client in all user-facing routes. Reserve `supabaseAdmin` for background jobs only. |
| 2 | **Tenant Isolation Flaw** | `WHERE company_id = $1` fails when `$1 = NULL`. User with `company_id = NULL` sees ALL documents from users without companies. | Add explicit NULL checks: `WHERE company_id = $1 AND company_id IS NOT NULL`. Add DB constraint: `ALTER TABLE users ADD CONSTRAINT users_company_id_not_null CHECK (company_id IS NOT NULL);` |
| 3 | **Missing UUID Validation** | All `[id]` route params lack validation. Malformed UUIDs cause 500 errors instead of 400. Potential injection vector. | Import `validateUUID()` from `lib/validators.ts` at start of all `[id]` routes. Return 400 if invalid. |
| 4 | **XSS in /api/user/profile** | Profile name/email returned without sanitization. Stored XSS possible if malicious data entered during registration. | Apply `sanitizeString()` to all text fields in response before returning to client. |
| 5 | **SQL Injection in KB Search** | Knowledge base search uses `ilike` with user input but lacks proper escaping in some code paths. | Verify all `.ilike()` calls use parameterized queries. Add `sanitizeString()` to search terms. |

### P0 — Security Enhancements Required

| # | Enhancement | Rationale | Implementation |
|---|------------|-----------|----------------|
| 6 | **File Upload DoS Protection** | No rate limit on file uploads. Attacker can spam 10MB PDFs. | Apply tighter rate limit to `/api/knowledge-base/upload` (5/hour instead of 30/min). Add file count limit per company (1000 files max). |
| 7 | **increment_kb_usage Ownership Check** | Supabase function `increment_kb_usage` doesn't verify caller owns the company. Can increment other companies' usage. | Add RLS check in function: `IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND company_id = company_id_param) THEN RAISE EXCEPTION 'Unauthorized'; END IF;` |
| 8 | **Audit Logs Table** | No audit trail for document generation, review, KB access. Compliance risk. | Create `audit_logs` table with RLS. Log all document operations with user_id, company_id, action, resource_id, metadata, timestamp. |

### SQL Migration — audit_logs Table

```sql
-- File: supabase/migrations/005_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'document.generate', 'document.review', 'kb.upload', etc.
  resource_type TEXT NOT NULL, -- 'document', 'analysis', 'knowledge_base_item'
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own company's audit logs
CREATE POLICY "Users can view own company audit logs"
  ON audit_logs FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Only service role can insert (via API routes)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

### SQL Fix — increment_kb_usage

```sql
-- File: supabase/migrations/006_fix_increment_kb_usage.sql
CREATE OR REPLACE FUNCTION increment_kb_usage(company_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller owns this company
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND company_id = company_id_param
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User does not belong to this company';
  END IF;

  -- Increment usage
  UPDATE companies
  SET
    kb_documents_used = kb_documents_used + 1,
    updated_at = now()
  WHERE id = company_id_param;
END;
$$;
```

### Acceptance Criteria — Phase A

- [ ] All P0 vulnerabilities remediated and verified with manual testing
- [ ] `audit_logs` table created with RLS policies
- [ ] `increment_kb_usage` function patched with ownership check
- [ ] Build passes with no TypeScript errors
- [ ] Manual security testing confirms fixes (attempt cross-tenant access, XSS payloads, invalid UUIDs)
- [ ] No regression in existing functionality

---

## Phase B: Landing Page Redesign

**Timeline:** Week 1 (parallel with Phase C after Phase A complete)
**Owner:** UI/UX agent

### New Components to Create

| # | File Path | Description |
|---|-----------|-------------|
| 1 | `components/landing/Hero.tsx` | Above-the-fold section with value proposition headline, subheadline, dual CTA (Empieza Gratis + Ver Demo), trust indicators (Colombian law firms, documents generated count) |
| 2 | `components/landing/DemoChatInterface.tsx` | Interactive demo chat component with 4 states (empty, loading, result, error). Tracks usage via localStorage (3 tries per 24h). Shows truncated result with blur gradient + "Regístrate para ver el documento completo" overlay. |
| 3 | `components/landing/FeatureHighlights.tsx` | 3-column grid showcasing core features: document generation, AI review, knowledge base. Each card has icon, title, 2-sentence description. |
| 4 | `components/landing/HowItWorks.tsx` | 3-step process visualization with numbered cards: 1) Elige plantilla, 2) Personaliza con IA, 3) Descarga y usa. Visual flow with arrows. |
| 5 | `components/landing/SocialProof.tsx` | 2-3 testimonial cards (placeholder content) + logos of Colombian legal associations/partners (if available, else generic trust badges). |
| 6 | `components/landing/PricingPreview.tsx` | 2-tier pricing cards (Free vs Pro). Highlights Free tier limits, Pro unlimited with CTA "Próximamente". |
| 7 | `components/landing/Footer.tsx` | Site footer with links to Términos, Privacidad, Contacto. Social media placeholders. Copyright notice. |

### Files to Modify

| # | File Path | Changes |
|---|-----------|---------|
| 1 | `app/(landing)/page.tsx` | Complete redesign. Replace existing content with new component composition: `<Hero />`, `<DemoChatInterface />`, `<FeatureHighlights />`, `<HowItWorks />`, `<SocialProof />`, `<PricingPreview />`, `<Footer />`. Add metadata for SEO. |
| 2 | `app/layout.tsx` | Update global metadata (title, description, OG tags) to match new landing value proposition. Add Spanish lang attribute `<html lang="es">`. |
| 3 | `app/globals.css` | Add landing-specific utility classes for gradient backgrounds, section spacing, hero typography sizing. |
| 4 | `components/ui/button.tsx` | Add new variant `cta` (larger, bolder, with subtle shadow for primary landing CTAs). |
| 5 | `lib/constants.ts` | Add `DEMO_RATE_LIMITS` constant: `{ requestsPerHour: 3, maxResultLength: 300, cooldownHours: 24 }`. |
| 6 | `types/index.ts` | Add `DemoChatMessage` interface, `DemoUsageTracking` interface. |
| 7 | `public/` | Add new assets: hero illustration SVG (legal documents theme), feature icons (3), testimonial avatars (placeholder). |
| 8 | `app/(landing)/terminos/page.tsx` | Ensure Spanish legal terms are complete and up-to-date. |
| 9 | `app/(landing)/privacidad/page.tsx` | Ensure privacy policy reflects demo feature (data not stored, no account creation). |
| 10 | `app/(landing)/layout.tsx` | Add landing-specific layout with transparent header (turns opaque on scroll). Remove dashboard navigation. |
| 11 | `middleware.ts` | Update public routes array to include `/terminos`, `/privacidad`, ensure demo API route `/api/demo/chat` is excluded from auth requirement. |
| 12 | `README.md` | Update project description to mention demo feature. Add environment variable for demo rate limits. |

### Files to Delete

| # | File Path | Reason |
|---|-----------|--------|
| 1 | `app/(landing)/about/page.tsx` | Unused. About content will be integrated into main landing page or removed. |

### ASCII Mockup — Landing Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO] Luuc.ai                    [Inicia Sesión] [Empieza →] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│               🏛️  HERO SECTION                                  │
│                                                                  │
│   Genera documentos legales en minutos,                         │
│   no en horas                                                    │
│                                                                  │
│   IA especializada en derecho colombiano para firmas            │
│   de abogados modernas                                           │
│                                                                  │
│   [Empieza Gratis →]  [Ver Demo ↓]                             │
│                                                                  │
│   ✓ 2,847 documentos generados  ✓ Cumple normativa colombiana  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│          💬  DEMO INTERACTIVO                                   │
│   ┌──────────────────────────────────────────────────────┐     │
│   │  [Prueba sin registrarte - 3 intentos gratis]        │     │
│   │                                                       │     │
│   │  Escribe qué documento necesitas:                    │     │
│   │  ┌────────────────────────────────────────────────┐  │     │
│   │  │ Ej: "Contrato de arrendamiento para oficina"  │  │     │
│   │  └────────────────────────────────────────────────┘  │     │
│   │                                    [Generar →]       │     │
│   │                                                       │     │
│   │  [Estado: empty / loading / result con blur]         │     │
│   └──────────────────────────────────────────────────────┘     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ⚡  CARACTERÍSTICAS PRINCIPALES                               │
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                    │
│  │ 📝      │    │ 🔍      │    │ 📚      │                    │
│  │ Genera  │    │ Revisa  │    │ Base de │                    │
│  │ Docs    │    │ Riesgos │    │ Conoc.  │                    │
│  └─────────┘    └─────────┘    └─────────┘                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  📋  CÓMO FUNCIONA                                              │
│   1️⃣ Elige plantilla → 2️⃣ Personaliza → 3️⃣ Descarga            │
├─────────────────────────────────────────────────────────────────┤
│  💬  TESTIMONIOS                                                │
│   [Placeholder quote cards]                                     │
├─────────────────────────────────────────────────────────────────┤
│  💰  PRECIOS                                                    │
│   [Free tier] vs [Pro - Próximamente]                          │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER: Links | Términos | Privacidad | © 2026 Luuc.ai        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specifications — DemoChatInterface

**File:** `components/landing/DemoChatInterface.tsx`

**States:**

1. **Empty State:**
   - Displays input field with placeholder "Ej: Contrato de arrendamiento para oficina en Bogotá"
   - Shows "Intentos restantes: 3/3" below input
   - "Generar" button enabled
   - No results shown

2. **Loading State:**
   - Input disabled
   - "Generar" button shows spinner, text changes to "Generando..."
   - Skeleton loader appears below input (3 lines pulsing)
   - Prevents double-submission

3. **Result State (Truncated):**
   - Shows first 300 words of generated document in code block or styled text area
   - Bottom 30% has blur gradient overlay
   - Overlay contains: "Regístrate gratis para ver el documento completo y descargar en PDF/DOCX" + [Crear Cuenta →] button
   - "Intentos restantes: 2/3" updates
   - "Generar otro" button appears to reset

4. **Error State:**
   - Shows friendly error message in Spanish (based on error type):
     - Rate limit: "Has alcanzado el límite de 3 intentos. Crea una cuenta gratis para continuar."
     - Network error: "No pudimos conectar con el servidor. Intenta de nuevo."
     - Invalid input: "Por favor describe el documento que necesitas con más detalle."
   - Input remains enabled
   - "Intentar de nuevo" button

**Props:**
```typescript
interface DemoChatInterfaceProps {
  className?: string;
  onSignupClick?: () => void; // Navigates to /register
}
```

**Behavior:**
- On mount, check `localStorage.getItem('luuc_demo_usage')` for usage tracking
- Usage format: `{ attempts: number, lastAttemptAt: ISO8601 timestamp }`
- If 24 hours elapsed since `lastAttemptAt`, reset `attempts` to 0
- On "Generar" click:
  1. Validate input (min 10 chars)
  2. Check attempts < 3
  3. POST to `/api/demo/chat` with `{ prompt: string }`
  4. On success: display truncated result, increment attempts, update localStorage
  5. On 429 error: show rate limit error state
  6. On other error: show generic error state
- "Crear Cuenta" button in blur overlay navigates to `/register` with `?from=demo` query param

**Accessibility:**
- Aria-live region announces state changes
- Focus management: after result loads, focus moves to "Crear Cuenta" button
- Loading state announced to screen readers
- Error messages have role="alert"

### Acceptance Criteria — Phase B

- [ ] All 7 new components created and functional
- [ ] All 12 modified files updated per spec
- [ ] Landing page renders on `/` with new design
- [ ] DemoChatInterface 4 states work correctly with manual testing
- [ ] localStorage tracking persists across page reloads
- [ ] 24-hour cooldown resets attempts correctly
- [ ] Blur overlay appears on truncated results
- [ ] All CTAs navigate to correct routes
- [ ] Mobile responsive (test on 375px, 768px, 1440px widths)
- [ ] Accessibility: keyboard navigable, ARIA labels present, screen reader tested
- [ ] Spanish copy throughout, no English text visible
- [ ] Build passes with no TypeScript errors

---

## Phase C: Demo Chat API

**Timeline:** Week 1 (parallel with Phase B after Phase A complete)
**Owner:** Engineer agent

### API Route Specification

**Endpoint:** `POST /api/demo/chat`
**Auth:** None (public endpoint)
**Rate Limit:** 3 requests per hour per IP + device fingerprint
**Model:** Claude Haiku 3.5 (cost-effective)
**Max Tokens:** 1024 (approximately 300 words)
**Timeout:** 30 seconds

**Request Schema:**
```typescript
{
  prompt: string; // User's document request, min 10 chars, max 500 chars
}
```

**Response Schema (Success):**
```typescript
{
  success: true;
  data: {
    content: string; // Truncated to 300 words
    isTruncated: true; // Always true for demo
    model: "claude-3-5-haiku-20241022";
    tokensUsed: number;
  };
}
```

**Response Schema (Error):**
```typescript
{
  success: false;
  error: string; // Spanish error message
  code: "RATE_LIMIT" | "INVALID_INPUT" | "ABUSE_DETECTED" | "SERVER_ERROR";
}
```

**Implementation Details:**

**File:** `app/api/demo/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkDemoRateLimit } from "@/lib/demo-rate-limit";
import { getCachedDemoResponse, cacheDemoResponse } from "@/lib/demo-cache";
import { sanitizeString, validatePromptInjection } from "@/lib/validators";
import { logDemoUsage } from "@/lib/audit-log";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse request
    const body = await request.json();
    const { prompt } = body;

    // 2. Validate input
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt requerido", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    if (prompt.length < 10 || prompt.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "El prompt debe tener entre 10 y 500 caracteres",
          code: "INVALID_INPUT"
        },
        { status: 400 }
      );
    }

    // 3. Sanitize and check for prompt injection
    const sanitizedPrompt = sanitizeString(prompt);
    if (validatePromptInjection(sanitizedPrompt)) {
      return NextResponse.json(
        {
          success: false,
          error: "Solicitud inválida detectada",
          code: "ABUSE_DETECTED"
        },
        { status: 400 }
      );
    }

    // 4. Rate limiting (IP + fingerprint)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = await checkDemoRateLimit(clientId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Has alcanzado el límite de intentos. Crea una cuenta gratis para continuar.",
          code: "RATE_LIMIT"
        },
        { status: 429 }
      );
    }

    // 5. Check cache (Vercel KV)
    const cacheKey = `demo:${sanitizedPrompt.toLowerCase().trim()}`;
    const cached = await getCachedDemoResponse(cacheKey);

    if (cached) {
      await logDemoUsage({ clientId, prompt: sanitizedPrompt, cached: true });
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }

    // 6. Call Claude API (Haiku)
    const systemPrompt = `Eres un asistente legal especializado en derecho colombiano. Genera un borrador del documento legal solicitado. Usa formato profesional, lenguaje jurídico apropiado, y cumple con las normativas colombianas. Máximo 300 palabras.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: sanitizedPrompt,
        },
      ],
    });

    const content = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // 7. Truncate to 300 words
    const truncatedContent = truncateToWords(content, 300);

    const result = {
      content: truncatedContent,
      isTruncated: true,
      model: "claude-3-5-haiku-20241022",
      tokensUsed: response.usage.output_tokens,
    };

    // 8. Cache result (24h TTL)
    await cacheDemoResponse(cacheKey, result);

    // 9. Log usage
    await logDemoUsage({
      clientId,
      prompt: sanitizedPrompt,
      cached: false,
      tokensUsed: response.usage.output_tokens,
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error("[DEMO API ERROR]", error);

    // Log error for monitoring
    await logDemoUsage({
      clientId: "unknown",
      prompt: "error",
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el documento. Intenta de nuevo.",
        code: "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Combine IP + User-Agent hash for basic fingerprinting
  const ip = request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip") ||
              "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const hash = simpleHash(`${ip}:${userAgent}`);
  return hash;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}
```

### Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Landing)  │
└──────┬──────┘
       │ POST /api/demo/chat { prompt }
       ▼
┌──────────────────────────────────────┐
│  Demo API Route                      │
│  (/app/api/demo/chat/route.ts)      │
├──────────────────────────────────────┤
│  1. Validate input (10-500 chars)    │
│  2. Sanitize & check injection       │
│  3. Rate limit (IP+UA fingerprint)   │◄──── Vercel KV (rate limit store)
│  4. Check cache                      │◄──── Vercel KV (response cache)
│  5. If cache miss → Claude API       │──┐
│  6. Truncate to 300 words            │  │
│  7. Cache result (24h TTL)           │  │
│  8. Log usage → audit_logs table     │  │
│  9. Return truncated result          │  │
└───────────┬──────────────────────────┘  │
            │                              │
            ▼                              ▼
    ┌──────────────┐            ┌───────────────────┐
    │   Browser    │            │  Anthropic API    │
    │ (Shows blur  │            │  (Haiku 3.5)      │
    │  overlay)    │            │  Max 1024 tokens  │
    └──────────────┘            └───────────────────┘
```

### Supporting Libraries

**File:** `lib/demo-rate-limit.ts`

```typescript
import { kv } from "@vercel/kv";

const DEMO_RATE_LIMIT = {
  maxAttempts: 3,
  windowHours: 1,
};

export async function checkDemoRateLimit(clientId: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `demo_rate_limit:${clientId}`;
  const now = Date.now();
  const windowMs = DEMO_RATE_LIMIT.windowHours * 60 * 60 * 1000;

  // Get current attempts with timestamps
  const attempts: number[] = await kv.get(key) || [];

  // Filter attempts within window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

  if (recentAttempts.length >= DEMO_RATE_LIMIT.maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  // Record this attempt
  recentAttempts.push(now);
  await kv.set(key, recentAttempts, { ex: Math.ceil(windowMs / 1000) });

  return {
    allowed: true,
    remaining: DEMO_RATE_LIMIT.maxAttempts - recentAttempts.length
  };
}
```

**File:** `lib/demo-cache.ts`

```typescript
import { kv } from "@vercel/kv";

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export async function getCachedDemoResponse(cacheKey: string): Promise<any | null> {
  try {
    const cached = await kv.get(cacheKey);
    return cached || null;
  } catch (error) {
    console.error("[CACHE GET ERROR]", error);
    return null; // Fail open
  }
}

export async function cacheDemoResponse(cacheKey: string, data: any): Promise<void> {
  try {
    await kv.set(cacheKey, data, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error("[CACHE SET ERROR]", error);
    // Don't throw, caching is non-critical
  }
}
```

### Acceptance Criteria — Phase C

- [ ] `/api/demo/chat` endpoint created and functional
- [ ] Accepts POST with valid JSON body
- [ ] Returns 400 for invalid input (too short, too long, missing)
- [ ] Returns 429 after 3 requests from same client within 1 hour
- [ ] Calls Claude Haiku API with correct parameters
- [ ] Truncates response to 300 words
- [ ] Caches responses in Vercel KV with 24h TTL
- [ ] Cache hit returns cached response (verify with duplicate requests)
- [ ] Rate limiting works across page reloads (verify with 4th attempt)
- [ ] Audit logs record demo usage in `audit_logs` table
- [ ] Build passes with no TypeScript errors
- [ ] Manual API testing with Postman/curl confirms all scenarios

---

## Phase D: Architecture Decision Records & Strategy

**Owner:** Architecture Advisor agent

### ADR-001: Demo Deployment Strategy

**Decision:** Integrate demo into main Next.js app at `/` route, not as separate micro-frontend.

**Rationale:**
- Simpler deployment (single Vercel project)
- Shared component library (shadcn/ui, Tailwind config)
- Easier to convert demo users to registered users (same session context)
- Lower operational complexity (no CORS, single domain, unified monitoring)

**Consequences:**
- Demo API shares rate limits with production API (mitigated by separate Vercel KV namespace)
- Demo must not impact production performance (mitigated by caching)
- SEO benefits: landing page same origin as app

**Alternatives Considered:**
- Separate micro-frontend: Rejected due to complexity, no clear benefit at current scale

### ADR-002: Model Selection for Demo (Haiku vs Sonnet)

**Decision:** Use Claude Haiku 3.5 for demo endpoint, not Sonnet 4.5.

**Cost Comparison (1,000 requests/day for 30 days):**

| Model | Input Cost | Output Cost | Monthly Cost (No Cache) | Monthly Cost (80% Cache Hit) |
|-------|-----------|-------------|------------------------|------------------------------|
| Sonnet 4.5 | $3/MTok | $15/MTok | $855/month | $171/month |
| Haiku 3.5 | $0.25/MTok | $1.25/MTok | $71.25/month | $17/month |

**Assumptions:**
- 100 input tokens/request (prompt)
- 1024 output tokens/request (max_tokens)
- 80% cache hit rate (Vercel KV)
- 1,000 unique demo requests/day

**Rationale:**
- **12x cheaper** at no-cache baseline
- **10x cheaper** with caching
- Haiku quality sufficient for demo (300-word snippets)
- Sonnet overkill for truncated previews
- Demo is top-of-funnel, not revenue-generating

**Consequences:**
- Slightly lower output quality (acceptable for demo)
- Faster response times (Haiku lower latency)
- Cost ceiling of ~$20/month with caching and 1000 requests/day

**When to Revisit:**
- If demo conversion rate > 10%, consider A/B test with Sonnet
- If user feedback indicates quality issues

### ADR-003: Caching Strategy (Vercel KV)

**Decision:** Cache demo responses in Vercel KV with 24-hour TTL.

**Expected Cache Hit Rate:** 60-80% (similar prompts from different users)

**Cost Analysis (Vercel KV):**
- Free tier: 30,000 commands/month, 256 MB storage
- At 1,000 requests/day:
  - 30,000 requests/month
  - ~200 unique prompts cached
  - Cache storage: ~2 MB (well within free tier)
- **Cost: $0/month** (free tier sufficient)

**Rationale:**
- Dramatic cost reduction (60-80% fewer Claude API calls)
- Improved latency (cached responses < 50ms vs 2-4s API calls)
- Vercel KV is serverless, auto-scales, zero config
- TTL prevents stale responses (legal content may change)

**Cache Key Strategy:**
```typescript
cacheKey = `demo:${sanitizedPrompt.toLowerCase().trim()}`
```
- Lowercase + trim normalizes similar prompts
- "contrato de arrendamiento" = "Contrato de Arrendamiento" (same cache entry)

**Cache Invalidation:**
- Automatic via TTL (24 hours)
- Manual flush via Vercel dashboard if needed

**Consequences:**
- Adds Vercel KV dependency (acceptable, Vercel-native)
- Shared responses across users (privacy: no PII in demo prompts)
- Slightly outdated responses possible (acceptable for demo)

### ADR-004: Abuse Prevention Strategy (Multi-Layer Defense)

**Threat Model:**
1. **Cost Attack:** Malicious user spams endpoint to inflate Claude API costs
2. **Resource Exhaustion:** DDoS-style requests overwhelm server
3. **Content Farming:** Competitor scrapes generated content at scale
4. **Inappropriate Content:** User requests offensive/illegal documents

**Defense Layers:**

| Layer | Mechanism | Cost If Bypassed | Effectiveness |
|-------|-----------|------------------|---------------|
| 1. Client-side localStorage | 3 attempts, 24h cooldown | $0 (only stops honest users) | Low (easily bypassed) |
| 2. IP-based rate limiting | 3 req/hour via Vercel KV | ~$2/day (IP rotation expensive) | Medium |
| 3. Fingerprint (IP+UA) | Hash-based deduplication | ~$5/day (requires sophisticated bypass) | High |
| 4. Caching | Deduplicate identical prompts | ~$1/day (if all cached) | Very High |
| 5. Cost ceiling alarm | Alert at $5/day spend | $5/day (fail-safe) | Absolute |
| 6. Input validation | Reject prompts < 10 chars, > 500 chars | $0 | Medium |
| 7. Prompt injection detection | `validatePromptInjection()` from validators.ts | $0 | Medium |

**Cost Ceiling Implementation:**

**File:** `lib/cost-monitor.ts`

```typescript
import { kv } from "@vercel/kv";

const DAILY_COST_CEILING = 5.00; // USD
const HAIKU_OUTPUT_COST_PER_TOKEN = 0.00000125; // $1.25/MTok

export async function checkCostCeiling(tokensUsed: number): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const key = `demo_cost:${today}`;

  const currentSpend: number = await kv.get(key) || 0;
  const requestCost = tokensUsed * HAIKU_OUTPUT_COST_PER_TOKEN;
  const projectedSpend = currentSpend + requestCost;

  if (projectedSpend > DAILY_COST_CEILING) {
    console.error(`[COST CEILING EXCEEDED] Current: $${currentSpend.toFixed(2)}, Projected: $${projectedSpend.toFixed(2)}`);
    // Send alert to founder (email/Slack)
    return false; // Block request
  }

  // Update spend tracker (expires at end of day UTC)
  const secondsUntilMidnight = getSecondsUntilMidnightUTC();
  await kv.set(key, projectedSpend, { ex: secondsUntilMidnight });

  return true; // Allow request
}

function getSecondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}
```

**Monitoring & Alerts:**
- Vercel Analytics tracks API latency, error rates
- Daily spend logged to `audit_logs` table
- Founder receives email if cost ceiling hit (integrate with Resend)

**Escalation Path:**
1. Cost ceiling hit → Disable demo endpoint temporarily
2. Return 503 error: "Demo temporalmente no disponible. Crea una cuenta gratis para continuar."
3. Founder investigates `audit_logs` for abuse patterns
4. Re-enable after mitigation (IP ban, tighter rate limits)

### ADR-005: Demo Content Truncation Strategy

**Decision:** Truncate all demo responses to 300 words (approximately 1024 tokens) with blur overlay.

**Rationale:**
- Balances demonstration value vs. conversion incentive
- 300 words sufficient to show quality (full intro + first clauses)
- Blur gradient creates visual "unlock" moment
- Prevents demo from cannibalizing paid product

**User Research Insight (from Product Team):**
- Users need to see structure + tone to trust the AI
- Full documents reduce registration motivation
- 300 words is "enough to evaluate, not enough to use"

**Implementation:**
- Backend truncates in API route (server-side, can't be bypassed)
- Frontend applies blur gradient CSS (visual reinforcement)
- "Ver documento completo" CTA positioned at truncation point

---

## Phase E: Code Quality & Refactoring

**Timeline:** Week 2
**Owner:** Engineer agent

### Dead Code to Delete (~350 lines)

| # | Location | Lines | Description | Why Delete |
|---|----------|-------|-------------|-----------|
| 1 | `app/api/documents/route.ts` | ~40 | Duplicate DELETE handler (lines 120-160) | Already handled in `/api/documents/[id]/route.ts` DELETE method. This is unreachable code. |
| 2 | `app/api/documents/[id]/route.ts` | ~35 | Duplicate POST handler (lines 80-115) | Documents created via `/api/generate`, not direct POST. Unused endpoint. |
| 3 | `lib/auth.ts` | ~50 | `getUserWithCompany()` function | Never imported anywhere. `getCurrentUser()` used instead. |
| 4 | `lib/templates.ts` | ~30 | `validateTemplateVariables()` function | Template validation moved to validators.ts. This is old implementation. |
| 5 | `components/DocumentCard.tsx` | ~25 | `formatFileSize()` helper | Utility duplicated in lib/utils.ts. Import from utils instead. |
| 6 | `app/dashboard/documentos/page.tsx` | ~40 | Commented-out pagination code (lines 85-125) | Old infinite scroll implementation, never completed. Remove. |
| 7 | `lib/company.ts` | ~30 | `getCompanySettings()` function | Settings fetched via `/api/company/[id]` endpoint. Function unused. |
| 8 | `types/index.ts` | ~20 | `TemplateVariable` interface | Old template system. Current templates use string substitution. |
| 9 | `hooks/useDocument.ts` | ~40 | Entire file | Hook never imported. Document fetching done server-side. |
| 10 | `app/api/test-claude/route.ts` | ~40 | Entire file | Debug endpoint. Should not exist in production code. |

**Total:** ~350 lines

### Duplicate Handlers to Consolidate

**Issue 1: Auth Validation Duplication (16 routes, ~200 lines)**

**Current State:** Every API route has this block:
```typescript
const user = await getCurrentUser();
if (!user) {
  return NextResponse.json(
    { success: false, error: "No autenticado" },
    { status: 401 }
  );
}
```

**Fix:** Create middleware wrapper in `lib/api-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export function withAuth(
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}
```

**Usage in route:**
```typescript
import { withAuth } from "@/lib/api-middleware";

export const POST = withAuth(async (request, user) => {
  // user is guaranteed to exist
  // business logic here
});
```

**Impact:** Eliminates ~200 lines of duplicate auth checks across 16 routes.

---

**Issue 2: Company ID Resolution Duplication (8 routes, ~80 lines)**

**Current State:** Many routes have:
```typescript
const companyId = user.user_metadata?.company_id;
if (!companyId) {
  return NextResponse.json(
    { success: false, error: "Empresa no encontrada" },
    { status: 400 }
  );
}
```

**Fix:** Extend `withAuth` middleware:

```typescript
export function withCompany(
  handler: (request: NextRequest, user: User, companyId: string) => Promise<NextResponse>
) {
  return withAuth(async (request, user) => {
    const companyId = user.user_metadata?.company_id;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Empresa no encontrada" },
        { status: 400 }
      );
    }

    return handler(request, user, companyId);
  });
}
```

**Impact:** Eliminates ~80 lines across 8 company-scoped routes.

### Missing Validations to Add

| # | Route | Missing Validation | Fix |
|---|-------|-------------------|-----|
| 1 | `/api/company/setup` | No validation on company name (accepts empty string) | Add `if (!name || name.trim().length < 2)` check at start |
| 2 | `/api/company/documents` | No file type validation before upload | Import `validateFileType()` from validators.ts, check before processing |
| 3 | `/api/user/profile` | Email update doesn't validate format | Import `z.string().email()` from zod, validate before Supabase update |

### Error Messages to Translate

**File:** `app/api/review/route.ts`

**Lines 98-104** — English error messages returned to user:

```typescript
// BEFORE (English)
return NextResponse.json(
  { success: false, error: "Failed to parse Claude response" },
  { status: 500 }
);

// AFTER (Spanish)
return NextResponse.json(
  { success: false, error: "No se pudo procesar la respuesta del análisis" },
  { status: 500 }
);
```

**Other instances:**
- Line 112: "Invalid file format" → "Formato de archivo inválido"
- Line 125: "File too large" → "Archivo demasiado grande"
- Line 138: "Analysis failed" → "El análisis falló. Intenta de nuevo"

### Acceptance Criteria — Phase D

- [ ] All 10 dead code locations deleted, verified with grep no imports remain
- [ ] `withAuth()` and `withCompany()` middleware created in `lib/api-middleware.ts`
- [ ] All 16 API routes refactored to use `withAuth()` or `withCompany()`
- [ ] All 8 company-scoped routes use `withCompany()` (verify `companyId` param passed)
- [ ] 3 missing validations added to specified routes
- [ ] All error messages in `/api/review` translated to Spanish
- [ ] Build passes with no TypeScript errors
- [ ] Manual API testing confirms no regression (all endpoints still work)
- [ ] Codebase reduced by ~350 lines (verify with `cloc` before/after)

---

## Phase F: UX Redundancies & Fixes

**Timeline:** Week 2
**Owner:** UI/UX agent

### UX Issue 1: Merge /redactar + /redactar/personalizado

**Current State:**
- `/dashboard/redactar` shows template grid
- `/dashboard/redactar/personalizado` shows custom document form
- Users confused which to use
- "Personalizado" suggests customization, not "from scratch"

**Fix:**
- **Delete** `/dashboard/redactar/personalizado/page.tsx`
- **Modify** `/dashboard/redactar/page.tsx`:
  - Add button at top: "Crear Documento Personalizado" (opens dialog)
  - Dialog contains custom document form (prompt, variables, focus areas)
  - Template grid remains below
- **Update** sidebar navigation: Remove "Personalizado" link

**User Flow After:**
1. Click "Redactar" in sidebar → Goes to template grid page
2. See two options: "Plantillas Predefinidas" (grid) OR "Documento Personalizado" (button at top)
3. Click "Documento Personalizado" → Dialog opens with custom form
4. Submit → Same `/api/generate` endpoint, same result page

**Rationale:**
- Single entry point reduces cognitive load
- Dialog pattern signals "alternative path" vs. "different feature"
- Aligns with "Progressive Disclosure" design principle

### UX Issue 2: Rename "Knowledge Base" → "Base de Conocimiento"

**Current State:**
- Sidebar: "Knowledge Base" (English)
- Settings page: "Documentos" (confusing, sounds like generated docs)

**Fix:**
- **Sidebar:** Change link text to "Base de Conocimiento"
- **Page title:** Change `<h1>` in `/dashboard/knowledge-base/page.tsx` to "Base de Conocimiento"
- **Settings tab:** Change "Documentos" to "Base de Conocimiento" in `/dashboard/configuracion/page.tsx`

**Rationale:**
- Spanish-first product (English breaks immersion)
- "Base de Conocimiento" immediately understood by lawyers
- Consistent terminology across app

### UX Issue 3: Merge "Configuración Documentos" → KB Settings Redirect

**Current State:**
- Settings has "Documentos" tab with file type preferences
- Knowledge Base page has identical upload settings
- Duplication confuses users ("where do I configure uploads?")

**Fix:**
- **Delete** "Documentos" tab content from `/dashboard/configuracion/page.tsx`
- **Redirect:** "Documentos" tab now shows: "Configura tu base de conocimiento desde la [página principal](link to KB)"
- **Consolidate:** All upload settings (file types, categories, retention) in KB page sidebar or dedicated Settings section on KB page

**Rationale:**
- Settings for a feature should live with the feature
- Reduces navigation depth (no tab-hopping)
- Aligns with "Clarity over cleverness" principle

### UX Issue 4: Add Breadcrumbs to All Sub-Pages

**Current State:**
- Deep pages like `/dashboard/documentos/[id]` lack breadcrumbs
- Users click back button repeatedly (poor UX)

**Fix:**
- **Create** `components/Breadcrumbs.tsx` component
- **Add** to layout of all depth > 1 pages:
  - `/dashboard/documentos/[id]` → Dashboard / Documentos / [Document Name]
  - `/dashboard/configuracion/[tab]` → Dashboard / Configuración / [Tab Name]
  - `/dashboard/knowledge-base/[id]` → Dashboard / Base de Conocimiento / [Document Name]

**Implementation:**
```typescript
// components/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-center">
            {i > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**Rationale:**
- Reduces navigation friction
- Provides context ("where am I?")
- Standard UX pattern for SaaS apps

### Acceptance Criteria — Phase E

- [ ] `/redactar/personalizado` route deleted
- [ ] Custom document form moved to dialog in `/redactar` page
- [ ] Dialog opens/closes correctly, form submits to `/api/generate`
- [ ] Sidebar navigation updated (no "Personalizado" link)
- [ ] All "Knowledge Base" text changed to "Base de Conocimiento" (sidebar, page titles, settings)
- [ ] "Configuración Documentos" tab redirects to KB page with message
- [ ] Breadcrumbs component created and added to 3+ deep pages
- [ ] Manual testing: navigate through app, verify breadcrumbs accurate
- [ ] Build passes with no TypeScript errors

---

## Phase G: Accessibility Fixes

**Timeline:** Week 2 (parallel with Phase E)
**Owner:** UI/UX agent

### Accessibility Issues Identified

| # | Issue | Location | WCAG Criterion | Fix |
|---|-------|----------|----------------|-----|
| 1 | Icon-only buttons lack ARIA labels | `components/DocumentCard.tsx` (edit, delete buttons) | 4.1.2 Name, Role, Value | Add `aria-label="Editar documento"` and `aria-label="Eliminar documento"` |
| 2 | Insufficient color contrast | `components/ui/badge.tsx` (secondary variant) | 1.4.3 Contrast (Minimum) | Change bg color from `gray-100` to `gray-200`, text from `gray-700` to `gray-900` |
| 3 | Missing focus rings | `components/KnowledgeBaseCard.tsx` (card click area) | 2.4.7 Focus Visible | Add `focus-visible:ring-2 focus-visible:ring-primary` to Card component |
| 4 | Form fields missing required indicators | `app/dashboard/redactar/page.tsx` (all forms) | 3.3.2 Labels or Instructions | Add red asterisk `*` to required field labels, add `aria-required="true"` to inputs |
| 5 | Modal dialogs lack focus trap | `components/ui/dialog.tsx` | 2.4.3 Focus Order | Radix UI Dialog auto-traps focus, verify enabled (should be default) |
| 6 | Error messages not announced | `app/dashboard/revisar/page.tsx` | 4.1.3 Status Messages | Wrap error toast in `<div role="alert" aria-live="assertive">` |
| 7 | Loading spinners lack text alternative | All pages with skeleton loaders | 1.1.1 Non-text Content | Add `<span className="sr-only">Cargando...</span>` inside Skeleton component |

### Keyboard Navigation Checklist

- [ ] Tab order follows visual layout on all pages
- [ ] All interactive elements reachable via keyboard
- [ ] Esc key closes dialogs and dropdowns
- [ ] Enter key submits forms
- [ ] Arrow keys navigate dropdown menus
- [ ] Focus visible on all interactive elements (test with Tab key)

### Screen Reader Testing

**Tool:** MacOS VoiceOver (Cmd+F5)

**Test Scenarios:**
1. Navigate landing page, verify all CTAs announced correctly
2. Fill out document generation form, verify field labels read
3. Trigger error, verify error message announced
4. Open dropdown menu, verify options announced
5. Upload file to KB, verify upload progress announced

### Acceptance Criteria — Phase F

- [ ] All 7 accessibility issues fixed per table above
- [ ] ARIA labels added to all icon-only buttons
- [ ] Color contrast meets WCAG AA (4.5:1 minimum) — verified with browser DevTools
- [ ] Focus rings visible on all interactive elements
- [ ] Required form fields marked with `*` and `aria-required="true"`
- [ ] Error messages have `role="alert"`
- [ ] Loading states announced to screen readers
- [ ] Keyboard navigation tested on 5 key pages (landing, redactar, revisar, KB, settings)
- [ ] VoiceOver testing completed for 5 scenarios above
- [ ] Build passes with no TypeScript errors

---

## Database Changes

### New Table: audit_logs

**Purpose:** Track all user actions for security, compliance, and debugging.

**Schema:** See Phase A, SQL Migration 005

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK to users, nullable for demo usage)
- `company_id` (UUID, FK to companies, nullable for demo)
- `action` (TEXT, e.g., 'document.generate', 'demo.chat')
- `resource_type` (TEXT, e.g., 'document', 'demo_response')
- `resource_id` (UUID, nullable)
- `metadata` (JSONB, flexible for additional context)
- `ip_address` (INET)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `user_id` (for user activity reports)
- `company_id` (for company audit logs)
- `created_at DESC` (for recent activity queries)
- `action` (for filtering by action type)

**RLS Policies:**
- SELECT: Users can view logs for their own company
- INSERT: Only service role (API routes log via `supabaseAdmin`)

### Modified Function: increment_kb_usage

**Purpose:** Prevent unauthorized usage increments.

**Change:** Add ownership check before updating company usage counter.

**SQL:** See Phase A, SQL Migration 006

---

## Environment Variables Required

### New Variables

| Variable | Purpose | Example Value | Required For |
|----------|---------|---------------|--------------|
| `KV_URL` | Vercel KV connection string | `redis://...` | Demo rate limiting, caching |
| `KV_REST_API_URL` | Vercel KV REST API endpoint | `https://...` | Demo rate limiting, caching |
| `KV_REST_API_TOKEN` | Vercel KV auth token | `AbCd1234...` | Demo rate limiting, caching |
| `DEMO_COST_CEILING` | Daily cost limit for demo (USD) | `5.00` | Cost monitoring |
| `DEMO_ALERT_EMAIL` | Email for cost ceiling alerts | `founder@luuc.ai` | Cost monitoring |

### Existing Variables (Reminder)

| Variable | Current Status | Action Required |
|----------|---------------|-----------------|
| `ANTHROPIC_API_KEY` | Empty in `.env.local` | Founder must add API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Set | Rotate key (security best practice) |
| `NEXT_PUBLIC_SUPABASE_URL` | Set | No action |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set | No action |

### Setup Instructions

1. Create Vercel KV database in Vercel dashboard
2. Copy connection credentials to `.env.local`
3. Add to Vercel project environment variables (Production + Preview)
4. Test locally with `npm run dev`, verify cache hit in logs

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Demo abuse spikes costs** | Medium | High ($100+ unexpected charges) | Multi-layer rate limiting, cost ceiling with auto-shutoff, Vercel KV caching reduces 80% of API calls |
| **Cache poisoning with inappropriate content** | Low | Medium (brand damage) | Prompt injection detection, manual review of cached responses (first 100), TTL forces refresh every 24h |
| **Vercel KV downtime breaks demo** | Low | Low (demo non-critical) | Fail open: if KV unavailable, skip cache, continue to API (logged for monitoring) |
| **Haiku quality insufficient for conversion** | Medium | Medium (low demo-to-signup rate) | A/B test planned for Week 3, easy to swap model in single API route |
| **Security fixes introduce regressions** | Medium | High (production downtime) | Comprehensive manual testing, staging deployment first, rollback plan documented |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Users don't understand demo is limited** | High | Medium (confused users, support burden) | Clear messaging: "3 intentos gratis", blur overlay with explicit CTA, localStorage counter visible |
| **Demo cannibalizes free tier signups** | Low | Low (demo limited to 300 words) | 300-word truncation prevents utility, blur overlay forces action for full doc |
| **UX consolidation confuses existing users** | Medium | Low (temporary confusion) | Add changelog announcement in dashboard, update onboarding tooltips |

### Security Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Cross-tenant data leak from RLS fixes** | Low | Critical (GDPR violation) | Comprehensive testing with 2 test companies, attempt to access other company's data, verify 403 errors |
| **XSS from unsanitized profile fields** | Medium | High (account takeover) | `sanitizeString()` applied to all user inputs before storage AND display, CSP headers block inline scripts |
| **New demo endpoint becomes attack vector** | Medium | Medium (DDoS, abuse) | Rate limiting, input validation, cost ceiling, monitoring, can disable endpoint instantly via feature flag |

---

## Architecture Decision Records Summary

### ADR-001: Integrated Demo Strategy

**Decision:** Build demo into main Next.js app at `/` route, not as separate service.

**Why:** Simpler deployment, shared components, easier conversion funnel, lower operational complexity.

**Trade-off:** Demo shares infrastructure with production, mitigated by separate KV namespace and caching.

### ADR-002: Haiku Over Sonnet for Demo

**Decision:** Use Claude Haiku 3.5 for demo endpoint (12x cheaper than Sonnet).

**Why:** $17/month vs $171/month at 1,000 uses/day with caching. Quality sufficient for 300-word previews.

**When to Revisit:** If conversion rate > 10% or quality complaints.

### ADR-003: Vercel KV Caching

**Decision:** Cache demo responses in Vercel KV with 24h TTL.

**Why:** 60-80% cost reduction, faster responses, free tier sufficient for expected load.

**Trade-off:** Shared responses across users (acceptable, no PII in demo).

### ADR-004: Multi-Layer Abuse Prevention

**Decision:** Implement 7 defense layers (localStorage, IP rate limit, fingerprinting, caching, cost ceiling, input validation, prompt injection detection).

**Why:** Single layer insufficient for public endpoint. Defense in depth prevents $100+ surprise bills.

**Monitoring:** Daily spend tracked, founder alerted at $5/day threshold.

---

## Implementation Timeline

### Week 1: Security + Demo Launch (Phase A + B + C)

**Days 1-2: Phase A — Security Mitigations (BLOCKER)**
- Create `audit_logs` table migration
- Fix `increment_kb_usage` function
- Replace `supabaseAdmin` with user-scoped client in user-facing routes
- Add NULL checks to company_id queries
- Add UUID validation to all `[id]` routes
- Add XSS sanitization to `/api/user/profile`
- Add SQL injection protection to KB search
- Apply tighter rate limits to file upload
- Manual security testing (attempt exploits, verify fixes)
- Deploy security fixes to staging
- Founder review + approval

**Days 3-5: Phase B + C — Landing Redesign + Demo API (PARALLEL)**

**UI Track (Phase B):**
- Create 7 new landing components (Hero, DemoChatInterface, Features, etc.)
- Modify 12 files (landing page, layout, globals.css, etc.)
- Delete `/about` page
- Implement DemoChatInterface 4 states with localStorage tracking
- Add blur overlay to truncated results
- Mobile responsive testing (375px, 768px, 1440px)
- Accessibility testing (ARIA labels, keyboard nav, VoiceOver)

**API Track (Phase C):**
- Create `/api/demo/chat` route
- Implement `lib/demo-rate-limit.ts` with Vercel KV
- Implement `lib/demo-cache.ts` with Vercel KV
- Implement `lib/cost-monitor.ts` with daily ceiling
- Add audit logging for demo usage
- Set up Vercel KV database (via dashboard)
- Configure environment variables (KV credentials, cost ceiling)
- Manual API testing (Postman, curl)
- Test rate limiting (attempt 4th request, verify 429)
- Test caching (duplicate request, verify cache hit in logs)

**Day 5: Integration Testing**
- End-to-end demo flow: landing page → type prompt → see result → hit rate limit → CTA to register
- Verify localStorage persists across reloads
- Verify blur overlay appears
- Verify 300-word truncation
- Verify cache hit rate (send 10 requests, 5 duplicates, expect ~50% cache hit)
- Verify audit logs populated

**Day 5 EOD: Deploy to Production**
- Merge security fixes PR (requires founder approval)
- Merge landing redesign + demo API PR (requires founder approval)
- Deploy to Vercel production
- Monitor logs for errors, cost tracking for unexpected spikes
- Smoke test production URL

---

### Week 2: Hardening (Phase D + E + F)

**Days 6-7: Phase D — Code Quality**
- Delete ~350 lines of dead code (10 locations)
- Create `withAuth()` and `withCompany()` middleware
- Refactor 16 API routes to use middleware
- Add 3 missing validations
- Translate error messages to Spanish
- Manual API testing (verify no regression)
- Measure LOC reduction with `cloc`

**Days 8-9: Phase E — UX Improvements**
- Merge `/redactar` + `/redactar/personalizado` (dialog pattern)
- Rename "Knowledge Base" → "Base de Conocimiento" (3 locations)
- Merge "Configuración Documentos" into KB page
- Create Breadcrumbs component
- Add breadcrumbs to 3+ deep pages
- Manual navigation testing

**Day 10: Phase F — Accessibility**
- Fix 7 accessibility issues (ARIA labels, contrast, focus rings, etc.)
- Keyboard navigation testing (5 pages)
- VoiceOver testing (5 scenarios)
- Contrast verification with DevTools

**Day 10 EOD: Deploy Hardening Updates**
- Merge code quality PR
- Merge UX improvements PR
- Merge accessibility fixes PR
- Deploy to production
- Announce changes in dashboard (optional changelog banner)

---

## Open Questions for Product Team

### 1. Demo Conversion Target

**Question:** What conversion rate (demo → signup) makes this feature successful?

**Context:** Industry benchmarks for SaaS demos: 5-15%. Legal tech may be lower (10-day sales cycles).

**Impact on Decisions:**
- If target < 5%: Haiku sufficient
- If target > 10%: May need Sonnet A/B test, more generous truncation (500 words)

**Recommendation:** Set KPI at 8% (demo users who sign up within 7 days). Track in Vercel Analytics.

---

### 2. Free Tier Limits Post-Demo

**Question:** Should users who exhaust demo (3 attempts) get bonus free tier credits if they sign up immediately?

**Context:** Incentivizes conversion ("Sign up now, get 5 extra documents free this month").

**Impact:** Requires UI for promo code redemption, usage tracking adjustment.

**Recommendation:** YES — Add "DEMO2024" promo code, grants +5 documents to Free tier for first month. Low cost, high conversion incentive.

---

### 3. Demo Content Monitoring

**Question:** Who reviews cached demo responses for quality/appropriateness?

**Context:** First 100 cached responses will establish baseline quality. Some may be low-quality or inappropriate.

**Impact:** Manual review labor (2-3 hours), potential need to flush cache and adjust prompts.

**Recommendation:** Founder reviews first 50 cached responses in Week 2. Create blocklist of inappropriate prompts if needed.

---

### 4. Cost Ceiling Action Plan

**Question:** If demo hits $5/day cost ceiling, what's the protocol?

**Options:**
1. Auto-disable demo, show "Temporalmente no disponible" message
2. Switch to even cheaper model (Haiku → Haiku Lite)
3. Accept cost and investigate after 24h

**Recommendation:** Option 1 (auto-disable). Send Slack alert to founder. Re-enable manually after investigation.

---

### 5. Testimonials & Social Proof

**Question:** Do we have real testimonials from beta users for landing page?

**Context:** `SocialProof.tsx` component currently uses placeholder quotes.

**Impact:** Fake testimonials harm trust. Empty state also weak.

**Recommendation:** If no real testimonials yet, replace with:
- "Trusted by 12 Colombian law firms" (if true)
- Colombian legal association logos (if partnerships exist)
- Or remove section entirely until real quotes available

---

## 🔴 FOUNDER APPROVAL REQUIRED

**This sprint plan may not proceed to implementation until the founder approves the following:**

### Critical Approvals

- [ ] **Phase A Security Mitigations Scope**
  Confirms P0 vulnerabilities (RLS bypass, tenant isolation, XSS, SQL injection) are acceptable to fix now, and acknowledges potential for regression requiring rollback plan.

- [ ] **Landing Page Layout and Demo UX**
  Approves ASCII mockup, DemoChatInterface 4-state design, 300-word truncation strategy, and blur overlay approach.

- [ ] **Haiku Model for Demo (vs Sonnet)**
  Accepts 12x cost savings with potential quality trade-off. Acknowledges A/B test may be needed if conversion < 8%.

- [ ] **Vercel KV Caching Strategy**
  Approves shared cached responses across users, 24h TTL, and reliance on Vercel KV free tier.

- [ ] **Cost Ceiling ($5/day, $150/month max)**
  Agrees to auto-disable demo if cost ceiling hit, and manual re-enable after investigation.

- [ ] **UX Merges**
  Approves consolidation of `/redactar` flows, "Knowledge Base" → "Base de Conocimiento" rename, and Settings tab redirect.

- [ ] **Dead Code Deletion Scope**
  Confirms ~350 lines of identified dead code are safe to delete (no hidden dependencies, no "maybe we'll need this later").

### Optional Approvals (Can Defer)

- [ ] Demo promo code ("DEMO2024" for +5 free docs)
- [ ] Testimonials strategy (placeholder vs. remove section)
- [ ] Staging environment deployment before production (recommended, not required)

---

**Approval Signature:**

**Approved by:** _________________________________ (Founder)

**Date:** _________________

**Special Instructions / Modifications:**

_________________________________________________________________________

_________________________________________________________________________

_________________________________________________________________________

---

## Appendix A: Cost Projection Tables

### Demo Cost Analysis (30 Days, 1,000 Requests/Day)

**Scenario 1: Sonnet 4.5, No Caching**
| Component | Unit Cost | Usage | Monthly Cost |
|-----------|-----------|-------|--------------|
| Input tokens (100/req) | $3.00/MTok | 3M tokens | $9 |
| Output tokens (1024/req) | $15.00/MTok | 30.72M tokens | $461 |
| Vercel KV | Free tier | 30K commands | $0 |
| **Total** | | | **$470** |

**Scenario 2: Sonnet 4.5, 80% Cache Hit**
| Component | Unit Cost | Usage | Monthly Cost |
|-----------|-----------|-------|--------------|
| Input tokens (100/req) | $3.00/MTok | 600K tokens (20% miss) | $1.80 |
| Output tokens (1024/req) | $15.00/MTok | 6.14M tokens (20% miss) | $92 |
| Vercel KV | Free tier | 30K commands | $0 |
| **Total** | | | **$94** |

**Scenario 3: Haiku 3.5, No Caching**
| Component | Unit Cost | Usage | Monthly Cost |
|-----------|-----------|-------|--------------|
| Input tokens (100/req) | $0.25/MTok | 3M tokens | $0.75 |
| Output tokens (1024/req) | $1.25/MTok | 30.72M tokens | $38.40 |
| Vercel KV | Free tier | 30K commands | $0 |
| **Total** | | | **$39** |

**Scenario 4: Haiku 3.5, 80% Cache Hit (RECOMMENDED)**
| Component | Unit Cost | Usage | Monthly Cost |
|-----------|-----------|-------|--------------|
| Input tokens (100/req) | $0.25/MTok | 600K tokens (20% miss) | $0.15 |
| Output tokens (1024/req) | $1.25/MTok | 6.14M tokens (20% miss) | $7.68 |
| Vercel KV | Free tier | 30K commands | $0 |
| **Total** | | | **$8** |

**Recommended:** Scenario 4 (Haiku + caching) = **$8/month** at 1,000 uses/day.

### Cost Ceiling Trigger Analysis

**Daily cost at various request volumes (Haiku + 80% cache hit):**

| Requests/Day | Daily Cost | Monthly Projection | Triggers $5 Ceiling? |
|--------------|-----------|-------------------|---------------------|
| 500 | $0.13 | $4 | No |
| 1,000 | $0.26 | $8 | No |
| 2,000 | $0.51 | $15 | No |
| 5,000 | $1.28 | $38 | No |
| 10,000 | $2.56 | $77 | No |
| 20,000 | $5.12 | $154 | **YES** |

**Conclusion:** Cost ceiling of $5/day protects against abuse. Normal usage (1,000-5,000 req/day) well below threshold.

---

## Appendix B: Agent Coordination Matrix

| Phase | Primary Owner | Supporting Agents | Handoff Criteria |
|-------|--------------|------------------|------------------|
| A — Security | Security Agent | Engineer Agent (implements fixes) | All P0 vulnerabilities remediated, manual testing complete |
| B — Landing UI | UI/UX Agent | None | All components render, responsive, accessible |
| C — Demo API | Engineer Agent | Arch Advisor (cost monitoring), Security (input validation) | API functional, rate limiting works, caching verified |
| D — Code Quality | Engineer Agent | None | Dead code deleted, middleware refactor complete, no regression |
| E — UX Improvements | UI/UX Agent | Engineer Agent (route deletions) | Flows merged, Spanish translations complete, breadcrumbs added |
| F — Accessibility | UI/UX Agent | None | WCAG AA compliance, keyboard nav tested, VoiceOver verified |

---

## Appendix C: Testing Checklist

### Manual Testing Scenarios — Demo Feature

**Test 1: Happy Path**
1. Visit `/` (landing page)
2. Scroll to demo section
3. Type "Contrato de arrendamiento para oficina en Bogotá"
4. Click "Generar"
5. **Expect:** Loading state → Result with 300 words + blur overlay
6. **Verify:** "Intentos restantes: 2/3" updates
7. Click "Crear Cuenta" in overlay
8. **Expect:** Navigate to `/register?from=demo`

**Test 2: Rate Limiting**
1. Repeat Test 1 three times
2. On 4th attempt, click "Generar"
3. **Expect:** Error state: "Has alcanzado el límite..."
4. **Verify:** localStorage shows `{ attempts: 3, lastAttemptAt: ... }`
5. Wait 1 hour (or manually edit localStorage timestamp)
6. **Expect:** Attempts reset, can generate again

**Test 3: Cache Hit**
1. Generate document with prompt "Contrato de arrendamiento"
2. Open new incognito window
3. Generate document with same prompt "Contrato de arrendamiento"
4. **Expect:** Identical response returned in < 1 second
5. **Verify:** Backend logs show cache hit

**Test 4: Invalid Input**
1. Type "abc" (< 10 chars)
2. Click "Generar"
3. **Expect:** Error state: "Por favor describe el documento..."
4. Type 600-character prompt
5. **Expect:** Error state: "El prompt debe tener entre 10 y 500 caracteres"

**Test 5: Cost Ceiling**
1. Manually set daily spend to $4.90 in Vercel KV (`demo_cost:2026-01-31`)
2. Generate document (costs ~$0.15)
3. **Expect:** Request blocked, 503 error
4. **Expect:** Founder receives alert email
5. **Verify:** Frontend shows "Demo temporalmente no disponible"

---

### Security Testing Scenarios — Phase A Fixes

**Test 1: Cross-Tenant Data Access (RLS Bypass)**
1. Create two test companies (Company A, Company B)
2. Create user in Company A
3. Log in as Company A user
4. Attempt to access Company B document via `/api/documents/[company-b-doc-id]`
5. **Expect:** 403 Forbidden (before fix: 200 OK with data)

**Test 2: Tenant Isolation with NULL company_id**
1. Create user with `company_id = NULL` (via SQL)
2. Create documents under users with `company_id = NULL` and `company_id = 'valid-uuid'`
3. Log in as NULL user
4. Query `/api/documents`
5. **Expect:** Empty array (before fix: all NULL user documents visible)

**Test 3: XSS in Profile**
1. Register user with name `<script>alert('XSS')</script>`
2. Navigate to `/dashboard/configuracion` (profile page)
3. **Expect:** Name displayed as plain text (before fix: script executes)

**Test 4: SQL Injection in KB Search**
1. Search knowledge base with input `'; DROP TABLE knowledge_base; --`
2. **Expect:** No results, no error (before fix: potential SQL execution)

**Test 5: Unauthorized KB Usage Increment**
1. Get Company A's UUID
2. Log in as Company B user
3. Call `increment_kb_usage('company-a-uuid')` via SQL function
4. **Expect:** Error "Unauthorized" (before fix: Company A usage increments)

---

## Document Control

**Version:** 1.0
**Author:** Luuc.ai Project Manager Agent
**Contributors:** UI/UX Agent, Engineer Agent, Security Agent, Arch Advisor Agent
**Last Updated:** 2026-01-31
**Status:** Draft — Pending Founder Approval

**Change Log:**
- 2026-01-31: Initial compilation of all agent outputs into unified sprint plan

**Review Schedule:**
- Pre-implementation review: Required before Week 1 Day 1
- Mid-sprint checkpoint: End of Week 1 (after demo launch)
- Post-sprint retrospective: End of Week 2 (after hardening complete)

**Distribution:**
- Founder (approval required)
- Development team (reference during implementation)
- QA team (testing scenarios)

---

**END OF SPRINT PLAN**
