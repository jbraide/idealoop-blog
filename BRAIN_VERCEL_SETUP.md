# Vercel Integration Guide: Idealoop Blog & AI Agent

Follow these steps to deploy and automate your Idealoop blog platform.

## 1. Environment Variables
Add the following variables in your Vercel Project Settings (Settings > Environment Variables):

| Variable | Description | Example/Guidance |
|----------|-------------|------------------|
| `DATABASE_URL` | Your Supabase/PostgreSQL URL | `postgresql://...` |
| `DIRECT_URL` | Direct connection (for migrations) | `postgresql://...` |
| `DEEPSEEK_API_KEY` | Your DeepSeek API Key | `sk-...` |
| `NEXTAUTH_SECRET` | Secret for session encryption | Use a 32+ char random string |
| `CRON_SECRET` | Secret to protect the AI trigger | `dce903c05fd02587e2f74540f27d12a61b94a956de14e23e46067614003a7d19` |
| `NEXTAUTH_URL` | Your production domain | `https://blog.idealoop.ai` |

## 2. CI/CD Configuration (package.json)
We have already configured your `build` script to handle Prisma and Next.js 16 requirements:
```json
"build": "prisma generate && next build --webpack"
```

## 3. Creating the Cron Job
Vercel handles Cron jobs automatically via `vercel.json`. Create this file in your root directory:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-posts",
      "schedule": "0 0 * * *"
    }
  ]
}
```
*The above schedule (`0 16 * * *`) triggers the agent every day at 5:00 PM GMT+1 (4:00 PM UTC).*

## 4. Manual Trigger
To manually trigger the AI agent, make an authenticated GET request:
`https://your-domain.com/api/cron/generate-posts?secret=YOUR_CRON_SECRET`

## 5. Deployment
1. Connect your GitHub repository to Vercel.
2. Select the root directory.
3. Deploy.
4. **Important**: After deployment, run `npx prisma db push` (if using Supabase) to ensure the schema is synced.
