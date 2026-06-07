# Staging Environment

## Setup

The `staging` branch deploys automatically to Vercel as a preview deployment.

### Vercel Configuration (do once in dashboard)

1. Go to **Vercel → Project Settings → Git**
2. Under "Preview Deployments", ensure the `staging` branch is included
3. Go to **Environment Variables** → set the same vars as production but optionally use test Stripe keys

### Workflow

```
feature branch → PR to staging → test on staging preview URL → PR to main → production
```

### Promoting to Production

```bash
git checkout main
git merge staging
git push origin main
```

### Keeping Staging Current

```bash
git checkout staging
git merge main
git push origin staging
```

## Current Staging URL

Check Vercel dashboard for the auto-generated preview URL for the `staging` branch.
The URL format is: `luuc-ai-git-staging-<team>.vercel.app`
