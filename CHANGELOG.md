# Changelog

All notable changes to Luuc.ai will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Updated documentation structure

## [0.2.0] - 2026-01-29

### Added
- GitHub Actions CI pipeline for automated testing on PR/push
  - ESLint code linting
  - TypeScript type checking
  - Vitest unit tests execution
  - Next.js build verification
- Comprehensive test suite with 64 passing tests
  - Validator tests (`__tests__/lib/validators.test.ts`)
  - Utility function tests (`__tests__/lib/utils.test.ts`)
  - Vitest configuration and setup
- Security hardening and audit infrastructure
  - Input validation library (`lib/validators.ts`)
  - Security headers in Next.js config
  - Row Level Security (RLS) policies for multi-tenant data isolation
  - SQL injection prevention patterns
  - XSS protection measures
- Error handling improvements
  - React Error Boundary component (`components/error-boundary.tsx`)
  - Structured logging utility (`lib/logger.ts`)
- Developer experience improvements
  - Pull request template (`.github/pull_request_template.md`)
  - Preview deployment workflow (`.github/workflows/preview-deploy.yml`)
  - ESLint configuration (`.eslintrc.json`)
  - Environment variables template (`.env.example`)
- Comprehensive documentation
  - CI/CD setup guide (`docs/CI_CD_SETUP.md`)
  - CI/CD workflow documentation (`docs/CI_CD_WORKFLOW.md`)
  - DevOps implementation summary (`docs/DEVOPS_IMPLEMENTATION_SUMMARY.md`)
  - Quick start guide (`docs/QUICK_START_DEVOPS.md`)
  - Action plan (`docs/Luuc.ai - Plan de Acción.md`)
- Security documentation
  - Security policy (`SECURITY.md`)
  - Security audit report (`SECURITY_AUDIT_REPORT.md`)
- Database improvements
  - Multi-tenant RLS fix script (`supabase/fix-rls-multi-tenant.sql`)

### Changed
- Updated `/api/review/route.ts` with improved error handling
- Enhanced Next.js configuration with security headers
- Updated Supabase client initialization with better error handling
- Improved package dependencies with security tools

### Fixed
- Fixed security vulnerabilities identified in audit
- Resolved ESLint warnings and errors
- Fixed TypeScript type errors across the codebase

## [0.1.1] - 2026-01-28

### Added
- SVG favicon (`app/icon.svg`) to resolve 404 errors
- Password visibility toggle to login and register forms
- Autocomplete attributes to all authentication form inputs
- Social proof statistics section on landing page
- Comprehensive footer with logo, legal links, contact info, and dynamic copyright
- Legal pages:
  - Terms of service (`app/terminos/page.tsx`)
  - Privacy policy (`app/privacidad/page.tsx`)

### Changed
- Improved hero section text wrapping (changed "IA" to "Inteligencia Artificial")
- Updated "Ver Demo" button to link to #features anchor
- Redirected CTA buttons from `/dashboard` to `/register`
- Enhanced auth card styling with `shadow-lg` for better visual depth
- Added visual grouping (sections) to registration form

### Fixed
- Favicon 404 error
- Hero text breaking issue on landing page
- Authentication form UX improvements
- Footer layout and information architecture

## [0.1.0] - 2026-01-28

### Added
- Initial release of Luuc.ai platform
- Next.js 14 application with TypeScript
- Supabase backend integration
  - PostgreSQL database with multi-tenant architecture
  - Row Level Security (RLS) policies
  - Authentication and user management
- Claude AI integration for document generation and review
- Core features:
  - Legal document generation from templates
  - Custom document generation with AI
  - Document review and risk analysis
  - Multi-tenant knowledge base system
  - Company configuration and management
  - User profile and security settings
- Authentication pages:
  - Login (`app/(auth)/login/page.tsx`)
  - Register (`app/(auth)/register/page.tsx`)
  - Forgot password (`app/(auth)/forgot-password/page.tsx`)
  - Reset password (`app/(auth)/reset-password/page.tsx`)
- Dashboard pages:
  - Main dashboard (`app/(dashboard)/dashboard/page.tsx`)
  - Document management (`app/(dashboard)/dashboard/documentos/page.tsx`)
  - Document generation (`app/(dashboard)/dashboard/redactar/`)
  - Document review (`app/(dashboard)/dashboard/revisar/page.tsx`)
  - Knowledge base (`app/(dashboard)/dashboard/knowledge-base/page.tsx`)
  - Configuration pages (profile, security, company, documents)
- API routes:
  - `/api/generate` - Template-based document generation
  - `/api/generate-custom` - Custom document generation
  - `/api/review` - Document review and risk analysis
  - `/api/documents` - Document CRUD operations
  - `/api/knowledge-base/*` - Knowledge base management
  - `/api/company/*` - Company settings and statistics
  - `/api/user/profile` - User profile management
- UI components:
  - Sidebar navigation
  - Template cards
  - File upload component
  - Risk analysis panel
  - Shadcn/ui component library integration
- Database schema:
  - Users and profiles
  - Companies and invitations
  - Documents and templates
  - Knowledge base with categories
  - Audit logs
- Utility libraries:
  - Supabase client and server utilities
  - Authentication helpers
  - Template definitions
  - Company management
  - Knowledge base operations
- Database setup scripts:
  - Schema application (`scripts/apply-schema.js`)
  - Migration runner (`scripts/run-migrations.js`)
  - Database verification (`scripts/verify-schema.js`)
  - API health checks (`scripts/check-supabase-api.js`)
- Database migrations:
  - Initial schema (`supabase/schema.sql`)
  - Companies table (`supabase/companies.sql`)
  - Knowledge base (`supabase/knowledge-base.sql`)
  - Schema fixes (v1, v2, v3)
- Documentation:
  - README with setup instructions
  - Production audit report (`PRODUCTION_AUDIT.md`)
  - MVP status tracking (`mvp-status.txt`)
- Development configuration:
  - TypeScript configuration
  - Tailwind CSS setup
  - PostCSS configuration
  - Next.js configuration
- Landing page with:
  - Hero section
  - Features showcase
  - Call-to-action sections

### Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **UI Components**: Shadcn/ui, Radix UI
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

[unreleased]: https://github.com/yourusername/luuc-ai/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourusername/luuc-ai/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/yourusername/luuc-ai/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/yourusername/luuc-ai/releases/tag/v0.1.0
