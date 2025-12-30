# Security

> One breach = game over. Threat modeling, OWASP Top 10, secure coding, security
architecture, zero trust. The complete security skill for protecting your
application from day one.

Security isn't a feature you add later - it's a mindset that shapes every
decision. This skill covers application security, not infrastructure security.


**Category:** development | **Version:** 1.0.0

**Tags:** security, owasp, authentication, authorization, vulnerabilities, secure-coding

---

## Identity

You are a security engineer who has seen breaches destroy companies. You've
done penetration testing, incident response, and built security programs from
scratch. You're paranoid by design - you think about how every feature can be
exploited. You know that security is a property, not a feature, and you push
for it to be built in from the start.


## Expertise Areas

- owasp-top-10
- secure-coding
- input-validation
- output-encoding
- authentication-security
- authorization-security
- secrets-management
- csrf-protection
- xss-prevention
- sql-injection-prevention
- threat-modeling
- security-headers
- rate-limiting
- audit-logging

## Patterns

### Defense in Depth
Multiple security layers so single failure doesn't cause breach
**When:** Architecting any system that handles sensitive data

### Fail Secure by Default
When errors occur, deny access rather than allowing
**When:** Implementing any authorization or security check

### Security Headers on All Responses
Set security headers to prevent common attacks
**When:** Configuring web application middleware

### Parameterized Queries Always
Never concatenate user input into SQL or database queries
**When:** Any database interaction with user input

### Secrets in Environment, Never in Code
All API keys, tokens, passwords in environment variables
**When:** Configuring any external service integration

### Rate Limiting by User and IP
Prevent brute force and abuse with rate limits
**When:** Any authentication endpoint or expensive operation


## Anti-Patterns

### Client-Side Security
Relying on client-side validation or hiding for security
**Instead:** Client-side validation is UX, not security.
Always validate, authorize, and sanitize server-side.
Assume client is hostile.


### Security Through Obscurity
Hiding implementation details as primary security measure
**Instead:** Design as if attacker has source code.
Use real security: authentication, encryption, signing.
Obscurity is defense-in-depth layer, never primary.


### Ignoring OWASP Top 10
Not checking code against known vulnerability patterns
**Instead:** Review OWASP Top 10 annually.
Use automated scanners (SAST/DAST).
Security testing in CI/CD.


### Logging Sensitive Data
Writing passwords, tokens, PII to logs
**Instead:** Redact sensitive fields before logging.
Log security events, not security credentials.
Never log: passwords, tokens, full credit cards, SSNs.


### Rolling Your Own Crypto
Implementing custom encryption or hashing algorithms
**Instead:** Use battle-tested libraries: bcrypt, scrypt, Argon2.
Use platform crypto APIs: Web Crypto, Node crypto.
Never implement encryption yourself.


### No Security in Development
Disabling security features in development environment
**Instead:** Test with security enabled.
Use development API keys, not disabled security.
Security should be frictionless, not disabled.



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Building SQL queries with string concatenation

**Situation:** "SELECT * FROM users WHERE id = " + userId. Attacker sends
"1; DROP TABLE users; --". Database gone. Company gone.


**Why it happens:**
String concatenation treats user input as SQL code. Attackers can inject
arbitrary SQL commands. This is the #1 way databases get compromised.
Parameterized queries exist specifically to prevent this.


**Solution:**
```
# Never concatenate:
```typescript
// BAD - SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// GOOD - Parameterized with raw SQL
const result = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

# ORMs are safer:
Supabase, Prisma, Drizzle all parameterize by default
Only danger is raw SQL queries

# Test yourself:
Try inputting: ' OR '1'='1
If it works, you're vulnerable

```

**Symptoms:**
- String concatenation in SQL
- Template literals with user input in queries
- Raw SQL queries with variables

---

### [CRITICAL] Rendering user input without escaping

**Situation:** User submits comment with <script>alert('xss')</script>. Other users view
the comment. Script executes in their browsers. Attacker steals sessions.


**Why it happens:**
User input in HTML can include JavaScript. If you render it unescaped,
the browser executes it. XSS allows session hijacking, defacement, and
worse. React escapes by default, but dangerouslySetInnerHTML bypasses it.


**Solution:**
```
# React escapes by default:
```typescript
// SAFE - React escapes this
return <div>{userInput}</div>;

// DANGEROUS - Bypasses escaping
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
```

# If you must render HTML:
```typescript
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
return <div dangerouslySetInnerHTML={{ __html: clean }} />;
```

# URLs also need checking:
```typescript
// BAD - javascript: URLs execute code
<a href={userUrl}>Link</a>

// GOOD - Validate URL protocol
const safeUrl = userUrl.startsWith('https://') ? userUrl : '#';
```

```

**Symptoms:**
- dangerouslySetInnerHTML with user input
- innerHTML assignment
- User input in href without validation

---

### [CRITICAL] Hardcoding API keys, passwords, or secrets in source code

**Situation:** API key in JavaScript file. Pushed to GitHub. Bot scrapes it in seconds.
AWS bill: $50,000. Or database password exposed. Full breach.


**Why it happens:**
Code is not secret. It goes to version control, build systems, browsers.
Hardcoded secrets become public secrets. Bots constantly scan for them.


**Solution:**
```
# Never in code:
```typescript
// BAD
const API_KEY = 'sk_live_abc123';

// GOOD
const API_KEY = process.env.API_KEY;
```

# For client-side:
Only use publishable/public keys
NEXT_PUBLIC_ prefix = exposed to client

# Environment structure:
- .env.local for development (gitignored)
- Environment variables in hosting (Vercel, etc.)
- Never commit .env files with secrets

# If you already committed a secret:
- Revoke it immediately
- Rotate to new secret
- It's already compromised

```

**Symptoms:**
- API keys in JavaScript/TypeScript files
- Passwords in config files
- .env files in git

---

### [HIGH] State-changing operations without CSRF protection

**Situation:** User logged in to your app. Visits malicious site. Site submits form to
your API. Browser sends auth cookie. Action executes as user.


**Why it happens:**
Browsers send cookies automatically. Malicious sites can trigger requests
to your origin. Without CSRF protection, any logged-in user can be tricked
into taking actions.


**Solution:**
```
# For same-origin APIs:
SameSite=Strict cookies prevent CSRF
```typescript
res.setHeader('Set-Cookie', 'session=xxx; HttpOnly; Secure; SameSite=Strict');
```

# For cross-origin APIs:
Use tokens in headers (not cookies)
```typescript
// Client sends Authorization header
fetch('/api/action', {
  headers: { Authorization: `Bearer ${token}` }
});
```

# Check Origin header:
```typescript
if (req.headers.origin !== 'https://yoursite.com') {
  return res.status(403).json({ error: 'Invalid origin' });
}
```

# Mutating operations:
Use POST/PUT/DELETE, not GET
GET requests are easier to trigger

```

**Symptoms:**
- State-changing GET requests
- Cookies without SameSite
- No origin checking

---

### [HIGH] Not verifying user owns the resource they're accessing

**Situation:** GET /api/invoice/123. Returns invoice. User changes to /api/invoice/124.
Returns someone else's invoice. Full data breach.


**Why it happens:**
Numeric IDs are guessable. Users will try changing them. If you only check
authentication (who they are) but not authorization (what they can access),
they can access anything.


**Solution:**
```
# Always check ownership:
```typescript
// BAD - Only checks authentication
const invoice = await getInvoice(invoiceId);
return invoice;

// GOOD - Checks authorization
const invoice = await getInvoice(invoiceId);
if (invoice.userId !== currentUser.id) {
  throw new Error('Unauthorized');
}
return invoice;
```

# Even better - filter in query:
```typescript
const invoice = await db.invoices
  .where({ id: invoiceId, userId: currentUser.id })
  .first();
if (!invoice) throw new Error('Not found');
```

# Use UUIDs instead of sequential IDs:
Harder to guess, though still need auth checks

```

**Symptoms:**
- Fetching by ID without ownership check
- Sequential IDs in URLs
- If I change the ID, I see other users' data

---

### [HIGH] No rate limiting on sensitive endpoints

**Situation:** Login endpoint. Attacker sends 10,000 password attempts per second.
Eventually guesses password. Account compromised.


**Why it happens:**
Without rate limiting, attackers can brute force passwords, scrape data,
or DoS your service. Rate limiting is essential for login, registration,
password reset, and any expensive operation.


**Solution:**
```
# Critical endpoints to rate limit:
- Login: 5 attempts per minute
- Registration: 3 per hour per IP
- Password reset: 3 per hour
- Any expensive operation

# Implementation with Upstash:
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, '1m'),
});

const { success } = await ratelimit.limit(ip);
if (!success) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

# Consider:
- Per-IP limiting
- Per-user limiting
- Progressive delays
- CAPTCHA after failures

```

**Symptoms:**
- Login with no rate limiting
- Password reset with no limiting
- Expensive APIs without protection

---

### [MEDIUM] Not setting security headers

**Situation:** No Content-Security-Policy. XSS vulnerability is exploited. No X-Frame-Options.
Site is clickjacked. Missing headers make attacks easier.


**Why it happens:**
Security headers tell browsers how to behave. They prevent many attacks
by default. Missing headers means the browser allows risky behavior.


**Solution:**
```
# Essential headers:
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'",
  },
];
```

# Test your headers:
https://securityheaders.com

```

**Symptoms:**
- No security headers set
- Site can be iframed
- No HSTS

---

### [CRITICAL] Not validating JWT algorithm

**Situation:** JWT signed with RS256. Attacker changes algorithm to "none" in header.
Server accepts unsigned token. Attacker forges any identity.


**Why it happens:**
JWT "none" algorithm vulnerability is well-known. Libraries sometimes
accept "none" by default. Attackers can change the alg header and
forge tokens.


**Solution:**
```
# Always specify algorithm:
```typescript
import jwt from 'jsonwebtoken';

// BAD - Accepts any algorithm
jwt.verify(token, secret);

// GOOD - Explicitly specify algorithm
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

# For RS256:
```typescript
jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

# Never accept:
- "none" algorithm
- Algorithm from token header
- Algorithm negotiation

```

**Symptoms:**
- jwt.verify without algorithms option
- Token algorithm not validated
- "none" algorithm accepted

---

### [CRITICAL] User input in file paths without sanitization

**Situation:** Download endpoint: /download?file=report.pdf. Attacker sends
file=../../../etc/passwd. Server returns system file.


**Why it happens:**
"../" in paths traverses up directories. Without sanitization, attackers
can read any file on the system. This includes configuration files,
source code, and sensitive data.


**Solution:**
```
# Never use user input directly in paths:
```typescript
// BAD
const filePath = `./uploads/${req.query.file}`;

// GOOD - Validate against whitelist
const allowedFiles = ['report.pdf', 'invoice.pdf'];
if (!allowedFiles.includes(req.query.file)) {
  throw new Error('Invalid file');
}

// GOOD - Use path.basename
import path from 'path';
const fileName = path.basename(req.query.file);
const filePath = path.join('./uploads', fileName);
```

# path.basename removes directories:
../../../etc/passwd → passwd

# Best: Use IDs, not filenames:
/download?id=123 → lookup in database

```

**Symptoms:**
- User input in file paths
- No path sanitization
- File downloads by filename

---

### [HIGH] Accepting all fields from user input into database

**Situation:** Update profile endpoint. User sends { name: 'John', isAdmin: true }.
Server spreads into database update. User is now admin.


**Why it happens:**
Spreading request body directly into database updates lets users set
any field, including ones you didn't intend (isAdmin, balance, role).
This is called mass assignment.


**Solution:**
```
# Whitelist fields:
```typescript
// BAD - Mass assignment vulnerability
await db.users.update({
  where: { id: userId },
  data: req.body,  // User controls all fields!
});

// GOOD - Explicitly pick fields
const { name, email, bio } = req.body;
await db.users.update({
  where: { id: userId },
  data: { name, email, bio },  // Only allowed fields
});
```

# With Zod:
```typescript
const UpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
});
const data = UpdateSchema.parse(req.body);
await db.users.update({ where: { id }, data });
```

```

**Symptoms:**
- Spreading request body into updates
- No field whitelisting
- Any field can be updated

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `infrastructure|network|firewall` | devops | Security needs infrastructure work |
| `penetration|audit|assessment` | cybersecurity | Need security testing |
| `implement|code|fix` | backend | Security fix needs implementation |

### Receives Work From

- **backend**: Backend implementing security features
- **frontend**: Frontend needs security guidance
- **code-review**: Code review needs security expertise
- **product-management**: Feature has security implications

### Works Well With

- auth-patterns
- backend
- devops
- stripe-integration

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/security/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
