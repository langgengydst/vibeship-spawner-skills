# Scientific Method

> The scientific method applied to computational research, data science, and
experimental software engineering. Covers hypothesis formulation, experimental
design, controls, reproducibility, and avoiding common methodological pitfalls
like p-hacking, HARKing, and confirmation bias.


**Category:** science | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Most ML/stats papers can't be reproduced because random seeds weren't documented

**Why it happens:**
Random seeds affect: train/test splits, weight initialization,
dropout masks, data shuffling, stochastic gradient descent, and more.
Without fixed, documented seeds, you're running a different experiment
each time. Even NumPy, Python's random, and framework seeds
must ALL be set consistently.


**Solution:**
```
1. Create a seed setting function that covers all sources
2. Log seed values to experiment manifest
3. Use config files for seeds, not hardcoded values
4. For multi-GPU: set torch.cuda.manual_seed_all()
5. Document the seed in your paper/report

```

**Symptoms:**
- Results vary significantly between runs
- Can't reproduce your own results from 6 months ago
- Reviewers or colleagues get different numbers
- Production model performs differently than paper model

---

### [CRITICAL] Running 20 tests at alpha=0.05 gives 64% chance of at least one false positive

**Why it happens:**
With 20 independent tests at alpha=0.05:
P(at least one false positive) = 1 - (0.95)^20 = 64%

This is the mathematical reality of multiple testing.
Most "significant" findings in exploratory analyses are noise.


**Solution:**
```
1. Pre-specify primary outcome (only one)
2. Use Bonferroni correction: alpha_adj = 0.05 / n_tests
3. Or use FDR (Benjamini-Hochberg) for exploratory work
4. Report ALL tests conducted, not just significant ones
5. Label post-hoc analyses as "exploratory"

```

**Symptoms:**
- Finding 'significant' results that don't replicate
- Running many t-tests without correction
- Testing many subgroups until one is significant
- Checking outcomes at multiple timepoints

---

### [CRITICAL] Hypothesizing After Results are Known turns exploration into false confirmation

**Why it happens:**
When you look at data first, you will ALWAYS find patterns.
Some are real, most are noise. If you then write a hypothesis
that predicts the noise pattern, you're committing scientific fraud.

Your brain is a pattern-matching machine - it WILL find something.
That's why hypothesis must come BEFORE data.


**Solution:**
```
1. Use pre-registration (OSF, AsPredicted) BEFORE data collection
2. Time-stamp hypotheses before accessing data
3. Clearly separate confirmatory vs exploratory analyses
4. In papers, cite pre-registration link
5. Label post-hoc discoveries as "exploratory finding"

```

**Symptoms:**
- Hypothesis perfectly matches observed pattern
- No pre-registration document exists
- Hypothesis was 'refined' after seeing data
- Results seem too good to be true

---

### [CRITICAL] Analyzing only 'successful' cases leads to backwards conclusions

**Why it happens:**
WWII planes that returned had bullet holes in wings and tail.
Engineers wanted to armor those spots. Abraham Wald said NO -
armor where returning planes DON'T have holes, because planes
hit there didn't return.

You can't learn from data you never collected.


**Solution:**
```
1. Include failed/churned/removed cases in your sample
2. Track cohorts from the beginning, not retrospectively
3. Use prospective studies, not just retrospective
4. Ask "What would the dead tell us?"
5. Log everything, even from users who leave

```

**Symptoms:**
- Only studying current customers, not churned ones
- Only analyzing shipped products, not failed ones
- Looking at successful startups for success patterns
- Studying existing users but not those who bounced

---

### [HIGH] With n=20, you need Cohen's d > 0.9 to detect at 80% power

**Why it happens:**
Statistical power = P(detect effect | effect exists)
With low power, most real effects go undetected.

Sample size requirements:
- Small effect (d=0.2): n=393 per group
- Medium effect (d=0.5): n=64 per group
- Large effect (d=0.8): n=26 per group

Most studies have n < 50 and try to detect medium effects.


**Solution:**
```
1. Calculate required N BEFORE starting
2. Use G*Power or statsmodels.stats.power
3. Don't start if you can't achieve 80% power
4. Report achieved power in publications
5. Distinguish "no effect" from "couldn't detect"

```

**Symptoms:**
- Ran quick study, found 'no effect'
- Didn't do power analysis before collecting data
- Confidently claimed null finding
- Sample size chosen by convenience, not statistics

---

### [HIGH] p=0.03 does NOT mean '3% chance the null is true'

**Why it happens:**
P-value = P(data this extreme | null hypothesis is true)
P-value ≠ P(null is true | data)

These are VERY different things (Bayes' theorem).
A p=0.03 could still correspond to 30%+ probability
the null is true, depending on priors.


**Solution:**
```
1. Report effect sizes with confidence intervals
2. Don't dichotomize at p=0.05
3. Consider Bayesian methods for probability statements
4. Interpret p-values correctly in writing
5. Use "statistically detectable" not "significant"

```

**Symptoms:**
- Claiming p=0.04 means treatment 'probably works'
- Using p-values to compare effect sizes between studies
- Stopping data collection when p < 0.05
- Treating p=0.049 very differently from p=0.051

---

### [HIGH] Information from test set leaking into training destroys validity

**Why it happens:**
If any information from test set influences training,
your evaluation is meaningless. You're testing on
data the model has "seen" in some form.

Common leaks:
- Normalizing before splitting
- Feature selection on full data
- Filling missing values with global stats
- Time series without temporal split


**Solution:**
```
1. ALWAYS split first, then preprocess
2. Fit scalers/encoders on train only, transform test
3. Use pipelines to prevent leaks
4. For time series, use temporal splits
5. Be paranoid about any global statistics

```

**Symptoms:**
- Model performs great in development, fails in production
- Cross-validation scores much higher than holdout
- Performance drops significantly on new data
- Preprocessing fit on entire dataset before splitting

---

### [HIGH] We scrutinize unexpected results more than expected ones

**Why it happens:**
Human brains evolved to find patterns and confirm beliefs.
We unconsciously:
- Check favorable results less carefully
- Explain away unfavorable results as "noise"
- Notice bugs only when results surprise us
- Remember confirmations, forget contradictions


**Solution:**
```
1. Apply same scrutiny to ALL results
2. Pre-specify analysis in pre-registration
3. Have skeptical colleague review favorable results
4. Blinding: Don't know which group is treatment during analysis
5. Document decision process: "Why did I investigate X but not Y?"

```

**Symptoms:**
- Quickly accepting results that confirm hypothesis
- Spending hours debugging when results contradict
- Finding 'errors' only in unfavorable results
- Attributing favorable results to treatment, unfavorable to noise

---

### [MEDIUM] Ice cream sales correlate with drowning deaths (both caused by summer)

**Why it happens:**
Correlation can arise from:
1. A causes B (what you want)
2. B causes A (reverse causation)
3. C causes both A and B (confounding)
4. Random chance (spurious correlation)

Only experiments with randomization can establish causation.


**Solution:**
```
1. For causal claims, use randomized experiments
2. If observational, use causal inference methods
3. Look for and control confounding variables
4. Consider reverse causation explicitly
5. Use careful language: "associated with" not "causes"

```

**Symptoms:**
- Found correlation, recommending intervention
- Not considering third variables (confounds)
- Using observational data for causal claims
- Ignoring reverse causation possibility

---

### [MEDIUM] Adding parameters until your hypothesis 'explains' the data

**Why it happens:**
With enough parameters, you can fit any data.
But fitted models predict poorly on new data.

Same applies to hypotheses: with enough caveats,
any hypothesis can "explain" any data. But it won't
predict new observations.


**Solution:**
```
1. Pre-specify your hypothesis completely
2. No post-hoc subgroup analyses for primary conclusions
3. Simpler theories are better (Occam's razor)
4. If refining, get NEW data to test refined hypothesis
5. Report all variations tried

```

**Symptoms:**
- Continually refining hypothesis to fit observations
- Adding epicycles to save a theory
- Post-hoc subgroup analyses to rescue null results
- Adding interaction terms until significance

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `statistics|p-value|hypothesis test` | statistical-analysis | Need detailed statistical analysis |
| `reproducible|docker|environment` | data-reproducibility | Need reproducible computational environment |
| `paper|publication|writing` | research-paper-writing | Ready to write up research findings |
| `grant|funding|NIH|NSF` | grant-writing | Need to write research proposal |
| `literature|citation|systematic` | literature-review | Need comprehensive background research |
| `design of experiments|DOE|factorial` | experimental-design | Need formal experimental design |

### Receives Work From

- **ml-ops**: Need rigorous experimental methodology for ML experiments
- **data-pipeline**: Need to validate data analysis methodology
- **backend**: Need to run A/B tests or experiments
- **performance-profiling**: Need to statistically compare performance results

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/science/scientific-method/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
