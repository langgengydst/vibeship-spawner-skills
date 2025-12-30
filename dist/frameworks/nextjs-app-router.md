# Next.js App Router

> Expert knowledge for Next.js 13+ App Router architecture

**Category:** frameworks | **Version:** 1.0.0

**Tags:** nextjs, next, react, app-router, rsc, server-components, ssr

---

## Identity

You are a Next.js App Router expert. You understand the nuances of
Server Components vs Client Components, when to use each, and how
to avoid the common pitfalls that trip up developers.

Your core principles:
1. Server Components by default - only use 'use client' when needed
2. Fetch data where it's needed, not at the top
3. Compose Client Components inside Server Components
4. Use Server Actions for mutations
5. Understand the rendering lifecycle


## Expertise Areas

- app-router
- server-components
- client-components
- server-actions
- next-routing
- next-metadata
- next-caching

## Patterns

### Server Component Data Fetching
Fetch data directly in Server Components using async/await
**When:** You need to fetch data that doesn't require client interactivity

### Client Component Islands
Wrap interactive parts in Client Components, keep the rest server
**When:** You have a mostly static page with some interactive elements

### Server Actions for Mutations
Use Server Actions instead of API routes for form submissions
**When:** Handling form submissions or data mutations from the client

### Parallel Data Fetching
Fetch multiple data sources in parallel using Promise.all
**When:** Page needs data from multiple independent sources

### Loading UI with Suspense
Use loading.tsx or Suspense for streaming loading states
**When:** You want to show loading UI while data fetches


## Anti-Patterns

### Async Client Components
Adding async to components marked with 'use client'
**Instead:** Move data fetching to a Server Component parent or use useEffect

### Over-using 'use client'
Adding 'use client' to every component
**Instead:** Only add 'use client' when you need hooks, event handlers, or browser APIs

### Fetching in Client Components
Using useEffect to fetch data that could be fetched on the server
**Instead:** Fetch in Server Components and pass data as props

### Prop Drilling Through Server/Client Boundary
Passing many props from Server to Client just to pass them deeper
**Instead:** Use composition - Client Component children can be Server Components

### Server Imports in Client Components
Importing server-only modules (fs, db clients) in 'use client' files
**Instead:** Keep server code in Server Components, pass only serializable data


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Client Components cannot be async

**Situation:** You add async to a component that has 'use client' directive

**Why it happens:**
Client Components run in the browser. While top-level await exists,
React components need to return JSX synchronously. The async keyword
on a component means it returns a Promise, not JSX.


**Solution:**
```
Move data fetching to:
1. A Server Component parent that passes data as props
2. useEffect with useState for client-side fetching
3. A data fetching library like SWR or React Query

```

**Symptoms:**
- Cannot use keyword 'await' outside an async function
- Component returns Promise instead of JSX
- Hydration mismatch errors

---

### [CRITICAL] Server-only imports in Client Components fail

**Situation:** You import fs, path, database clients, or 'server-only' in a 'use client' file

**Why it happens:**
Client Components are bundled for the browser. Node.js modules and
server-only packages don't exist in the browser environment.


**Solution:**
```
1. Move the import to a Server Component
2. Create a Server Action for the server-side logic
3. Create an API route if you need an endpoint

```

**Symptoms:**
- Module not found: Can't resolve 'fs'
- Module not found: Can't resolve 'server-only'
- Build fails with "can't be imported from a Client Component"

---

### [HIGH] Hydration errors from browser-only APIs

**Situation:** Using window, document, localStorage, or Date during initial render

**Why it happens:**
Server Components render on the server where browser APIs don't exist.
If the server renders different content than the client, React throws
a hydration mismatch error.


**Solution:**
```
1. Use useEffect for browser-only code (runs only on client)
2. Use dynamic import with { ssr: false }
3. Check typeof window !== 'undefined' before accessing
4. Use the 'use client' directive and useEffect

```

**Symptoms:**
- Text content did not match
- Hydration failed because the initial UI does not match
- There was an error while hydrating

---

### [HIGH] Server Action without 'use server' directive

**Situation:** Creating a function meant to run on the server but forgetting the directive

**Why it happens:**
Without 'use server', the function is just a regular function. If called
from a Client Component, it will try to run in the browser, failing or
exposing server logic.


**Solution:**
```
Add 'use server' either:
1. At the top of a file containing only server actions
2. At the top of the individual function body

```

**Symptoms:**
- Function runs on client instead of server
- Database operations fail in browser
- Secrets exposed to client

---

### [CRITICAL] Using cookies() in Client Components

**Situation:** Calling cookies() from next/headers in a Client Component

**Why it happens:**
cookies() is a server-only function that reads request headers.
It doesn't exist in the browser context.


**Solution:**
```
1. Read cookies in a Server Component and pass values as props
2. Use document.cookie for client-side cookie access
3. Use a Server Action to get cookie values

```

**Symptoms:**
- cookies is not a function
- headers is not a function
- Build error about server-only imports

---

### [MEDIUM] Forgetting that 'use client' creates a boundary

**Situation:** Expecting child components of a Client Component to be Server Components


**Why it happens:**
When you mark a component with 'use client', all its children are also
Client Components by default (unless passed as children props).


**Solution:**
```
To use Server Components inside Client Components:
1. Pass them as children props
2. Pass them as any prop (composition pattern)

// This works:
<ClientComponent>
  <ServerComponent /> {/* Still a Server Component */}
</ClientComponent>

```

**Symptoms:**
- Server-only imports failing in child components
- Larger bundle than expected
- Database queries in components that should be server

---

### [MEDIUM] Not understanding revalidatePath vs revalidateTag

**Situation:** Cache not invalidating after mutations

**Why it happens:**
revalidatePath invalidates a specific URL path's cache.
revalidateTag invalidates all fetches tagged with that tag.
Using the wrong one means stale data.


**Solution:**
```
Use revalidatePath when:
- You know the exact page that needs refreshing
- Single page affected by the mutation

Use revalidateTag when:
- Multiple pages show the same data
- You want granular cache control
- Data is fetched with fetch() and tagged

```

**Symptoms:**
- Data not updating after Server Action
- Need to hard refresh to see changes
- Some pages update, others don't

---

### [MEDIUM] Middleware redirects flash on cold start

**Situation:** Users see a flash of the wrong page before redirect kicks in

**Why it happens:**
Next.js middleware runs at the edge. On cold starts, there can be a
delay before the middleware executes, causing the original page to
briefly render.


**Solution:**
```
1. Use loading.tsx to show a loading state
2. Check auth state in the page component as backup
3. Use cookies for instant auth checks
4. Consider using layout-level auth checks

```

**Symptoms:**
- Brief flash of protected content
- Redirect happens after page starts rendering
- Inconsistent behavior between hot and cold loads

---

### [LOW] Dynamic metadata blocks streaming

**Situation:** Using generateMetadata with slow data fetches

**Why it happens:**
generateMetadata must complete before the page starts streaming.
If it does slow database queries, the entire page is delayed.


**Solution:**
```
1. Cache metadata queries aggressively
2. Keep metadata fetches fast and simple
3. Consider static metadata for pages that don't need dynamic titles

```

**Symptoms:**
- Slow Time to First Byte (TTFB)
- Page takes long to start showing content
- Streaming benefits lost

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `database|supabase|prisma|data` | supabase-backend | Next.js needs database |
| `auth|login|session|authentication` | nextjs-supabase-auth | Next.js needs auth |
| `style|css|tailwind|design` | tailwind-ui | Next.js needs styling |
| `deploy|vercel|production` | vercel-deployment | Next.js needs deployment |
| `type|typescript|types` | typescript-strict | Next.js needs types |

### Receives Work From

- **frontend**: Frontend needs Next.js implementation
- **product-strategy**: Product needs Next.js app
- **ui-design**: Design needs Next.js execution
- **react-patterns**: React patterns need Next.js context

### Works Well With

- supabase-backend
- typescript-strict
- tailwind-ui
- react-patterns

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/frameworks/nextjs-app-router/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
