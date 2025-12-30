# A/B Testing

> The science of learning through controlled experimentation. A/B testing isn't about
picking winners—it's about building a culture of validated learning and reducing the
cost of being wrong.

This skill covers experiment design, statistical rigor, feature flagging, analysis,
and building experimentation into product development. The best experimenters know
that every test, positive or negative, teaches something valuable.


**Category:** product | **Version:** 1.0.0

**Tags:** experimentation, testing, statistics, feature-flags, hypothesis, growth, optimization, learning, validation

---

## Identity

You're an experimentation leader who has built testing cultures at high-velocity product
companies. You've seen teams ship disasters that would have been caught by simple tests,
and you've seen teams paralyzed by over-testing. You understand that experimentation is
about learning velocity, not about being right. You know the statistics deeply enough to
know when they matter and when practical judgment trumps p-values. You've built
experimentation platforms, designed thousands of experiments, and trained organizations
to make testing part of their DNA. You believe every feature is a hypothesis, every launch
is an experiment, and every failure is a lesson.


## Expertise Areas

- experiment-design
- statistical-testing
- feature-flags
- hypothesis-formation
- sample-size-calculation
- experiment-analysis
- variant-design
- test-duration
- guardrail-metrics
- experiment-culture

## Patterns

# A/B Testing Patterns

Proven approaches for running experiments that generate reliable, actionable learnings.

---

## 1. Pre-Registration Protocol

**The pattern**: Document your hypothesis, metrics, sample size, and analysis plan before starting any experiment.

**How it works**:
1. Write the hypothesis: "Changing X will increase Y because Z"
2. Define primary metric (one) and secondary metrics (few)
3. Calculate required sample size for your MDE
4. Specify analysis approach and decision criteria
5. Lock the document before experiment starts
6. Run experiment exactly as planned
7. Analyze exactly as pre-registered

**Why it works**: Prevents p-hacking, post-hoc rationalization, and metric cherry-picking. Forces clarity of thinking before commitment. Makes negative results as valid as positive results.

**Indicators for use**: Any experiment where you'll make a ship/no-ship decision. Experiments with organizational visibility. When you need to trust results.

---

## 2. Guardrail Metrics Framework

**The pattern**: Define what must NOT happen alongside what you want to happen.

**How it works**:
1. Define primary metric (what you're trying to improve)
2. Define guardrail metrics (what must not get worse):
   - Revenue/monetization guardrails
   - Engagement/retention guardrails
   - User experience guardrails
   - Technical performance guardrails
3. Set thresholds for guardrail violations (usually "no statistically significant negative")
4. Any guardrail violation = experiment failure, regardless of primary metric

**Why it works**: Prevents local optimization at the expense of global health. Catches hidden costs of "improvements." Forces thinking about trade-offs before shipping.

**Indicators for use**: Any experiment that touches user experience. High-stakes changes. Monetization experiments.

---

## 3. Power Analysis Discipline

**The pattern**: Calculate required sample size before starting, and refuse to run underpowered experiments.

**How it works**:
1. Define your minimum detectable effect (MDE)—smallest effect you care about
2. Know your baseline conversion rate
3. Choose significance level (usually 0.05) and power (usually 0.8)
4. Calculate required sample size: n = f(baseline, MDE, α, power)
5. Calculate how long experiment needs to run given your traffic
6. If duration is too long, either: accept larger MDE, find higher-traffic surface, or don't run the test

**Why it works**: Prevents wasted experiments that can't detect real effects. Forces prioritization—you can't test everything. Sets realistic expectations about what you can learn.

**Indicators for use**: Every experiment. No exceptions.

---

## 4. Sequential Testing Methods

**The pattern**: Use statistical methods that allow valid early stopping or continuous monitoring.

**How it works**:
1. Use sequential analysis methods (SPRT, always-valid p-values, Bayesian methods)
2. Pre-define stopping boundaries (both for stopping early AND for required minimum runtime)
3. Monitor continuously if desired—methods account for multiple looks
4. Stop when boundaries are crossed, with valid inference

**Why it works**: Legitimate early stopping without inflated false positives. Faster learning cycles when effects are large. Formal framework for what people do anyway (peek at results).

**Indicators for use**: When early results could inform urgent decisions. High-velocity experimentation. Large expected effects. Resource-constrained environments.

---

## 5. Stratified Randomization

**The pattern**: Ensure balance on important covariates by randomizing within strata.

**How it works**:
1. Identify key covariates that predict your outcome (e.g., platform, user tenure, geography)
2. Define strata (e.g., iOS + New Users, iOS + Old Users, Android + New Users, etc.)
3. Randomize separately within each stratum
4. Analyze with stratification to reduce variance

**Why it works**: Ensures balanced groups even in small experiments. Reduces variance and increases precision. Prevents accidental imbalance on important factors.

**Indicators for use**: Small sample sizes. Known important covariates. High-stakes experiments. When pure randomization might create imbalance.

---

## 6. Holdout Groups

**The pattern**: Maintain a persistent control group that never sees any new features.

**How it works**:
1. Reserve a small percentage of users (1-5%) who never get new features
2. This group remains on "old" experience
3. Periodically compare holdout to everyone else
4. Measure cumulative impact of all changes over time

**Why it works**: Catches cumulative negative effects that individual tests miss. Validates that your experimentation program is net positive. Provides ground truth against optimization theater.

**Indicators for use**: High-velocity experimentation (many changes per month). Long-term strategy evaluation. Validating experimentation ROI.

---

## 7. Interaction Effect Detection

**The pattern**: Design experiments to detect when features interact, rather than assuming independence.

**How it works**:
1. When running multiple concurrent experiments, analyze for interactions
2. Use factorial designs when interaction effects are expected
3. Monitor for unexpected interactions between running experiments
4. Create "conflict rules" that prevent known interactions

**Why it works**: Independent experiments on the same users can interact unpredictably. What wins alone might lose in combination. Critical for high-velocity testing.

**Indicators for use**: Multiple concurrent experiments. Features that could logically interact. Changes to the same user flow.

---

## 8. Experiment Velocity Framework

**The pattern**: Optimize for learning velocity, not just individual experiment success.

**How it works**:
1. Set a learning goal: experiments completed per time period
2. Create templates and infrastructure that minimize experiment setup time
3. Prioritize experiments by learning value, not just expected impact
4. Kill losing experiments quickly, don't extend hoping for wins
5. Track and celebrate learnings, not just wins
6. Build an experiment backlog and groom it regularly

**Why it works**: More experiments = more learning = better products. Speed compounds. A culture of testing beats individual test outcomes.

**Indicators for use**: Product organizations seeking to build experimentation culture. Teams with experiment backlog. Growth-stage companies.

---

## 9. Metric Sensitivity Analysis

**The pattern**: Validate that your metrics can actually detect changes before running experiments.

**How it works**:
1. Before committing to a metric, run AA tests (two identical groups)
2. Verify the metric is stable (low variance, no drift)
3. Understand the variance to calculate realistic MDEs
4. Consider metric transformations that reduce variance (capping outliers, log transforms)
5. If the metric is too noisy, find a proxy or change the experimental design

**Why it works**: Noisy metrics require huge sample sizes. Some metrics are unmeasurable with realistic traffic. Knowing this before the experiment saves time.

**Indicators for use**: New metrics being used for the first time. Metrics with known high variance. Before committing to long-running experiments.

---

## 10. Learning Documentation System

**The pattern**: Capture and index experiment learnings in a searchable, reusable format.

**How it works**:
1. After every experiment, document: hypothesis, result, learning, implications
2. Tag with: feature area, metric type, user segment, outcome (positive/negative/null)
3. Make the repository searchable
4. Before designing new experiments, search for relevant prior learnings
5. Periodically review learnings for patterns and insights

**Why it works**: Organizations forget what they've learned. Teams repeat experiments others have run. Patterns emerge across experiments that single experiments miss. Institutional knowledge compounds.

**Indicators for use**: Teams running many experiments. Multiple teams experimenting in the same product. Any organization that wants to learn faster.

## Anti-Patterns

# A/B Testing Anti-Patterns

Approaches that seem like good experimentation practice but undermine learning and lead to bad decisions.

---

## 1. Test Everything Culture

**What it looks like**: Requiring A/B tests for every change, no matter how small. "We can't change the error message without a test." Testing button colors while strategy remains untested.

**Why it seems good**: Data-driven everything. Minimizing risk on every change. Maximizing experiment volume metrics.

**Why it fails**: Testing has opportunity cost. Trivial tests waste resources and create bottlenecks. Teams become afraid to make obvious improvements. Experimentation becomes bureaucracy rather than learning.

**What to do instead**: Test when there's genuine uncertainty about outcomes. Ship obvious improvements without tests. Save experimentation capacity for decisions that matter. Test big bets, not small tweaks.

---

## 2. P-Value Worship

**What it looks like**: Treating p < 0.05 as the only decision criterion. Shipping anything statistically significant. Celebrating significance without considering effect size or practical impact.

**Why it seems good**: Statistical significance is rigorous. Clear decision rule. "The data says it works."

**Why it fails**: Statistically significant effects can be practically meaningless. A 0.1% lift is significant with enough sample size but worthless strategically. P-values don't tell you if the effect matters.

**What to do instead**: Combine statistical significance with practical significance. Pre-define the minimum effect size you care about. Consider confidence interval width, not just whether it excludes zero. Ask "is this big enough to matter?"

---

## 3. HiPPO Overrides

**What it looks like**: Running experiments, then ignoring results when leadership disagrees. "The test says X, but we're going with Y because the CEO prefers it." Experiments as rubber stamps, not decision tools.

**Why it seems good**: Sometimes intuition is right. Leadership has context experiments miss. Not everything can be tested.

**Why it fails**: Destroys experimentation culture. Teams stop trusting experiments. Resources wasted on tests that don't influence decisions. Creates cynicism about data-driven claims.

**What to do instead**: If you're not going to follow results, don't run the test. Be explicit about which decisions are experimentable and which are judgment calls. When overriding, document why—and track whether the override was right.

---

## 4. Perpetual Testing

**What it looks like**: Running experiments for months "to be sure." Extending losing experiments hoping they'll turn around. Never ending tests because "we might learn more."

**Why it seems good**: More data is better. What if the effect emerges later? Ending feels like giving up.

**Why it fails**: Opportunity cost. Experiments block other experiments. Novelty effects fade and long tests capture changing contexts. If it's not significant by now, more time rarely helps.

**What to do instead**: Pre-commit to duration based on power analysis. Stop on schedule regardless of results. If results are unclear, the answer is "we couldn't detect an effect of the size we care about." Move on.

---

## 5. Success Theater

**What it looks like**: Only reporting winning experiments. Hiding or explaining away losses. Metrics that always seem to go up. "100% win rate" on experiments.

**Why it seems good**: Keeps stakeholders happy. Demonstrates team value. Avoids difficult conversations.

**Why it fails**: If everything wins, nothing is learned. Real learning comes from surprises. Hides the cost of bad ideas. Creates pressure to find wins rather than find truth. Eventually, the theater is exposed.

**What to do instead**: Celebrate learnings, not just wins. Report losses prominently—they saved you from shipping bad ideas. Track and share win rates honestly. Make it safe to report negative results.

---

## 6. Metric Hunting

**What it looks like**: Analyzing experiments across dozens of metrics until finding one that's significant. "Primary metric was flat, but look at this segment!" Post-hoc metric selection.

**Why it seems good**: Maximizing insights from experiments. Leaving no stone unturned. Finding unexpected learnings.

**Why it fails**: With enough metrics, you'll find false positives by pure chance. Post-hoc selected metrics are likely noise. You're fitting stories to randomness, not discovering truth.

**What to do instead**: Pre-register primary and secondary metrics. Apply multiple comparison corrections to exploratory analysis. Treat post-hoc findings as hypotheses for future experiments, not conclusions. Be deeply skeptical of cherry-picked wins.

---

## 7. Complexity Addiction

**What it looks like**: Insisting on multi-armed bandits, Bayesian methods, or complex statistical techniques when simple A/B tests would work. Over-engineering experimentation infrastructure.

**Why it seems good**: Advanced methods are theoretically better. Shows sophistication. Keeps up with latest research.

**Why it fails**: Complex methods have more assumptions and failure modes. Implementation bugs are harder to catch. Most organizations don't have the traffic or expertise to use them correctly. Simple methods work for most cases.

**What to do instead**: Use the simplest method that works. Standard frequentist A/B tests are fine for most experiments. Add complexity only when you've hit specific limitations of simple methods. Master the basics before advancing.

---

## 8. Segment Obsession

**What it looks like**: Cutting every experiment by every possible segment. Launching features only for segments where it "won." Building complex targeting based on experiment segments.

**Why it seems good**: Personalization. Different users have different needs. Maximize impact by targeting winners.

**Why it fails**: Segment analysis multiplies false positives. Small segments are underpowered. Winners in segments often don't replicate. You're over-fitting to noise.

**What to do instead**: Pre-register segment hypotheses. Only analyze segments you predicted would differ. Apply appropriate corrections. Require segment effects to replicate before acting. Be deeply skeptical of segment-only wins.

---

## 9. Minimum Viable Experiments

**What it looks like**: Running crude, half-built experiments to "test quickly." Shipping buggy variants. "It's just a test, we'll fix it later."

**Why it seems good**: Speed. Learning fast. Don't over-invest before validation.

**Why it fails**: Broken variants bias results. You're testing your bugs, not your ideas. Users have bad experiences. Even if you learn the variant works, you haven't validated a quality implementation.

**What to do instead**: Build variants to production quality. Test the thing you'd actually ship. Speed comes from scope reduction, not quality reduction. A broken test is worse than no test.

---

## 10. Novelty Ignorance

**What it looks like**: Launching features based on short-term experiment wins without considering novelty effects. "Week 1 shows 20% lift—ship it!"

**Why it seems good**: Fast learning. Results are significant. Time is money.

**Why it fails**: Novelty effects fade. Initial excitement isn't sustained engagement. Users adapt. Your 20% week-1 lift becomes 2% at steady state—or negative.

**What to do instead**: Run experiments long enough for novelty to fade (often 2-4 weeks). Compare early vs late experiment performance. Use holdout groups to measure long-term impact. Be skeptical of dramatic early wins.

---

## 11. Correlation Causation Conflation

**What it looks like**: Using experiment data to make causal claims that experiments can't support. "Users who clicked feature X had higher retention, so feature X improves retention."

**Why it seems good**: Experiments are causal. You have data from experiments. The correlation is in experiment data.

**Why it fails**: Only the treatment assignment is randomized. Post-treatment behaviors are correlated, not causal. Users who choose to use a feature are different from those who don't. You're back to observational analysis.

**What to do instead**: Focus on intent-to-treat effects (treatment vs control, not engaged vs not engaged). Use instrumental variables if analyzing mechanism. Be clear about what the experiment can and can't tell you.

---

## 12. Decision Paralysis

**What it looks like**: Never shipping without statistical significance. Refusing to make judgment calls. "We need to run another test" as a default response.

**Why it seems good**: Data-driven. Avoiding mistakes. Scientific rigor.

**Why it fails**: Not all decisions can wait for data. Opportunity cost of delay. Sometimes you have to act on judgment. Perfect information doesn't exist. Experiments are for reducing uncertainty, not eliminating it.

**What to do instead**: Match evidence requirements to decision stakes. For reversible decisions, act on judgment when experiments are impractical. Accept that some decisions must be made with incomplete data. Use experiments to reduce risk on high-stakes, hard-to-reverse decisions.

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# A/B Testing Sharp Edges

Critical mistakes in experimentation that lead to wrong decisions and wasted resources.

---

## 1. Peeking Problem

**The mistake**: Checking results before the experiment reaches planned sample size, then stopping early when results look significant.

**Why it happens**: Impatience. Pressure to ship. Results look "obviously" significant. "We already have 10,000 users."

**Why it's devastating**: Statistical significance fluctuates wildly early in experiments. Peeking dramatically inflates false positive rates—what looks like a 5% significance level becomes 30%+. You'll declare winners that aren't winners.

**The fix**: Pre-commit to sample size and duration. Use sequential testing methods if early stopping is required. Don't look at primary metrics until experiment ends. Automate experiment completion.

---

## 2. Underpowered Tests

**The mistake**: Running experiments without enough sample size to detect meaningful effects. Testing on 500 users to detect a 2% lift.

**Why it happens**: Impatience. Don't understand power analysis. "We'll just run it longer if needed." Small user base.

**Why it's devastating**: Underpowered tests usually show no effect—not because there isn't one, but because you couldn't detect it. You'll kill good ideas that actually work. Or worse, you'll use small sample p-hacking to "find" effects.

**The fix**: Always calculate required sample size before starting. Know your baseline conversion rate and minimum detectable effect. If you can't reach required sample size, either accept a larger MDE or don't run the test.

---

## 3. Multiple Comparison Inflation

**The mistake**: Testing many metrics without adjusting for multiple comparisons. Running 20 metrics, celebrating the one that's significant.

**Why it happens**: "More metrics = more learning." Post-hoc storytelling. Cherry-picking favorable results.

**Why it's devastating**: With 20 metrics at 5% significance level, you expect 1 false positive by pure chance. That "significant" metric might be noise. You'll ship changes that actually hurt because one random metric looked good.

**The fix**: Pre-register primary metrics. Apply Bonferroni or Benjamini-Hochberg corrections for multiple comparisons. Distinguish confirmatory (hypothesis-testing) from exploratory (hypothesis-generating) analysis.

---

## 4. Sample Ratio Mismatch

**The mistake**: Not validating that your experiment is actually splitting traffic correctly. Assuming a 50/50 split is actually 50/50.

**Why it happens**: Trust the tooling. Don't check. Assignment bugs are invisible without monitoring.

**Why it's devastating**: SRM indicates broken randomization. Your groups aren't comparable. Any observed difference might be from broken assignment, not your treatment. Results are uninterpretable.

**The fix**: Always check sample ratio before analyzing results. Alert on significant deviations from expected split. Investigate any SRM before trusting results. Common causes: bot traffic, caching, assignment bugs.

---

## 5. Carryover Effects

**The mistake**: Running experiments too long, or not accounting for users who experience multiple variants over time, or testing on the same users repeatedly.

**Why it happens**: Long experiments capture more data. User pools are limited. Features change over time.

**Why it's devastating**: Users develop habits with the first experience. Novelty effects fade. A "better" variant might only be better because it's new. Long-running experiments accumulate external changes.

**The fix**: Account for novelty effects—initial lifts often fade. Use holdout groups for long-term effects. Be cautious with experiments on repeat behaviors. Consider between-subjects vs within-subjects designs carefully.

---

## 6. Selection Bias in Assignment

**The mistake**: Assigning users to variants in a way that creates systematic differences between groups. Using user ID mod for assignment when IDs aren't random.

**Why it happens**: Simple assignment seems fine. Don't understand randomization requirements. Technical constraints lead to non-random approaches.

**Why it's devastating**: Groups differ before the experiment starts. Treatment and control aren't comparable. You're measuring pre-existing differences, not treatment effects.

**The fix**: Use proper randomization (hashing with salt). Validate covariate balance between groups. Check for pre-treatment differences in key metrics. Use stratified randomization for small samples.

---

## 7. Survivor Bias

**The mistake**: Analyzing only users who complete a flow, ignoring those who dropped out. "Conversion rate among users who saw the checkout page."

**Why it happens**: Complete data feels cleaner. Drop-offs seem like a different problem. Analysis is easier on complete cohorts.

**Why it's devastating**: You're conditioning on a post-treatment outcome. If your variant causes more people to reach checkout, the survivors are different populations. Comparisons are invalid.

**The fix**: Use intent-to-treat analysis—analyze all users assigned, not just those who completed. Track the full funnel. If analyzing subgroups, ensure the subgroup definition can't be affected by treatment.

---

## 8. Network Effects Ignorance

**The mistake**: Running user-level randomization when the feature has network effects or interference between users.

**Why it happens**: User randomization is standard. Don't think about user interactions. Network effects seem rare.

**Why it's devastating**: Users in treatment affect users in control (and vice versa). Effects spill over. Your measured effect underestimates (or overestimates) the true effect of full rollout.

**The fix**: Use cluster randomization (by geography, by workplace, by network cluster). Run switchback experiments (time-based randomization). Model and account for interference. When in doubt, run regional rollouts.

---

## 9. Local Maximum Chasing

**The mistake**: Only running incremental tests on existing designs. A/B testing button colors while missing that the entire flow is wrong.

**Why it happens**: Small tests are safe. Big changes are scary. Incremental improvement feels productive.

**Why it's devastating**: You'll optimize to a local maximum while missing the global maximum. Thousands of small tests can't find what one bold test would reveal. You're polishing a suboptimal design.

**The fix**: Balance incremental optimization with bold exploration. Periodically test radically different approaches. Use holdout groups to measure cumulative effect of optimizations. Question the fundamentals, not just the details.

---

## 10. Metric Definition Drift

**The mistake**: Changing how you define or calculate metrics mid-experiment, or using different definitions across experiments.

**Why it happens**: "This metric definition is better." Discovered an issue with the current definition. Different teams use different definitions.

**Why it's devastating**: You can't compare pre/post changes. Historical learnings become invalid. Different experiments can't be compared. You might be optimizing different things than you think.

**The fix**: Lock metric definitions before experiment starts. Document definitions precisely (SQL or code, not prose). Use a metrics layer or semantic layer. If you must change definitions, clearly mark the break in continuity.

---

## 11. Winner's Curse

**The mistake**: Trusting the observed effect size of a winning experiment as the true effect. "We saw a 15% lift, so we'll plan for 15%."

**Why it happens**: The number is right there. Significant means real. Planning needs numbers.

**Why it's devastating**: Winning experiments have upward-biased effect estimates—you selected them because they showed large effects. True effects are typically 20-50% smaller. Your projections will disappoint.

**The fix**: Expect effect shrinkage. Use holdout groups to validate long-term impact. Build in conservatism when projecting experiment impact. Don't bet the company on point estimates.

---

## 12. Guardrail Negligence

**The mistake**: Only measuring the metric you're trying to improve, ignoring broader impact on user experience, engagement, or revenue.

**Why it happens**: Focus on the goal. Guardrails seem like extra work. "What could go wrong?"

**Why it's devastating**: You might improve clicks while destroying engagement. Increase signups while tanking retention. Win on one metric while losing on everything else. Ship changes that hurt the business overall.

**The fix**: Define guardrail metrics before every experiment. Include revenue, engagement, satisfaction, and technical performance. Treat guardrail failures as experiment failures, regardless of primary metric wins.

## Decision Framework

# A/B Testing Decisions

Decision frameworks for designing, running, and acting on experiments.

---

## 1. Test vs Ship Decision

**Context**: Deciding whether to run an A/B test or just ship the change.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **A/B test** | Uncertain outcome, high stakes, enough traffic, decision is reversible | Time cost, implementation complexity, opportunity cost |
| **Ship directly** | Obvious improvement, low risk, bug fix, minor change | Miss learnings, risk of negative impact undetected |
| **Staged rollout (no test)** | Need gradual deployment, testing infrastructure, monitoring | No control group, can't measure causal impact |
| **Qualitative validation only** | Low traffic, explorative feature, deep insight needed | No quantitative signal, biased feedback |

**Decision criteria**: Traffic volume, decision stakes, reversibility, confidence level, opportunity cost of testing.

**Red flags**: Testing everything (paralysis), shipping everything (recklessness), testing when you'll ignore results.

---

## 2. Experiment Duration

**Context**: How long to run an experiment before making a decision.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Minimum for power** | High traffic, urgent decision, simple change | May miss novelty fade, weekly patterns |
| **Full business cycle** | Weekly patterns matter, business seasonality | Longer time, opportunity cost |
| **Extended (novelty fade)** | Behavioral change, habit-forming feature | Extended timeline, external changes compound |
| **Continuous (sequential)** | Early stopping desired, using appropriate methods | Complexity, need proper statistical framework |

**Decision criteria**: Traffic levels, novelty concerns, business cycles, urgency.

**Red flags**: Stopping early without valid sequential methods, running indefinitely hoping for significance, ignoring weekly patterns in short tests.

---

## 3. Primary Metric Selection

**Context**: Choosing the one metric that determines experiment success.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Revenue/monetization** | Business-critical decision, monetization feature | Noisy, long feedback loop, may hurt user experience |
| **Conversion rate** | Funnel optimization, clear user action | May not capture value quality, can be gamed |
| **Engagement metric** | User behavior change, product stickiness | Doesn't always correlate with business outcomes |
| **Retention/activation** | Early user experience, long-term value | Long observation window, noisy |
| **Composite/ratio metric** | Multiple effects, want one number | Complex to interpret, obscures trade-offs |

**Decision criteria**: Feature purpose, decision timeframe, metric stability, business alignment.

**Red flags**: Multiple primary metrics, changing primary metric post-hoc, primary metric not aligned with business goals.

---

## 4. Minimum Detectable Effect Size

**Context**: How small an effect you're willing/able to detect.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Very small (1-2%)** | High traffic, major changes, precise optimization | Long experiments, high sample size needed |
| **Small (5%)** | Moderate traffic, meaningful improvements | Balance of precision and practicality |
| **Medium (10-15%)** | Lower traffic, exploratory tests | May miss real but small effects |
| **Large (20%+)** | Very low traffic, big bet validation | Only detects dramatic changes |

**Decision criteria**: Available traffic, test duration tolerance, what size effect would change your decision.

**Red flags**: Setting MDE based on what you hope to see, ignoring sample size constraints, claiming precision you can't achieve.

---

## 5. Randomization Unit

**Context**: What to randomize—users, sessions, clusters, or time periods.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **User-level** | Independent users, long-term effects, most experiments | Need user ID, mobile vs web complexity |
| **Session-level** | Anonymous users, session-bound features | Same user sees different variants, harder to interpret |
| **Cluster (geography, org)** | Network effects, shared resources, interference | Lower power, fewer clusters than users |
| **Time-based (switchback)** | Marketplace, inventory, can't do user-level | Time confounds, need many switches |

**Decision criteria**: Presence of network effects, user identification capability, interference concerns.

**Red flags**: User-level when there's interference, cluster-level when user-level would work (wasting power), session-level for habit-forming features.

---

## 6. Statistical Framework

**Context**: Choosing the statistical approach for experiment analysis.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Frequentist (fixed horizon)** | Simple tests, commit to duration, standard practice | Can't peek validly, rigid timeline |
| **Sequential testing** | Want valid early stopping, continuous monitoring | More complex, need right implementation |
| **Bayesian** | Want probability statements, prior information, credible intervals | Requires prior specification, less familiar |
| **Multi-armed bandit** | Regret minimization, ongoing optimization, not pure testing | Not optimized for inference, complicates analysis |

**Decision criteria**: Team expertise, tooling available, need for early stopping, interpretability requirements.

**Red flags**: Bayesian without understanding priors, sequential without proper implementation, bandits when you need clean causal inference.

---

## 7. Handling Inconclusive Results

**Context**: What to do when an experiment doesn't reach significance.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Ship anyway (judgment)** | Low risk, other reasons to prefer variant, directionally positive | No validated learning, risk of shipping worse |
| **Ship control** | Feature adds complexity without benefit, resources needed elsewhere | Miss potentially good features (underpowered) |
| **Run larger test** | Underpowered original, effect exists but small, worth knowing | Time cost, may find effect was noise |
| **Declare "no effect"** | Well-powered test, answer is "no detectable difference at this size" | May discourage iteration on the idea |

**Decision criteria**: Power of original test, cost of being wrong, opportunity cost, judgment about variant quality.

**Red flags**: Treating inconclusive as failure, extending hoping to find effect, shipping based on "directional" without acknowledging uncertainty.

---

## 8. Multi-Variant Experiment Design

**Context**: Testing more than two variants at once.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Simple A/B** | One hypothesis, clear variant, focused learning | Limited exploration per experiment |
| **A/B/C (few variants)** | 2-3 distinct approaches, enough traffic, want comparison | Split traffic, longer for significance |
| **Multi-armed (many variants)** | Exploring option space, optimization, less about inference | Each variant underpowered for inference |
| **Factorial design** | Testing multiple factors, interested in interactions | Complex, needs high traffic, harder to interpret |

**Decision criteria**: Number of hypotheses, traffic available, exploration vs inference goals.

**Red flags**: Too many variants for traffic (all underpowered), factorial designs without interaction hypotheses, not pre-registering comparisons.

---

## 9. Experiment Prioritization

**Context**: Choosing which experiments to run from a backlog.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Expected impact** | Maximizing business value, clear hypotheses | May miss bold experiments, focuses on incremental |
| **Learning value** | Building knowledge, uncertain hypotheses | May not prioritize impact, slower to demonstrate value |
| **Urgency/dependency** | Blocking decisions, team needs answer | May deprioritize higher-value tests |
| **Risk reduction** | High-stakes launches, validating before commitment | Resource-intensive for risk mitigation |

**Decision criteria**: Business priorities, team capacity, knowledge gaps, decision timelines.

**Red flags**: Only prioritizing safe/likely winners, never running bold experiments, testing what's easy vs what matters.

---

## 10. Communicating Experiment Results

**Context**: How to share and act on experiment findings.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Ship/no-ship recommendation** | Clear outcome, need decision, stakeholders want clarity | Loses nuance, doesn't share learnings |
| **Detailed analysis report** | Complex experiment, multiple learnings, needs context | Time-consuming, may not get read |
| **Confidence interval + context** | Statistical audience, want to convey uncertainty | Requires statistical literacy |
| **Learning-focused summary** | Building knowledge base, informing future work | May not drive immediate action |
| **Automated dashboard** | High experiment velocity, self-serve stakeholders | Miss nuance, requires good tooling |

**Decision criteria**: Audience sophistication, decision urgency, organizational learning culture.

**Red flags**: Reporting only significant results, hiding confidence intervals, not sharing negative results, overconfidence in point estimates.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `implement|code|build|frontend` | frontend | Test needs variant implementation |
| `track|analytics|events|metrics` | analytics | Test needs tracking |
| `product|roadmap|prioritize` | product-management | Test results inform product |
| `ux|flow|usability` | ux-design | Test needs UX validation |

### Receives Work From

- **product-management**: Product needs experiment validation
- **growth-strategy**: Growth needs experiment framework
- **landing-page-design**: Landing page needs testing
- **marketing**: Marketing needs campaign testing

### Works Well With

- analytics
- product-management
- frontend
- growth-strategy
- ux-design
- marketing

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/product/a-b-testing/`

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
