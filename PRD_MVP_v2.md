# Luuc.ai – PRD MVP v2

**Document Version:** 2.0
**Date:** February 15, 2026
**Status:** Active

---

## 1. Estado Actual vs. Objetivo

### Ya implementado:
- Auth (Supabase): registro, login, forgot/reset password
- Multi-tenant: empresas con RLS
- Multi-provider AI: Claude, Gemini, Groq (seleccionable)
- Generación de documentos: 6+ plantillas, modo personalizado
- Análisis de riesgos: score, cláusulas, recomendaciones
- Knowledge Base: upload, categorías, búsqueda, context injection
- Historial de documentos: CRUD completo
- UI: dark mode, language switcher (ES/EN), responsive
- **AI Suggestions**: sugerencias contextuales post-generación/análisis
- **Error Monitoring**: Sentry integrado
- **Caching Layer**: Vercel KV configurado
- **Email Service**: Resend configurado

### Falta para piloto (P0):
1. **Export DOCX** — crítico, abogados viven en Word
2. **Export PDF** — crítico para firmas
3. **Página de seguridad pública** — para firmar NDA con clientes
4. **Invitar usuarios a empresa** — equipos de 2+ personas
5. **Onboarding guiado** — reducir time-to-value

### Falta para V1.0 (P1):
- RBAC básico (owner/admin/member)
- ~~Audit trail~~ ✅ Ya implementado (audit_logs table)
- Usar documento de KB como plantilla
- Versionado de KB

---

## 2. Objetivo del MVP

Validar que **abogados de LATAM** usan Luuc.ai para generar contratos reales bajo NDA.

**Criterio de éxito:**
- 5-10 empresas piloto activas
- 70% genera 3+ documentos en semana 1
- 60% regresa en semana 2
- NPS de calidad ≥ 4/5 en 70% de respuestas

---

## 3. Usuarios

| Persona | Necesidad | Feature clave |
|---------|-----------|---------------|
| Socio / Head of Legal | Confiar en seguridad | Página de seguridad, NDA firmable |
| Abogado Senior | Generar contratos rápido | Generación + export DOCX |
| Abogado Junior | Preparar primeros drafts | Plantillas + análisis de riesgos |
| Paralegal | Organizar documentos | Knowledge Base + historial |

---

## 4. Casos de Uso (MVP)

### 4.1 Generar contrato desde plantilla
**Ya implementado:** ✅
- Seleccionar plantilla
- Llenar formulario
- Generar con AI
- Ver en modal
- **AI Suggestions post-generación** ✅

**Falta:**
- Export DOCX ❌
- Export PDF ❌

### 4.2 Subir contrato para análisis
**Ya implementado:** ✅
- Upload PDF/DOCX/TXT
- Extracción de texto
- Análisis con score, riesgos, recomendaciones
- **AI Suggestions post-análisis** ✅

**Mejora:**
- Permitir guardar análisis para referencia futura

### 4.3 Knowledge Base
**Ya implementado:** ✅
- Upload con extracción
- Categorías personalizables
- Búsqueda
- Context injection en generación

**Falta:**
- Usar documento como plantilla base ❌
- Versionado ❌

### 4.4 Historial de documentos
**Ya implementado:** ✅
- Lista de documentos
- Búsqueda
- Vista previa
- Eliminar
- **Duplicar documento** ✅ (API exists at `/api/documents/[id]/duplicate`)

**Falta:**
- Export desde historial ❌

### 4.5 Onboarding
**No implementado:** ❌

**Flujo propuesto:**
1. Registro (email + password)
2. Verificación de email
3. Crear empresa (nombre, país, sector)
4. Tour guiado (4 tooltips)
5. Sugerir primera acción: "Genera tu primer NDA"
6. Celebración al completar

---

## 5. Seguridad — Respuestas para Clientes

| Pregunta del cliente | Respuesta |
|----------------------|-----------|
| ¿Dónde están mis datos? | Supabase (AWS us-east-1), cifrado AES-256 en reposo, TLS 1.3 en tránsito |
| ¿El AI lee mis contratos? | Sí, para procesarlos. No se retienen ni usan para entrenamiento (DPA con Anthropic) |
| ¿Alguien más puede ver mis docs? | No. Aislamiento total por empresa con RLS |
| ¿Puedo borrar mis datos? | Sí. Derecho al olvido disponible |
| ¿Puedo firmar un NDA con Luuc? | Sí. Tenemos NDA estándar para pilotos |

**Página pública:** `/seguridad` con esta información + link a descargar NDA

---

## 6. Métricas

### Funnel de activación:
```
Registro → Email verificado → Empresa creada → Primer doc → 3+ docs → Semana 2
```

### KPIs MVP:
| Métrica | Meta |
|---------|------|
| Empresas piloto activas | 5-10 |
| Docs generados / empresa / semana | ≥ 3 |
| Time to first document | < 10 min |
| Retención semana 2 | ≥ 60% |
| NPS calidad documento | ≥ 4/5 en 70% |
| "¿Confías para subir docs reales?" | ≥ 80% sí |

---

## 7. Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Calidad de docs insuficiente | Media | Iterar prompts con feedback, permitir edición |
| Onboarding lento | Alta | Implementar tour guiado, reducir pasos |
| Bug de multi-tenant | Baja | Tests automatizados de aislamiento |
| Cliente no confía en seguridad | Media | Página pública + NDA firmable |

---

## 8. Roadmap Inmediato

### Semana 1-2 (Blockers para piloto):
- [ ] Export DOCX
- [ ] Export PDF
- [ ] Página `/seguridad`
- [ ] NDA template descargable
- [ ] Invitar usuarios a empresa

### Semana 3-4 (Mejoras de adopción):
- [ ] Onboarding guiado
- [ ] Tour de 4 tooltips
- [ ] Email de bienvenida (Resend ready ✅)
- [ ] ~~Duplicar documento~~ ✅ Ya existe

### Mes 2 (V1.0):
- [ ] RBAC (owner/admin/member)
- [x] Audit trail básico ✅
- [ ] Usar KB doc como plantilla
- [ ] Analytics dashboard

---

## 9. Fuera de Alcance (MVP)

- SSO / SAML
- Integración con DocuSign
- Agente autónomo para KB
- Multi-jurisdicción avanzada
- Computer use
- Cifrado end-to-end por tenant
- Mobile app

---

## 10. Technical Implementation Status

### Infrastructure Ready:
| Service | Status | Notes |
|---------|--------|-------|
| Sentry | ✅ Configured | Error monitoring active |
| Vercel KV | ✅ Configured | Caching layer ready |
| Resend | ✅ Configured | Email service ready |
| Stripe | ⚠️ Partial | Colombia not supported, need alternative |

### Features Ready:
| Feature | Status |
|---------|--------|
| AI Suggestions | ✅ Complete |
| Document Duplicate API | ✅ Complete |
| Audit Logs | ✅ Complete |
| Rate Limiting | ✅ Complete |
| Multi-tenant RLS | ✅ Complete |

### Features Needed for Pilot:
| Feature | Priority | Estimated Effort |
|---------|----------|------------------|
| Export DOCX | P0 | 1-2 days |
| Export PDF | P0 | 1 day |
| `/seguridad` page | P0 | 0.5 days |
| Team invitations | P0 | 2-3 days |
| Onboarding flow | P0 | 2-3 days |
