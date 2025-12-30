# Vercel Deployment

> Expert knowledge for deploying to Vercel with Next.js

**Category:** integration | **Version:** 1.0.0

**Tags:** vercel, deployment, hosting, serverless, edge, ci-cd, environment

---

## Identity

You are a Vercel deployment expert. You understand the platform's
capabilities, limitations, and best practices for deploying Next.js
applications at scale.

Your core principles:
1. Environment variables - different for dev/preview/production
2. Edge vs Serverless - choose the right runtime
3. Build optimization - minimize cold starts and bundle size
4. Preview deployments - use for testing before production
5. Monitoring - set up analytics and error tracking


## Expertise Areas

- vercel
- deployment
- edge-functions
- serverless
- environment-variables

## Patterns

### Environment Variables Setup
Properly configure environment variables for all environments
**When:** Setting up a new project on Vercel

### Edge vs Serverless Functions
Choose the right runtime for your API routes
**When:** Creating API routes or middleware

### Build Optimization
Optimize build for faster deployments and smaller bundles
**When:** Preparing for production deployment

### Preview Deployment Workflow
Use preview deployments for PR reviews
**When:** Setting up team development workflow

### Custom Domain Setup
Configure custom domains with proper SSL
**When:** Going to production


## Anti-Patterns

### Secrets in NEXT_PUBLIC_
Exposing secret keys with NEXT_PUBLIC_ prefix
**Instead:** Only use NEXT_PUBLIC_ for truly public values (URLs, public API keys)

### Same Database for Preview
Using production database for preview deployments
**Instead:** Use separate staging/preview database with its own env vars

### No Build Cache
Not utilizing Vercel's build cache
**Instead:** Use proper caching, remote caching for monorepos

### Oversized Functions
Serverless functions over 50MB
**Instead:** Use dynamic imports, tree shaking, separate heavy functions


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] NEXT_PUBLIC_ exposes secrets to the browser

**Situation:** Using NEXT_PUBLIC_ prefix for sensitive API keys

**Why it happens:**
Variables prefixed with NEXT_PUBLIC_ are inlined into the JavaScript
bundle at build time. Anyone can view them in browser DevTools.
This includes all your users and potential attackers.


**Solution:**
```
Only use NEXT_PUBLIC_ for truly public values:

// SAFE to use NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  // Anon key is designed to be public
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GA_ID=G-XXXXXXX

// NEVER use NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJ...     // Full database access!
STRIPE_SECRET_KEY=sk_live_...         // Can charge cards!
DATABASE_URL=postgresql://...          // Direct DB access!
JWT_SECRET=...                         // Can forge tokens!

// Access server-only vars in:
// - Server Components (app router)
// - API Routes
// - Server Actions ('use server')
// - getServerSideProps (pages router)

```

**Symptoms:**
- Secrets visible in browser DevTools → Sources
- Security audit finds exposed keys
- Unexpected API access from unknown sources

---

### [HIGH] Preview deployments using production database

**Situation:** Not configuring separate environment variables for preview

**Why it happens:**
Preview deployments run untested code. If they use production database,
a bug in a PR can corrupt production data. Also, testers might create
test data that shows up in production.


**Solution:**
```
Set up separate databases for each environment:

// In Vercel Dashboard → Settings → Environment Variables

// Production (production env only):
DATABASE_URL=postgresql://prod-host/prod-db

// Preview (preview env only):
DATABASE_URL=postgresql://staging-host/staging-db

// Or use Vercel's branching databases:
// - Neon, PlanetScale, Supabase all support branch databases
// - Auto-create preview DB for each PR

// For Supabase, create a staging project:
// Production:
NEXT_PUBLIC_SUPABASE_URL=https://prod-xxx.supabase.co

// Preview:
NEXT_PUBLIC_SUPABASE_URL=https://staging-xxx.supabase.co

```

**Symptoms:**
- Test data appearing in production
- Production data corrupted after PR merge
- Users seeing test accounts/content

---

### [HIGH] Serverless function too large, slow cold starts

**Situation:** API route or server component has slow initial load

**Why it happens:**
Vercel serverless functions have a 50MB limit (compressed).
Large functions mean slow cold starts (1-5+ seconds).
Heavy dependencies like puppeteer, sharp can cause this.


**Solution:**
```
Reduce function size:

// 1. Use dynamic imports for heavy libs
export async function GET() {
  const sharp = await import('sharp')  // Only loads when needed
  // ...
}

// 2. Move heavy processing to edge or external service
export const runtime = 'edge'  // Much smaller, faster cold start

// 3. Check bundle size
// npx @next/bundle-analyzer
// Look for large dependencies

// 4. Use external services for heavy tasks
// - Image processing: Cloudinary, imgix
// - PDF generation: API service
// - Puppeteer: Browserless.io

// 5. Split into multiple functions
// /api/heavy-task/start - Queue the job
// /api/heavy-task/status - Check progress

```

**Symptoms:**
- First request takes 3-10+ seconds
- Subsequent requests are fast
- Function size limit exceeded error
- Deployment fails with size error

---

### [HIGH] Edge runtime missing Node.js APIs

**Situation:** Using Node.js APIs in edge runtime functions

**Why it happens:**
Edge runtime runs on V8, not Node.js. Many Node APIs are missing:
fs, path, crypto (partial), child_process, and most native modules.
Your code will fail at runtime with "X is not defined".


**Solution:**
```
Check API compatibility before using edge:

// SUPPORTED in Edge:
// - fetch, Request, Response
// - crypto.subtle (Web Crypto)
// - TextEncoder, TextDecoder
// - URL, URLSearchParams
// - Headers, FormData
// - setTimeout, setInterval

// NOT SUPPORTED in Edge:
// - fs, path, os
// - Buffer (use Uint8Array)
// - crypto.createHash (use crypto.subtle)
// - Most npm packages with native deps

// If you need Node.js APIs:
export const runtime = 'nodejs'  // Use Node runtime instead

// For crypto hashing in edge:
// WRONG
import { createHash } from 'crypto'  // Fails in edge

// RIGHT
async function hash(message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

```

**Symptoms:**
- X is not defined at runtime
- Cannot find module fs
- Works locally, fails deployed
- Middleware crashes

---

### [MEDIUM] Function timeout causes incomplete operations

**Situation:** Long-running operations timing out

**Why it happens:**
Vercel has timeout limits:
- Hobby: 10 seconds
- Pro: 60 seconds (can increase to 300)
- Enterprise: 900 seconds

Operations exceeding this are killed mid-execution.


**Solution:**
```
Handle long operations properly:

// 1. Return early, process async
export async function POST(request: Request) {
  const data = await request.json()

  // Queue for background processing
  await queue.add('process-data', data)

  // Return immediately
  return Response.json({ status: 'queued' })
}

// 2. Use streaming for long responses
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of generateChunks()) {
        controller.enqueue(chunk)
        await sleep(100)  // Prevents timeout
      }
      controller.close()
    }
  })
  return new Response(stream)
}

// 3. Use external services for heavy processing
// - Trigger serverless function, return job ID
// - Process in background (Inngest, Trigger.dev)
// - Client polls for completion

// 4. Increase timeout (Pro plan)
// vercel.json:
{
  "functions": {
    "app/api/slow/route.ts": {
      "maxDuration": 60
    }
  }
}

```

**Symptoms:**
- Task timed out after X seconds
- Incomplete database operations
- Partial file uploads
- Function killed mid-execution

---

### [MEDIUM] Environment variable missing at runtime but present at build

**Situation:** Environment variable works in build but undefined at runtime

**Why it happens:**
Some env vars are only available at build time (hardcoded into bundle).
If you expect a runtime value but it was baked in at build, you get
the build-time value or undefined.


**Solution:**
```
Understand when env vars are read:

// BUILD TIME (baked into bundle):
// - NEXT_PUBLIC_* variables
// - next.config.js
// - generateStaticParams
// - Static pages

// RUNTIME (read on each request):
// - Server Components (without cache)
// - API Routes
// - Server Actions
// - Middleware

// To force runtime reading:
export const dynamic = 'force-dynamic'

// For config that must be runtime:
// Don't use NEXT_PUBLIC_, read on server and pass to client

// Check which env vars you need:
// Build: URLs, public keys, feature flags (if static)
// Runtime: Secrets, database URLs, user-specific config

```

**Symptoms:**
- Env var is undefined in production
- Value doesn't change after updating in dashboard
- Works in dev, wrong value in production
- Requires redeploy to update value

---

### [MEDIUM] CORS errors calling API routes from different domain

**Situation:** Frontend on different domain can't call API routes

**Why it happens:**
By default, browsers block cross-origin requests. Vercel doesn't
automatically add CORS headers. If your frontend is on a different
domain (or localhost in dev), requests fail.


**Solution:**
```
Add CORS headers to API routes:

// app/api/data/route.ts
export async function GET(request: Request) {
  const data = await fetchData()

  return Response.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',  // Or specific domain
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Or use next.config.js for all routes:
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}

```

**Symptoms:**
- CORS policy error in browser console
- No Access-Control-Allow-Origin header
- Requests work in Postman but not browser
- Works same-origin, fails cross-origin

---

### [MEDIUM] Page shows stale data after deployment

**Situation:** Updated data not appearing after new deployment

**Why it happens:**
Vercel caches aggressively. Static pages are cached at the edge.
Even dynamic pages may be cached if not configured properly.
Old cached versions served until cache expires or is purged.


**Solution:**
```
Control caching behavior:

// Force no caching (always fresh)
export const dynamic = 'force-dynamic'
export const revalidate = 0

// ISR - revalidate every 60 seconds
export const revalidate = 60

// On-demand revalidation (after mutation)
import { revalidatePath, revalidateTag } from 'next/cache'

// In Server Action:
async function updatePost(id: string) {
  await db.post.update({ ... })
  revalidatePath(`/posts/${id}`)  // Purge this page
  revalidateTag('posts')          // Purge all with this tag
}

// Purge via API (deployment hook):
// POST https://your-site.vercel.app/api/revalidate?path=/posts

// Check caching in response headers:
// x-vercel-cache: HIT = served from cache
// x-vercel-cache: MISS = freshly generated

```

**Symptoms:**
- Old content shows after deploy
- Changes not visible immediately
- Different users see different versions
- Data updates but page doesn't

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `next.js|app router|pages|server components` | nextjs-app-router | Deployment needs Next.js patterns |
| `database|supabase|backend` | supabase-backend | Deployment needs database |
| `auth|authentication|session` | nextjs-supabase-auth | Deployment needs auth config |
| `monitoring|logs|errors|analytics` | analytics-architecture | Deployment needs monitoring |

### Receives Work From

- **nextjs-app-router**: Next.js app needs deployment
- **devops**: DevOps needs Vercel setup
- **frontend**: Frontend needs hosting
- **backend**: Backend needs serverless

### Works Well With

- nextjs-app-router
- supabase-backend

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/integration/vercel-deployment/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
