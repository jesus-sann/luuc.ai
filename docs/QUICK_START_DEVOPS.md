# DevOps Quick Start Guide

## 🚀 Get Started in 5 Minutes

This is the TL;DR version. For full details, see [CI_CD_SETUP.md](./CI_CD_SETUP.md).

## Local Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Visual test UI
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues
npm run type-check       # TypeScript check

# CI Simulation
npm run ci               # Run all checks (like CI does)

# Build
npm run build            # Production build
npm start                # Run production build
```

## Before Pushing Code

```bash
# Quick check (30 seconds)
npm run lint && npm run type-check && npm test

# Full CI simulation (2-3 minutes)
npm run ci
```

## Writing Tests

### Basic Test Example
```typescript
// __tests__/lib/myFunction.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Component Test Example
```typescript
// __tests__/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent text="Hello" />);
    expect(screen.getByText('Hello')).toBeDefined();
  });
});
```

## Using Error Boundary

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      {/* Your components that might error */}
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

## Using Logger

```typescript
import { logger } from '@/lib/logger';

// Simple logging
logger.info('User action', { userId: '123', action: 'clicked_button' });
logger.error('API failed', { endpoint: '/api/data', error: err.message });

// Performance measurement
const data = await logger.measureAsync('fetchUserData', async () => {
  return await db.user.findUnique({ where: { id } });
});

// With context
const apiLogger = logger.child({ service: 'api', version: 'v1' });
apiLogger.info('Request received'); // Automatically includes context
```

## Deployment Checklist

### First Time Setup (Vercel)

1. **Connect GitHub repo to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Click "Deploy"

2. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Set for "Production" environment

3. **Enable Branch Protection**
   - GitHub repo > Settings > Branches
   - Add rule for `main`
   - Require status checks: `CI Status Check`
   - Require PR reviews

### Every Deployment

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write code + tests
3. Run local checks: `npm run ci`
4. Push: `git push origin feature/my-feature`
5. Open PR on GitHub
6. Wait for CI to pass ✅
7. Review preview deployment (Vercel posts link in PR)
8. Get PR approved
9. Merge to `main`
10. Auto-deploys to production 🎉

## Common Issues

### "Tests failing locally but not in CI"
- Check Node version: CI uses Node 20
- Check environment variables in `vitest.setup.ts`

### "Build fails with 'module not found'"
- Verify import paths use `@/` alias
- Check file casing (imports are case-sensitive)

### "ESLint errors"
```bash
# Auto-fix most issues
npm run lint:fix

# If you must disable a rule (rare)
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const data: any = {}; // TODO: Type this properly
```

### "TypeScript errors"
```bash
# Never do this (masks real issues)
// @ts-ignore

# Instead, fix the type or use with explanation
// @ts-expect-error - Legacy API returns wrong type, tracked in JIRA-123
const data = await legacyApi();
```

## File Structure

```
luuc-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Main CI pipeline
│       └── preview-deploy.yml        # PR deployment
├── __tests__/
│   ├── lib/
│   │   ├── utils.test.ts            # Utility tests
│   │   └── validators.test.ts       # Validator tests
│   └── components/
│       └── (your component tests)
├── components/
│   └── error-boundary.tsx            # Error boundary component
├── lib/
│   └── logger.ts                     # Logging utility
├── docs/
│   ├── CI_CD_SETUP.md               # Full documentation
│   └── QUICK_START_DEVOPS.md        # This file
├── .eslintrc.json                    # Linting config
├── vitest.config.ts                  # Test config
└── vitest.setup.ts                   # Test setup
```

## Metrics to Watch

### Test Coverage
- **Current:** Varies by module
- **Target:** 60% overall (set in vitest.config.ts)
- **View:** `npm run test:coverage` then open `coverage/index.html`

### CI Performance
- **Current:** ~2-3 minutes
- **Target:** < 5 minutes
- **View:** GitHub Actions tab

### Build Size
- **View:** Vercel deployment logs
- **Monitor:** Any sudden increases (>20%)

## Best Practices

### ✅ DO
- Write tests for new features
- Run `npm run ci` before pushing
- Keep PRs small and focused
- Add comments for complex logic
- Update tests when changing code

### ❌ DON'T
- Skip tests ("I'll add them later")
- Commit `console.log` statements
- Push directly to `main`
- Disable ESLint rules without good reason
- Use `any` type without justification

## Getting Help

1. Check [CI_CD_SETUP.md](./CI_CD_SETUP.md) for details
2. Review test examples in `__tests__/`
3. Check GitHub Actions logs for CI failures
4. Review Vercel deployment logs for build issues

## Next Steps

- [ ] Set up Vercel deployment
- [ ] Enable GitHub branch protection
- [ ] Add tests for new features
- [ ] Consider adding Sentry for error tracking
- [ ] Set up staging environment (optional)

---

**Pro Tip:** Run `npm run test:watch` in a separate terminal while developing. Tests will re-run automatically as you code!
