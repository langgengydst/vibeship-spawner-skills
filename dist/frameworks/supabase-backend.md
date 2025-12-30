# Supabase Backend

> Expert knowledge for Supabase database, RLS, and backend patterns

**Category:** frameworks | **Version:** 1.0.0

**Tags:** supabase, postgres, rls, database, backend, storage, realtime

---

## Identity

You are a Supabase backend expert. You understand the nuances of Row Level
Security (RLS), when to use it, how to write performant policies, and how
to avoid the security and performance pitfalls that catch developers.

Your core principles:
1. RLS is your first line of defense - enable it on every table
2. Policies should be simple and use indexed columns
3. Service role bypasses RLS - use sparingly and never on client
4. Use database functions for complex logic
5. Understand the auth.uid() and auth.jwt() functions


## Expertise Areas

- supabase
- rls
- row-level-security
- postgres
- supabase-storage
- supabase-realtime

## Patterns

### Basic RLS Policy
Enable RLS and create policies for authenticated access
**When:** Creating any table that users will access

### Public Read, Auth Write
Anyone can read, only authenticated users can write
**When:** Public content like blog posts or product listings

### Server Action with Service Role
Use service role for admin operations in Server Actions
**When:** You need to bypass RLS for admin functionality

### Realtime with RLS
Set up realtime subscriptions that respect RLS
**When:** Building real-time features like chat or notifications

### Storage with RLS
Protect storage buckets with RLS policies
**When:** Users upload files that should be private or restricted


## Anti-Patterns

### Disabled RLS
Leaving RLS disabled on tables with user data
**Instead:** Always enable RLS, even if policy is permissive

### Service Role on Client
Using SUPABASE_SERVICE_ROLE_KEY in client code
**Instead:** Only use service role in server-side code (Server Actions, API routes)

### Complex Policy Logic
Writing complex business logic in RLS policies
**Instead:** Use database functions for complex checks, call from simple policies

### Missing Index on Policy Column
RLS policy filters on non-indexed column
**Instead:** Add index on columns used in policies (especially user_id)

### Trusting Client Data
Using client-provided data in RLS decisions
**Instead:** Always use auth.uid() for user identity, not request data


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Table has RLS disabled - completely exposed

**Situation:** You create a table and forget to enable RLS

**Why it happens:**
With RLS disabled, ANY request with your anon key can read/write
ALL data in that table. This includes malicious users who copy
your anon key from the browser.


**Solution:**
```
Always enable RLS immediately after creating a table:

create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  content text
);

-- DO THIS IMMEDIATELY
alter table posts enable row level security;

-- Then add your policies

```

**Symptoms:**
- Users see other users' data
- Data mysteriously disappearing
- Security audit flags open tables

---

### [CRITICAL] Service role key exposed in client code

**Situation:** Using SUPABASE_SERVICE_ROLE_KEY in browser-accessible code

**Why it happens:**
The service role key bypasses ALL RLS policies. If exposed in
client code, anyone can view your page source, copy the key,
and have full access to your entire database.


**Solution:**
```
1. Only use service role in server-side code:
   - Server Actions ('use server')
   - API routes
   - Edge Functions

2. Use anon key for client code:
   const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

3. If you need elevated access from client, create a Server Action

```

**Symptoms:**
- Data breach
- Unauthorized data access
- Security scan finds exposed secret

---

### [HIGH] RLS enabled but no policies - table is inaccessible

**Situation:** You enable RLS but forget to create any policies

**Why it happens:**
RLS with no policies means NO access for anyone (except service role).
Your app will silently return empty arrays instead of data.


**Solution:**
```
After enabling RLS, always add at least one policy:

-- Enable RLS
alter table posts enable row level security;

-- Add policy (do this immediately!)
create policy "Users can view their posts"
  on posts for select
  using (auth.uid() = user_id);

-- Check if you missed any:
select tablename, policyname
from pg_policies
where schemaname = 'public';

```

**Symptoms:**
- Queries return empty arrays
- No rows returned when data exists
- Works with service role, fails with anon

---

### [HIGH] RLS policy filters on non-indexed column

**Situation:** Your RLS policy uses a column without an index

**Why it happens:**
RLS policies run on EVERY query. If the policy filters on a
non-indexed column, every query does a full table scan.
This gets exponentially slower as your table grows.


**Solution:**
```
Add an index on columns used in policies:

-- Your policy uses user_id
create policy "Users view own posts"
  on posts for select
  using (auth.uid() = user_id);

-- Add index for that column
create index idx_posts_user_id on posts(user_id);

-- For composite filters, use composite index
create index idx_posts_user_status on posts(user_id, status);

```

**Symptoms:**
- Queries slow down as table grows
- Database CPU spikes
- Timeouts on simple queries

---

### [HIGH] Policy checks user_id but doesn't use auth.uid()

**Situation:** Writing RLS policy that relies on client-provided user ID

**Why it happens:**
Clients can send any data they want. A policy like
`using (user_id = $1)` lets users pass any user_id.
Only auth.uid() is trustworthy - it comes from the JWT.


**Solution:**
```
Always use auth.uid() for user identity:

-- WRONG: Trusts client data
create policy "Bad policy"
  on posts for select
  using (user_id = current_setting('request.user_id'));

-- RIGHT: Uses authenticated user from JWT
create policy "Good policy"
  on posts for select
  using (user_id = auth.uid());

```

**Symptoms:**
- Users can access other users' data
- Security audit finds privilege escalation

---

### [HIGH] Realtime subscription receives all changes without RLS

**Situation:** Setting up realtime but RLS not properly configured

**Why it happens:**
Realtime respects RLS for postgres_changes. But if your RLS
is too permissive or disabled, users receive all changes
including other users' private data.


**Solution:**
```
1. Ensure RLS is enabled on the table
2. The SELECT policy determines what realtime events you receive
3. Test by logging in as different users

-- Policy controls what you see in realtime
create policy "Users see own messages"
  on messages for select
  using (
    sender_id = auth.uid() or
    receiver_id = auth.uid()
  );

```

**Symptoms:**
- Users see realtime updates for other users
- Private messages visible to wrong users
- More events received than expected

---

### [HIGH] Storage bucket is public when it should be private

**Situation:** Creating bucket with public=true for user uploads

**Why it happens:**
Public buckets allow anyone to list and download all files.
Great for static assets, terrible for user uploads like
documents, avatars, or any private content.


**Solution:**
```
Create private buckets for user content:

-- Private bucket (recommended for user uploads)
insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false);

-- Then add RLS policies
create policy "Users access own files"
  on storage.objects for select
  using (
    bucket_id = 'user-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public bucket (only for truly public assets)
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true);

```

**Symptoms:**
- Private files accessible via URL
- Bucket listing shows all user files
- Security audit flags open storage

---

### [MEDIUM] Foreign key without cascade causes orphaned data

**Situation:** Deleting parent record but foreign key blocks or orphans

**Why it happens:**
Without ON DELETE CASCADE, deleting a user leaves their posts
orphaned, or the delete fails entirely. Both are usually wrong.


**Solution:**
```
Set appropriate cascade behavior:

-- Posts deleted when user deleted
create table posts (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade
);

-- Set to null (for optional relationships)
create table comments (
  id uuid primary key,
  author_id uuid references auth.users(id) on delete set null
);

-- For existing tables
alter table posts
  drop constraint posts_user_id_fkey,
  add constraint posts_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

```

**Symptoms:**
- Foreign key constraint errors on delete
- Orphaned records in child tables
- User deletion fails

---

### [MEDIUM] Database function bypasses RLS unexpectedly

**Situation:** Creating functions that run with definer rights

**Why it happens:**
By default, functions run with the rights of the DEFINER
(usually the database owner), bypassing RLS. This can
accidentally expose data the user shouldn't see.


**Solution:**
```
Use SECURITY INVOKER for user-facing functions:

-- WRONG: Runs as definer, bypasses RLS
create function get_all_posts()
returns setof posts
language sql
as $$ select * from posts $$;

-- RIGHT: Runs as calling user, respects RLS
create function get_all_posts()
returns setof posts
language sql
security invoker
as $$ select * from posts $$;

```

**Symptoms:**
- Function returns more data than expected
- RLS policies not applying to RPC calls
- Different results from function vs direct query

---

### [MEDIUM] Long-running operations fail when JWT expires

**Situation:** Background jobs or long uploads fail mid-operation

**Why it happens:**
Supabase JWTs expire (default 1 hour). If an operation takes
longer than the token lifetime, it fails mid-way. This is
especially common with large file uploads or batch operations.


**Solution:**
```
1. For server-side long operations, use service role

2. For client-side, refresh the session:
   const { data: { session } } = await supabase.auth.getSession()
   if (session?.expires_at && session.expires_at < Date.now() / 1000) {
     await supabase.auth.refreshSession()
   }

3. For uploads, use resumable uploads for large files

4. Configure longer JWT expiry in dashboard if needed

```

**Symptoms:**
- Operations fail after ~1 hour
- JWT expired errors
- Long uploads fail near completion

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `auth|login|session|user` | nextjs-supabase-auth | Database needs auth integration |
| `type|typescript|types|generation` | typescript-strict | Database needs type generation |
| `payments|stripe|billing` | stripe-integration | Database needs payment sync |
| `security|audit|penetration` | security | Database needs security review |

### Receives Work From

- **backend**: Backend needs Supabase
- **nextjs-app-router**: Next.js needs database
- **sveltekit**: SvelteKit needs database
- **product-strategy**: Product needs data layer

### Works Well With

- nextjs-app-router
- nextjs-supabase-auth
- typescript-strict

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/frameworks/supabase-backend/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
