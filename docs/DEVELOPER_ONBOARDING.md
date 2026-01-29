# Developer Onboarding Guide - Luuc.ai

Welcome to the Luuc.ai development team. This guide will help you set up your local environment and understand the project structure.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Coding Conventions](#coding-conventions)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Debugging](#debugging)
9. [Resources](#resources)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js:** v18.0.0 or higher (v22.x recommended)
  ```bash
  node --version  # Should be 18+
  ```
  Download: [https://nodejs.org](https://nodejs.org)

- **npm:** v9.0.0 or higher (comes with Node.js)
  ```bash
  npm --version
  ```

- **Git:** Latest version
  ```bash
  git --version
  ```
  Download: [https://git-scm.com](https://git-scm.com)

- **VS Code:** (Recommended) or your preferred editor
  Download: [https://code.visualstudio.com](https://code.visualstudio.com)

### Recommended VS Code Extensions

Install these for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### Accounts & Access

You'll need access to:

1. **GitHub Repository**
   - Request access from team lead
   - Set up SSH keys: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

2. **Supabase Project** (Development/Staging)
   - Request invitation from project admin
   - You'll receive email with project access

3. **Anthropic API Key** (Development)
   - Team lead will provide a shared development key
   - OR create your own: [Anthropic Console](https://console.anthropic.com)

4. **Team Communication**
   - Slack/Discord channel invitation
   - Calendar access for standups

---

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone via SSH (recommended)
git clone git@github.com:your-org/luuc-ai.git

# OR via HTTPS
git clone https://github.com/your-org/luuc-ai.git

# Navigate to project
cd luuc-ai
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Next.js 14
# - React 18
# - Supabase client
# - Anthropic SDK
# - Tailwind CSS
# - Testing libraries
# - Development tools (ESLint, TypeScript, etc.)
```

### Step 3: Set Up Environment Variables

1. **Copy example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your credentials:**
   ```bash
   # Use your preferred editor
   code .env.local
   # OR
   nano .env.local
   ```

3. **Fill in the values:**
   ```bash
   # ===========================================
   # SUPABASE (Get from Supabase Dashboard)
   # ===========================================
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # ===========================================
   # ANTHROPIC (Get from team or create your own)
   # ===========================================
   ANTHROPIC_API_KEY=sk-ant-api03-xxxx...

   # ===========================================
   # APP CONFIG
   # ===========================================
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Luuc.ai

   # ===========================================
   # LIMITS (Optional - defaults in code)
   # ===========================================
   FREE_TIER_DOCUMENT_LIMIT=10
   FREE_TIER_ANALYSIS_LIMIT=5
   MAX_TOKENS_GENERATE=4096
   MAX_TOKENS_ANALYZE=4096
   ```

4. **Get Supabase Credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select development project
   - Navigate to Settings > API
   - Copy URL, Anon Key, and Service Role Key

5. **Security Check:**
   ```bash
   # Verify .env.local is in .gitignore (it should be)
   grep -q ".env.local" .gitignore && echo "Safe" || echo "WARNING: Add .env.local to .gitignore"
   ```

### Step 4: Set Up Local Database

You have two options:

#### Option A: Use Shared Development Supabase (Recommended)

- Use the team's development Supabase project
- Already configured with schema and test data
- Get credentials from team lead

#### Option B: Create Your Own Supabase Project (Advanced)

1. Create new project on Supabase
2. Run migrations in order:
   ```sql
   -- In Supabase SQL Editor, run each file:
   -- 1. supabase/schema.sql
   -- 2. supabase/companies.sql
   -- 3. supabase/knowledge-base.sql
   ```
3. Update `.env.local` with your project credentials

### Step 5: Verify Setup

```bash
# Run type check
npm run type-check

# Run linter
npm run lint

# Run tests
npm test
```

All commands should complete without errors.

### Step 6: Start Development Server

```bash
npm run dev
```

Expected output:
```
> luuc-ai@0.1.0 dev
> next dev

   ▲ Next.js 14.2.7
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.1s
```

### Step 7: Verify Application

1. **Open browser:** http://localhost:3000
2. **You should see:** Luuc.ai landing page
3. **Test authentication:**
   - Click "Iniciar Sesión"
   - Try logging in with test account (or create new one)
4. **Test core features:**
   - Generate a document
   - Review a document (upload test PDF)
   - Navigate dashboard

**Congratulations! Your development environment is ready.**

---

## Project Structure

```
luuc-ai/
│
├── .github/                      # GitHub Actions CI/CD
│   └── workflows/
│       └── ci.yml                # CI pipeline (lint, test, build)
│
├── .next/                        # Next.js build output (git-ignored)
├── node_modules/                 # Dependencies (git-ignored)
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (grouped)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (dashboard)/              # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── generar/
│   │       ├── personalizado/
│   │       ├── revisar/
│   │       ├── documentos/
│   │       ├── empresa/
│   │       └── perfil/
│   │
│   ├── api/                      # API routes (backend)
│   │   ├── generate/route.ts
│   │   ├── review/route.ts
│   │   ├── documents/route.ts
│   │   ├── user/profile/route.ts
│   │   ├── company/
│   │   └── knowledge-base/
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── error-boundary.tsx
│   ├── file-upload.tsx
│   ├── risk-panel.tsx
│   ├── sidebar.tsx
│   └── template-card.tsx
│
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication helpers
│   ├── claude.ts                 # Claude API integration
│   ├── company.ts                # Company operations
│   ├── knowledge-base.ts         # Knowledge base operations
│   ├── supabase.ts               # Database helpers
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── templates.ts              # Document templates
│   ├── utils.ts                  # General utilities
│   ├── validators.ts             # Input validation
│   └── logger.ts                 # Logging utilities
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All app types
│
├── supabase/                     # Database migrations
│   ├── schema.sql                # Base schema
│   ├── companies.sql             # Multi-tenant schema
│   └── knowledge-base.sql        # Knowledge base schema
│
├── public/                       # Static assets
│   ├── favicon.ico
│   └── images/
│
├── tests/                        # Test files (*.test.ts)
│   └── (mirrors app structure)
│
├── docs/                         # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPER_ONBOARDING.md
│   └── INCIDENT_RESPONSE.md
│
├── .env.example                  # Environment variables template
├── .env.local                    # Your local env vars (git-ignored)
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest test configuration
├── README.md                     # Project overview
└── CHANGELOG.md                  # Version history
```

### Key Directories Explained

- **`app/`**: Next.js 14 App Router - all pages and API routes
- **`components/`**: Reusable React components
- **`lib/`**: Business logic, database operations, external API integrations
- **`types/`**: TypeScript type definitions for type safety
- **`supabase/`**: SQL migration files for database schema
- **`docs/`**: Project documentation (you're reading it!)

---

## Development Workflow

### Daily Workflow

1. **Start your day:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # OR
   git checkout -b fix/bug-description
   ```

3. **Make changes:**
   - Edit code in your editor
   - Save files (dev server auto-reloads)

4. **Test locally:**
   ```bash
   npm run dev          # Test in browser
   npm run type-check   # Check TypeScript
   npm run lint         # Check code style
   npm test             # Run tests
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add user profile editing"
   # OR
   git commit -m "fix: resolve document generation error"
   ```

   **Commit Message Format:**
   ```
   type: short description

   Optional longer description

   Types: feat, fix, docs, style, refactor, test, chore
   ```

6. **Push to GitHub:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request:**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Fill in PR template
   - Request review from team

8. **Address review feedback:**
   ```bash
   # Make changes based on feedback
   git add .
   git commit -m "refactor: address PR feedback"
   git push origin feature/your-feature-name
   ```

9. **Merge:**
   - After approval, merge via GitHub UI
   - Delete feature branch

### Branch Strategy

- **`main`**: Production-ready code
- **`feature/*`**: New features
- **`fix/*`**: Bug fixes
- **`refactor/*`**: Code refactoring
- **`docs/*`**: Documentation updates

### Code Review Checklist

Before submitting PR:
- [ ] Code follows project conventions
- [ ] TypeScript types are correct
- [ ] No ESLint errors
- [ ] Tests pass
- [ ] Tested locally
- [ ] Environment variables documented (if new)
- [ ] Comments added for complex logic
- [ ] No console.logs in production code
- [ ] No hardcoded secrets

---

## Coding Conventions

### TypeScript

**Always use types:**
```typescript
// Good
function getUserById(id: string): Promise<User | null> {
  return supabaseAdmin.from('users').select('*').eq('id', id).single();
}

// Bad
function getUserById(id) {
  return supabaseAdmin.from('users').select('*').eq('id', id).single();
}
```

**Use interfaces for objects:**
```typescript
// Good
interface CreateDocumentParams {
  title: string;
  content: string;
  userId: string;
}

// Use it
function createDocument(params: CreateDocumentParams) { }
```

### React Components

**Use functional components with hooks:**
```typescript
// Good
export function DocumentCard({ document }: { document: Document }) {
  const [isLoading, setIsLoading] = useState(false);

  return <div>{document.title}</div>;
}

// Avoid class components
```

**Server Components by default:**
```typescript
// app/dashboard/page.tsx
// This is a Server Component by default
export default async function DashboardPage() {
  const user = await getCurrentUser(); // Server-side data fetch
  return <div>Hello {user.name}</div>;
}
```

**Client Components when needed:**
```typescript
// components/interactive-button.tsx
'use client'; // Mark as Client Component

import { useState } from 'react';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Naming Conventions

- **Files:** `kebab-case.tsx` (e.g., `document-card.tsx`)
- **Components:** `PascalCase` (e.g., `DocumentCard`)
- **Functions:** `camelCase` (e.g., `getUserById`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- **Interfaces/Types:** `PascalCase` (e.g., `User`, `DocumentType`)

### Code Style

**Use the configured ESLint/Prettier:**
```bash
# Auto-fix style issues
npm run lint:fix
```

**Import order:**
```typescript
// 1. External libraries
import { useState } from 'react';
import { NextRequest } from 'next/server';

// 2. Internal libraries
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// 3. Types
import type { User, Document } from '@/types';

// 4. Components
import { Button } from '@/components/ui/button';
```

### Error Handling

**Always handle errors:**
```typescript
// Good
try {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  // ... rest of logic
} catch (error) {
  console.error('Error in API route:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Use proper HTTP status codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (logged in but not allowed)
- `404` - Not Found
- `500` - Internal Server Error

### Security Best Practices

**Never expose secrets:**
```typescript
// Good
const apiKey = process.env.ANTHROPIC_API_KEY;

// Bad - NEVER hardcode
const apiKey = 'sk-ant-api03-xxx';
```

**Always validate user input:**
```typescript
import { validateAnalysisContent } from '@/lib/validators';

const validation = validateAnalysisContent(userInput);
if (!validation.valid) {
  return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
}
const sanitized = validation.sanitized;
```

**Use RLS policies (don't bypass in code):**
```typescript
// Good - RLS enforced
const { data } = await supabase.from('documents').select('*');

// Avoid - Only use supabaseAdmin when necessary (server-side admin operations)
const { data } = await supabaseAdmin.from('documents').select('*');
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (interactive)
npm run test:ui
```

### Writing Tests

**Test file location:**
- Tests go in `tests/` directory
- Mirror the app structure
- Name files: `*.test.ts` or `*.test.tsx`

**Example test:**
```typescript
// tests/lib/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validateFilename } from '@/lib/validators';

describe('validateFilename', () => {
  it('should accept valid filenames', () => {
    const result = validateFilename('document.pdf');
    expect(result.valid).toBe(true);
  });

  it('should reject path traversal attempts', () => {
    const result = validateFilename('../../../etc/passwd');
    expect(result.valid).toBe(false);
  });

  it('should sanitize filename', () => {
    const result = validateFilename('my document<script>.pdf');
    expect(result.sanitized).toBe('my-document-script.pdf');
  });
});
```

### Test Coverage Goals

- **Critical paths:** 80%+ coverage
- **Utilities/validators:** 90%+ coverage
- **UI components:** 60%+ coverage (integration tests more important)

---

## Common Tasks

### Adding a New API Endpoint

1. **Create route file:**
   ```bash
   # Create directory if needed
   mkdir -p app/api/my-feature
   touch app/api/my-feature/route.ts
   ```

2. **Implement endpoint:**
   ```typescript
   // app/api/my-feature/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { getCurrentUser } from '@/lib/auth';
   import { ApiResponse } from '@/types';

   export async function GET(request: NextRequest) {
     try {
       const user = await getCurrentUser();
       if (!user) {
         return NextResponse.json<ApiResponse<null>>(
           { success: false, error: 'Unauthorized' },
           { status: 401 }
         );
       }

       // Your logic here
       return NextResponse.json<ApiResponse<YourType>>({
         success: true,
         data: yourData,
       });
     } catch (error) {
       console.error('Error:', error);
       return NextResponse.json<ApiResponse<null>>(
         { success: false, error: 'Internal error' },
         { status: 500 }
       );
     }
   }
   ```

3. **Test endpoint:**
   ```bash
   # Start dev server
   npm run dev

   # Test with curl
   curl http://localhost:3000/api/my-feature
   ```

4. **Document in API_DOCUMENTATION.md**

### Adding a New Database Table

1. **Create migration file:**
   ```bash
   touch supabase/migrations/004_my_table.sql
   ```

2. **Write migration:**
   ```sql
   -- supabase/migrations/004_my_table.sql
   BEGIN;

   CREATE TABLE IF NOT EXISTS public.my_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
     -- ... your columns
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Add indexes
   CREATE INDEX idx_my_table_user_id ON public.my_table(user_id);

   -- Enable RLS
   ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own rows"
     ON public.my_table FOR SELECT
     USING (auth.uid() = user_id);

   COMMIT;
   ```

3. **Run migration:**
   - Supabase Dashboard > SQL Editor
   - Paste and run migration

4. **Add TypeScript types:**
   ```typescript
   // types/index.ts
   export interface MyTable {
     id: string;
     user_id: string;
     // ... your fields
     created_at: string;
   }
   ```

5. **Document in ARCHITECTURE.md ERD section**

### Adding a New UI Component

1. **Create component file:**
   ```bash
   touch components/my-component.tsx
   ```

2. **Implement component:**
   ```typescript
   // components/my-component.tsx
   'use client'; // If needs client-side features

   import { Button } from '@/components/ui/button';

   interface MyComponentProps {
     title: string;
     onAction: () => void;
   }

   export function MyComponent({ title, onAction }: MyComponentProps) {
     return (
       <div>
         <h2>{title}</h2>
         <Button onClick={onAction}>Click me</Button>
       </div>
     );
   }
   ```

3. **Use component:**
   ```typescript
   // app/dashboard/page.tsx
   import { MyComponent } from '@/components/my-component';

   export default function DashboardPage() {
     return <MyComponent title="Hello" onAction={() => console.log('clicked')} />;
   }
   ```

---

## Debugging

### Browser DevTools

**React DevTools:**
- Install: [React DevTools Extension](https://react.dev/learn/react-developer-tools)
- Inspect component props, state, hooks

**Network Tab:**
- Monitor API calls
- Check request/response payloads
- Verify authentication headers

**Console:**
- View `console.log` output
- Check for errors

### VS Code Debugging

**Launch configuration:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging

**Use structured logging:**
```typescript
import { logger } from '@/lib/logger';

logger.info('Document generated', { documentId, userId });
logger.error('Failed to save document', { error, userId });
```

**Check Vercel logs (production):**
- Vercel Dashboard > Project > Logs
- Filter by function, status code, or search

### Common Issues

**Issue: "Module not found: Can't resolve '@/...'"**
```bash
# Solution: Check tsconfig.json paths are correct
# Restart dev server
```

**Issue: "Hydration failed"**
```bash
# Solution: Server and client rendered different HTML
# Check for:
# - localStorage/window usage in Server Component
# - Mismatched HTML structure
# - Date formatting (timezone issues)
```

**Issue: "Failed to fetch" in API call**
```bash
# Solution:
# - Check API route exists
# - Check authentication (user logged in?)
# - Check browser network tab for error details
```

---

## Resources

### Official Documentation

- **Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **React:** [https://react.dev](https://react.dev)
- **Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Anthropic Claude:** [https://docs.anthropic.com](https://docs.anthropic.com)
- **Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **TypeScript:** [https://www.typescriptlang.org/docs](https://www.typescriptlang.org/docs)

### Internal Documentation

- **API Documentation:** `/docs/API_DOCUMENTATION.md`
- **Architecture:** `/docs/ARCHITECTURE.md`
- **Deployment:** `/docs/DEPLOYMENT.md`
- **Incident Response:** `/docs/INCIDENT_RESPONSE.md`

### Learning Resources

- **Next.js Tutorial:** [https://nextjs.org/learn](https://nextjs.org/learn)
- **React Server Components:** [https://nextjs.org/docs/app/building-your-application/rendering/server-components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- **Supabase Quickstart:** [https://supabase.com/docs/guides/getting-started/quickstarts/nextjs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Team Resources

- **Slack/Discord:** [Link to team chat]
- **Notion/Confluence:** [Link to team wiki]
- **Figma Designs:** [Link to design files]
- **GitHub Issues:** [Link to project board]

---

## Getting Help

### Before Asking

1. **Check documentation** (this guide, API docs, architecture docs)
2. **Search existing issues** on GitHub
3. **Google the error message**
4. **Check official docs** for the relevant library

### How to Ask for Help

1. **Describe the problem clearly:**
   - What are you trying to do?
   - What did you expect to happen?
   - What actually happened?

2. **Provide context:**
   - Error messages (full stack trace)
   - Code snippet (minimal reproducible example)
   - Environment (local dev, staging, production)
   - Steps to reproduce

3. **What you've tried:**
   - List debugging steps you've taken
   - Show research you've done

4. **Ask in the right place:**
   - Quick questions: Team chat
   - Complex issues: GitHub issue
   - Urgent/blocking: Tag team lead

### Onboarding Checklist

- [ ] Installed prerequisites (Node, Git, VS Code)
- [ ] Cloned repository
- [ ] Installed dependencies
- [ ] Set up environment variables
- [ ] Connected to development database
- [ ] Started dev server successfully
- [ ] Logged in and tested core features
- [ ] Read project documentation
- [ ] Joined team communication channels
- [ ] Introduced yourself to the team
- [ ] Asked questions and clarified doubts
- [ ] Made first small contribution (fix typo, update docs)

**Welcome aboard! Happy coding!**

---

**Last Updated:** 2026-01-29
**Maintained By:** Development Team
