# Incident Response Runbook - Luuc.ai

Operational runbook for diagnosing and resolving common production incidents.

---

## Table of Contents

1. [General Incident Protocol](#general-incident-protocol)
2. [Incident Severity Levels](#incident-severity-levels)
3. [Incident Scenarios](#incident-scenarios)
   - [API Down / High Error Rates](#api-down--high-error-rates)
   - [Authentication Failures](#authentication-failures)
   - [Claude API Issues](#claude-api-issues)
   - [Database Connection Issues](#database-connection-issues)
   - [Slow Performance / Timeouts](#slow-performance--timeouts)
   - [Data Loss / Corruption](#data-loss--corruption)
   - [Security Incident](#security-incident)
4. [Escalation Matrix](#escalation-matrix)
5. [Post-Incident Review](#post-incident-review)

---

## General Incident Protocol

### Step 1: Detect
Incidents may be detected via:
- Monitoring alerts (Vercel, Supabase, Sentry)
- User reports
- Team member observation

### Step 2: Assess
1. **Confirm the incident** (not a false alarm)
2. **Determine severity** (see Incident Severity Levels)
3. **Identify affected users/features**

### Step 3: Communicate
1. **Internal:**
   - Post in #incidents channel
   - Tag on-call engineer
   - Update status page if SEV-1 or SEV-2

2. **External (if SEV-1):**
   - Email affected users
   - Update public status page
   - Post on social media if needed

### Step 4: Mitigate
1. Follow relevant runbook section below
2. Document all actions taken
3. Keep team updated every 15-30 minutes

### Step 5: Resolve
1. Verify fix in production
2. Monitor for 30 minutes post-resolution
3. Mark incident as resolved
4. Schedule post-incident review

### Step 6: Learn
1. Conduct post-mortem within 48 hours
2. Document lessons learned
3. Create action items to prevent recurrence

---

## Incident Severity Levels

| Level | Impact | Response Time | Examples |
|-------|--------|---------------|----------|
| **SEV-1** | Complete outage, data loss | Immediate | Site down, database unreachable, mass data corruption |
| **SEV-2** | Major feature broken, many users affected | < 30 minutes | Auth broken, document generation failing for all users |
| **SEV-3** | Minor feature broken, some users affected | < 4 hours | Single template broken, UI bug, slow performance |
| **SEV-4** | Cosmetic issue, no user impact | < 24 hours | Typo in UI, minor styling issue |

---

## Incident Scenarios

### API Down / High Error Rates

**Symptoms:**
- 500 errors on API routes
- Vercel showing error spike
- Users reporting "something went wrong"

**Diagnostic Steps:**

1. **Check Vercel deployment status:**
   ```bash
   # Via Vercel Dashboard
   # Deployments > Check latest deployment state
   # Functions > Check error logs
   ```

2. **Check error logs:**
   ```bash
   # Vercel Dashboard > Logs
   # Filter by status code: 500
   # Look for error patterns
   ```

3. **Check recent deployments:**
   ```bash
   # Was there a recent deploy?
   # Deployments > Check timing of error spike vs deploy
   ```

4. **Check external services:**
   - Supabase status: [https://status.supabase.com](https://status.supabase.com)
   - Anthropic status: [https://status.anthropic.com](https://status.anthropic.com)

**Resolution Steps:**

**If caused by bad deployment:**
```bash
# Immediate rollback
1. Vercel Dashboard > Deployments
2. Find last working deployment (before error spike)
3. Click "..." > "Promote to Production"
4. Confirm rollback
5. Monitor error rate for 5 minutes
```

**If caused by external service outage:**
```bash
# Wait for service to recover
1. Post status update: "We're aware of an issue with [Service]. Monitoring."
2. Check service status page for updates
3. Consider temporary feature disablement if prolonged
```

**If caused by rate limiting:**
```bash
# Check Anthropic API usage
1. Anthropic Console > Usage
2. If over quota:
   a. Upgrade plan (immediate)
   b. OR disable generation temporarily
   c. OR implement queue system
```

**If unknown cause:**
```bash
# Systematic debug
1. Check environment variables in Vercel (not expired/changed)
2. Test API endpoints manually with curl
3. Check database connectivity (see Database section)
4. Review recent code changes for bugs
5. Enable verbose logging temporarily
```

**Post-Resolution:**
- [ ] Verify error rate returned to normal
- [ ] Check sample of user actions work
- [ ] Document root cause
- [ ] Create preventative action items

---

### Authentication Failures

**Symptoms:**
- Users can't log in
- "No autenticado" errors on all API calls
- Logged-in users suddenly logged out

**Diagnostic Steps:**

1. **Check Supabase Auth status:**
   ```bash
   # Supabase Dashboard > Authentication
   # Check if service is operational
   # Look for unusual activity
   ```

2. **Verify environment variables:**
   ```bash
   # Vercel Dashboard > Settings > Environment Variables
   # Verify NEXT_PUBLIC_SUPABASE_URL is correct
   # Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
   # Check if recently rotated
   ```

3. **Check Supabase redirect URLs:**
   ```bash
   # Supabase Dashboard > Authentication > URL Configuration
   # Verify Site URL: https://yourdomain.com
   # Verify Redirect URLs include: https://yourdomain.com/auth/callback
   ```

4. **Check browser console:**
   ```bash
   # Ask user to check browser console
   # Look for CORS errors
   # Look for "Invalid JWT" errors
   ```

**Resolution Steps:**

**If environment variables incorrect:**
```bash
1. Vercel Dashboard > Settings > Environment Variables
2. Update incorrect variables
3. Redeploy (env changes require redeploy)
4. Test authentication flow
```

**If redirect URLs misconfigured:**
```bash
1. Supabase Dashboard > Authentication > URL Configuration
2. Add missing redirect URLs
3. Save changes
4. Test authentication flow (no redeploy needed)
```

**If Supabase service outage:**
```bash
1. Check https://status.supabase.com
2. Post status update for users
3. Wait for service restoration
4. No action needed on our side
```

**If JWT expiration issue:**
```bash
# User sessions expired
1. This is expected behavior after 1 hour (default JWT expiry)
2. Ensure refresh token flow works (check code in lib/supabase)
3. If refresh broken, users need to re-login (temporary)
4. Fix refresh token handling in code
```

**If RLS policy issue:**
```bash
# Check if RLS policies blocking legitimate access
1. Supabase Dashboard > Authentication > Policies
2. Review policies on users table
3. Temporarily disable RLS to test (DANGER - only for diagnosis)
4. If RLS is the issue, fix policy logic
5. Re-enable RLS immediately
```

**Post-Resolution:**
- [ ] Verify login flow end-to-end
- [ ] Verify API calls work for authenticated users
- [ ] Check no users stuck in bad auth state
- [ ] Document cause and prevention

---

### Claude API Issues

**Symptoms:**
- Document generation fails
- Document review fails
- "Error generating document" messages
- Timeouts on generation

**Diagnostic Steps:**

1. **Check Anthropic API status:**
   - Visit: [https://status.anthropic.com](https://status.anthropic.com)
   - Check for reported outages

2. **Check API key validity:**
   ```bash
   # Test API key directly
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"Hi"}]}'

   # Should return Claude response
   # If 401: API key invalid
   # If 429: Rate limit exceeded
   # If 500: Anthropic service issue
   ```

3. **Check rate limits:**
   ```bash
   # Anthropic Console > Usage
   # Check tokens used vs quota
   # Check requests per minute
   ```

4. **Check logs for API errors:**
   ```bash
   # Vercel Dashboard > Logs
   # Search for: "Claude API" or "Anthropic"
   # Look for error codes: 401, 429, 500
   ```

**Resolution Steps:**

**If API key invalid (401):**
```bash
1. Anthropic Console > API Keys
2. Verify key is active (not revoked)
3. Generate new key if needed
4. Update Vercel environment variable: ANTHROPIC_API_KEY
5. Redeploy
```

**If rate limit exceeded (429):**
```bash
# Immediate:
1. Display user-friendly error: "High demand, try again in a few minutes"
2. Implement exponential backoff in code
3. Consider queueing requests

# Short-term:
1. Anthropic Console > Upgrade plan
2. Request higher rate limits

# Long-term:
1. Implement request throttling per user
2. Add request queue system
3. Cache common responses
```

**If Anthropic service outage (500):**
```bash
1. Check status page for ETA
2. Post status update: "AI service temporarily unavailable"
3. No action needed on our side
4. Wait for service restoration
5. Consider fallback to simpler generation for critical features
```

**If timeout issue:**
```bash
# If requests timing out (> 30 seconds)
1. Check prompt length (reduce if too long)
2. Check max_tokens setting (reduce from 4096 if needed)
3. Implement timeout handling in code
4. Consider async processing for large documents
```

**Post-Resolution:**
- [ ] Verify document generation works
- [ ] Verify document review works
- [ ] Check token usage is within limits
- [ ] Monitor for recurring issues

---

### Database Connection Issues

**Symptoms:**
- "Failed to connect to database"
- Supabase client errors
- Intermittent 500 errors
- Slow queries / timeouts

**Diagnostic Steps:**

1. **Check Supabase project status:**
   ```bash
   # Supabase Dashboard > Project
   # Check if project is paused (free tier auto-pauses after 1 week inactivity)
   # Check if project is active
   ```

2. **Check connection count:**
   ```bash
   # Supabase Dashboard > Database > Connection Pooling
   # Check active connections vs limit
   # Free tier: 60 connections
   # Pro tier: 200 connections
   ```

3. **Test database connectivity:**
   ```bash
   # Supabase Dashboard > SQL Editor
   # Run: SELECT 1;
   # Should return 1 immediately

   # OR test from local:
   psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" -c "SELECT 1"
   ```

4. **Check for long-running queries:**
   ```bash
   # Supabase Dashboard > SQL Editor
   SELECT pid, now() - query_start as duration, query
   FROM pg_stat_activity
   WHERE state = 'active' AND now() - query_start > interval '10 seconds'
   ORDER BY duration DESC;
   ```

**Resolution Steps:**

**If project paused (free tier):**
```bash
1. Supabase Dashboard > Project Settings
2. Click "Restore Project" or "Unpause"
3. Wait 1-2 minutes for restoration
4. Test connectivity
5. Consider upgrading to Pro to prevent auto-pause
```

**If connection limit reached:**
```bash
# Immediate:
1. Identify and kill stuck connections:
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND now() - state_change > interval '10 minutes';

# Short-term:
1. Review code for connection leaks (unclosed clients)
2. Implement connection pooling (Supabase Pro)

# Long-term:
1. Upgrade to Pro plan (higher limits + pooling)
2. Optimize query patterns
3. Use connection pooler mode
```

**If long-running queries:**
```bash
# Kill the query
SELECT pg_terminate_backend(PID_FROM_ABOVE_QUERY);

# Investigate query
1. Find the query in application code
2. Add indexes if missing
3. Optimize query logic
4. Consider pagination for large datasets
```

**If RLS performance issue:**
```bash
# RLS policies can slow queries if complex
1. Review RLS policies for affected table
2. Add indexes on columns used in RLS WHERE clauses
3. Simplify policy logic if possible
4. Consider denormalization for complex multi-join policies
```

**If general performance degradation:**
```bash
1. Check Supabase Dashboard > Reports > Performance
2. Identify slow queries
3. Run EXPLAIN ANALYZE on slow queries
4. Add missing indexes
5. Consider upgrading database size (Pro plan)
```

**Post-Resolution:**
- [ ] Verify database queries work
- [ ] Check connection count is stable
- [ ] Monitor query performance
- [ ] Document optimization done

---

### Slow Performance / Timeouts

**Symptoms:**
- Pages loading slowly (> 5 seconds)
- API responses slow (> 3 seconds)
- Vercel function timeouts (> 10 seconds)
- User complaints about slowness

**Diagnostic Steps:**

1. **Check Vercel Analytics:**
   ```bash
   # Vercel Dashboard > Analytics
   # Check Response Time graph
   # Identify which endpoints are slow
   # Check p50, p75, p99 latencies
   ```

2. **Check database performance:**
   ```bash
   # Supabase Dashboard > Reports > Performance
   # Check slow queries
   # Check database CPU usage
   # Check connection pool saturation
   ```

3. **Check external API latency:**
   ```bash
   # Test Claude API directly
   time curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"Hi"}]}'

   # Check time to first byte
   ```

4. **Profile specific slow page:**
   ```bash
   # Browser DevTools > Network tab
   # Load page
   # Identify slow resources
   # Check waterfall chart
   ```

**Resolution Steps:**

**If database queries slow:**
```bash
# Add indexes
CREATE INDEX idx_documents_user_created ON documents(user_id, created_at DESC);

# Optimize query
-- Before: SELECT * FROM documents
-- After: SELECT id, title, created_at FROM documents

# Use pagination
-- Add LIMIT and OFFSET to large queries

# Cache frequently accessed data
-- Implement Redis or in-memory cache
```

**If Claude API slow:**
```bash
# Reduce prompt size
-- Trim company context to most relevant docs only
-- Reduce max_tokens from 4096 to 2048 if acceptable

# Implement streaming (if supported)
-- Show partial results to user while generating

# Add loading states
-- Improve perceived performance with progress indicators
```

**If frontend bundle too large:**
```bash
# Check bundle size
npm run build
# Review output for large chunks

# Optimize
1. Lazy load routes with dynamic imports
2. Remove unused dependencies
3. Use code splitting
4. Optimize images (WebP, responsive sizes)
```

**If Vercel function timeout:**
```bash
# Increase timeout (Pro plan only)
1. vercel.json: { "functions": { "api/**": { "maxDuration": 30 } } }

# OR move long operations to background
1. Implement job queue (Vercel Cron + database queue table)
2. Return immediately with "Processing..." status
3. Poll for completion or use webhook
```

**Post-Resolution:**
- [ ] Verify performance improved (check metrics)
- [ ] Test user-reported slow operations
- [ ] Set up performance monitoring
- [ ] Document optimizations made

---

### Data Loss / Corruption

**Symptoms:**
- User reports missing documents
- Data doesn't match expected state
- Unexpected deletions
- Database integrity errors

**CRITICAL: Stop and assess before taking action**

**Diagnostic Steps:**

1. **Confirm the scope:**
   ```bash
   # How many users affected?
   # Which data is affected? (documents, companies, users)
   # When did it occur? (check created_at/updated_at timestamps)
   ```

2. **Check for accidental deletion:**
   ```bash
   # Check if data is actually gone or just hidden
   SELECT * FROM documents WHERE id = 'reported-missing-id';

   # Check soft-deletes (if implemented)
   # Check RLS policies (might be hiding data)
   ```

3. **Check recent deployments:**
   ```bash
   # Was there a deployment around the time of data loss?
   # Review code changes for accidental DELETE or UPDATE bugs
   ```

4. **Check logs:**
   ```bash
   # Vercel Logs > Search for DELETE or UPDATE operations
   # Look for unusual patterns
   ```

**Resolution Steps:**

**If data exists but hidden by RLS:**
```bash
# Check policies
SELECT * FROM pg_policies WHERE tablename = 'documents';

# If policy is wrong, fix it
-- DO NOT disable RLS globally
-- Fix the specific policy logic

# Data should become visible immediately
```

**If data actually deleted:**
```bash
# DO NOT PANIC
# DO NOT run any UPDATE or DELETE queries yet

# Option 1: Restore from backup (if recent backup exists)
1. Supabase Dashboard > Database > Backups
2. Note: Backup restores create NEW project (not in-place)
3. Extract missing data from backup project
4. Manually insert into production (after review)

# Option 2: Point-in-time recovery (Pro plan only)
1. Supabase Dashboard > Database > Backups > Point-in-time
2. Select timestamp before data loss
3. Restore to new project
4. Extract and verify data
5. Insert into production

# Option 3: Manual reconstruction
1. Check usage_logs table for metadata
2. Contact affected users for copies (if documents)
3. Reconstruct from any available sources
```

**If data corrupted:**
```bash
# Identify corruption
SELECT * FROM documents WHERE content IS NULL AND created_at > '2026-01-01';

# If repairable, write UPDATE script
-- Test on staging FIRST
UPDATE documents SET content = 'recovered-content' WHERE id = 'xxx';

# If not repairable, restore from backup
```

**Prevention:**
```bash
# Immediate:
1. Review DELETE/UPDATE code paths for bugs
2. Add additional confirmation prompts for destructive actions
3. Implement soft-deletes (deleted_at column instead of DELETE)

# Short-term:
1. Increase backup frequency
2. Enable point-in-time recovery (Pro plan)
3. Add pre-delete hooks for critical tables

# Long-term:
1. Implement audit logging (track all data changes)
2. Add data validation constraints
3. Implement data integrity checks
```

**Post-Resolution:**
- [ ] Verify data restored correctly
- [ ] Notify affected users
- [ ] Document root cause
- [ ] Implement prevention measures
- [ ] Test deletion flows thoroughly

---

### Security Incident

**Symptoms:**
- Suspicious login attempts
- Unauthorized data access
- Exposed API keys
- SQL injection attempts
- DDoS attack
- Data breach report

**CRITICAL: Follow security protocol immediately**

**Immediate Actions:**

1. **Assess severity:**
   - Is data currently being exfiltrated?
   - Are attackers actively in the system?
   - Has data been accessed/modified?

2. **Contain:**
   ```bash
   # If active attack:
   # Disable affected API endpoints (comment out in code, redeploy)
   # Revoke compromised API keys immediately
   # Lock affected user accounts

   # If API key exposed:
   1. Anthropic Console > Revoke key immediately
   2. Supabase Dashboard > API > Revoke service role key if exposed
   3. Generate new keys
   4. Update Vercel environment variables
   5. Redeploy
   ```

3. **Notify:**
   ```bash
   # Internal:
   - Alert security team immediately
   - Alert leadership
   - Document timeline

   # External (if data breach):
   - Notify affected users within 72 hours (GDPR requirement)
   - Notify authorities if required by law
   - Consider public disclosure
   ```

**Investigation:**

1. **Check auth logs:**
   ```bash
   # Supabase Dashboard > Authentication > Users
   # Look for suspicious accounts
   # Check login timestamps and IPs

   # Database query:
   SELECT * FROM auth.audit_log_entries
   WHERE created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

2. **Check database access:**
   ```bash
   # Check for unusual queries
   SELECT usename, query, query_start
   FROM pg_stat_activity
   WHERE usename NOT IN ('postgres', 'supabase_admin');

   # Check for data exfiltration
   -- Large SELECT queries
   -- Unusual table access patterns
   ```

3. **Check Vercel logs:**
   ```bash
   # Vercel Dashboard > Logs
   # Search for:
   # - 401/403 errors (failed auth attempts)
   # - SQL injection patterns (' OR '1'='1)
   # - Unusual API usage patterns
   # - High request rates from single IP
   ```

4. **Review code for vulnerabilities:**
   ```bash
   # Check for:
   # - SQL injection vulnerabilities (should use parameterized queries)
   # - XSS vulnerabilities (should sanitize user input)
   # - CSRF vulnerabilities (should use CSRF tokens)
   # - Exposed secrets in code (git history)
   ```

**Resolution:**

**If SQL injection:**
```bash
# Immediate:
1. Disable affected endpoint
2. Review query for vulnerability
3. Fix with parameterized queries (Supabase client already does this)
4. Redeploy

# Verify:
SELECT * FROM documents WHERE user_id = $1  -- Good (parameterized)
-- NOT: SELECT * FROM documents WHERE user_id = '${userId}'  -- Bad (injectable)
```

**If exposed API keys:**
```bash
1. Revoke all exposed keys immediately
2. Generate new keys
3. Update environment variables
4. Review git history for commits with secrets
5. If in git history: git filter-branch to remove (complex - seek help)
6. Force rotate all API keys as precaution
```

**If unauthorized access:**
```bash
1. Revoke affected user sessions:
   -- Supabase Dashboard > Authentication > Users > Revoke sessions

2. Force password reset for affected accounts

3. Review RLS policies for gaps:
   -- Ensure users can only access their own data
   -- Check for missing policies on new tables

4. Enable MFA for admin accounts (if available)
```

**If DDoS:**
```bash
# Vercel has automatic DDoS protection
# If overwhelming:
1. Contact Vercel support
2. Enable Cloudflare (additional layer)
3. Implement rate limiting per IP
4. Consider challenge-response (CAPTCHA)
```

**Post-Resolution:**
- [ ] All vulnerabilities patched
- [ ] All compromised keys rotated
- [ ] Affected users notified
- [ ] Security audit completed
- [ ] Post-mortem written
- [ ] Prevention measures implemented
- [ ] Compliance requirements met (GDPR, etc.)

---

## Escalation Matrix

| Incident Type | First Responder | Escalate After | Escalate To |
|---------------|----------------|----------------|-------------|
| SEV-4 (Minor) | Any developer | 4 hours if unresolved | Tech Lead |
| SEV-3 (Feature broken) | On-call engineer | 2 hours if unresolved | Tech Lead |
| SEV-2 (Major) | On-call engineer | 30 minutes if unresolved | Tech Lead + CTO |
| SEV-1 (Outage) | On-call engineer | Immediately | Tech Lead + CTO + CEO |
| Security | On-call engineer | Immediately | Security Lead + CTO + Legal |

**On-Call Schedule:**
- [Link to on-call calendar]
- Rotation: Weekly
- Backup: [Name/Contact]

**Contact Information:**
- On-Call Engineer: [Phone/Slack]
- Tech Lead: [Phone/Slack/Email]
- CTO: [Phone/Email]
- Security Lead: [Phone/Email]
- Legal: [Email]

---

## Post-Incident Review

**Timeline: Within 48 hours of resolution**

**Required Attendees:**
- Incident responders
- Tech Lead
- Product Manager (if user-facing)

**Agenda:**

1. **Timeline:**
   - When was incident detected?
   - Who detected it?
   - What actions were taken? (with timestamps)
   - When was it resolved?

2. **Root Cause:**
   - What caused the incident? (technical root cause)
   - Why did it happen? (5 whys analysis)
   - What could have prevented it?

3. **Impact:**
   - How many users affected?
   - What data/features were impacted?
   - What was the business impact?

4. **Response Quality:**
   - What went well?
   - What could be improved?
   - Were runbooks helpful?

5. **Action Items:**
   - Preventative measures (with owners and due dates)
   - Runbook updates needed
   - Monitoring/alerting improvements
   - Code changes required

**Post-Mortem Template:**

```markdown
# Incident Post-Mortem: [Title]

**Date:** 2026-01-29
**Severity:** SEV-X
**Duration:** X hours
**Responders:** [Names]

## Summary
[One paragraph: what happened, impact, resolution]

## Timeline
- 10:00 - Incident detected via [source]
- 10:05 - [Action taken]
- 10:15 - [Action taken]
- 11:00 - Incident resolved

## Root Cause
[Technical explanation of what caused the incident]

## Impact
- Users affected: X
- Features impacted: [List]
- Revenue impact: $X (if applicable)

## What Went Well
- [Positive aspect 1]
- [Positive aspect 2]

## What Could Be Improved
- [Improvement 1]
- [Improvement 2]

## Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

## Lessons Learned
[Key takeaways for the team]
```

---

**Last Updated:** 2026-01-29
**Maintained By:** DevOps Team
**Review Cycle:** Quarterly or after each SEV-1/SEV-2 incident
