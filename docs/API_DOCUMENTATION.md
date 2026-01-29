# API Documentation - Luuc.ai

Complete reference for all REST API endpoints in the Luuc.ai platform.

---

## Authentication

All endpoints require authentication via Supabase Auth unless otherwise noted. The authentication token must be included in the request headers.

**Auth Header:**
```
Authorization: Bearer <supabase-access-token>
```

**User Context:**
Most endpoints automatically retrieve the current user from the Supabase session via `getCurrentUser()`.

---

## Response Format

All API endpoints return a standard response structure:

```typescript
{
  "success": boolean,
  "data": T | null,
  "error": string | undefined
}
```

---

## Endpoints

### Document Generation

#### POST /api/generate
Generate a legal document using a predefined template with company context.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |
| **Rate Limit** | Free: 10 docs/user, Pro: Unlimited |

**Request Body:**
```json
{
  "template": "nda | contrato_servicios | carta_terminacion | acta_reunion | politica_interna",
  "variables": {
    "key": "value",
    ...
  },
  "title": "Document Title",
  "companyId": "uuid" // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": "Generated document markdown content",
    "title": "Document Title",
    "id": "uuid",
    "usedCompanyContext": true
  }
}
```

**Error Codes:**
- `401` - Unauthorized (no authentication)
- `403` - Forbidden (free tier limit reached)
- `400` - Bad request (missing template or variables)
- `500` - Server error (Claude API failure or database error)

---

#### POST /api/generate-custom
Generate a custom legal document from natural language description.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |
| **Rate Limit** | Free: 10 docs/user, Pro: Unlimited |

**Request Body:**
```json
{
  "tipoDocumento": "contrato | carta | politica | acta | poder | memorando | otro",
  "descripcion": "Natural language description (min 20 chars)",
  "partes": "Parties involved (optional)",
  "duracion": "Duration/validity (optional)",
  "valor": "Amount/value (optional)",
  "jurisdiccion": "Legal jurisdiction (optional)",
  "detallesAdicionales": "Additional details (optional)"
}
```

**Validation:**
- Request is validated against blocked patterns (non-legal requests rejected)
- Requires legal context keywords
- Description must be at least 20 characters

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": "Generated document content",
    "tipo": "contrato",
    "timestamp": "2026-01-29T12:00:00.000Z",
    "id": "uuid"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Free tier limit exceeded
- `400` - Invalid request (non-legal content, missing fields)
- `500` - Server error

---

### Document Review/Analysis

#### POST /api/review
Analyze a legal document for risks, missing clauses, and compliance issues.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |
| **Rate Limit** | Free: 5 analyses/user, Pro: Unlimited |

**Request Body:**
```json
{
  "content": "Document content to analyze",
  "filename": "contract.pdf",
  "focusContext": "Optional: specific areas to focus on",
  "fileSize": 123456 // Optional, in bytes
}
```

**Input Validation:**
- Content is sanitized to prevent prompt injection
- Filename is sanitized (path traversal protection)
- Focus context is validated (max length, no injection patterns)
- File size must be < 10MB

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumen": "Executive summary",
    "score": 5,
    "riesgos": [
      {
        "nivel": "CRITICO | ALTO | MEDIO | BAJO",
        "descripcion": "Risk description",
        "clausula": "Affected clause",
        "recomendacion": "Recommendation"
      }
    ],
    "clausulas_faltantes": ["Missing clause 1", "..."],
    "observaciones_generales": "General observations",
    "id": "uuid"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Invalid content, filename, or focus context
- `500` - Server error

---

### Document Management

#### GET /api/documents
Get user's generated documents with pagination and filtering.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Query Parameters:**
- `limit` (number, default: 50) - Max documents to return
- `offset` (number, default: 0) - Pagination offset
- `docType` (string, optional) - Filter by document type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "company_id": "uuid",
      "title": "Document Title",
      "doc_type": "nda",
      "content": "...",
      "variables": {},
      "is_custom": false,
      "word_count": 1500,
      "created_at": "2026-01-29T12:00:00.000Z",
      "updated_at": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### DELETE /api/documents?id=xxx
Delete a document owned by the current user.

| Property | Value |
|----------|-------|
| **Method** | DELETE |
| **Auth Required** | Yes |

**Query Parameters:**
- `id` (uuid, required) - Document ID to delete

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Missing document ID
- `403` - Forbidden (document not owned by user)
- `404` - Document not found
- `500` - Server error

---

### User Profile

#### GET /api/user/profile
Get current user's profile information.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+57 300 1234567",
    "position": "Abogado Senior",
    "created_at": "2026-01-15T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### PUT /api/user/profile
Update current user's profile.

| Property | Value |
|----------|-------|
| **Method** | PUT |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+57 300 1234567",
  "position": "Abogado Senior"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "full_name": "John Doe",
    "phone": "+57 300 1234567",
    "position": "Abogado Senior"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

### Company Management

#### GET /api/company/setup
Get the company associated with the current user.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Firma Legal ABC",
    "user_id": "uuid",
    "industry": "legal",
    "description": "Firma especializada en...",
    "document_rules": {
      "style": "formal",
      "language": "es",
      "tone": "professional",
      "customInstructions": "..."
    },
    "status": "active",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-29T12:00:00.000Z"
  }
}
```

**Response when no company exists:**
```json
{
  "success": true,
  "data": null
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### POST /api/company/setup
Create a new company. User can only have one company.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Firma Legal ABC",
  "industry": "legal",
  "description": "Firma especializada en derecho corporativo" // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Firma Legal ABC",
    "user_id": "uuid",
    "industry": "legal",
    "description": "Firma especializada en derecho corporativo",
    "document_rules": {
      "style": "formal",
      "language": "es"
    },
    "status": "active",
    "created_at": "2026-01-29T12:00:00.000Z",
    "updated_at": "2026-01-29T12:00:00.000Z"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Company already exists or missing required fields
- `500` - Server error

---

#### PUT /api/company/setup
Update existing company details.

| Property | Value |
|----------|-------|
| **Method** | PUT |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Firma Legal ABC",
  "industry": "legal",
  "description": "Updated description",
  "document_rules": {
    "style": "formal",
    "language": "es",
    "tone": "professional",
    "customInstructions": "Use specific terminology..."
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    // Updated company object
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Company not found
- `500` - Server error

---

#### GET /api/company/stats
Get statistics for the user's company.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 45,
    "totalUsers": 5,
    "documentsThisMonth": 12,
    "avgRiskScore": 3.5
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Company not found
- `500` - Server error

---

### Company Documents (Reference Library)

#### GET /api/company/documents
Get reference documents uploaded by the company.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Query Parameters:**
- `docType` (string, optional) - Filter by document type
- `category` (string, optional) - Filter by category (aprobado, borrador, ejemplo)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "title": "NDA Template v2",
      "content": "...",
      "doc_type": "nda",
      "category": "aprobado",
      "uploaded_by": "uuid",
      "views_count": 15,
      "created_at": "2026-01-15T10:00:00.000Z",
      "updated_at": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### POST /api/company/documents
Upload a new reference document to the company library.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "title": "NDA Template v2",
  "content": "Document content (min 100 chars)",
  "docType": "nda", // Optional
  "category": "aprobado | borrador | ejemplo" // Default: aprobado
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "title": "NDA Template v2",
    "content": "...",
    "doc_type": "nda",
    "category": "aprobado",
    "uploaded_by": "uuid",
    "views_count": 0,
    "created_at": "2026-01-29T12:00:00.000Z",
    "updated_at": "2026-01-29T12:00:00.000Z"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Missing fields or content too short (< 100 chars)
- `500` - Server error

---

#### DELETE /api/company/documents?docId=xxx
Delete a reference document.

| Property | Value |
|----------|-------|
| **Method** | DELETE |
| **Auth Required** | Yes |

**Query Parameters:**
- `docId` (uuid, required) - Document ID to delete

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Missing docId
- `500` - Server error

---

### Knowledge Base

#### GET /api/knowledge-base
Get knowledge base documents for the company.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Full-text search (min 3 chars)
- `limit` (number, default: 50) - Max documents to return

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "title": "Legal Manual 2026",
      "filename": "manual.pdf",
      "file_type": "pdf",
      "file_size": 1048576,
      "category": "manuales",
      "tags": ["legal", "compliance"],
      "content": "Extracted text content...",
      "content_summary": "Summary...",
      "metadata": {},
      "usage_count": 25,
      "last_used_at": "2026-01-28T10:00:00.000Z",
      "uploaded_by": "uuid",
      "created_at": "2026-01-15T10:00:00.000Z",
      "updated_at": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### POST /api/knowledge-base
Upload a document to the knowledge base (file or text).

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |
| **Content-Type** | multipart/form-data OR application/json |

**Request Body (File Upload - multipart/form-data):**
```
file: File (required) - pdf, docx, txt, md (max 10MB)
title: string (required)
category: string (required)
tags: string (JSON array, optional)
metadata: string (JSON object, optional)
```

**Request Body (Text Upload - application/json):**
```json
{
  "title": "Document Title",
  "category": "general",
  "content": "Text content (min 50 chars)",
  "tags": ["tag1", "tag2"],
  "metadata": {}
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "title": "Legal Manual 2026",
    "filename": "manual.pdf",
    "file_type": "pdf",
    "file_size": 1048576,
    "category": "manuales",
    "tags": ["legal"],
    "content": "...",
    "content_summary": null,
    "metadata": {},
    "usage_count": 0,
    "last_used_at": null,
    "uploaded_by": "uuid",
    "created_at": "2026-01-29T12:00:00.000Z",
    "updated_at": "2026-01-29T12:00:00.000Z"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Invalid file type, file too large, content too short, or missing fields
- `500` - Server error

**Supported File Types:** pdf, docx, txt, md
**Max File Size:** 10MB

---

#### GET /api/knowledge-base/[id]
Get a specific knowledge base document by ID.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "title": "Document Title",
    // ... full document object
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Document not found
- `500` - Server error

---

#### PUT /api/knowledge-base/[id]
Update a knowledge base document's metadata.

| Property | Value |
|----------|-------|
| **Method** | PUT |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "title": "Updated Title",
  "category": "plantillas",
  "tags": ["updated", "tags"],
  "metadata": {}
}
```

**Note:** Only metadata fields can be updated. Content cannot be modified.

**Response (200):**
```json
{
  "success": true,
  "data": {
    // Updated document object
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - No valid fields to update
- `500` - Server error

---

#### DELETE /api/knowledge-base/[id]
Delete a knowledge base document.

| Property | Value |
|----------|-------|
| **Method** | DELETE |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### GET /api/knowledge-base/categories
Get all categories for the company's knowledge base.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "name": "General",
      "slug": "general",
      "description": null,
      "icon": "folder",
      "color": "#3B82F6",
      "display_order": 1,
      "is_active": true,
      "document_count": 12,
      "created_at": "2026-01-15T10:00:00.000Z",
      "updated_at": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

#### POST /api/knowledge-base/categories
Create a new category.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Auth Required** | Yes |

**Request Body:**
```json
{
  "name": "Contratos",
  "description": "Category description", // Optional
  "icon": "file-text", // Optional, default: "folder"
  "color": "#3B82F6" // Optional, default: "#3B82F6"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "name": "Contratos",
    "slug": "contratos",
    "description": "Category description",
    "icon": "file-text",
    "color": "#3B82F6",
    "display_order": 0,
    "is_active": true,
    "document_count": 0,
    "created_at": "2026-01-29T12:00:00.000Z",
    "updated_at": "2026-01-29T12:00:00.000Z"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `400` - Name too short (< 2 chars) or category already exists
- `500` - Server error

---

#### GET /api/knowledge-base/stats
Get knowledge base statistics for the company.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Auth Required** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 45,
    "totalSize": 52428800,
    "categoriesCount": 5,
    "lastUploadedAt": "2026-01-29T12:00:00.000Z",
    "mostUsedCategory": "plantillas",
    "recentUploads": [
      // Array of recent documents
    ]
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `500` - Server error

---

## Error Handling

All endpoints follow consistent error response patterns:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error, missing fields)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not allowed, e.g., tier limits)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side error)

---

## Rate Limits

### Free Tier
- Document Generation: 10 documents total
- Document Analysis: 5 analyses total

### Pro Tier
- Unlimited document generation
- Unlimited document analysis

Rate limits are enforced per user based on the `plan` field in the users table.

---

## Security Features

1. **Authentication:** All endpoints require valid Supabase auth token
2. **Row-Level Security (RLS):** Database policies ensure users can only access their own data
3. **Input Validation:** All user inputs are validated and sanitized
4. **Prompt Injection Prevention:** Content sanitization on review endpoints
5. **Multi-Tenant Isolation:** Company data is isolated via RLS policies
6. **CORS:** Configured for production domain only

---

## Usage Tracking

All API actions are logged to the `usage_logs` table for analytics and billing:

- `action_type`: generate, analyze, custom_generate
- `tokens_used`: Claude API token count
- `model_used`: AI model identifier
- `metadata`: Additional context (template, risk score, etc.)

---

## Environment Variables Required

See `.env.example` for complete configuration. Key variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side service role key
- `ANTHROPIC_API_KEY` - Claude API key
- `FREE_TIER_DOCUMENT_LIMIT` - Free tier doc limit (default: 10)
- `FREE_TIER_ANALYSIS_LIMIT` - Free tier analysis limit (default: 5)
- `MAX_TOKENS_GENERATE` - Max tokens for generation (default: 4096)
- `MAX_TOKENS_ANALYZE` - Max tokens for analysis (default: 4096)
