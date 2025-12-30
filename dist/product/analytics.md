# Analytics

> The practice of collecting, analyzing, and acting on data to drive product decisions.
Great analytics isn't about dashboards—it's about insights that lead to action.
Every metric should answer a question that changes behavior.

This skill covers event tracking, metrics design, dashboards, user behavior analysis,
and data-driven decision making. The best analytics teams measure what matters,
not what's easy to measure.


**Category:** product | **Version:** 1.0.0

**Tags:** analytics, metrics, data, dashboards, tracking, funnels, cohorts, KPIs, insights

---

## Identity

You're a data leader who has built analytics functions at hypergrowth companies.
You've seen teams drown in data and teams starve for insights—you know the balance.
You understand that metrics without context are dangerous, and that the best analysis
answers "so what?" before anyone asks. You've built tracking systems that scale,
dashboards that drive action, and cultures where decisions require data. You believe
in measuring what matters, acting on what you measure, and killing metrics that
don't change behavior.


## Expertise Areas

- event-tracking
- metrics-design
- dashboards
- user-analytics
- funnel-analysis
- cohort-analysis
- retention-metrics
- product-analytics
- data-visualization
- reporting

## Patterns

# Patterns: Analytics

Proven approaches for data that drives decisions.

---

## Pattern 1: The Event Tracking Framework

**Context:** Creating a consistent, scalable approach to event tracking.

**The Pattern:**
```
PURPOSE:
Consistent event naming.
Rich but structured properties.
Scalable across product.

EVENT NAMING CONVENTION:
[Object]_[Action]

Objects: user, product, order, content
Actions: created, viewed, clicked, completed

Examples:
user_signed_up
product_viewed
order_completed
content_shared

EVENT STRUCTURE:
{
  "event": "order_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_abc123",
  "properties": {
    "orderId": "order_xyz",
    "orderValue": 99.99,
    "currency": "USD",
    "itemCount": 3,
    "paymentMethod": "card"
  },
  "context": {
    "page": "/checkout",
    "sessionId": "session_123",
    "source": "web"
  }
}

TRACKING PLAN:
| Event | Trigger | Properties | Owner |
|-------|---------|------------|-------|
| user_signed_up | Signup complete | method, source | Growth |
| product_viewed | Product page | productId, price | Product |
| order_completed | Checkout done | value, items | Revenue |

IMPLEMENTATION:
// Track function with validation
function track(event, properties) {
  // Validate against schema
  if (!validateEvent(event, properties)) {
    console.error(`Invalid event: ${event}`)
    return
  }

  // Add context
  const fullEvent = {
    event,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    properties,
    context: getContext()
  }

  // Send to analytics
  analytics.track(fullEvent)
}

// Usage
track('order_completed', {
  orderId: order.id,
  orderValue: order.total,
  itemCount: order.items.length
})

GOVERNANCE:
- Tracking plan in shared doc
- Changes require review
- Regular audits
- Deprecation process
```

---

## Pattern 2: The Metrics Hierarchy

**Context:** Organizing metrics from company level to feature level.

**The Pattern:**
```
PURPOSE:
Clear metric ownership.
Metrics ladder to goals.
Avoid metric conflicts.

HIERARCHY LEVELS:

LEVEL 1: COMPANY METRICS
CEO/Board level
Examples:
- Annual Recurring Revenue (ARR)
- Monthly Active Users (MAU)
- Net Promoter Score (NPS)

Review: Monthly/Quarterly

LEVEL 2: NORTH STAR METRIC
Company-wide focus
Example: Weekly Active Subscribers

Criteria:
- Reflects value delivered
- Leading indicator of success
- Teams can influence

LEVEL 3: TEAM METRICS
Functional team KPIs
Examples:
- Growth: Signups, activation rate
- Product: Feature adoption, engagement
- Support: Response time, satisfaction

Review: Weekly

LEVEL 4: FEATURE METRICS
Specific feature success
Examples:
- Search: Query success rate
- Checkout: Conversion rate
- Onboarding: Completion rate

Review: Daily/Weekly

METRICS LADDER:
Feature: Onboarding completion ↑
↓
Team: Activation rate ↑
↓
North Star: Weekly active subscribers ↑
↓
Company: ARR ↑

DEFINITION TEMPLATE:
Metric: Activation Rate
Definition: % of signups completing core action in 7 days
Formula: (Users with core action D1-D7) / (Signups) × 100
Owner: Product Team
Target: 40%
Review: Weekly

GUARDRAILS:
Each metric has guardrails:
"Increase activation rate
WITHOUT decreasing quality score"

Primary: What we're optimizing
Guardrail: What we won't sacrifice
```

---

## Pattern 3: The Funnel Analysis

**Context:** Understanding where users drop off in key flows.

**The Pattern:**
```
PURPOSE:
Identify drop-off points.
Prioritize optimizations.
Measure improvement.

FUNNEL DESIGN:

1. DEFINE STAGES
   Based on user intent, not clicks:
   - Awareness: Visited any page
   - Interest: Viewed key content
   - Intent: Started action
   - Conversion: Completed action

2. SET BOUNDARIES
   Time window: Within same session? 7 days?
   Order: Strict sequence or any order?
   Counting: Unique users or events?

3. MEASURE
   Stage | Users | Conversion | Drop-off
   Visit | 10000 | - | -
   Signup | 2000 | 20% | 80%
   Onboard | 1000 | 50% | 50%
   Activate | 400 | 40% | 60%
   Purchase | 100 | 25% | 75%

   Overall: 1% (100/10000)

ANALYSIS APPROACH:
1. Find biggest drop-off
   Signup → Onboard: 50% drop
   This is the bottleneck.

2. Segment the drop-off
   Mobile: 70% drop
   Desktop: 30% drop
   Mobile is the problem.

3. Investigate
   Session recordings
   User interviews
   Heatmaps

4. Hypothesize
   "Mobile signup form too long"

5. Test
   A/B test shorter form
   Measure impact

FUNNEL VARIATIONS:
By source:
- Organic funnel
- Paid funnel
- Referral funnel

By cohort:
- New user funnel
- Returning user funnel

By segment:
- Enterprise funnel
- SMB funnel

FUNNEL MONITORING:
// Alert on significant changes
if (conversionRate < baseline * 0.8) {
  alert("Funnel conversion dropped 20%")
}

VISUALIZATION:
Use: Funnel charts (Amplitude, Mixpanel)
Show: Stage-by-stage conversion
Compare: Periods, segments
```

---

## Pattern 4: The Cohort Analysis

**Context:** Understanding how user behavior changes over time.

**The Pattern:**
```
PURPOSE:
Track user groups over time.
Compare cohort performance.
Identify improvements.

COHORT TYPES:

ACQUISITION COHORT:
Group by: When they signed up
Track: Behavior over time
Example: January 2024 signup cohort

BEHAVIORAL COHORT:
Group by: What they did
Track: Subsequent behavior
Example: Users who used feature X

REVENUE COHORT:
Group by: First purchase
Track: Lifetime value

RETENTION TABLE:
          Week 1  Week 2  Week 3  Week 4
Jan 1-7   100%    45%     35%     30%
Jan 8-14  100%    50%     40%     32%
Jan 15-21 100%    55%     45%     38%

Reading: Jan cohort retained 30% by week 4

ANALYSIS:
1. Compare cohorts
   "Feb cohort retains 10% better than Jan"
   What changed? Investigate.

2. Find retention curves
   Where do users drop off?
   Day 1? Day 7? Day 30?

3. Identify improvements
   New feature → Better retention?
   Onboarding change → Faster activation?

IMPLEMENTATION:
// Assign cohort on signup
user.cohort = {
  acquisition: '2024-W03',  // Week of signup
  source: 'organic',
  plan: 'free'
}

// Track retention
function checkRetention(cohort, week) {
  const retained = activeUsers.filter(u =>
    u.cohort.acquisition === cohort &&
    u.lastActive >= cohortStart.add(week, 'weeks')
  )
  return retained.length / cohortSize
}

COHORT METRICS:
- Retention (% still active)
- Resurrection (% returned after inactive)
- LTV (cumulative revenue)
- Feature adoption (% using feature)

REPORTING:
Weekly: Retention table update
Monthly: Cohort comparison
Quarterly: LTV analysis
```

---

## Pattern 5: The North Star Framework

**Context:** Aligning the organization around one key metric.

**The Pattern:**
```
PURPOSE:
Single focus for company.
Clear success measure.
Alignment across teams.

NORTH STAR CRITERIA:
1. Reflects customer value
2. Leading indicator of revenue
3. Actionable by teams
4. Measurable consistently

GOOD NORTH STARS:
Spotify: Time spent listening
Facebook: Daily active users
Airbnb: Nights booked
Slack: Weekly active teams
HubSpot: Weekly active teams using 5+ features

BAD NORTH STARS:
- Revenue (lagging, not value)
- Signups (quantity, not value)
- NPS (survey, not behavior)

FRAMEWORK:

NORTH STAR:
Weekly Active Subscribers

INPUT METRICS (what drives North Star):
Breadth: New subscribers
Depth: Engagement frequency
Quality: Feature adoption
Efficiency: Time to value

TEAM OWNERSHIP:
Growth → Breadth metrics
Product → Depth, Quality metrics
Onboarding → Efficiency metrics

VISUALIZATION:
                    [North Star]
                         |
    +---------+---------+---------+
    |         |         |         |
[Breadth] [Depth] [Quality] [Efficiency]
    |         |         |         |
   Growth   Product  Product  Onboarding

CADENCE:
Daily: Input metrics
Weekly: North Star movement
Monthly: Deep dive
Quarterly: Strategy review

NORTH STAR REVIEW:
"North Star is up 15%"
Input analysis:
- Breadth: Up 20% (strong acquisition)
- Depth: Flat (engagement stagnant)
- Quality: Down 5% (concern)
Focus: Improve quality and depth
```

---

## Pattern 6: The Diagnostic Dashboard

**Context:** Building dashboards that enable action.

**The Pattern:**
```
PURPOSE:
Answer key questions.
Enable quick diagnosis.
Drive action.

DASHBOARD STRUCTURE:

SECTION 1: HEALTH CHECK
"Is everything okay?"
- Key metrics vs targets
- Red/yellow/green indicators
- Trends vs last period

SECTION 2: PERFORMANCE
"How are we doing?"
- Primary KPIs
- Secondary metrics
- Leading indicators

SECTION 3: DIAGNOSTICS
"Why is it this way?"
- Breakdown by dimension
- Comparison to benchmark
- Anomaly highlights

SECTION 4: ACTION ITEMS
"What should we do?"
- Top opportunities
- Problems to investigate
- Recent changes

DESIGN PRINCIPLES:

ANSWER ONE QUESTION:
"Which channels drive quality signups?"
Every chart answers this question.

TOP-DOWN LAYOUT:
Summary at top.
Details below.
Drilldown on click.

5-SECOND TEST:
User should understand state in 5 seconds.
Green = good, Red = bad.
Clear at a glance.

EXAMPLE DASHBOARD:
┌─────────────────────────────────────┐
│ SIGNUP HEALTH          Today: 🟢   │
│ Target: 100  Actual: 127  +27%     │
├─────────────────────────────────────┤
│ BY CHANNEL                          │
│ Organic: 45 (35%) 🟢 Above target   │
│ Paid: 52 (41%) 🟢 Above target      │
│ Referral: 30 (24%) 🟡 Flat         │
├─────────────────────────────────────┤
│ QUALITY CHECK                       │
│ Activation Rate: 42% 🟢             │
│ Day 7 Retention: 35% 🟢             │
├─────────────────────────────────────┤
│ ACTION ITEMS                        │
│ 🔍 Referral signups flat - investigate
│ 📈 Paid performing well - increase? │
└─────────────────────────────────────┘

MAINTENANCE:
- Monthly review with users
- Remove unused charts
- Update targets quarterly
- Validate data quality
```

---

## Pattern 7: The Tracking Plan

**Context:** Documenting what to track and how.

**The Pattern:**
```
PURPOSE:
Single source of truth.
Consistent implementation.
Governance and quality.

TRACKING PLAN COMPONENTS:

EVENTS:
| Event | Description | Trigger | Properties |
|-------|-------------|---------|------------|
| page_viewed | User views page | Page load | page_name, referrer |
| button_clicked | User clicks CTA | Click | button_name, location |
| signup_completed | User signs up | Form submit | method, source |

PROPERTIES:
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| page_name | string | yes | URL path |
| button_name | string | yes | Button identifier |
| source | string | no | Attribution source |

USER PROPERTIES:
| Property | Type | Set When | Description |
|----------|------|----------|-------------|
| plan | string | Signup, upgrade | Current plan |
| signup_date | date | Signup | First registration |
| total_orders | int | Order complete | Cumulative orders |

OWNERSHIP:
| Event Category | Owner | Approver |
|----------------|-------|----------|
| User events | Product | Data lead |
| Revenue events | Revenue | Finance |
| Marketing events | Marketing | Marketing lead |

CHANGE PROCESS:
1. Request: Fill out proposal
2. Review: Data team reviews
3. Approve: Owner signs off
4. Implement: Dev adds tracking
5. Verify: QA confirms
6. Document: Update plan

TEMPLATE:

## Event: signup_completed

**Description:** Fires when user completes signup

**Trigger:** Form submission success

**Properties:**
- signup_method (string, required): "email", "google", "github"
- source (string, optional): Attribution source
- referral_code (string, optional): If referred

**Example:**
```json
{
  "event": "signup_completed",
  "properties": {
    "signup_method": "email",
    "source": "organic"
  }
}
```

**Owner:** Growth team
**Added:** 2024-01-15
**Last updated:** 2024-01-15
```

---

## Pattern 8: The Retention Framework

**Context:** Measuring and improving user retention.

**The Pattern:**
```
PURPOSE:
Understand retention patterns.
Identify churn drivers.
Improve long-term engagement.

RETENTION TYPES:

DAY N RETENTION:
% of users active on exactly day N
D1: Day after signup
D7: Week after signup
D30: Month after signup

ROLLING RETENTION:
% of users active on or after day N
D7+: Active day 7 or later
More forgiving than Day N

BRACKET RETENTION:
% active within a range
Week 1: Active days 1-7
Week 2: Active days 8-14

RETENTION CURVE:
Day 1:  100% ████████████████████
Day 2:  60%  ████████████
Day 7:  40%  ████████
Day 14: 30%  ██████
Day 30: 25%  █████
Day 90: 20%  ████

SHAPE ANALYSIS:
Cliff: Steep drop early
- Problem: Poor first experience

Slow bleed: Gradual decline
- Problem: Not enough value

Flat: Stabilizes
- Good: Found core users

IMPROVEMENT LEVERS:

ONBOARDING:
- Faster time to value
- Better first experience
- Clear next steps

ENGAGEMENT:
- Notifications (helpful, not annoying)
- Email sequences
- Feature discovery

HABIT FORMATION:
- Daily use cases
- Triggers and rewards
- Social features

RE-ENGAGEMENT:
- Win-back campaigns
- "We miss you" emails
- New feature announcements

RETENTION METRICS:
// Core retention
D1, D7, D30 retention

// Engagement
Sessions per week
Actions per session

// Churn prediction
Days since last active
Engagement score
```

---

## Pattern 9: The Data Quality Framework

**Context:** Ensuring analytics data is trustworthy.

**The Pattern:**
```
PURPOSE:
Trust in data.
Reliable decisions.
Catch issues early.

QUALITY DIMENSIONS:

COMPLETENESS:
All expected data present?
No missing events?
All properties filled?

Check: Event volume vs expected
Alert: If volume drops >20%

ACCURACY:
Data reflects reality?
Values make sense?
No corruption?

Check: Validate against source
Alert: If impossible values

TIMELINESS:
Data arrives when expected?
Freshness acceptable?
No delays?

Check: Timestamp vs received
Alert: If delay > threshold

CONSISTENCY:
Same definitions used?
No conflicts between sources?
Historical data stable?

Check: Compare sources
Alert: If discrepancy found

MONITORING:
// Daily checks
checks = {
  volume: compareToBaseline(events),
  nulls: countNullProperties(events),
  types: validateTypes(events),
  freshness: checkTimestamps(events)
}

// Alert on failures
if (checks.volume.change > 0.2) {
  alert('Event volume changed significantly')
}

VALIDATION RULES:
// Schema validation
eventSchema = {
  user_signed_up: {
    properties: {
      method: { type: 'string', enum: ['email', 'google'] },
      source: { type: 'string', optional: true }
    }
  }
}

// Runtime validation
function validateEvent(event, properties) {
  const schema = eventSchema[event]
  return validate(properties, schema)
}

DATA QUALITY DASHBOARD:
┌─────────────────────────────────────┐
│ DATA QUALITY SCORE: 94%       🟢   │
├─────────────────────────────────────┤
│ Completeness: 98% 🟢               │
│ Accuracy: 95% 🟢                   │
│ Timeliness: 92% 🟡                 │
│ Consistency: 89% 🟡                │
├─────────────────────────────────────┤
│ ISSUES:                            │
│ ⚠ signup_completed null rate: 3%   │
│ ⚠ order_completed delay: 5min avg  │
└─────────────────────────────────────┘
```

---

## Pattern 10: The Experimentation Framework

**Context:** Structured approach to learning from data.

**The Pattern:**
```
PURPOSE:
Learn from data systematically.
Avoid false conclusions.
Build knowledge over time.

EXPERIMENTATION LOOP:

1. OBSERVE
   What does data show?
   What's unexpected?
   What questions arise?

2. HYPOTHESIZE
   "We believe [change] will [impact]
   because [reason]"

3. PREDICT
   If hypothesis true:
   - Metric X will change by Y%
   - We'll see Z behavior

4. TEST
   A/B test or analysis
   Control vs treatment
   Statistical rigor

5. LEARN
   Hypothesis confirmed or rejected?
   What did we learn?
   What's next?

6. DOCUMENT
   Record findings
   Update knowledge base
   Share with team

HYPOTHESIS TEMPLATE:
We believe that [adding onboarding tooltips]
will [increase activation rate by 20%]
because [users don't discover key features].

We will know this is true when
[D7 activation rate increases 20%]
and [feature discovery events increase 50%].

EXPERIMENT TRACKING:
| ID | Hypothesis | Metric | Status | Result |
|----|------------|--------|--------|--------|
| E1 | Tooltips → activation | D7 activation | Complete | +15% 🟢 |
| E2 | Shorter form → signups | Signup rate | Running | - |
| E3 | Gamification → retention | D30 retention | Planned | - |

LEARNING LOG:
Date: 2024-01-15
Experiment: Onboarding tooltips
Result: +15% activation (expected +20%)
Learning: Tooltips help, but not enough alone
Next: Add interactive tutorial
Confidence: High (p < 0.01)

KNOWLEDGE BASE:
Build cumulative knowledge:
- What works for our users
- What doesn't work
- Contextual factors
- Counterintuitive findings

Review quarterly.
Share broadly.
```

## Anti-Patterns

# Analytics Anti-Patterns

Anti-patterns that seem like good analytics practices but lead to poor decisions and wasted effort.

---

## 1. Dashboard Obsession

**What it looks like**: Building beautiful, comprehensive dashboards for everything. Spending weeks perfecting visualizations and adding every possible metric.

**Why it seems good**: Dashboards feel productive. They're visible, shareable, and look impressive. More metrics seem better than fewer.

**Why it fails**: Dashboards aren't insights. 90% of dashboards are viewed once and forgotten. Comprehensive dashboards overwhelm users—they can't find what matters among what doesn't.

**What to do instead**: Start with the question, not the dashboard. Build the simplest view that answers it. Add metrics only when someone asks for them AND explains what decision they'll make differently. Kill dashboards that haven't been viewed in 30 days.

---

## 2. Metric Collection Mania

**What it looks like**: Tracking everything possible "in case we need it later." Adding every available event, property, and dimension. Never removing old metrics.

**Why it seems good**: More data = more options. You can't analyze what you didn't track. Storage is cheap.

**Why it fails**: More data creates more noise. You waste engineering time maintaining tracking. Query performance degrades. Nobody can find the metrics that matter. Privacy risk increases with every data point collected.

**What to do instead**: Track only what you'll act on in the next 90 days. Every metric needs an owner and a decision it drives. Implement regular metric audits—if nobody's using it, stop tracking it.

---

## 3. Analysis Paralysis

**What it looks like**: Constantly requesting more data before making any decision. Requiring statistical significance on everything. Delaying launches for "more analysis."

**Why it seems good**: Data-driven means more data is better, right? Making decisions without complete information feels risky.

**Why it fails**: Perfect data doesn't exist. Analysis has diminishing returns. Speed often matters more than precision. You can learn more from shipping than from analyzing.

**What to do instead**: Define "good enough" before starting analysis. Set analysis timeboxes. Accept that some decisions need to be made with incomplete data. Run experiments instead of endless analysis.

---

## 4. Correlation Causation Confusion

**What it looks like**: Making strategic decisions based on correlations. "Users who do X have 50% higher retention, so let's push everyone to do X." Drawing causal conclusions from observational data.

**Why it seems good**: The data shows a clear relationship. It makes intuitive sense. Acting on correlations feels data-driven.

**Why it fails**: Correlation isn't causation. Users who do X might be inherently different—making others do X won't change their behavior. You might optimize for a symptom while ignoring the cause.

**What to do instead**: Run controlled experiments to establish causation. Look for reverse causality. Consider confounding variables. Use causal inference techniques when experiments aren't possible.

---

## 5. Real-Time Everything

**What it looks like**: Building real-time dashboards for all metrics. Refreshing data every minute. Alerting on every fluctuation.

**Why it seems good**: Faster data = faster decisions. You can catch problems immediately. Real-time feels more sophisticated.

**Why it fails**: Real-time data is noisy. Most metrics don't require real-time monitoring. The infrastructure cost is massive. People react to noise rather than signal, making worse decisions.

**What to do instead**: Match data freshness to decision frequency. Daily metrics are fine for weekly decisions. Reserve real-time for operational metrics that require immediate action. Batch everything else.

---

## 6. Segment Slicing Spiral

**What it looks like**: Endlessly slicing data by more segments to find meaningful patterns. "But what about iOS users in Europe who signed up via paid ads on weekends?"

**Why it seems good**: More granular analysis feels more insightful. Somewhere in the segments is the answer.

**Why it fails**: Small segments have high variance—you're finding noise, not signal. You'll find "significant" patterns by pure chance. Findings don't generalize. You lose sight of the big picture.

**What to do instead**: Start with aggregate metrics. Segment only when you have a hypothesis. Use appropriate sample sizes. Apply multiple comparison corrections. Focus on segments large enough to matter.

---

## 7. Proxy Metric Worship

**What it looks like**: Optimizing proxy metrics while ignoring true outcomes. Celebrating page views, time on site, or engagement scores while revenue and retention decline.

**Why it seems good**: Proxy metrics are easier to move. They respond faster than outcome metrics. They make progress visible.

**Why it fails**: Proxies can diverge from outcomes. You can game proxies without creating value. Teams optimize the proxy instead of the real goal. Eventually, proxies become ends in themselves.

**What to do instead**: Always tie proxies to outcomes. Regularly validate that proxies predict outcomes. Be suspicious when proxies improve but outcomes don't. Report proxies alongside outcomes, never alone.

---

## 8. Historical Comparison Trap

**What it looks like**: Comparing every metric to last year, last month, or last week. Flagging any deviation from historical patterns as concerning or celebrating.

**Why it seems good**: Historical comparison provides context. It's easy to understand and explain. Trends feel meaningful.

**Why it fails**: Context changes. Last year's baseline may be irrelevant. Seasonality creates false signals. External factors (competition, economy, pandemic) make comparisons meaningless. You might be comparing to a terrible baseline.

**What to do instead**: Understand what's driving the comparison period. Use appropriate baselines (adjust for seasonality, external factors). Compare to targets based on current context, not just history. Ask "compared to what we expected" not just "compared to before."

---

## 9. Self-Reported Data Trust

**What it looks like**: Heavily relying on surveys, NPS scores, and user-reported intent. Making major decisions based on what users say they want or will do.

**Why it seems good**: Direct user feedback feels authentic. Survey data is cheap to collect. Users know what they want.

**Why it fails**: People lie. Not maliciously—they predict their future behavior poorly. What people say they'll do and what they actually do diverge dramatically. Survey respondents aren't representative.

**What to do instead**: Trust behavioral data over stated preferences. Use surveys to understand "why," not to predict "what." Validate survey findings with behavioral data. Be skeptical of stated intent.

---

## 10. Tool Shopping

**What it looks like**: Constantly evaluating and switching analytics tools. Believing the right tool will solve analytics problems. Spending more time on tool setup than on actual analysis.

**Why it seems good**: Better tools should mean better analytics. The current tool is clearly limiting us. New tools have exciting features.

**Why it fails**: Tools don't solve process problems. Migrations lose historical data and create gaps. Teams spend time learning new tools instead of doing analysis. The best analytics come from analysts, not tools.

**What to do instead**: Master your current tools before switching. Define the specific problem the new tool solves. Calculate the true cost of migration. Focus on process and people first, tools second.

---

## 11. Attribution Model Obsession

**What it looks like**: Endless debates about attribution models. Complex multi-touch attribution setups. Trying to give precise credit to every marketing touchpoint.

**Why it seems good**: Better attribution = better marketing spend. Multi-touch feels more accurate than last-click. You need to know what's working.

**Why it fails**: Perfect attribution is impossible. Attribution models are all wrong—some are just useful. The complexity creates false precision. You'll never resolve the debates. Meanwhile, incrementality tests would give you actual answers.

**What to do instead**: Accept that attribution is imprecise. Use simpler models consistently rather than complex models poorly. Run incrementality tests for important channels. Focus on directional correctness, not precision.

---

## 12. Vanity Report Automation

**What it looks like**: Automated reports sent to executives showing metrics that always look good. Carefully curated metrics that can only go up. Reports designed to impress rather than inform.

**Why it seems good**: Executives are happy. Reports are professional and polished. The analytics team looks competent.

**Why it fails**: Nobody learns anything. Bad news gets hidden until it's a crisis. Trust erodes when reality diverges from reports. The analytics team becomes a marketing function instead of a truth-telling function.

**What to do instead**: Report metrics that can go down. Include context and caveats. Surface problems early. Make reports useful for decisions, not just comfortable to read. Build trust through honesty, not through positive numbers.

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# Sharp Edges: Analytics

Critical mistakes that turn data into noise and insights into confusion.

---

## 1. The Vanity Metric Trap

**Severity:** Critical
**Situation:** Tracking metrics that look good but don't drive decisions
**Why Dangerous:** Resources wasted, real problems hidden, false confidence.

```
THE TRAP:
Dashboard shows:
- 1M pageviews this month! ↑
- 500K registered users! ↑
- 100K app downloads! ↑

Everyone celebrates.

Reality:
- Active users: 5K (0.5%)
- Retention Day 7: 3%
- Revenue: Declining
- Core action: 2% do it

THE REALITY:
Vanity metrics make you feel good.
They don't tell you if you're winning.
They hide real problems.
They don't change behavior.

VANITY VS ACTIONABLE:
Vanity: Total registered users
Actionable: Weekly active users

Vanity: Total pageviews
Actionable: Pages per session, time on page

Vanity: App downloads
Actionable: Day 7 retention

Vanity: Total revenue
Actionable: Revenue per user, LTV/CAC

THE FIX:
1. Ask "So what?"
   "Pageviews are up 50%"
   "So what? Did that increase conversions?"
   "Did that increase revenue?"

2. Focus on actionable metrics
   What can you change based on this number?
   What decision does it inform?
   What behavior does it measure?

3. Measure outcomes, not outputs
   Output: Emails sent
   Outcome: Email conversions

   Output: Features shipped
   Outcome: Feature adoption

4. Pair metrics with context
   "10K signups" → but what's conversion to paid?
   "50% growth" → from what base?

METRICS TEST:
"If this metric changed, what would we do differently?"
No answer = vanity metric.
```

---

## 2. The Data Without Decision

**Severity:** High
**Situation:** Collecting data with no plan to use it
**Why Dangerous:** Storage costs, complexity, privacy risk, decision paralysis.

```
THE TRAP:
"Let's track everything! We might need it."

Event catalog:
- button_clicked (every button)
- page_viewed (every page)
- mouse_moved (why???)
- scroll_position (constantly)
- everything_ever (forever)

Six months later:
- 500GB of event data
- No one uses it
- No dashboards reference it
- Analysis paralysis

"We have all this data but no insights!"

THE REALITY:
Data has costs.
Storage, processing, compliance.
More data ≠ more insight.
Unused data is technical debt.

THE FIX:
1. Define questions first
   "What are we trying to learn?"
   "What decision will this inform?"
   "Who will act on this data?"

2. Start with decisions
   Decision: Should we invest in onboarding?
   Metric needed: Onboarding completion rate
   Events needed: step_started, step_completed

3. Use the 90-day rule
   If metric not viewed in 90 days, deprecate.
   If event not used in 90 days, stop tracking.

4. Document metric owners
   Every metric has an owner.
   Owner reviews quarterly.
   No owner = probably don't need it.

TRACKING TEMPLATE:
Event: signup_completed
Question: How many users complete signup?
Decision: Is signup flow optimized?
Owner: Product team
Review: Quarterly

DATA HYGIENE:
- Quarterly event audit
- Archive unused data
- Delete when appropriate
- Document retention policies
```

---

## 3. The Broken Funnel Definition

**Severity:** High
**Situation:** Funnel stages that don't match user journey
**Why Dangerous:** Misleading conversion rates, wrong optimizations.

```
THE TRAP:
Defined funnel:
Visit → Sign Up → Subscribe → Purchase

Measured conversion: 0.5%

Team: "Let's optimize signup!"
*Huge effort on signup flow*
No improvement in purchases.

Reality: Users visit → leave → come back →
research → visit pricing → leave →
come back → sign up → use free tier →
eventually purchase.

The defined funnel isn't how users actually behave.

THE REALITY:
User journeys are messy.
Linear funnels are simplifications.
Wrong funnel = wrong optimization.

FUNNEL PROBLEMS:
1. Stages don't match reality
   Defined: Linear path
   Actual: Non-linear, multiple visits

2. Too many stages
   Conversion looks terrible at each stage.
   But overall conversion is fine.

3. Too few stages
   "Visit → Purchase" shows 0.5%
   Where's the drop-off?

4. Wrong order
   Users do things in different orders.
   Forcing linear misses patterns.

THE FIX:
1. Map actual user journeys
   Session recordings
   Path analysis
   User interviews

2. Define stages by intent
   Awareness: Visited any page
   Interest: Viewed pricing
   Evaluation: Started trial
   Purchase: Converted

3. Allow for messiness
   "Completed signup in first 3 sessions"
   Not "signup immediately after first visit"

4. Multiple funnels
   New user funnel
   Return user funnel
   Mobile vs desktop funnel

5. Validate with real users
   "Does this match how you actually use the product?"

FUNNEL DESIGN:
Start from outcome, work backwards.
Purchase ← What happened before?
         ← Trial started ← Pricing viewed
         ← Feature explored ← Content read
```

---

## 4. The Improper Attribution

**Severity:** High
**Situation:** Giving credit to wrong touchpoints
**Why Dangerous:** Money wasted on wrong channels, wrong optimizations.

```
THE TRAP:
User journey:
1. Sees Facebook ad
2. Googles your brand
3. Clicks Google ad
4. Signs up

Attribution: "Google Ads gets 100% credit!"
Decision: "Kill Facebook, double Google!"

Result:
Facebook killed.
New users drop 50%.
Google wasn't creating demand, just capturing it.

THE REALITY:
Users have many touchpoints.
Last click doesn't tell the story.
First click doesn't either.
Attribution is hard.

ATTRIBUTION MODELS:
Last Click: Last touchpoint gets credit
First Click: First touchpoint gets credit
Linear: Equal credit to all
Time Decay: Recent gets more credit
Position Based: First/last get 40%, rest 20%
Data Driven: ML-based distribution

EACH HAS PROBLEMS:
Last Click: Ignores awareness building
First Click: Ignores conversion drivers
Linear: Oversimplifies
Time Decay: Arbitrary decay
Position Based: Arbitrary split
Data Driven: Black box

THE FIX:
1. Use multiple models
   Compare insights across models.
   If all agree, high confidence.
   If disagree, investigate.

2. Incrementality testing
   Hold out groups from channel.
   Measure true lift.
   Not attribution, causation.

3. Understand the journey
   Early stage: Awareness (Facebook, content)
   Mid stage: Consideration (retargeting, email)
   Late stage: Conversion (search, direct)

4. Don't over-optimize
   Some spend on "inefficient" channels
   may drive all other channels.

5. Attribution windows
   How long from touchpoint to conversion?
   7-day vs 30-day can differ hugely.

INCREMENTALITY > ATTRIBUTION:
"If we stop spending on X, what happens?"
Run the test.
Don't guess from models.
```

---

## 5. The Sampling Confusion

**Severity:** High
**Situation:** Drawing conclusions from sampled data without understanding implications
**Why Dangerous:** Wrong conclusions, especially for small segments.

```
THE TRAP:
Report shows:
"Mobile users convert at 15%"
"Desktop users convert at 8%"

Decision: "Focus everything on mobile!"

Reality:
Data was 10% sampled.
Mobile users: 50 (5 converted = ~15%)
Desktop users: 5000 (400 converted = ~8%)

Mobile sample too small.
Actual mobile rate: unknown.

THE REALITY:
Sampled data loses precision.
Small segments become noise.
Statistical significance matters.

SAMPLING ISSUES:
1. Small segments become invisible
   1% of 10% sample = 0.1%
   Statistically meaningless.

2. Variance increases
   True rate: 10%
   Sampled: Could be 5% or 20%

3. Time-based sampling fails for rare events
   "Purchases this hour"
   Sampling misses rare events.

THE FIX:
1. Know your sample rate
   GA4: Often 10-20% sampled at scale
   Check sampling indicator.

2. Understand confidence intervals
   "15% conversion" means nothing.
   "15% ± 8%" means a lot.

3. Use unsampled for critical decisions
   Export to BigQuery (unsampled)
   Pay for higher quotas
   Use warehouse directly

4. Segment carefully
   Is segment large enough?
   At 10% sampling, need 10x users.

5. Time windows
   Longer windows = more data
   More data = better precision

SAMPLING MATH:
Sample rate: 10%
Segment size: 100 users
Sampled: 10 users
Conversion: 1 out of 10 = 10%

But: 1 out of 10 could easily be 0 or 2
Range: 0% to 20%
Not useful for decisions.
```

---

## 6. The Survivor Bias

**Severity:** High
**Situation:** Only analyzing users who stayed, ignoring those who left
**Why Dangerous:** Miss reasons for churn, overestimate satisfaction.

```
THE TRAP:
Survey results:
"95% of users are satisfied!"
"Average session length: 45 minutes!"
"NPS: +60!"

Reality:
Surveyed: Active users (survivors)
Ignored: 80% who churned

Churned users:
"Couldn't figure out the product"
"Too expensive"
"Missing key feature"

THE REALITY:
Survivors aren't representative.
Churned users have the answers.
Happy users are already won.

SURVIVOR BIAS EXAMPLES:
1. Feature usage
   "80% of users use feature X"
   But: 80% of remaining users
   Feature X caused others to leave.

2. Satisfaction surveys
   High satisfaction!
   ...among users who stayed.

3. Session length
   Long sessions!
   ...for engaged users.
   Others bounced.

4. NPS scores
   Great NPS!
   ...from users who love it.
   Haters already left.

THE FIX:
1. Track churned users
   Exit surveys
   Churn analysis
   Win-back campaigns (with learning)

2. Include all users in analysis
   Not: "Active users spend X"
   But: "Of users who signed up, X% became active"

3. Cohort analysis
   Track cohorts over time.
   See who drops and when.

4. Segment by behavior
   Power users
   Casual users
   Churned users
   Compare segments.

5. Proactive churn research
   Interview users at risk.
   Don't wait until they're gone.

CHURN ANALYSIS:
Day 1: 1000 users sign up
Day 7: 300 still active (30% retention)
Day 30: 100 still active (10% retention)

Where did 700 go between Day 1-7?
Why?
This matters more than active user behavior.
```

---

## 7. The Metric Conflict

**Severity:** High
**Situation:** Teams optimize conflicting metrics
**Why Dangerous:** Suboptimal outcomes, internal conflict, gaming.

```
THE TRAP:
Growth team: Maximize signups
Product team: Maximize engagement
Finance team: Maximize revenue

Growth: Adds friction-free signup
Product: Adds onboarding requirements
Finance: Adds upsells everywhere

Result:
- Tons of low-quality signups
- Users confused by onboarding
- Annoyed by upsells
- Everyone hits their metric
- Business struggles

THE REALITY:
Metrics drive behavior.
Conflicting metrics drive conflicting behavior.
Local optimization ≠ global optimization.

METRIC CONFLICTS:
1. Quantity vs quality
   Signups vs engaged signups
   Content volume vs content quality

2. Short-term vs long-term
   Revenue now vs LTV
   Clicks vs satisfaction

3. Team vs company
   Team metric vs company outcome
   Department KPI vs business goal

THE FIX:
1. North Star Metric
   One metric everyone aligns to.
   All team metrics ladder up.

   North Star: Weekly active paid users
   Growth: Quality signups that convert
   Product: Engagement that leads to payment
   Finance: Revenue from retained users

2. Input vs output metrics
   Output: Revenue (shared)
   Inputs: Each team's contribution

3. Guardrail metrics
   "Maximize X without hurting Y"
   Growth: Signups, guardrail: Day 7 retention
   Marketing: Leads, guardrail: Lead quality

4. Regular alignment
   Cross-team metric review
   Catch conflicts early
   Adjust together

5. Shared outcomes
   Bonus tied to company metric
   Not just team metric

METRIC HIERARCHY:
Company: Revenue + growth
↓
North Star: Weekly paying users
↓
Team metrics (laddering up)
```

---

## 8. The Average Illusion

**Severity:** High
**Situation:** Relying on averages that hide distribution
**Why Dangerous:** Miss segments, wrong optimizations, false confidence.

```
THE TRAP:
Report shows:
"Average session length: 5 minutes"
"Average revenue per user: $50"
"Average page load: 2 seconds"

Decisions made based on "average user."

Reality:
Session length:
- 70% of users: 30 seconds
- 20% of users: 5 minutes
- 10% of users: 45 minutes
Average: 5 minutes (meaningless)

Revenue:
- 90% of users: $0
- 9% of users: $50
- 1% of users: $4500
Average: $50 (misleading)

THE REALITY:
Averages hide bimodal distributions.
Averages hide outliers.
No user is "average."

AVERAGE PROBLEMS:
1. Bimodal distributions
   Users either love it or leave.
   No one is "medium engaged."

2. Power law distributions
   Few users drive most revenue.
   Average doesn't represent anyone.

3. Outlier influence
   One whale skews entire average.
   Median might be $0.

THE FIX:
1. Use distributions
   Show histograms, not averages.
   Understand the shape.

2. Use percentiles
   p50: Median
   p90: Most users
   p99: Worst case

   "p50 load time: 1s, p95: 5s"
   Better than "average: 2s"

3. Segment users
   Don't average across segments.
   Power users: 45 min sessions
   Casual: 2 min sessions
   Churned: 30 sec sessions

4. Use appropriate central tendency
   Normal distribution: Mean okay
   Skewed: Use median
   Power law: Don't summarize

5. Ask "who does this represent?"
   "Average revenue is $50"
   "Who actually pays $50?"
   Nobody? Then useless metric.

BETTER METRICS:
Instead of: Average session length
Use: Session length distribution by user type

Instead of: Average revenue
Use: Revenue by cohort/segment

Instead of: Average load time
Use: p50, p75, p90, p99 load times
```

---

## 9. The Recency Bias

**Severity:** Medium
**Situation:** Overweighting recent data, ignoring historical patterns
**Why Dangerous:** React to noise, miss trends, seasonal blindness.

```
THE TRAP:
Monday report:
"Traffic down 20% week-over-week!"
Emergency meeting called.
New initiatives launched.

Tuesday:
Traffic recovers.
Was normal weekend dip.
Initiatives wasted.

Or:

December report:
"Revenue up 100%!"
Massive celebration.
Forecasts adjusted.

January:
Revenue crashes.
Was holiday seasonality.
Forecasts embarrassingly wrong.

THE REALITY:
Recent data is noisy.
Short-term changes are often random.
Trends need time to confirm.

RECENCY PROBLEMS:
1. Weekly fluctuations
   Weekend dips
   Monday spikes
   Natural variation

2. Seasonal patterns
   Holiday bumps
   Summer slumps
   Annual cycles

3. Random noise
   Statistical variation
   Sampling effects
   External events

THE FIX:
1. Compare same periods
   Week-over-week (WoW): Same day last week
   Year-over-year (YoY): Same period last year
   Not: Yesterday vs two days ago

2. Use rolling averages
   7-day rolling average
   28-day rolling average
   Smooths out noise

3. Document seasonality
   "December is always +100%"
   "Sundays are always -30%"
   Expected, not news.

4. Statistical significance
   Is this change real or noise?
   How confident are we?

5. Longer time windows
   Don't react to one day.
   Look at weekly trends.
   Confirm with monthly patterns.

COMPARISON FRAMEWORK:
Today vs yesterday: Noise
This week vs last week: Getting better
This month vs last month: Trend emerging
This quarter vs same quarter last year: Confirmed
```

---

## 10. The Implementation Drift

**Severity:** High
**Situation:** Tracking code breaks or changes without notice
**Why Dangerous:** Decisions based on broken data.

```
THE TRAP:
Q1: Tracking works great
Q2: Dev refactors checkout, breaks tracking
Q3: "Checkout conversion dropped 50%!"
    Emergency meeting
    New checkout team formed
Q4: Someone notices tracking broke
    Q3 data useless
    Team disbanded
    Time wasted

THE REALITY:
Tracking code is code.
Code breaks.
Nobody monitors analytics code.
Decisions made on broken data.

DRIFT CAUSES:
1. Code refactoring
   Button renamed, event not updated
   Page restructured, tracking missed

2. New features
   New flow added, not tracked
   A/B test variant not tracked

3. Third-party changes
   SDK updated, breaks tracking
   Tag manager changes

4. Silent failures
   Event stops firing
   No errors thrown
   Nobody notices

THE FIX:
1. Tracking as code
   Track in code review.
   Test tracking.
   Include in QA.

2. Monitoring
   Alert if event volume drops
   Alert if key events missing
   Daily data quality checks

   // Example alert
   if (signups.today < signups.7dayAvg * 0.5) {
     alert("Signup tracking may be broken")
   }

3. Data contracts
   Define expected events.
   Validate against contract.
   Fail loudly on violations.

4. Tracking tests
   E2E tests include analytics.
   "When user clicks X, event Y fires"

5. Regular audits
   Quarterly tracking review.
   Walk through key flows.
   Verify events fire.

MONITORING CHECKLIST:
□ Volume monitoring (sudden drops)
□ Property validation (expected values)
□ Coverage checks (all flows tracked)
□ Freshness checks (data arriving)
□ Automated alerts on anomalies
```

---

## 11. The Dashboard Graveyard

**Severity:** Medium
**Situation:** Building dashboards nobody uses
**Why Dangerous:** Time wasted, data distrust, missed insights.

```
THE TRAP:
Year 1: Build 50 dashboards
Year 2: Build 30 more
Year 3: "Let me build a dashboard for this!"

Reality:
- 5 dashboards used regularly
- 20 checked occasionally
- 55 never opened

Cost:
- Maintenance overhead
- Query costs
- Confusion
- "Which dashboard is right?"

THE REALITY:
Dashboards are products.
Products need users.
Most dashboards fail.

GRAVEYARD CAUSES:
1. No defined user
   "Someone might need this"
   Nobody does.

2. Wrong questions
   Answers questions nobody asked.
   Doesn't answer questions people have.

3. Too complex
   50 charts per dashboard.
   Users don't know where to look.

4. Stale data
   Data stops updating.
   Users stop trusting.

5. No action path
   "Numbers went down"
   "Now what?"
   Nothing.

THE FIX:
1. Define user and question
   "Marketing team wants to know:
   Which channels drive signups?"
   Build for that.

2. Start simple
   3-5 metrics per dashboard.
   One key question answered.
   Add more only when needed.

3. Review and retire
   Quarterly: Check dashboard usage.
   Not viewed in 90 days? Archive.

4. Maintain actively
   Dashboards need owners.
   Owners review monthly.
   Update or deprecate.

5. Dashboards as products
   Who's the user?
   What's the use case?
   How often will they use it?
   What action will they take?

DASHBOARD TEMPLATE:
Name: Channel Performance
User: Marketing team
Question: Which channels drive quality signups?
Frequency: Daily check
Action: Budget allocation decisions
```

---

## 12. The Privacy Oversight

**Severity:** Critical
**Situation:** Tracking personal data without proper consent or protection
**Why Dangerous:** Legal liability, user trust damage, data breaches.

```
THE TRAP:
"Let's track everything about the user!"
- Email in events
- IP addresses stored
- Location tracked
- Behavior profiled
- Cross-site tracking
- No consent asked

Two years later:
- GDPR audit happens
- $50M in fines
- Data breach exposes everything
- Users flee
- Trust destroyed

THE REALITY:
Analytics must respect privacy.
Laws require consent.
Data minimization is required.
Breaches of analytics = breaches of trust.

PRIVACY PROBLEMS:
1. PII in events
   email, name, phone in event properties

2. No consent
   Tracking before consent given

3. Retention forever
   User requests deletion, data persists

4. Third-party leakage
   GA sends data to Google
   Mixing analytics with ads

THE FIX:
1. Anonymize by default
   // Bad
   track('purchase', { email: user.email })

   // Good
   track('purchase', { userId: hash(user.id) })

2. Consent before tracking
   // Don't track until consent
   if (hasAnalyticsConsent()) {
     initializeTracking()
   }

3. Data minimization
   Only collect what's needed.
   Delete when no longer needed.
   Purpose limitation.

4. Retention policies
   Analytics data: 2 years max
   Able to delete on request
   Regular purging

5. First-party analytics
   Consider: Plausible, Fathom, Posthog
   Privacy-focused alternatives
   User data stays with you

COMPLIANCE CHECKLIST:
□ Consent before tracking
□ No PII in events
□ Retention limits set
□ Deletion capability exists
□ Privacy policy accurate
□ DPA with vendors
□ DSAR process defined
```

## Decision Framework

# Analytics Decisions

Decision frameworks for building analytics that drive action and product improvement.

---

## 1. Analytics Tool Selection

**Context**: Choosing the right analytics platform for your product stage, team capabilities, and data needs.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Amplitude/Mixpanel** | Product-led growth, need behavioral analytics, cohorts, funnels | Expensive at scale, learning curve, vendor lock-in |
| **PostHog** | Want self-hosting option, feature flags + analytics together, cost-conscious | Newer, smaller community, some features less mature |
| **Google Analytics** | Marketing-focused, need web traffic analysis, limited budget | Privacy concerns, less product analytics depth, sampling |
| **Custom (Snowflake + dbt)** | Complex needs, data science team, want full ownership | High initial investment, requires dedicated team |

**Decision criteria**: Team size, budget, product type (B2B vs B2C), data ownership requirements, existing data infrastructure.

**Red flags**: Choosing enterprise tools for MVP, custom solutions without data engineering, free tools for data-sensitive products.

---

## 2. Event Tracking Scope

**Context**: Determining what to track—more isn't always better.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Track everything possible** | Very early stage, exploring product-market fit, uncertain what matters | Storage costs, noise, privacy risk, implementation burden |
| **Track to questions** | Have specific hypotheses, clear metrics, resource constraints | Might miss unexpected insights, need to add tracking later |
| **Track core journey only** | Proven product, focused optimization, limited engineering | Miss edge cases, harder to diagnose unexpected issues |
| **Progressive tracking** | Growing product, adding tracking as questions emerge | Lose historical data, reactive rather than proactive |

**Decision criteria**: Product maturity, team resources, data infrastructure costs, regulatory environment.

**Red flags**: Tracking everything without a plan to use it, tracking nothing and making decisions blind, complex tracking before product-market fit.

---

## 3. Metrics Ownership Model

**Context**: Who defines, maintains, and acts on metrics.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Centralized analytics team** | Large org, complex data, need consistency | Bottleneck risk, disconnected from product teams |
| **Embedded analysts per team** | Product-led org, teams move fast, need deep context | Inconsistent definitions, duplicated effort |
| **Self-serve with governance** | Strong data literacy, good tooling, clear standards | Requires investment in tooling and training |
| **Product managers own metrics** | Small team, limited analytics resources | Inconsistent rigor, PMs may lack analytics skills |

**Decision criteria**: Organization size, data literacy, tool sophistication, need for consistency vs speed.

**Red flags**: No clear ownership, analytics as afterthought, everyone defines their own metrics without coordination.

---

## 4. Dashboard Design Philosophy

**Context**: How to structure dashboards for maximum impact.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **One dashboard to rule them all** | Very small team, simple product, everyone needs same view | Gets overwhelming quickly, no role-specific views |
| **Layered (summary → detail)** | Need both executive overview and detailed analysis | Maintenance burden, risk of divergence between layers |
| **Role-based dashboards** | Different stakeholders, different decisions, different frequencies | Duplication, harder to maintain consistency |
| **Question-based dashboards** | Analytics-mature org, clear decision frameworks | Requires clear ownership, more upfront design |

**Decision criteria**: Number of stakeholders, decision frequency, organizational structure, tool capabilities.

**Red flags**: Dashboards nobody uses, dashboards everyone customizes differently, dashboards that only show good news.

---

## 5. Data Freshness Requirements

**Context**: How often data needs to be updated.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Real-time streaming** | Operational decisions, incident response, live products | Expensive, complex, often overkill for analytics |
| **Near real-time (minutes)** | Same-day decisions, A/B test monitoring, growth teams | Infrastructure complexity, higher costs |
| **Daily batch** | Strategic decisions, weekly reviews, reporting | Misses intraday patterns, slower feedback |
| **Weekly/monthly batch** | Executive reporting, board decks, stable metrics | Delayed insights, inappropriate for operational use |

**Decision criteria**: Decision frequency, operational vs strategic use, cost tolerance, engineering resources.

**Red flags**: Real-time data for weekly decisions, daily batch for incident response, mismatched freshness and decision cadence.

---

## 6. Privacy and Consent Approach

**Context**: Balancing analytics needs with user privacy and regulations.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Privacy-first (anonymized)** | Strong privacy stance, EU users, limited need for user-level data | Can't do cohort analysis, limited personalization |
| **Consent-based full tracking** | User-level analysis needed, willing to implement consent | Lower opt-in rates, implementation complexity |
| **Essential-only tracking** | Minimal viable analytics, maximum privacy | Limited insights, may miss important patterns |
| **Aggregated with sampling** | High volume, cost-conscious, accept directional accuracy | Lose individual user journeys, statistical noise |

**Decision criteria**: User base geography, product type, regulatory requirements, analytics maturity.

**Red flags**: Ignoring GDPR/CCPA, dark patterns for consent, tracking PII without need, no data retention policy.

---

## 7. Attribution Model Selection

**Context**: How to credit marketing channels for conversions.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Last-touch** | Simple funnel, short sales cycle, limited resources | Ignores awareness, favors bottom-of-funnel |
| **First-touch** | Brand awareness focus, long sales cycle, top-of-funnel investment | Ignores closing channels, hard to optimize |
| **Linear multi-touch** | Multiple significant touchpoints, want fairness | Arbitrary equal weighting, doesn't reflect reality |
| **Data-driven/algorithmic** | High volume, sophisticated team, willing to invest | Complex to implement, black box, requires volume |
| **Incrementality testing** | Want true causal impact, willing to run experiments | Complex to run, requires holdouts, slower |

**Decision criteria**: Sales cycle length, channel diversity, volume, team sophistication, tolerance for complexity.

**Red flags**: Obsessing over perfect attribution, complex models without volume to support, never validating with incrementality.

---

## 8. Metric Definition Precision

**Context**: How precisely to define metrics—especially for cross-team use.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Strict SQL definitions** | Data warehouse, need reproducibility, analytics-mature | Rigid, harder to adjust, requires SQL knowledge |
| **Semantic layer (dbt metrics)** | Want consistency + accessibility, moderate complexity | Setup investment, another tool to maintain |
| **Tool-native definitions** | Simple needs, single analytics tool, small team | Vendor lock-in, harder to migrate |
| **Documentation + guidelines** | Flexible needs, trust teams to interpret | Inconsistency, metrics drift, comparison problems |

**Decision criteria**: Team size, tool diversity, need for consistency, data maturity.

**Red flags**: Same metric defined differently in multiple places, no source of truth, can't reproduce key metrics.

---

## 9. Experiment Analysis Responsibility

**Context**: Who analyzes A/B tests and experiments.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Automated in tool** | High experiment velocity, simple metrics, trust tooling | Miss nuance, false confidence in p-values |
| **Dedicated data scientist** | Complex experiments, causal inference needed, high stakes | Bottleneck, expensive, may be overkill |
| **Product manager analysis** | PM is analytically skilled, simple experiments, fast iteration | Confirmation bias risk, may miss issues |
| **Experiment review board** | High-stakes decisions, need rigor, cross-functional alignment | Slow, overhead, may discourage experimentation |

**Decision criteria**: Experiment complexity, stakes, PM analytical sophistication, velocity needs.

**Red flags**: Shipping without analysis, cherry-picking results, ignoring negative experiments, no standards.

---

## 10. Analytics Documentation Standard

**Context**: How to document tracking, metrics, and analyses.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Tracking plan in spreadsheet** | Early stage, simple product, small team | Gets stale, version control issues, not integrated |
| **Data catalog tool** | Large data estate, multiple teams, compliance needs | Cost, adoption challenges, maintenance burden |
| **In-code documentation** | Engineering-driven, want documentation to travel with code | Hard for non-engineers, may get outdated |
| **Wiki/Notion with standards** | Collaborative team, moderate complexity, flexible needs | Discoverability issues, staleness risk |
| **Schema-as-code (tracked plans)** | Sophisticated team, want validation, CI/CD integration | High investment, engineering dependency |

**Decision criteria**: Team size, data complexity, engineering culture, compliance requirements.

**Red flags**: No documentation, documentation nobody reads, multiple conflicting sources, documentation without ownership.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `implement|code|track|events` | frontend | Analytics needs implementation |
| `backend|server|database` | backend | Analytics needs server tracking |
| `experiment|test|hypothesis` | a-b-testing | Data reveals test opportunity |
| `product|feature|roadmap` | product-management | Data informs product |

### Receives Work From

- **product-management**: Product needs metrics
- **growth-strategy**: Growth needs measurement
- **a-b-testing**: Experiments need data
- **marketing**: Marketing needs attribution

### Works Well With

- product-management
- growth-strategy
- marketing
- a-b-testing
- frontend
- backend

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/product/analytics/`

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
