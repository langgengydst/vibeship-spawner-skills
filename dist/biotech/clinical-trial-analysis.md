# Clinical Trial Analysis

> Patterns for designing and analyzing clinical trials, including survival
analysis, endpoint selection, sample size calculation, interim analyses,
and regulatory considerations. Covers FDA/EMA guidelines and modern
adaptive designs.


**Category:** biotech | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] PFS gains don't always translate to OS benefit - can even show harm

**Why it happens:**
Per FDA 2024 guidance: Several recent examples demonstrated that common
early endpoints do not always predict treatment effect or potential harm.

Examples:
- PI3K inhibitors: PFS improvement but OS detriment in hematologic malignancies
- PARP inhibitors: PFS benefit but potential OS harm in ovarian cancer

Reasons for discordance:
- Treatment toxicity catches up over time
- Post-progression therapies differ between arms
- PFS gain may be purely radiographic, not clinical
- Crossover to active treatment in control arm

OS is the only endpoint measuring true clinical benefit.


**Solution:**
```
# Pre-specify OS as safety endpoint per FDA guidance
safety_endpoints = {
    'primary': 'PFS',
    'key_secondary': 'OS',
    'os_monitoring': {
        'interim_analyses': [0.50, 0.75, 1.00],
        'futility_boundary': True,
        'harm_boundary': 'O-Brien Fleming'
    }
}

# Plan crossover handling upfront
os_analysis_plan = {
    'primary': 'ITT',
    'sensitivity': ['RPSFT', 'IPCW'],
    'crossover_adjustment': True
}

# Ensure adequate OS follow-up before publication

```

**Symptoms:**
- Significant PFS improvement but OS shows no benefit
- Crossover confounds OS analysis
- Later OS data shows potential harm

---

### [CRITICAL] Finding 'significant' subgroups invalidates statistical inference

**Why it happens:**
If you test enough subgroups, one will be significant by chance.
With 20 subgroups and alpha=0.05, expect 1 false positive.

Common violations:
- Testing biomarker cutoffs until one works
- Splitting by age/sex/region until finding significance
- Reporting only 'successful' subgroups

Regulators now scrutinize subgroup claims heavily.


**Solution:**
```
# Pre-specify subgroups in statistical analysis plan
prespecified_subgroups = [
    {
        'name': 'Biomarker-positive',
        'definition': 'IHC ≥50% per central lab',
        'rationale': 'Biological mechanism',
        'analysis': 'Stratified by randomization factors'
    }
]

# Limit number of subgroups (typically 3-5 max)
# Adjust for multiplicity if testing multiple

# Report ALL subgroups, not just positive ones
# Use forest plots for transparency

```

**Symptoms:**
- Overall trial negative, but 'hypothesis-generating' subgroup positive
- Multiple subgroups tested without multiplicity adjustment
- Subgroup definition refined post-hoc

---

### [HIGH] Hazard ratio meaningless when hazards cross

**Why it happens:**
Cox proportional hazards assumes constant hazard ratio over time.
When curves cross:
- Treatment may be harmful early, beneficial late
- Or beneficial early, harmful late
- A single HR doesn't capture this

Reporting HR=1.0 when curves cross misses the story.

Common in immunotherapy: delayed separation of curves.


**Solution:**
```
# Test proportional hazards assumption
cph.check_assumptions(data, p_value_threshold=0.05)

# If violated, use:
# 1. Restricted Mean Survival Time (RMST)
rmst_diff = rmst(treatment, 24) - rmst(control, 24)

# 2. Milestone analysis (survival at fixed time)
survival_12mo = kaplan_meier_at_time(data, 12)

# 3. Time-varying Cox model
cph_tv = CoxTimeVaryingFitter()

# 4. MaxCombo test (handles crossing)
maxcombo_test(treatment_times, control_times)

```

**Symptoms:**
- Survival curves cross
- Treatment effect changes over time
- Schoenfeld residuals test significant

---

### [CRITICAL] Misclassifying time before treatment as treated time

**Why it happens:**
To receive treatment, patients must survive to treatment start.
If you count this pre-treatment time as "treated", you give
treatment credit for time when patient couldn't die.

This artificially improves treatment group survival.

Common in:
- Registry analyses
- EHR-based studies
- Second-line treatment analyses


**Solution:**
```
# Landmark analysis: Start clock at treatment decision point
landmark_time = 90  # days
eligible = data[data['diagnosis_to_decision'] <= landmark_time]
# All patients must be alive at landmark

# Time-varying treatment indicator
# Treatment exposure starts when treatment starts
data['treatment_status'] = (data['time'] >= data['treatment_start']).astype(int)

# Use proper time origins in Cox model
cph.fit(data, duration_col='time_from_treatment_start', ...)

```

**Symptoms:**
- Treatment looks protective in observational data
- Treated patients have impossibly good survival
- Time from diagnosis to treatment start ignored

---

### [HIGH] Censoring correlated with outcome violates assumptions

**Why it happens:**
Kaplan-Meier assumes censoring is non-informative (random).
If sicker patients drop out more:
- Remaining patients are healthier
- Survival estimate is biased upward

Common causes:
- Toxicity leads to dropout
- Patients switch to other treatments
- Travel burden in one arm


**Solution:**
```
# Check censoring patterns by arm
def check_censoring(data, group_col, time_col, event_col):
    by_group = data.groupby(group_col)
    censoring_rates = by_group.apply(
        lambda x: (x[event_col] == 0).mean()
    )
    # Large differences suggest informative censoring
    return censoring_rates

# Sensitivity analyses:
# 1. Worst-case: Assume censored = events
# 2. Best-case: Assume censored = no events
# 3. Inverse probability of censoring weighting (IPCW)

# Report censoring information
# Show number at risk at each time point

```

**Symptoms:**
- Patients lost to follow-up are sicker
- Censoring differs between treatment arms
- Kaplan-Meier overestimates survival

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `survival analysis|Kaplan-Meier|Cox` | statistical-analysis | Need survival analysis methods |
| `sample size|power calculation` | statistical-analysis | Need power analysis |
| `data management|EDC|SDTM` | data-engineering | Need clinical data management |
| `regulatory|FDA|EMA submission` | regulatory-affairs | Need regulatory strategy |

### Receives Work From

- **drug-discovery-informatics**: Lead compound ready for clinical development
- **statistical-analysis**: Need specific statistical methodology
- **experimental-design**: Need experimental design principles

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/biotech/clinical-trial-analysis/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
