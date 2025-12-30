# Disaster Recovery

> Use when designing disaster recovery strategies, defining RPO/RTO targets, implementing failover mechanisms, or conducting chaos engineering tests - covers active-active, pilot light, and backup strategies

**Category:** enterprise | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] DR plan exists on paper but has never been executed

**Why it happens:**
An untested DR plan is not a plan - it's hopeful documentation.
Real disasters reveal gaps: missing passwords, changed infrastructure,
broken automation, and team members who don't know their roles.


**Solution:**
```
1. Schedule regular DR drills:
   - Quarterly for critical systems
   - Annual full-scale exercises
   - Document and review results

2. Game day exercises:
   - Simulate real scenarios
   - Include on-call team
   - Practice communication

3. Automated testing:
   - Restore backups weekly
   - Verify data integrity
   - Measure actual RTO

```

**Symptoms:**
- Last DR test was years ago
- Team doesn't know the runbook
- Backup restore times are unknown

---

### [CRITICAL] All backups stored in the same region as production data

**Why it happens:**
Regional disasters (data center fire, natural disaster, provider outage)
can take out both your primary data AND your backups. Cross-region
replication is essential for true disaster recovery.


**Solution:**
```
1. Cross-region backup replication:
   - Replicate to at least one other region
   - Consider different cloud provider
   - Verify replication is working

2. Backup verification:
   - Test restores from DR region
   - Verify data integrity
   - Document restore procedures

3. Consider 3-2-1 rule:
   - 3 copies of data
   - 2 different storage types
   - 1 offsite location

```

**Symptoms:**
- Fast backup/restore times
- Low storage costs
- No cross-region replication

---

### [HIGH] Failover requires manual intervention that slows recovery

**Why it happens:**
During a disaster, stress is high and people make mistakes.
Manual steps add time to RTO and introduce human error.
What takes 5 minutes in practice takes 30 under pressure.


**Solution:**
```
1. Automate everything:
   - Scripted failover procedures
   - Automated health checks
   - Automatic DNS updates

2. One-click failover:
   - Single command to initiate
   - All steps automated
   - Rollback capability

3. Eliminate dependencies:
   - No SSH required
   - No manual approvals during DR
   - Pre-authorized actions

```

**Symptoms:**
- Failover requires SSH access
- Manual DNS changes needed
- Database promotion is manual

---

### [HIGH] DR plan doesn't account for all system dependencies

**Why it happens:**
Modern systems have many dependencies: databases, caches, queues,
third-party APIs, DNS, authentication providers. If your DR plan
doesn't account for all of them, recovery is incomplete.


**Solution:**
```
1. Complete dependency mapping:
   - Internal services
   - Databases and caches
   - Third-party APIs
   - Authentication/SSO
   - DNS and CDN

2. Tiered recovery plan:
   - Infrastructure first
   - Data stores second
   - Applications third
   - Verification last

3. Regular dependency audits:
   - Review when adding services
   - Update DR plan accordingly
   - Test full-stack recovery

```

**Symptoms:**
- Service starts but can't function
- Missing third-party services
- Authentication fails after failover

---

### [MEDIUM] System resilience is assumed but never tested

**Why it happens:**
You can't know how your system fails until you make it fail.
Chaos engineering in production reveals weaknesses before
real disasters do. Teams that practice handling failures
respond better during real incidents.


**Solution:**
```
1. Start small:
   - Kill single instances
   - Add network latency
   - Fill disk space

2. Game days:
   - Planned chaos experiments
   - Team observes and learns
   - Document discoveries

3. Continuous chaos:
   - Chaos Monkey in production
   - Random failure injection
   - Build resilience into culture

```

**Symptoms:**
- Single points of failure unknown
- Failure modes untested
- Team lacks incident experience

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `enterprise.architecture|system.design` | enterprise-architecture | Architecture decisions affecting DR |
| `multi.tenant|per.tenant.backup` | multi-tenancy | Tenant-specific DR requirements |
| `compliance|audit|evidence` | compliance-automation | DR compliance requirements |

### Receives Work From

- **enterprise-architecture**: System architecture and dependencies
- **multi-tenancy**: Per-tenant recovery needs

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/enterprise/disaster-recovery/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
