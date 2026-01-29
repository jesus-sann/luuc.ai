# CI/CD and DevOps Setup Guide

## Overview

This document describes the complete CI/CD pipeline and DevOps infrastructure for Luuc.ai. The setup is designed to be **production-ready from day one** while remaining practical and maintainable.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         GitHub                               │
│  ┌──────────────┐                  ┌──────────────┐         │
│  │  Pull Request │────────────────>│   CI Checks  │         │
│  └──────────────┘                  │              │         │
│                                     │ - Lint       │         │
│                                     │ - Type Check │         │
│                                     │ - Tests      │         │
│                                     │ - Build      │         │
│                                     └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ All checks pass
                              v
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Deployment)                       │
│  ┌──────────────┐          ┌──────────────┐                 │
│  │   Preview    │          │  Production  │                 │
│  │  (per PR)    │          │   (main)     │                 │
│  └──────────────┘          └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## What's Included

### 1. GitHub Actions Workflows

#### `.github/workflows/ci.yml`
**Triggers:** Push to `main`, Pull Requests to `main`

**Jobs:**
- **Lint & Type Check**: Ensures code quality
  - Runs ESLint
  - Runs TypeScript compiler in check mode

- **Test**: Runs unit tests
  - Executes Vitest test suite
  - Uploads coverage reports as artifacts

- **Build**: Validates production build
  - Builds Next.js application
  - Uses dummy env vars for CI (never exposes secrets)

- **CI Status**: Final check
  - Fails the pipeline if any job fails
  - Required for merge protection

**Performance:**
- Runs jobs in parallel where possible
- Uses npm cache for faster installs
- 10-15 minute timeout per job
- Cancels in-progress runs on new pushes

#### `.github/workflows/preview-deploy.yml`
**Triggers:** Pull Request opened/updated

**Purpose:**
- Posts deployment status comment on PRs
- Provides context about CI checks
- Works with Vercel's GitHub integration

**Note:** Actual deployment is handled by Vercel's native integration

### 2. Testing Infrastructure

#### Vitest Configuration
- **Framework:** Vitest (faster, modern alternative to Jest)
- **Environment:** jsdom (simulates browser environment)
- **Coverage:** v8 provider with 60% threshold
- **UI:** Vitest UI available for development

**Test Files:**
- `__tests__/lib/utils.test.ts`: Utility function tests
- `__tests__/lib/validators.test.ts`: Input validation tests (46 tests)

**Coverage Targets:**
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

### 3. Code Quality Tools

#### ESLint Configuration (`.eslintrc.json`)
- Extends Next.js recommended configs
- TypeScript-aware linting
- Custom rules:
  - Warns on `any` usage
  - Errors on unused variables (except `_` prefix)
  - Warns on `console.log` (allows `console.warn/error`)
  - Enforces `const` over `let` where possible

### 4. Error Tracking & Logging

#### Error Boundary (`components/error-boundary.tsx`)
**Features:**
- Catches React component errors
- Displays user-friendly error UI
- Logs errors via logger utility
- Shows stack traces in development
- Provides reset and reload actions

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Logger Utility (`lib/logger.ts`)
**Features:**
- Structured logging (JSON in production)
- Multiple log levels (debug, info, warn, error)
- Performance measurement helpers
- Child loggers with context
- Ready for Sentry/LogRocket integration

**Usage:**
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: '123' });
logger.error('Payment failed', { error, orderId: '456' });
logger.measureAsync('fetchData', async () => {
  // Your async operation
});
```

## Local Development

### Running Tests
```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Visual UI for debugging tests
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Code Quality Checks
```bash
# Lint code
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Type check
npm run type-check

# Run all CI checks locally
npm run ci
```

## Deployment Setup

### Vercel Configuration

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Environment Variables:**
   Set these in Vercel Dashboard (Settings > Environment Variables):

   **Production:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
   ANTHROPIC_API_KEY=your-prod-anthropic-key
   NEXT_PUBLIC_APP_URL=https://luuc.ai
   ```

   **Preview (optional - for preview deployments):**
   Use same variables but with staging/preview values

3. **Build Settings:**
   Vercel auto-configures:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

4. **Branch Protection:**
   In GitHub, protect `main` branch:
   - Go to Settings > Branches > Add rule
   - Require status checks to pass: `CI Status Check`
   - Require PR reviews before merging

### Vercel Preview Deployments

**Automatic Preview URLs:**
- Every PR gets a unique preview URL
- Updates automatically on new commits
- Perfect for stakeholder review
- No manual deployment needed

**Preview URL Format:**
```
https://luuc-ai-[hash]-[team].vercel.app
```

## What's NOT Included (Future Enhancements)

These require external services/accounts and should be added when needed:

### 1. Error Monitoring
**Recommended:** Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 2. Session Replay
**Recommended:** LogRocket
```bash
npm install logrocket
```

### 3. Performance Monitoring
**Options:**
- Sentry Performance
- Vercel Analytics (built-in)
- New Relic
- Datadog

### 4. End-to-End Testing
**Recommended:** Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

### 5. Staging Environment
**Setup:**
- Create separate Vercel project for staging
- Point to `staging` branch
- Use staging Supabase project
- Configure separate env vars

### 6. Database Migrations
**Recommended:** Supabase Migrations
- Use `supabase/migrations/` directory
- Run migrations via GitHub Actions
- Automate with `supabase db push`

## CI/CD Best Practices

### ✅ DO

1. **Always run CI on PRs** - Catch issues before merge
2. **Use branch protection** - Prevent direct pushes to main
3. **Keep CI fast** - Aim for < 10 minutes total
4. **Cache dependencies** - Use GitHub Actions cache
5. **Fail fast** - Run fastest checks first (lint, then test, then build)
6. **Review coverage reports** - Aim to increase over time
7. **Monitor CI costs** - GitHub Actions minutes are limited on free tier

### ❌ DON'T

1. **Don't skip tests** - They're there for a reason
2. **Don't commit secrets** - Use environment variables
3. **Don't merge failing PRs** - Fix the issue first
4. **Don't disable linting rules** - Fix the underlying issue
5. **Don't ignore TypeScript errors** - Use `@ts-expect-error` with comments only when absolutely necessary
6. **Don't make CI optional** - It defeats the purpose

## Monitoring CI/CD Health

### GitHub Actions
- Check workflow runs in Actions tab
- Review failed jobs immediately
- Monitor run duration trends

### Vercel
- Check deployment logs in Vercel dashboard
- Monitor build times
- Review failed deployments

### Test Coverage
- Review coverage report after each run
- Aim for gradual improvement
- Focus on critical paths first

## Troubleshooting

### CI Failing on Lint
```bash
# Locally reproduce the issue
npm run lint

# Auto-fix if possible
npm run lint:fix

# If unfixable, update ESLint config or fix code
```

### CI Failing on Type Check
```bash
# Locally reproduce
npm run type-check

# Fix TypeScript errors
# Don't use 'any' - fix the types properly
```

### CI Failing on Tests
```bash
# Run tests locally
npm test

# Run in watch mode to debug
npm run test:watch

# Check specific test file
npm test __tests__/lib/utils.test.ts
```

### CI Failing on Build
```bash
# Build locally
npm run build

# Check for missing env vars
# Verify imports are correct
# Look for Next.js-specific issues
```

### Vercel Deployment Failing
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check for build-time errors
4. Verify dependencies are in `package.json`

## Performance Benchmarks

**Current CI Pipeline:**
- Lint + Type Check: ~30s
- Tests: ~45s
- Build: ~60s
- **Total: ~2-3 minutes**

**Target:**
- Keep total time under 5 minutes
- Monitor trends over time
- Optimize slow tests

## Security Considerations

### Secrets Management
- ✅ Never commit `.env.local` files
- ✅ Use Vercel environment variables for production
- ✅ Use GitHub Secrets for CI if needed
- ✅ Rotate secrets regularly (every 90 days)

### Dependency Security
```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# For breaking changes
npm audit fix --force
```

### Build Security
- CI uses dummy env vars (no real secrets)
- Production builds happen in Vercel (secure environment)
- No secrets are logged or exposed

## Next Steps

1. **Enable branch protection** on GitHub
2. **Connect Vercel** to your repository
3. **Set environment variables** in Vercel
4. **Create first PR** to test the pipeline
5. **Add more tests** as you build features
6. **Monitor CI performance** and optimize as needed

## Support & Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Vitest Docs](https://vitest.dev)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** 2026-01-29
**Maintained By:** DevOps Team
