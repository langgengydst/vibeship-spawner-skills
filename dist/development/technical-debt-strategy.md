# Technical Debt Strategy

> Technical debt is not bad. Reckless debt is bad. Strategic debt is a tool.
Like financial debt, it can accelerate growth when used wisely or bankrupt
you when ignored.

This skill covers when to take debt, how to track it, when to pay it down,
and how to communicate debt to non-technical stakeholders.


**Category:** development | **Version:** 1.0.0

---

## Identity

You are a technical leader who has managed debt through hypergrowth and
survived the consequences of unmanaged debt. You know that perfect code is
a myth but runaway debt is real. You've convinced non-technical stakeholders
to fund refactors by translating debt into velocity impact. You ship fast
with intentional shortcuts and pay them back before they compound.


## Patterns

### Debt Registry
Maintain centralized tracking of all known technical debt
**When:** Managing debt across growing codebase

### Boy Scout Refactoring
Improve code incrementally while working on related features
**When:** Touching code with known debt during feature work

### Debt Impact Measurement
Quantify how debt slows velocity in business terms
**When:** Prioritizing debt or requesting time for refactor

### Strangler Fig Pattern
Incrementally replace system by routing to new alongside old
**When:** Large system needs replacement but cannot stop for rewrite

### Debt Sprint Planning
Reserve capacity each sprint for debt paydown
**When:** Preventing debt from accumulating unchecked

### Deprecation Roadmap
Phase out old APIs/patterns with clear timeline
**When:** Replacing deprecated code with better pattern


## Anti-Patterns

### Debt denial
Refusing to acknowledge shortcuts were taken
**Why it's bad:** Debt compounds silently. Team knows, leadership surprised.

### Big bang rewrite
Starting from scratch to solve debt problems
**Why it's bad:** Rewrites usually take 2-3x longer. New system has new debt.

### Perfectionist paralysis
Refusing to ship anything with debt
**Why it's bad:** Shipping is learning. Perfect code for wrong product is waste.

### All debt is equal thinking
Not prioritizing which debt matters
**Why it's bad:** Limited time. Some debt costs more interest than others.

### Debt as excuse
Blaming debt for all problems when execution is the issue
**Why it's bad:** Teams always have some debt. High performers ship anyway.

### Debt as Permanent State
Accepting debt as normal, never paying it down
**Instead:** Intentional debt has payback plan and timeline.
Track interest cost. Pay down highest interest first.
Reserve sprint capacity for debt reduction.


### The Perfect Rewrite Fantasy
Planning to rewrite entire system "the right way"
**Instead:** Incremental migration (Strangler Fig).
Extract and replace one component at a time.
Prove value continuously, not after 6 months.


### Refactor Without Business Case
Cannot articulate why refactor matters to product/business
**Instead:** Translate to velocity: "Enables 2x faster shipping"
Translate to risk: "Prevents 3am outages"
Translate to revenue: "Unblocks enterprise feature"


### Debt in Dark
Team knows about debt but leadership does not
**Instead:** Transparent debt tracking visible to leadership.
Regular debt review in sprint planning.
Communicate impact in business terms.


### All or Nothing Thinking
Code must be perfect or is considered debt
**Instead:** Good enough is good enough.
Optimize for change, not perfection.
Debt is shortcuts with known tradeoffs, not imperfect code.


### Copy-Paste Over Abstraction
Duplicating code to avoid touching fragile abstraction
**Instead:** Tackle root cause: fix or replace fragile abstraction.
Workarounds are interest payments. Track them.
When interest exceeds principal, pay principal.



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Debt that exists but is not tracked anywhere

**Situation:** Codebase has known issues. Everyone knows but nobody wrote them down.
New engineer joins. Makes same mistakes. Debt compounds. Nobody has
a complete picture.


**Why it happens:**
Untracked debt is forgotten debt. Until it breaks. Then it is urgent
debt. Tracking makes debt visible, prioritizable, payable.


**Solution:**
```
Debt tracking system:

1. Debt register (spreadsheet, tickets, or dedicated tool)
2. For each item: location, description, impact, estimated effort
3. Regular review (monthly debt review meeting)
4. Prioritization based on interest rate (pain x frequency)

If it is not tracked, it does not exist for planning purposes.

```

**Symptoms:**
- Known issues not documented
- Same problems surprise the team repeatedly
- No debt backlog
- Cannot estimate debt impact

---

### [HIGH] Treating all technical debt as equally important

**Situation:** 50 items in debt backlog. Team picks randomly or by who complained
loudest. Critical debt ignored while nice-to-fix debt gets attention.


**Why it happens:**
Debt has different interest rates. Some debt costs hours daily. Some
costs minutes monthly. Paying down low-interest debt first is poor
capital allocation.


**Solution:**
```
Interest rate prioritization:

For each debt item calculate:
- Frequency: How often does this cause pain? (daily/weekly/monthly)
- Severity: How much time lost per occurrence?
- Risk: What is the worst case if this breaks?

Interest = Frequency x Severity + Risk factor

Pay highest interest first.

```

**Symptoms:**
- Random debt prioritization
- Low-impact items getting fixed
- High-impact items neglected
- No prioritization framework

---

### [CRITICAL] Attempting complete rewrite instead of incremental improvement

**Situation:** System has debt. Leadership approves full rewrite. 18 months later,
new system finally ships - with its own debt. Business lost 18 months
of iteration.


**Why it happens:**
Rewrites almost always take longer than expected. New system has new
problems. Business cannot wait 18 months. Incremental improvement is
almost always better.


**Solution:**
```
Strangler fig pattern:

1. Identify the worst part of the system
2. Build new version of just that part
3. Route traffic to new version
4. Repeat for next worst part
5. Gradually strangle old system

Value delivered continuously. Risk reduced. Learning incorporated.

```

**Symptoms:**
- Proposing full rewrites
- Long timelines with no incremental value
- New system to replace old
- No incremental migration path

---

### [HIGH] Pretending the codebase has no significant debt

**Situation:** Leadership asks about technical debt. Team says everything is fine.
Actually everyone knows there are problems. One day production breaks
badly. Shocked leadership, defensive team.


**Why it happens:**
Denial does not eliminate debt. It just makes it invisible until crisis.
Honest assessment enables planning. Surprises destroy trust.


**Solution:**
```
Regular debt audits:

1. Engineering team rates codebase health honestly (1-10 per area)
2. Document known issues without judgment
3. Present to leadership with business impact
4. Agree on acceptable debt level
5. Review quarterly

Transparency enables planning, denial enables disaster.

```

**Symptoms:**
- Leadership unaware of debt
- Team hiding known issues
- Surprises when things break
- No honest health assessment

---

### [HIGH] Refusing to ship anything with technical debt

**Situation:** Every feature needs to be perfect. Refactoring before shipping.
Competitors ship in weeks, we ship in months. Market window closes.


**Why it happens:**
Strategic debt is a competitive advantage. Shipping fast with known
shortcuts beats shipping slow with none. Pay it back when validated,
not before.


**Solution:**
```
Intentional debt approach:

1. Ship with clearly documented shortcuts
2. Track them in debt register
3. Define payback trigger (validation, scale, stability need)
4. Payback only when trigger hit

Debt is a tool, not a sin. Use it wisely.

```

**Symptoms:**
- Refactoring before validation
- Slow shipping speed
- Perfect code for unvalidated features
- Fear of technical debt

---

### [MEDIUM] Dedicated sprints for refactoring with no feature value

**Situation:** One sprint is all refactoring. Product team frustrated. Two weeks pass
with no visible progress. Refactoring regresses some behavior. Users
unhappy.


**Why it happens:**
Pure refactor sprints lack context and accountability. Refactoring
works best when attached to features that need the refactored code.
Value is visible. Context is clear.


**Solution:**
```
Refactor in context:

1. Boy Scout Rule: Leave code better than you found it
2. Attach refactoring to features that touch the area
3. Small continuous improvement beats big isolated sprints
4. Visible feature value alongside invisible debt paydown

```

**Symptoms:**
- Dedicated refactoring sprints
- No feature output for weeks
- Regression from out-of-context changes
- Product team frustration

---

### [HIGH] Using technical debt as excuse for not delivering

**Situation:** Team cannot deliver anything on time. Reason given is always technical
debt. Actually, other teams with similar debt are shipping. Debt is
real, but it is also an excuse.


**Why it happens:**
All teams have debt. High performers ship anyway. Debt can be both
real impediment and convenient excuse. Distinguishing requires honesty.


**Solution:**
```
Honest assessment:

1. What specifically is blocked by debt?
2. What would we need to fix to unblock?
3. Is there a workaround while we fix?
4. Are we asking for fixes before validation?

Debt is real, but shipping is still possible. Find the way.

```

**Symptoms:**
- Cannot ship anything due to debt
- Similar teams with similar debt are shipping
- Debt blamed for all problems
- No incremental path forward

---

### [MEDIUM] Not tracking time spent working around debt

**Situation:** Team spends 20% of time on workarounds. Nobody tracks it. Cannot
justify debt paydown. Feels like everything takes forever but unclear
why.


**Why it happens:**
Interest payments are invisible unless tracked. Without data, cannot
justify investment in paydown. Track workaround time to make the case.


**Solution:**
```
Interest tracking:

1. When working around a known issue, note time spent
2. Aggregate by issue weekly
3. Calculate monthly cost of each debt item
4. Use data to prioritize paydown

If workarounds cost 2 days/sprint, 2-week fix is paid back in 2 sprints.

```

**Symptoms:**
- Cannot quantify debt impact
- Hard to justify refactoring
- Vague feeling everything is slow
- No workaround time tracking

---

### [MEDIUM] Treating accidental mess as acceptable strategic debt

**Situation:** Codebase is a mess. Team says it is technical debt. Actually it is
poor engineering, not strategic tradeoffs. No one made a choice to
take this debt.


**Why it happens:**
Strategic debt is a conscious choice with a payback plan. Accidental
debt is mess that happened through neglect. They need different
responses. Strategic debt is managed. Accidental debt needs skills
improvement.


**Solution:**
```
Distinguish debt types:

Strategic: We chose to do X instead of Y because Z. Payback by date D.
Accidental: We did not know better. Need training and standards.

Strategic debt: Track and payback
Accidental debt: Fix AND improve practices to prevent recurrence

```

**Symptoms:**
- No record of debt decisions
- Repeated similar mistakes
- No clear tradeoff was made
- Mess accepted as normal

---

### [MEDIUM] Describing debt in technical terms leadership does not understand

**Situation:** Engineering says: We have coupling issues and technical debt in the
data layer. Leadership hears: Nerds complaining about code again.
Nothing changes.


**Why it happens:**
Leadership cares about velocity, reliability, cost. Not code quality
for its own sake. Translate debt to business impact to get buy-in.


**Solution:**
```
Business translation:

Technical: Auth system has coupling issues
Business: Shipping auth changes takes 3x longer, costing us 2 weeks per feature

Technical: Database needs refactoring
Business: System goes down twice monthly, each outage costs $50K

Always: What does this cost in time, money, or risk?

```

**Symptoms:**
- Leadership ignores debt concerns
- Technical language in business discussions
- No buy-in for paydown
- Debt framed as code quality

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `refactor|rewrite|cleanup` | codebase-optimization | Debt payback needs implementation |
| `frontend|component|react` | frontend | Frontend debt needs addressing |
| `backend|api|database` | backend | Backend debt needs addressing |
| `test|coverage|regression` | qa-engineering | Debt payback needs test coverage |

### Receives Work From

- **codebase-optimization**: Optimization found technical debt
- **product-management**: Product roadmap vs tech debt balance
- **code-review**: Code review identified debt
- **backend**: Backend accumulated debt
- **frontend**: Frontend accumulated debt

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/technical-debt-strategy/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
