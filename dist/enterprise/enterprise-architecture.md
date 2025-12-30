# Enterprise Architecture

> Use when designing enterprise systems, applying TOGAF framework, creating capability maps, implementing domain-driven design, or planning technology transformations - covers ADM phases, architecture domains, and governance

**Category:** enterprise | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Architecture team disconnected from development reality

**Why it happens:**
When architects sit separate from delivery teams, they create designs
based on theoretical ideals rather than practical constraints. Teams
ignore impractical mandates and create shadow architectures.


**Solution:**
```
1. Embed architects in delivery teams:
   - Rotate architects through product teams
   - Architects write code sometimes
   - Attend standups and retros

2. Lightweight governance:
   - Self-service architecture review templates
   - Async reviews for standard patterns
   - Reserve sync reviews for novel decisions

3. Feedback loops:
   - Track actual vs. intended architecture
   - Post-mortems inform future guidance
   - Architecture debt is visible

```

**Symptoms:**
- Architecture documents nobody follows
- Developers work around official architecture
- No feedback loop from implementation

---

### [CRITICAL] Attempting to replace everything at once leads to project failure

**Why it happens:**
Large transformations fail because requirements change during execution,
key people leave, budgets get cut, and complexity compounds. The longer
the timeline, the higher the failure probability.


**Solution:**
```
1. Strangler Fig pattern:
   - Route specific traffic to new system
   - Incrementally migrate features
   - Old and new coexist during transition

2. Define intermediate architectures:
   - Transition State 1: Core migrated
   - Transition State 2: Integrations migrated
   - Target State: Legacy decommissioned

3. Measure progress:
   - Traffic percentage on new system
   - Feature parity checklist
   - Value delivered at each stage

```

**Symptoms:**
- Multi-year transformation timeline
- All-or-nothing migration approach
- No intermediate value delivery

---

### [HIGH] Sharing databases or models across domain boundaries

**Why it happens:**
When bounded contexts share implementation details, they become
coupled. Changes require coordination across teams. This slows
development and increases the risk of breaking changes.


**Solution:**
```
1. Clear context boundaries:
   - Each context owns its data
   - Integration via events or APIs
   - No shared databases

2. Anti-corruption layer:
   - Translate between context models
   - Don't leak internal structure
   - Version integration contracts

3. Context mapping:
   - Document relationships between contexts
   - Define integration patterns
   - Assign ownership

```

**Symptoms:**
- Multiple teams modifying same database tables
- Shared library with domain logic
- Changes in one domain break another

---

### [HIGH] All decisions require architecture board approval

**Why it happens:**
Centralized review creates bottlenecks. Teams queue for approval
while competitors ship. Eventually teams bypass the process entirely,
defeating the purpose of governance.


**Solution:**
```
1. Tiered governance:
   - Tier 1: Team decides (standard patterns)
   - Tier 2: Architect advises (minor deviations)
   - Tier 3: ARB approves (novel or risky)

2. Pre-approved patterns:
   - Reference architectures for common cases
   - Technology radar with recommended defaults
   - Self-service compliance checks

3. Asynchronous review:
   - ADR (Architecture Decision Record) review
   - Comment period instead of meetings
   - Escalate only on objection

```

**Symptoms:**
- Long wait times for architecture review
- Teams waiting on approval to proceed
- Architecture board overwhelmed

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `data.architecture|data.governance|data.model` | data-governance | Data architecture decisions |
| `integration|api.gateway|event.driven` | integration-patterns | Integration architecture |
| `multi.tenant|saas.architecture` | multi-tenancy | Multi-tenant architecture |
| `disaster.recovery|business.continuity` | disaster-recovery | DR architecture |

### Receives Work From

- **data-governance**: Data architecture patterns
- **integration-patterns**: Integration architecture

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/enterprise/enterprise-architecture/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
