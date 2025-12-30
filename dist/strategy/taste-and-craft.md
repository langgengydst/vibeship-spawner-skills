# Taste and Craft

> Good taste is knowing what is good. Craft is making it real. Together they
separate products people tolerate from products people love. Paul Graham's
essays explore how taste develops and why it matters.

This skill synthesizes PG's wisdom on quality, simplicity, and the details
that separate great from good.


**Category:** strategy | **Version:** 1.0.0

---

## Patterns

### Taste Development Practice
Study great work systematically to develop taste over time
**When:** Building your ability to recognize and create quality

### Simplicity Discipline
Remove everything possible until it breaks, then add back one element
**When:** Making design and product decisions

### Detail Obsession
Sweat every small detail as signal of overall quality
**When:** Reviewing work before shipping

### Timeless Over Trendy
Choose design principles that age well over current trends
**When:** Making aesthetic and architectural decisions

### Quality as Habit
Build quality in from the start, not as a later polish phase
**When:** Beginning any project or feature

### Good People Make Good Things
Hire people who care about craft and create culture where quality matters
**When:** Building team and culture


## Anti-Patterns

### Complexity as sophistication
Adding complexity to seem advanced
**Why it's bad:** Users want simplicity. Complexity is often laziness in disguise.

### Quality later
Assuming you can add quality after shipping
**Why it's bad:** Quality is a habit, not a phase. Patterns set early persist.

### Ignoring details
Dismissing small imperfections as unimportant
**Why it's bad:** Users feel it even if they cannot articulate it. Trust erodes.

### Trend chasing
Adopting whatever is currently popular
**Why it's bad:** Constant change is disorienting. Trends date quickly.

### Taste as elitism
Using taste to dismiss or exclude
**Why it's bad:** Taste should elevate, not exclude. Users know when things work.


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Adding complexity to appear sophisticated

**Situation:** Feature has 12 settings. Three nested menus. Configurable everything.
Feels powerful. Actually unusable. Users confused. Simple competitor
wins.


**Why it happens:**
Complexity is often laziness in disguise. Understanding what is
essential is hard. Adding everything is easy. Simple solutions
require deeper understanding.


**Solution:**
```
Simplicity practice:

For every feature ask:
What is the minimum that delivers value?
What can be removed without losing core benefit?
What can be defaulted instead of configured?

Remove until it breaks. Then add back just enough.

```

**Symptoms:**
- Many settings and options
- User confusion
- Power users confused by complexity
- Simpler competitors winning

---

### [HIGH] Planning to add quality after shipping MVP

**Situation:** Ship fast. Add polish later. Later never comes. Product stays rough.
Users form impressions. Competitors have polish. Catch-up is harder
than doing it right initially.


**Why it happens:**
Quality is a habit, not a phase. If you ship rough, rough becomes
normal. Polish is always deprioritized for features. Build quality
in from the start.


**Solution:**
```
Quality from the start:

Definition of done includes quality basics:
- Aligned elements
- Consistent spacing
- Intentional copy
- Smooth interactions

Slower initially. Faster overall. Quality compounds.

```

**Symptoms:**
- Rough edges in production
- Always prioritizing features over polish
- Quality debt accumulating
- Competitors feel more polished

---

### [HIGH] Dismissing details as unimportant perfectionism

**Situation:** Slightly off alignment. Inconsistent colors. Typos. Good enough. Ship
it. Users notice something feels off. Cannot articulate. Trust erodes.


**Why it happens:**
Details signal care. Users feel quality even when they cannot articulate
it. Small imperfections compound to feeling of rough product. Details
are the surface of deeper quality.


**Solution:**
```
Sweat the details:

Every pixel matters
Every word matters
Every interaction matters

Not perfectionism that prevents shipping.
But care that shows in the result.

```

**Symptoms:**
- Misaligned elements
- Inconsistent styles
- Typos in product
- Users say it feels off

---

### [MEDIUM] Redesigning to follow every new design trend

**Situation:** Last year glassmorphism. This year neubrutalism. Next year something
else. Constant redesign. Users disoriented. Each trend dates quickly.


**Why it happens:**
Trends pass. Timeless principles endure. Chasing trends means
perpetual redesign and dated feeling within a year. Choose timeless
and update rarely.


**Solution:**
```
Timeless principles:

Simple (will never go out of style)
Clear (always valuable)
Consistent (builds trust)
Functional (serves the user)

Ask: Will this look dated in 5 years? If yes, reconsider.

```

**Symptoms:**
- Following design trends
- Frequent redesigns
- Product feels dated
- Constant UI changes

---

### [MEDIUM] Believing taste is innate and cannot be developed

**Situation:** I just do not have good taste. Cannot improve. Will always make
mediocre things. Self-fulfilling prophecy. No effort to develop.


**Why it happens:**
Taste is learned, not innate. Study great work. Understand why it
is great. Compare to lesser work. See differences. Taste develops
through deliberate exposure and analysis.


**Solution:**
```
Taste development practice:

Daily: 30 minutes studying great products
For each: What makes this great? What would make it less great?
Compare: Put great and mediocre side by side
Apply: Use insights in your work
Seek feedback: From people with better taste

```

**Symptoms:**
- Belief taste is fixed
- No effort to develop taste
- Not studying great work
- Accepting mediocrity

---

### [MEDIUM] Prioritizing feature count over feature quality

**Situation:** Shipped 20 features this quarter. All mediocre. Competitor shipped 5.
All excellent. Competitor winning. Users prefer depth over breadth.


**Why it happens:**
Users do not use feature counts. They use features. One excellent
feature beats ten mediocre ones. Depth creates loyalty. Breadth
creates confusion.


**Solution:**
```
Quality over quantity:

Before starting a new feature, ask:
Could we make existing features better instead?
Is the new feature excellent or just adequate?
Would users prefer depth in what we have?

Ship fewer things, ship them better.

```

**Symptoms:**
- Many features, none excellent
- Feature factory mentality
- Always shipping new, never improving old
- Shallow feature set

---

### [MEDIUM] Copying design patterns without understanding why they work

**Situation:** Copied successful product UI. Looks similar. Does not work. Context
was different. Pattern applied without understanding principles.


**Why it happens:**
Patterns work for reasons. Copying without understanding means
applying solutions to wrong problems. Understanding why enables
adaptation to your context.


**Solution:**
```
Learn principles, not just patterns:

When seeing good design:
Why does this work?
What problem does it solve?
What is the underlying principle?
How does that principle apply to my context?

Copy principles, adapt patterns.

```

**Symptoms:**
- Copied designs that do not work
- Surface-level imitation
- No understanding of why things work
- Patterns misapplied

---

### [MEDIUM] Using taste as excuse to avoid shipping

**Situation:** Not good enough yet. Needs more polish. Perfection as delay tactic.
Nothing ever ships. Taste becomes excuse for fear.


**Why it happens:**
Taste is about making better, not making perfect. Ship excellent
not perfect. Done is better than perfect. Taste that prevents
shipping is fear in disguise.


**Solution:**
```
Ship excellent, not perfect:

Set quality bar (what is excellent for this stage?)
Ship when excellent bar is met
Do not wait for perfect

Would I be proud to show this? Yes = ship.
Could it be better? Always yes, ship anyway.

```

**Symptoms:**
- Never shipping due to quality concerns
- Perfection as delay
- Taste as excuse
- Fear hidden as standards

---

### [MEDIUM] Building in isolation without user feedback on quality

**Situation:** Team thinks it is great. Users confused. Internal taste disconnected
from user experience. Nobody knows because nobody asked.


**Why it happens:**
Internal taste can diverge from user needs. Feedback loop keeps
quality grounded in reality. What feels polished to team may be
confusing to users.


**Solution:**
```
User quality feedback:

Regular user testing on quality perception
What feels confusing?
What feels rough?
What feels delightful?

Calibrate internal taste with external experience.

```

**Symptoms:**
- Team loves it, users confused
- No user testing on quality
- Internal echo chamber
- Disconnected from user experience

---

### [MEDIUM] Accumulating quality issues without addressing them

**Situation:** Known rough edges everywhere. Never prioritized. Product feels
increasingly rough. Compound effect of ignored quality issues.


**Why it happens:**
Craft debt compounds like technical debt. Each ignored rough edge
adds up. Eventually the whole product feels rough. Pay down craft
debt regularly.


**Solution:**
```
Craft debt management:

Track known quality issues
Dedicate time regularly (10% of sprint) to craft
Fix rough edges alongside new features
Do not let craft debt compound

```

**Symptoms:**
- List of known quality issues
- Never prioritized
- Product feels rough
- Quality degrading over time

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `design|visual|ui|interface` | ui-design | Taste needs visual execution |
| `product|features|experience` | product-strategy | Taste needs product integration |
| `copy|messaging|words` | copywriting | Taste needs verbal expression |
| `creative|campaign|content` | creative-strategy | Taste needs creative direction |

### Receives Work From

- **product-strategy**: Product needs quality direction
- **ui-design**: Design needs taste calibration
- **founder-character**: Founder developing taste
- **creative-strategy**: Creative needs quality bar

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/strategy/taste-and-craft/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
