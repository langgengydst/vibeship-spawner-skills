# Customer Success

> Acquisition is expensive. Retention is profitable. Customer success is the
discipline of ensuring customers achieve their desired outcomes with your
product - which leads to retention, expansion, and advocacy.

This skill covers onboarding that activates, health scoring that predicts,
retention plays that save, and expansion strategies that grow accounts.


**Category:** product | **Version:** 1.0.0

---

## Patterns

### Activation Milestones
Define specific value moments users must hit to become activated
**When:** Designing onboarding flows or measuring activation success

### Proactive Health Monitoring
Build health scores that predict churn before users decide to leave
**When:** Designing customer success operations and intervention playbooks

### Segmented Engagement
Design different CS motions for different customer segments
**When:** Scaling customer success beyond one-size-fits-all approach

### Time-to-Value Optimization
Ruthlessly reduce time from signup to first value moment
**When:** Improving activation rates and reducing early churn

### Leading Indicator Dashboards
Track metrics that predict future outcomes, not just outcomes
**When:** Building CS dashboards and alert systems

### Expansion Triggers
Identify behavioral signals that indicate expansion readiness
**When:** Designing expansion playbooks and upsell motions


## Anti-Patterns

### Onboarding as Checklist
Long list of tasks with no clear path to value
**Instead:** Minimum viable onboarding to first value moment. Get users to "aha" in minutes,
not hours. Use progressive disclosure - teach advanced features after activation


### Vanity Health Scores
Health scores that look good but don't predict churn
**Instead:** Validate health scores against actual churn data. Iterate formula until predictive.
Include usage depth, not just frequency. Weight by correlation with retention


### Spray and Pray Outreach
Mass emails that ignore customer context and lifecycle stage
**Instead:** Segment by lifecycle stage and health score. Different messages for different
states. Onboarding tips for new users, expansion offers for power users, win-back
for dormant. Make every message relevant


### Saving at Cancellation
Only trying to retain at the moment of churn decision
**Instead:** Intervene early when health score declines. Build relationship before crisis.
Proactive check-ins when usage drops. Solve problems before they become churn


### Ignoring Power Users
All focus on at-risk customers, none on advocates
**Instead:** Build advocacy program for happy customers. Make it easy to refer, review, share.
Expansion conversations with power users. Feature beta access. Community programs


### Generic Onboarding
Same onboarding flow for all users regardless of use case or experience
**Instead:** Segment onboarding by role, company size, use case. Ask 1-2 questions upfront,
customize flow. Show enterprise features to enterprise users, simplicity to solo.
Personalization drives activation



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Complex onboarding that users never complete

**Situation:** 15-step onboarding flow. Completion rate is 20%. Users who complete
retain at 80%. Users who do not complete churn at 90%. Most value
never delivered.


**Why it happens:**
Every step is friction. Users have limited patience. If they do not
reach value quickly, they leave. Front-load value, minimize steps.


**Solution:**
```
Minimum viable onboarding:

1. Single key action to value (under 5 minutes)
2. Progressive disclosure of advanced features
3. Measure step completion rates
4. Remove steps with high drop-off

The goal is first value moment, not complete understanding.

```

**Symptoms:**
- Low onboarding completion rate
- High early churn
- Many steps before value
- Users asking basic questions after onboarding

---

### [HIGH] Only measuring revenue, missing leading indicators

**Situation:** MRR looks fine. Suddenly drops 30% in a month. Team surprised. Actually
engagement had been declining for months. Nobody was watching.


**Why it happens:**
Revenue is a lagging indicator. By the time it drops, damage is done.
Leading indicators give warning. Engagement, feature adoption, support
sentiment - these predict revenue changes.


**Solution:**
```
Leading indicator dashboard:

Daily: Active users, key feature usage
Weekly: Feature adoption, support ticket sentiment
Monthly: NPS trends, health score distribution

Alert on leading indicator drops before revenue impact.

```

**Symptoms:**
- Only tracking revenue metrics
- Surprised by churn
- No engagement tracking
- Reactive not proactive

---

### [HIGH] Same success effort for all customers regardless of value

**Situation:** Enterprise customer worth $100K/year gets same attention as $50/month
self-serve customer. Enterprise churns for lack of attention.
Self-serve customers get more time than they are worth.


**Why it happens:**
Success resources are finite. Spreading evenly ignores economics.
High-value customers need high-touch. Low-value customers need
efficient self-serve. Match effort to customer value.


**Solution:**
```
Tiered success model:

Enterprise ($50K+): Dedicated CSM, quarterly business reviews
Mid-market ($1K-50K): Shared CSM, monthly check-ins
SMB ($100-1K): Tech-touch, automated sequences
Self-serve (under $100): Community and self-help

Calculate cost-to-serve vs customer value for each tier.

```

**Symptoms:**
- Same approach for all customers
- Enterprise customers feel neglected
- Too much time on low-value accounts
- No tier definitions

---

### [HIGH] Health scores that do not actually predict churn

**Situation:** Health score shows green. Customer churns. Score was based on logins,
not actual value delivery. Looked healthy, was not.


**Why it happens:**
Health scores are only useful if they predict outcomes. Many scores
measure activity, not value. Validate your score against actual
churn data. Iterate until predictive.


**Solution:**
```
Health score validation:

1. Run retrospective analysis on churned customers
2. What did their health scores look like 30, 60, 90 days before churn?
3. What signals did we miss?
4. Add those signals to the score
5. Test prediction accuracy monthly

A score that does not predict is worse than no score.

```

**Symptoms:**
- Churns from green accounts
- No retrospective on churned customers
- Score never updated
- Activity-based not value-based

---

### [HIGH] Only engaging at renewal time

**Situation:** Ignore customer for 11 months. Suddenly engage at renewal. Customer
has already decided to leave. Too late. Discount offered in desperation.


**Why it happens:**
Renewal is an outcome, not an activity. The decision happens throughout
the relationship. Quarterly business reviews, ongoing value delivery,
proactive engagement - these determine renewal.


**Solution:**
```
Renewal is earned throughout the year:

Quarterly: Business review, success metrics review
Monthly: Check-in on goals and blockers
Ongoing: Product education, feature announcements
At renewal: Celebration of value delivered, expansion discussion

No surprises at renewal because relationship is continuous.

```

**Symptoms:**
- Renewal outreach only near end date
- Low renewal rate
- Customers surprised by renewal
- No QBRs or regular touchpoints

---

### [MEDIUM] Customer success doing support, not success

**Situation:** CSM spends all day answering how-to questions. No time for strategic
conversations. Customers trained to use CSM as support. No proactive
success happening.


**Why it happens:**
Success and support are different functions. Success is proactive and
strategic. Support is reactive and tactical. When success does support,
nobody does success.


**Solution:**
```
Clear role separation:

Support: Reactive, tactical, how-to questions
Success: Proactive, strategic, business outcomes

Escalation paths:
- Technical issues go to support
- Strategy questions go to success

Train customers on correct routing from onboarding.

```

**Symptoms:**
- CSMs answering how-to questions
- No time for strategic conversations
- CSM as glorified support
- No proactive outreach happening

---

### [MEDIUM] Expansion conversations that feel like sales pitches

**Situation:** Customer happy with product. CSM pushes upgrade aggressively. Customer
feels sold to. Trust damaged. Actually churns instead of expanding.


**Why it happens:**
Expansion should feel like helping, not selling. When customers outgrow
their tier, expansion is natural. Pushing before they are ready damages
the relationship.


**Solution:**
```
Expansion through value:

1. Track usage vs plan limits
2. When approaching limits, explain options
3. Frame as solution to their growth, not your revenue
4. If not ready, back off gracefully

Natural expansion signals:
- Hitting usage limits
- Asking about features in higher tiers
- Adding users or use cases

```

**Symptoms:**
- Aggressive upsell attempts
- Customers complain about sales pressure
- Expansion damages relationships
- Pushing before usage supports it

---

### [MEDIUM] All focus on at-risk, none on advocates

**Situation:** All CSM time on saving at-risk accounts. Happy customers ignored.
Power users never asked to refer, review, or expand. Advocacy
opportunity missed.


**Why it happens:**
Happy customers are an asset. They can refer, review, case study,
expand. Ignoring them leaves revenue and advocacy on the table.
Balanced attention to risk and opportunity.


**Solution:**
```
Advocate program:

Identify happy customers (NPS 9-10, high health, frequent users)
Ask for: Referrals, reviews, case studies, references
Reward: Early access, exclusive events, recognition

Time allocation: 70% at-risk, 30% advocates (or adjust based on data)

```

**Symptoms:**
- All focus on red accounts
- No referral asks
- No case studies being created
- Happy customers feel ignored

---

### [MEDIUM] Trying to scale customer success manually

**Situation:** 100 customers per CSM. Impossible to give everyone attention.
Important tasks slip. Quality drops. Team burns out.


**Why it happens:**
Human touch cannot scale linearly. Automation, playbooks, and tech-touch
must handle low-touch segments. CSM time reserved for high-touch and
exceptions.


**Solution:**
```
Scalable success:

Automate: Onboarding sequences, usage-based nudges, renewal reminders
Playbooks: Standardized responses to common situations
Self-serve: Knowledge base, community, in-app guidance

CSM time only for:
- High-value strategic conversations
- Complex escalations
- Expansion opportunities

```

**Symptoms:**
- CSM overwhelmed
- Inconsistent experience
- Manual processes for everything
- No automation in place

---

### [MEDIUM] Not learning from churned customers

**Situation:** Customer churns. Marked as closed-lost. No investigation. Same
problems keep causing churn. Pattern never identified.


**Why it happens:**
Every churn is a learning opportunity. Why did they leave? What
could we have done differently? Without learning, the same problems
cause the same churn forever.


**Solution:**
```
Churn investigation process:

1. Exit interview (even if brief)
2. Review health score history
3. Review support and CSM interactions
4. Identify: Was this preventable? How?
5. Monthly churn patterns review
6. Product and process changes based on learnings

```

**Symptoms:**
- No exit interviews
- No churn pattern analysis
- Same reasons keep causing churn
- Churn seen as inevitable

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `email|sequence|automation` | email-systems | CS needs email automation |
| `track|health|analytics` | analytics-architecture | CS needs health scoring |
| `product|feature|feedback` | product-management | CS has product feedback |
| `copy|messaging|content` | copywriting | CS needs messaging |

### Receives Work From

- **product-strategy**: Product needs retention focus
- **growth-strategy**: Growth needs retention
- **marketing**: Marketing needs lifecycle
- **product-management**: Product needs user feedback

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/product/customer-success/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
