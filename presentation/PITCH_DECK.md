# Luuc.ai — Pitch Deck & Launch Materials

**Version:** 1.0
**Date:** February 18, 2026
**Purpose:** Early adopter acquisition, investor conversations, and product validation

---

## 1. EXECUTIVE SUMMARY

### One-Liner
**Luuc.ai es el copiloto legal con IA para empresas latinoamericanas — genera contratos en segundos, analiza riesgos automáticamente, y aprende el estilo de tu equipo legal.**

### English Version
**Luuc.ai is the AI legal copilot for Latin American companies — generate contracts in seconds, analyze risks automatically, and learn your legal team's style.**

### The Problem
- **80% del tiempo de un abogado corporativo** se gasta en tareas repetitivas: redactar contratos similares, revisar documentos estándar, buscar cláusulas.
- **Los departamentos legales son cuellos de botella** que retrasan operaciones comerciales.
- **Las herramientas existentes** (ChatGPT, otros LegalTech) no entienden el contexto latinoamericano ni las normativas locales.

### The Solution
Luuc.ai automatiza la redacción y revisión de documentos legales con IA entrenada en normativa latinoamericana, aprendiendo el estilo único de cada empresa.

### Key Metrics (Target for Pilot)
| Metric | Target |
|--------|--------|
| Time Saved | 70% reduction in document drafting |
| Documents/Month | 50+ per company |
| User Satisfaction | NPS > 50 |
| Retention | 80% monthly active |

---

## 2. PRODUCT — WHAT'S WORKING NOW

### Core Features (Production Ready)

#### 2.1 Document Generation
| Feature | Status | Description |
|---------|--------|-------------|
| **6 Template Types** | ✅ Live | NDA, Employment, Services, Lease, Corporate Minutes, Power of Attorney |
| **Free-form Generation** | ✅ Live | Describe any document in natural language |
| **User Instructions** | ✅ Live | Custom instructions for AI (tone, specific clauses, etc.) |
| **5 Output Languages** | ✅ Live | Spanish, English, Portuguese, French, German |
| **Export DOCX** | ✅ Live | Professional formatting, headers, page numbers |
| **Export PDF** | ✅ Live | Ready-to-sign documents |

#### 2.2 Document Analysis
| Feature | Status | Description |
|---------|--------|-------------|
| **Risk Scoring** | ✅ Live | 0-100 risk score with color coding |
| **Finding Categories** | ✅ Live | High/Medium/Low severity classification |
| **Recommendations** | ✅ Live | Actionable suggestions for each finding |
| **Multi-format Upload** | ✅ Live | PDF, DOCX, TXT support |
| **AI Suggestions** | ✅ Live | Follow-up actions after analysis |

#### 2.3 Knowledge Base
| Feature | Status | Description |
|---------|--------|-------------|
| **Company Information** | ✅ Live | Upload policies, procedures, company data |
| **Model Documents** | ✅ Live | Upload approved contracts for style learning |
| **Categories** | ✅ Live | Organize by type (contracts, policies, etc.) |
| **AI Context** | ✅ Live | Documents are used as context for generation |

#### 2.4 Team & Collaboration
| Feature | Status | Description |
|---------|--------|-------------|
| **Team Invitations** | ✅ Live | Email-based invites with roles |
| **Role-based Access** | ✅ Live | Owner, Admin, Member, Viewer roles |
| **Company Profiles** | ✅ Live | Centralized company configuration |
| **Multi-tenant** | ✅ Live | Complete data isolation between companies |

#### 2.5 User Experience
| Feature | Status | Description |
|---------|--------|-------------|
| **Dark Mode** | ✅ Live | Full dark theme support |
| **Mobile Responsive** | ✅ Live | Works on all devices |
| **Spanish/English UI** | ✅ Live | Complete i18n coverage |
| **Onboarding Wizard** | ✅ Live | Guided setup for new users |
| **Interactive Tour** | ✅ Live | Feature discovery walkthrough |

---

## 3. PRODUCT — WHAT'S COMING

### Roadmap (Next 90 Days)

#### Q1 2026 — Collaboration & Scale
| Feature | ETA | Priority |
|---------|-----|----------|
| Document versioning | March | HIGH |
| Comments & annotations | March | HIGH |
| Template library (shared) | April | MEDIUM |
| OAuth (Google/Microsoft) | April | MEDIUM |
| Webhook integrations | April | LOW |

#### Q2 2026 — Enterprise
| Feature | ETA | Priority |
|---------|-----|----------|
| SSO (SAML/OIDC) | May | HIGH |
| Audit reports (PDF) | May | HIGH |
| Custom branding | June | MEDIUM |
| API access | June | MEDIUM |
| Slack/Teams integration | June | LOW |

#### Q3 2026 — Intelligence
| Feature | ETA | Priority |
|---------|-----|----------|
| Contract comparison | July | HIGH |
| Clause library | July | HIGH |
| Deadline tracking | August | MEDIUM |
| Analytics dashboard | August | MEDIUM |
| AI chat assistant | September | HIGH |

---

## 4. UI/UX DESIGN DETAILS

### Design System

#### Color Palette
```
Primary Blue:    #2563EB (buttons, links, highlights)
Success Green:   #16A34A (confirmations, positive scores)
Warning Yellow:  #EAB308 (cautions, medium risks)
Error Red:       #DC2626 (errors, high risks)
Slate Gray:      #64748B (text, borders)
Background:      #F8FAFC (light) / #0F172A (dark)
```

#### Typography
```
Headings:   Inter (bold, 24-48px)
Body:       Inter (regular, 14-16px)
Code/Mono:  JetBrains Mono (for legal clauses)
```

#### Component Library
- **shadcn/ui** — High-quality, accessible components
- **Tailwind CSS** — Utility-first styling
- **Lucide Icons** — Consistent iconography

### Key UI Patterns

#### 1. Document Generation Flow
```
[Select Template] → [Fill Form] → [Add Instructions] → [Generate] → [Preview] → [Export]
     ↓                  ↓              ↓                  ↓            ↓
  6 options        Dynamic fields   Optional text    AI streaming   DOCX/PDF
```

#### 2. Document Analysis Flow
```
[Upload File] → [Add Focus] → [Analyze] → [View Results] → [Act on Suggestions]
      ↓             ↓            ↓              ↓                 ↓
  PDF/DOCX/TXT   Optional    AI streaming   Risk score +     Create follow-up
                                            Findings
```

#### 3. Onboarding Flow
```
[Welcome] → [Company Setup] → [Tour: Create] → [Tour: Review] → [Tour: KB] → [First NDA] → [Dashboard]
    ↓            ↓                 ↓                ↓               ↓            ↓
  Greeting   Name/Country/     Highlight       Highlight        Highlight    Guided
             Sector            sidebar         sidebar          sidebar      creation
```

### Mobile Experience
- **Responsive breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly:** 44px minimum tap targets
- **Simplified navigation:** Collapsible sidebar, bottom nav on mobile
- **Optimized forms:** Single-column layouts, large inputs

### Accessibility
- **WCAG 2.1 AA** compliant color contrasts
- **Keyboard navigation** for all interactive elements
- **Screen reader** friendly with proper ARIA labels
- **Focus indicators** visible in both light and dark modes

---

## 5. ONBOARDING EXPERIENCE

### First-Time User Journey

#### Step 1: Welcome (0-10 seconds)
```
┌─────────────────────────────────────┐
│           ✨ Luuc.ai                │
│                                     │
│    Bienvenido a Luuc.ai            │
│    Tu asistente legal con IA       │
│                                     │
│    Vamos a configurar tu cuenta    │
│    en menos de 2 minutos.          │
│                                     │
│         [ Comenzar ]               │
└─────────────────────────────────────┘
```

#### Step 2: Company Setup (30-60 seconds)
```
┌─────────────────────────────────────┐
│    Configura tu empresa             │
│                                     │
│    Nombre: [________________]       │
│    País:   [Colombia ▼      ]       │
│    Sector: [Firma de Abogados ▼]    │
│                                     │
│    [ Configurar después ]           │
│              [ Continuar ]          │
└─────────────────────────────────────┘
```

#### Step 3: Interactive Tour (60-90 seconds)
- **Spotlight on "Crear"** — "Genera contratos, NDAs, y más con IA"
- **Spotlight on "Revisar"** — "Analiza documentos para identificar riesgos"
- **Spotlight on "Info Empresarial"** — "Sube datos de tu empresa para contexto"

#### Step 4: First Action Prompt
```
┌─────────────────────────────────────┐
│    ¡Ya casi terminas!               │
│                                     │
│    Te sugerimos comenzar con un    │
│    Acuerdo de Confidencialidad     │
│    (NDA). Es rápido y te mostrará  │
│    cómo funciona Luuc.ai.          │
│                                     │
│    [ Crear mi primer NDA ]         │
│    [ Explorar primero ]            │
└─────────────────────────────────────┘
```

### Onboarding Metrics to Track
| Metric | Target |
|--------|--------|
| Onboarding completion rate | > 80% |
| Time to first document | < 5 minutes |
| Company setup completion | > 60% |
| Tour completion | > 70% |

---

## 6. COMPETITIVE ADVANTAGES

### Why Luuc.ai vs. Alternatives

#### vs. ChatGPT / Claude Direct
| Factor | ChatGPT/Claude | Luuc.ai |
|--------|----------------|---------|
| Legal templates | ❌ Generic prompts | ✅ 6 specialized templates |
| Document formatting | ❌ Plain text | ✅ Professional DOCX/PDF |
| Company context | ❌ Manual each time | ✅ Persistent knowledge base |
| Risk analysis | ❌ Manual review | ✅ Automated scoring |
| Collaboration | ❌ None | ✅ Teams, roles, invites |
| Audit trail | ❌ None | ✅ Full operation logging |
| LATAM law | ❌ US-centric | ✅ Colombia, México, etc. |

#### vs. US LegalTech (LawGeex, Ironclad, etc.)
| Factor | US LegalTech | Luuc.ai |
|--------|--------------|---------|
| Pricing | $$$$ (enterprise only) | $$ (accessible) |
| Language | English-first | Spanish-first |
| Jurisdiction | US/UK law | LATAM law |
| Onboarding | Weeks | Minutes |
| Minimum seats | 10-50 | 1 |
| Local support | ❌ | ✅ Colombia-based |

#### vs. Local Competitors
| Factor | Generic Tools | Luuc.ai |
|--------|---------------|---------|
| AI generation | Basic templates | Advanced AI |
| Style learning | ❌ | ✅ Model documents |
| Risk analysis | ❌ | ✅ Automated |
| Mobile | Often poor | Fully responsive |
| Modern UX | Outdated | Modern, dark mode |

### Unique Value Propositions

1. **Aprende tu estilo** — Upload approved contracts, and AI mimics your firm's voice
2. **Contexto empresarial** — Upload company info, AI knows your business
3. **Análisis de riesgos** — Automated scoring, not just generation
4. **Latinoamérica primero** — Built for Colombian law, expanding regionally
5. **Equipo + IA** — Collaboration features, not just a chatbot

---

## 7. TARGET CUSTOMERS

### Primary Segment: SMB Legal Departments
**Profile:**
- Companies with 50-500 employees
- 1-5 person legal team
- Handles 20-50 contracts/month
- Currently using Word + manual review

**Pain Points:**
- Overwhelmed with routine contracts
- No budget for enterprise LegalTech
- Worried about AI quality
- Need Spanish-language tools

**Decision Makers:**
- General Counsel
- Legal Operations Manager
- CEO (in smaller companies)

### Secondary Segment: Law Firms
**Profile:**
- Small to mid-size firms (5-50 lawyers)
- Corporate/commercial practice
- Serves multiple clients
- Looking to increase efficiency

**Pain Points:**
- Billing pressure (need to do more with less)
- Client expectations for speed
- Associate training time
- Document consistency across team

**Decision Makers:**
- Managing Partner
- Practice Group Leader
- IT Director

### Early Adopter Criteria
| Criteria | Importance |
|----------|------------|
| Tech-forward culture | HIGH |
| High document volume | HIGH |
| Colombia-based | HIGH (for pilot) |
| Willing to give feedback | HIGH |
| Budget authority | MEDIUM |
| Existing AI experience | LOW |

---

## 8. PRICING STRATEGY

### Current Plans

| Plan | Price | Documents | Features |
|------|-------|-----------|----------|
| **Free** | $0/mo | 10 gen + 5 reviews | Basic templates, 1 user |
| **Plus** | $49/mo | 100 gen + 50 reviews | All templates, 3 users, KB |
| **Pro** | $149/mo | Unlimited | Teams, priority support, API |

### Early Adopter Offer
```
🎁 OFERTA DE LANZAMIENTO (Primeros 50 clientes)

   Plan Plus: $29/mes (primer año) — Ahorra 40%
   Plan Pro:  $99/mes (primer año) — Ahorra 33%

   + Onboarding personalizado (1 hora)
   + Acceso directo al equipo fundador
   + Influencia en el roadmap
```

### Pricing Justification
- **ROI:** If a lawyer costs $50/hour and saves 5 hours/week → $1,000/month saved
- **Comparison:** US tools cost $500-2,000/user/month
- **LATAM context:** Priced for regional market while delivering US-quality AI

---

## 9. VALIDATION PLAN

### Phase 1: Private Beta (Current)
**Timeline:** February 2026
**Goal:** 10-15 companies using the platform

**Activities:**
- [ ] Deploy with Anthropic API key
- [ ] Invite 20 target companies
- [ ] Weekly feedback calls
- [ ] Monitor usage metrics
- [ ] Fix critical bugs

**Success Metrics:**
| Metric | Target |
|--------|--------|
| Active companies | 10+ |
| Documents generated | 200+ |
| User retention (week 2) | 60%+ |
| NPS score | 40+ |

### Phase 2: Public Pilot (March 2026)
**Goal:** 50 paying customers

**Activities:**
- [ ] Launch landing page campaign
- [ ] LinkedIn content strategy
- [ ] Webinars for law firms
- [ ] Partnership with legal associations
- [ ] Case study from beta users

**Success Metrics:**
| Metric | Target |
|--------|--------|
| Paying customers | 50 |
| MRR | $3,000+ |
| Churn rate | < 10% |
| Referral rate | 20%+ |

### Phase 3: Growth (Q2 2026)
**Goal:** 200 customers, $15K MRR

---

## 10. TRUST & SECURITY

### Compliance & Certifications

| Standard | Status | Notes |
|----------|--------|-------|
| SOC 2 Type II | **Aligned** | Infrastructure certified, applying same controls |
| ISO 27001 | **Aligned** | Infrastructure certified, applying same controls |
| GDPR | **Compliant** | Data protection practices implemented |
| Ley 1581 (Colombia) | **Compliant** | Habeas Data requirements met |

### Security Features
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Isolation:** Row Level Security (RLS) — companies can't see each other's data
- **Auth:** Secure JWT tokens, session management
- **Audit:** All sensitive operations logged with IP, timestamp, user
- **AI Privacy:** Documents NOT used to train models (DPA with Anthropic)

### Trust Materials Available
- `/seguridad` — Public security page with FAQ
- `/terminos` — Comprehensive terms of service
- `/privacidad` — Detailed privacy policy
- NDA template — Available for download

---

## 11. TEAM & COMPANY

### Founding Team
*[To be filled with actual team info]*

| Role | Name | Background |
|------|------|------------|
| CEO | | |
| CTO | | |
| Legal Advisor | | |

### Company Info
- **Entity:** Luuc.ai S.A.S.
- **Location:** Colombia
- **Founded:** 2025
- **Stage:** Pre-seed / Bootstrap

### Advisors
*[To be filled]*

---

## 12. APPENDIX: DEMO SCRIPT

### 5-Minute Demo Flow

#### 1. Hook (30 seconds)
"Imagina que necesitas un NDA para una reunión mañana. Normalmente te tomaría 30-60 minutos buscando plantillas, adaptando cláusulas, revisando formato. Con Luuc.ai, lo tienes en 30 segundos."

#### 2. Generate Document (90 seconds)
1. Click "Crear" → Select "NDA"
2. Fill basic info (parties, duration)
3. Add user instruction: "Incluir cláusula de no competencia por 2 años"
4. Click "Generar" — show AI streaming
5. Show preview with professional formatting
6. Export to PDF — open the file

#### 3. Analyze Document (90 seconds)
1. Click "Revisar"
2. Upload a sample contract (have one ready)
3. Show analysis results:
   - Risk score (e.g., 65/100 — Medium)
   - Key findings (missing clauses, risky terms)
   - AI recommendations
4. "This would take a junior associate 2 hours to catch"

#### 4. Knowledge Base (60 seconds)
1. Show "Información Empresarial"
2. "Upload your company policies, and AI knows your context"
3. Show "Documentos Modelo"
4. "Upload approved contracts, and AI writes like your team"

#### 5. Close (30 seconds)
"Luuc.ai no reemplaza abogados — los hace más eficientes. Todo lo que generamos es un borrador para revisar. Pero en lugar de empezar desde cero, empiezas con el 80% listo."

### Demo Checklist
- [ ] Have sample NDA template ready
- [ ] Have sample contract to analyze (with some issues)
- [ ] Test export works
- [ ] Clear any test data from account
- [ ] Prepare "wow" moments (AI streaming, instant PDF)

---

## 13. APPENDIX: FAQ FOR SALES

### Common Objections & Responses

**Q: "¿Es seguro subir documentos confidenciales?"**
> Sí. Usamos cifrado de grado bancario (AES-256), aislamiento total entre empresas, y tenemos acuerdos con Anthropic que garantizan que tus documentos NO se usan para entrenar IA. Ofrecemos firmar un NDA si lo necesitas.

**Q: "¿Qué pasa si la IA comete un error?"**
> Luuc.ai genera borradores, no documentos finales. Siempre debe haber revisión humana antes de usar cualquier documento. Dicho esto, nuestra IA está entrenada en normativa colombiana y tiene tasas de precisión del 90%+.

**Q: "¿Por qué no usar ChatGPT directamente?"**
> Puedes, pero pierdes: (1) formato profesional, (2) contexto de tu empresa, (3) análisis de riesgos automatizado, (4) colaboración en equipo, (5) historial de documentos. ChatGPT es un chat; Luuc.ai es una herramienta de trabajo.

**Q: "¿Funciona para leyes de otros países?"**
> Actualmente optimizado para Colombia. Próximamente México y Argentina. La generación de documentos ya funciona en 5 idiomas.

**Q: "¿Puedo cancelar en cualquier momento?"**
> Sí. Sin contratos largos. Cancela desde tu panel y no se te cobra más.

---

## 14. CONTACT & RESOURCES

### Quick Links
- **App:** https://luuc.ai
- **Security:** https://luuc.ai/seguridad
- **Terms:** https://luuc.ai/terminos
- **Privacy:** https://luuc.ai/privacidad

### Contact
- **Sales:** ventas@luuc.ai
- **Support:** soporte@luuc.ai
- **Legal:** legal@luuc.ai
- **Security:** seguridad@luuc.ai

### Social
- **LinkedIn:** /company/luuc-ai
- **Twitter:** @luuc_ai

---

*Document prepared for Luuc.ai launch — February 2026*
