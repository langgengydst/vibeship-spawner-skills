# Integration Patterns

> Use when designing system integrations, implementing API gateways, event-driven architectures, ESB patterns, or hybrid cloud connectivity

**Category:** enterprise | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] One slow service brings down entire request path

**Why it happens:**
When Service A calls B calls C synchronously, a problem in C
causes B to block, which causes A to block. Threads pile up,
timeouts cascade, and your entire system becomes unavailable.


**Solution:**
```
1. Break synchronous chains:
   - Use async events where possible
   - Add circuit breakers
   - Set aggressive timeouts

2. Bulkhead pattern:
   - Separate thread pools per integration
   - Rate limit downstream calls
   - Fail fast when pool exhausted

3. Fallback strategies:
   - Return cached data
   - Degrade gracefully
   - Queue for later retry

```

**Symptoms:**
- Request timeouts cascade
- One service issue affects all callers
- Thread pool exhaustion

---

### [CRITICAL] Retry logic processes same request multiple times

**Why it happens:**
Networks are unreliable. Requests will be retried. If your
operations aren't idempotent, retries cause duplicates.
This is especially dangerous for financial operations.


**Solution:**
```
1. Idempotency keys:
   - Client generates unique key
   - Server stores key → result
   - Return cached result on retry

2. Natural idempotency:
   - PUT over POST where possible
   - Include timestamp/version in request
   - Check for existing before insert

3. Deduplication:
   - Message deduplication in queues
   - Track processed message IDs
   - Time-based dedup windows

```

**Symptoms:**
- Duplicate orders
- Double charges
- Duplicate notifications

---

### [HIGH] Failed messages disappear or block the queue

**Why it happens:**
Some messages will fail processing - bad data, temporary issues,
bugs. Without a DLQ, these either disappear forever or block
your queue. You need a place to park failures for investigation.


**Solution:**
```
1. Configure DLQ for every queue:
   - Set max retry attempts
   - Route to DLQ after exhaustion
   - Alert on DLQ depth

2. DLQ processing:
   - Monitor DLQ continuously
   - Investigate root causes
   - Replay after fixes

3. Poison message handling:
   - Catch and log exceptions
   - Don't block healthy messages
   - Track failure patterns

```

**Symptoms:**
- Messages silently dropped
- Queue blocked by poison messages
- No visibility into failures

---

### [HIGH] Producer schema update breaks existing consumers

**Why it happens:**
Producers and consumers deploy independently. If you change
a schema without backward compatibility, old consumers break.
This is especially painful with many consumers.


**Solution:**
```
1. Schema evolution rules:
   - Add fields as optional
   - Never remove required fields
   - Never change field types
   - Deprecate before removing

2. Schema registry:
   - Version all schemas
   - Compatibility checks on publish
   - Block breaking changes

3. Consumer tolerance:
   - Ignore unknown fields
   - Handle missing optional fields
   - Multiple schema version support

```

**Symptoms:**
- Consumers crash after producer deploy
- Deserialization failures
- Data loss from unknown fields

---

### [HIGH] Failing external service consumes all resources

**Why it happens:**
When an external service fails, continuing to call it wastes
resources (threads, connections) and adds latency. A circuit
breaker fails fast, protecting your system from cascade failure.


**Solution:**
```
1. Circuit breaker per external dependency:
   - Track failure rate
   - Open circuit on threshold
   - Fail fast when open

2. Configure properly:
   - Failure threshold (e.g., 5 failures)
   - Recovery timeout (e.g., 30 seconds)
   - Half-open test requests

3. Combine with bulkhead:
   - Dedicated thread pool
   - Limited connections
   - Independent failure domains

```

**Symptoms:**
- Thread pool exhaustion
- Cascading timeouts
- Slow degradation then crash

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `enterprise.architecture|system.design|bounded.context` | enterprise-architecture | Architecture decisions |
| `disaster.recovery|failover|resilience` | disaster-recovery | Integration DR requirements |
| `api.design|rest|graphql|openapi` | api-designer | API design patterns |

### Receives Work From

- **enterprise-architecture**: Integration architecture decisions
- **disaster-recovery**: Integration resilience

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/enterprise/integration-patterns/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
