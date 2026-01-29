# Deployment Guide - Luuc.ai

Production deployment guide for Vercel + Supabase infrastructure.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Vercel Setup](#vercel-setup)
4. [Environment Variables](#environment-variables)
5. [Database Migration](#database-migration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedure](#rollback-procedure)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [SSL & Domain Configuration](#ssl--domain-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deployment, ensure you have:

- [ ] GitHub account with repository access
- [ ] Vercel account (free or pro)
- [ ] Supabase account (free or pro)
- [ ] Anthropic API key (Claude API access)
- [ ] Domain name (optional, for custom domain)
- [ ] Git installed locally
- [ ] Node.js 18+ installed locally
- [ ] Access to production secrets vault

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Name:** luuc-ai-production
   - **Database Password:** Use strong password (save to password manager)
   - **Region:** Choose closest to your users (e.g., us-east-1, sa-east-1)
   - **Pricing Plan:** Free (for testing) or Pro (for production)
4. Wait for project to initialize (2-5 minutes)

### Step 2: Configure Authentication

1. Navigate to **Authentication > Settings**
2. Configure email settings:
   - Enable email confirmations (recommended for production)
   - Set site URL: `https://yourdomain.com` or `https://your-project.vercel.app`
   - Add redirect URLs: `https://yourdomain.com/auth/callback`
3. Configure email templates (optional):
   - Customize confirmation email
   - Customize password reset email
4. Disable unused auth providers (keep Email enabled)

### Step 3: Retrieve API Credentials

1. Go to **Settings > API**
2. Copy the following (you'll need these for Vercel):
   - **Project URL:** `https://your-project-id.supabase.co`
   - **Anon/Public Key:** `eyJhbG...` (safe for client-side)
   - **Service Role Key:** `eyJhbG...` (NEVER expose to client - server only)

### Step 4: Run Database Migrations

Execute SQL migrations in order via **SQL Editor**:

1. **Base Schema:** Run `/supabase/schema.sql`
   - Creates users, documents, analyses, templates, usage_logs tables
   - Sets up RLS policies
   - Creates triggers and functions

2. **Companies & Multi-Tenant:** Run `/supabase/companies.sql`
   - Creates companies, company_documents tables
   - Adds company_id to users, documents, analyses
   - Sets up multi-tenant RLS policies

3. **Knowledge Base:** Run `/supabase/knowledge-base.sql`
   - Creates knowledge_base, knowledge_base_categories tables
   - Sets up full-text search indexes
   - Creates default categories trigger

Verify migrations:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- analyses
- companies
- company_documents
- documents
- knowledge_base
- knowledge_base_categories
- templates
- usage_logs
- users

### Step 5: Configure Database Settings

1. **Connection Pooling** (Pro plan only):
   - Navigate to **Settings > Database > Connection Pooling**
   - Enable pooling mode: Transaction
   - Use connection pooler for production

2. **Backups** (Pro plan):
   - Navigate to **Settings > Database > Backups**
   - Enable daily backups
   - Set retention period (7 days minimum)

---

## Vercel Setup

### Step 1: Import GitHub Repository

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `your-org/luuc-ai`
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### Step 2: Configure Build Settings

Before deploying, set these in Vercel project settings:

1. **Build & Development Settings:**
   - Node.js Version: `22.x` (or latest LTS)
   - Install Command: `npm install`
   - Build Command: `npm run build`

2. **Environment Variables** (see next section)

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build (3-5 minutes for first deploy)
3. Note your deployment URL: `https://your-project.vercel.app`

---

## Environment Variables

### Required Environment Variables

Set these in **Vercel > Project Settings > Environment Variables**:

#### Supabase (from Supabase dashboard)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Critical Security Note:**
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for anon key)
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - NEVER expose to client
- Rotate service role key immediately if compromised

#### Anthropic API (from Anthropic Console)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxx...
```

Get your key at: [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

#### Application Configuration
```bash
# Production URL (update after custom domain setup)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# App name (optional)
NEXT_PUBLIC_APP_NAME=Luuc.ai

# Rate limits (optional - defaults set in code)
FREE_TIER_DOCUMENT_LIMIT=10
FREE_TIER_ANALYSIS_LIMIT=5
MAX_TOKENS_GENERATE=4096
MAX_TOKENS_ANALYZE=4096

# Node environment (auto-set by Vercel)
NODE_ENV=production
```

### Setting Environment Variables in Vercel

1. Go to **Vercel Dashboard > Your Project > Settings > Environment Variables**
2. Add each variable:
   - **Key:** Variable name (e.g., `ANTHROPIC_API_KEY`)
   - **Value:** Secret value
   - **Environments:** Select Production, Preview, Development as needed
3. Click "Save"

**Best Practice:**
- Use different keys for Production vs Preview
- Never commit `.env` files to Git
- Use Vercel's secret encryption

### Environment Variable Precedence

1. Vercel dashboard (highest priority)
2. `.env.production` (not recommended - use Vercel UI)
3. `.env.local` (local development only - not deployed)
4. `.env.example` (template only - not loaded)

---

## Database Migration

### Initial Migration (First Deploy)

Already covered in Supabase Setup Step 4.

### Future Migrations

When adding new features that require schema changes:

1. **Create Migration File:**
   ```bash
   # Example: Adding a new column
   # Create file: supabase/migrations/002_add_feature.sql
   ```

2. **Test Locally:**
   ```bash
   # Test against local Supabase or staging
   psql $DATABASE_URL < supabase/migrations/002_add_feature.sql
   ```

3. **Deploy to Production:**
   - Run SQL via Supabase Dashboard > SQL Editor
   - OR use Supabase CLI (recommended for automation):
     ```bash
     supabase db push
     ```

4. **Verify Migration:**
   ```sql
   -- Check table structure
   \d+ table_name

   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

### Migration Checklist

- [ ] Migration tested on staging/development
- [ ] Backup created before migration
- [ ] RLS policies updated if needed
- [ ] Indexes added for new columns
- [ ] Triggers updated if needed
- [ ] API endpoints updated to use new schema
- [ ] Types updated in `types/index.ts`
- [ ] Rollback script prepared

---

## Post-Deployment Verification

### 1. Health Check

Visit these URLs to verify deployment:

```bash
# Landing page
curl https://your-project.vercel.app

# API health (should return HTML since no dedicated health endpoint)
curl https://your-project.vercel.app/api/documents
# Expected: {"success":false,"error":"No autenticado"} (401 is correct)
```

### 2. Authentication Flow

1. Navigate to `/login`
2. Register a new account
3. Check email for confirmation (if enabled)
4. Verify redirect to dashboard after login
5. Check Supabase Dashboard > Authentication > Users for new user

### 3. Core Functionality Tests

#### Test Document Generation

1. Log in to dashboard
2. Navigate to "Generar Documento"
3. Select a template (e.g., NDA)
4. Fill in variables
5. Click "Generar"
6. Verify document appears
7. Check Supabase > Table Editor > documents for new row

#### Test Document Review

1. Navigate to "Revisar Documento"
2. Upload a test PDF/DOCX
3. Click "Analizar"
4. Verify risk analysis appears
5. Check Supabase > Table Editor > analyses for new row

#### Test Company Setup

1. Navigate to "Empresa > Configuración"
2. Create a company
3. Upload a reference document
4. Verify document appears in company library

#### Test Knowledge Base

1. Navigate to "Empresa > Conocimiento"
2. Upload a document or paste text
3. Select category
4. Verify document appears in KB
5. Test search functionality

### 4. Database Verification

Run these queries in Supabase SQL Editor:

```sql
-- Check user creation
SELECT COUNT(*) FROM users;

-- Check documents created
SELECT COUNT(*) FROM documents;

-- Check companies created
SELECT COUNT(*) FROM companies;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'documents', 'companies');
-- All should have rowsecurity = true

-- Check usage logs
SELECT action_type, COUNT(*)
FROM usage_logs
GROUP BY action_type;
```

### 5. Performance Verification

```bash
# Check page load times
curl -w "@curl-format.txt" -o /dev/null -s https://your-project.vercel.app

# Create curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:  %{time_connect}\n
# time_starttransfer:  %{time_starttransfer}\n
# time_total:  %{time_total}\n
```

Expected metrics:
- Page load: < 2s
- API response: < 1s
- Database query: < 500ms

### 6. Security Verification

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No environment variables exposed in client bundle
  ```bash
  # Check bundle for secrets
  curl https://your-project.vercel.app/_next/static/chunks/pages/_app-*.js | grep -i "service_role"
  # Should return nothing
  ```
- [ ] RLS policies active (verified in step 4)
- [ ] CORS restricted (check browser network tab)
- [ ] CSP headers present (optional)

---

## Rollback Procedure

### Immediate Rollback (Vercel)

If deployment introduces critical bugs:

1. Go to **Vercel Dashboard > Deployments**
2. Find the last working deployment
3. Click "..." menu > "Promote to Production"
4. Confirm promotion
5. Old version is now live (1-2 minutes)

### Database Rollback

If migration causes issues:

1. **Restore from backup:**
   - Supabase Dashboard > Database > Backups
   - Select backup before migration
   - Click "Restore" (creates new project - update connection strings)

2. **Manual rollback (if no backup):**
   - Write reverse migration SQL
   - Example:
     ```sql
     -- If you added a column:
     ALTER TABLE documents DROP COLUMN new_column;

     -- If you added a table:
     DROP TABLE new_table CASCADE;
     ```

3. **Verify rollback:**
   ```sql
   SELECT * FROM information_schema.columns WHERE table_name = 'your_table';
   ```

### Rollback Checklist

- [ ] Identify deployment that introduced issue
- [ ] Notify team of rollback
- [ ] Execute Vercel rollback OR database restore
- [ ] Verify app is functional
- [ ] Review logs to identify root cause
- [ ] Create post-mortem document

---

## Monitoring & Alerts

### Vercel Analytics

1. Enable in **Vercel Dashboard > Analytics**
2. Monitor:
   - Page views
   - API response times
   - Error rates
   - Deployment frequency

### Supabase Monitoring

1. Navigate to **Supabase Dashboard > Reports**
2. Monitor:
   - Database size
   - Active connections
   - Query performance
   - API requests

### External Monitoring (Recommended)

Set up external monitoring for production:

1. **Uptime Monitoring:**
   - UptimeRobot (free): [https://uptimerobot.com](https://uptimerobot.com)
   - Monitor: `https://yourdomain.com`
   - Alert on downtime

2. **Error Tracking:**
   - Sentry (recommended): [https://sentry.io](https://sentry.io)
   - Install: `npm install @sentry/nextjs`
   - Configure in `sentry.client.config.js` and `sentry.server.config.js`

3. **Log Aggregation:**
   - Vercel Logs (built-in)
   - OR Logtail: [https://logtail.com](https://logtail.com)

### Alert Configuration

Set up alerts for:

- [ ] Site downtime (> 1 minute)
- [ ] API error rate > 5%
- [ ] Database CPU > 80%
- [ ] Database connections > 90% of limit
- [ ] Slow API responses (p95 > 2s)
- [ ] Failed deployments
- [ ] Anthropic API quota warnings

### Health Check Endpoint (Future Enhancement)

Create `/api/health` endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database connection
  // Check Claude API availability
  // Return 200 if healthy, 503 if not
}
```

---

## SSL & Domain Configuration

### Vercel Automatic SSL

Vercel provides automatic SSL for:
- `*.vercel.app` domains (free)
- Custom domains (free with automatic renewal)

### Custom Domain Setup

1. **Add Domain in Vercel:**
   - Vercel Dashboard > Project Settings > Domains
   - Add `yourdomain.com` and `www.yourdomain.com`

2. **Configure DNS:**
   - **Option A: Vercel DNS (Recommended):**
     - Point nameservers to Vercel
     - Vercel manages everything

   - **Option B: External DNS:**
     - Add A record: `@` → `76.76.21.21` (Vercel IP)
     - Add CNAME record: `www` → `cname.vercel-dns.com`

3. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

4. **Update Supabase Redirect URLs:**
   - Supabase Dashboard > Authentication > URL Configuration
   - Add `https://yourdomain.com` to Site URL
   - Add `https://yourdomain.com/auth/callback` to Redirect URLs

5. **Verify SSL:**
   ```bash
   curl -I https://yourdomain.com
   # Should return 200 with SSL certificate info
   ```

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Check package.json dependencies
npm install
npm run build
# If works locally, clear Vercel cache and redeploy
```

**Error: "Type error in .ts file"**
```bash
# Solution: Fix TypeScript errors
npm run type-check
# Fix errors before deploying
```

### Runtime Errors

**Error: "No autenticado" on all API calls**
- Check Supabase URL and anon key in Vercel env vars
- Verify user is logged in (check browser cookies)
- Check Supabase RLS policies are correct

**Error: "ANTHROPIC_API_KEY is not defined"**
- Add API key to Vercel environment variables
- Redeploy (env changes require redeploy)

**Error: "Failed to connect to database"**
- Check Supabase project is not paused (free tier auto-pauses)
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check database connection limit (upgrade if needed)

### Database Issues

**Error: "Too many connections"**
- Upgrade to Supabase Pro (connection pooling)
- OR reduce concurrent API calls
- Check for connection leaks in code

**Error: "Permission denied for table"**
- Check RLS policies
- Verify user has correct permissions
- Use service role key for admin operations (server-side only)

### Performance Issues

**Slow page loads**
- Check Vercel Analytics for bottlenecks
- Optimize images (use Next.js Image component)
- Enable caching headers
- Consider edge caching for static content

**Slow API responses**
- Check Supabase query performance
- Add database indexes for common queries
- Optimize Claude API prompts (reduce token count)
- Consider caching frequent queries

### Deployment Checklist (Pre-Launch)

- [ ] All environment variables set in Vercel
- [ ] Database migrations completed successfully
- [ ] Supabase RLS policies verified
- [ ] Authentication flow tested
- [ ] Core features tested (generate, review, KB)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Rollback procedure documented and tested
- [ ] Team notified of deployment
- [ ] Post-deployment verification completed

---

## Production Readiness Checklist

### Security
- [ ] All secrets stored in Vercel (not in code)
- [ ] SUPABASE_SERVICE_ROLE_KEY never exposed to client
- [ ] RLS enabled on all tables
- [ ] Input validation on all API endpoints
- [ ] HTTPS enforced
- [ ] CORS configured for production domain only

### Performance
- [ ] Database indexes optimized
- [ ] Connection pooling enabled (Pro plan)
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] API response time < 2s (p95)

### Reliability
- [ ] Automated backups enabled
- [ ] Uptime monitoring configured
- [ ] Error tracking configured
- [ ] Rollback procedure tested
- [ ] Incident response plan documented

### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent (if applicable)
- [ ] Data retention policy defined
- [ ] GDPR/CCPA compliance reviewed (if applicable)

---

## Post-Launch

### Week 1
- [ ] Monitor error rates daily
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address critical bugs immediately

### Month 1
- [ ] Review usage patterns
- [ ] Optimize bottlenecks
- [ ] Plan feature improvements
- [ ] Review and rotate API keys

### Ongoing
- [ ] Monthly security audits
- [ ] Quarterly dependency updates
- [ ] Regular backup testing
- [ ] Performance optimization

---

## Support Contacts

- **Vercel Support:** [https://vercel.com/support](https://vercel.com/support)
- **Supabase Support:** [https://supabase.com/support](https://supabase.com/support)
- **Anthropic Support:** [https://support.anthropic.com](https://support.anthropic.com)
- **Internal Team:** [Your team contact info]

---

**Last Updated:** 2026-01-29
**Maintained By:** DevOps Team
