# Risk Modeling

> Use when building VaR models, stress testing portfolios, Monte Carlo simulations, or implementing enterprise risk management - covers market risk, credit risk, and operational risk frameworks

**Category:** finance | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] VaR based on normal assumption misses extreme events

**Why it happens:**
Financial returns have fat tails - extreme events occur more
frequently than normal distribution predicts. Using normal
assumptions can understate 99% VaR by 30-50%.


**Solution:**
```
# Use t-distribution for fat tails
params = stats.t.fit(returns)  # Fit degrees of freedom
z_score = stats.t.ppf(0.01, *params)

# Or use historical simulation
var_99 = np.percentile(returns, 1)

# Or use Extreme Value Theory for tail estimation

```

**Symptoms:**
- VaR breaches much more frequent than expected
- Actual losses exceed VaR by large multiples
- Model performs well in calm markets, fails in stress

---

### [HIGH] Small N gives unreliable VaR estimates

**Why it happens:**
For 99% VaR with 1,000 simulations, you only have ~10 observations
in the tail. The standard error of the percentile estimate is huge.
Need N >= 100,000 for stable tail estimates.


**Solution:**
```
# Minimum 100,000 for VaR
n_simulations = 100_000

# Use antithetic variates to reduce variance
z1 = np.random.standard_normal(n_simulations // 2)
z2 = -z1  # Antithetic
simulations = np.concatenate([z1, z2])

# Bootstrap to estimate standard error
bootstrap_vars = [np.percentile(np.random.choice(simulations, len(simulations)), 1) for _ in range(1000)]
se = np.std(bootstrap_vars)

```

**Symptoms:**
- VaR fluctuates significantly between runs
- Tail percentiles very unstable
- Can't reproduce results

---

### [HIGH] Using average correlation underestimates portfolio risk

**Why it happens:**
Correlations increase dramatically during market stress.
Using historical average correlation understates risk
precisely when it matters most.


**Solution:**
```
# Use stressed correlation scenarios
def stressed_correlation(base_corr, stress_factor=0.3):
    """Move correlations toward 1 under stress."""
    return base_corr + (1 - base_corr) * stress_factor

# Or use rolling correlation from crisis periods
crisis_periods = ['2008-09':'2009-03', '2020-02':'2020-04']
stress_corr = returns[crisis_periods].corr()

# Run VaR with both normal and stressed correlations

```

**Symptoms:**
- Diversification benefit evaporates in drawdowns
- Portfolio VaR exceeded by actual losses in crisis
- Hedges fail when most needed

---

### [MEDIUM] Diversified portfolio can have higher VaR than sum of parts

**Why it happens:**
VaR is not a coherent risk measure - it can violate subadditivity.
This means combining positions can appear to increase risk,
even when diversification should reduce it.


**Solution:**
```
# Use Expected Shortfall (CVaR) - it's coherent
def expected_shortfall(returns, confidence=0.99):
    var = np.percentile(returns, (1 - confidence) * 100)
    return returns[returns <= var].mean()

# ES satisfies subadditivity:
# ES(A + B) <= ES(A) + ES(B)

```

**Symptoms:**
- Portfolio VaR exceeds sum of component VaRs
- Diversification appears harmful (mathematically)
- Risk limits create perverse incentives

---

### [MEDIUM] Model passes backtest but fails on new data

**Why it happens:**
If you tune model parameters to pass backtests on historical
data, you've essentially fit to that specific history.
The model won't generalize to new market regimes.


**Solution:**
```
# Use walk-forward backtesting
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
results = []

for train_idx, test_idx in tscv.split(returns):
    # Fit on train
    model = fit_garch(returns.iloc[train_idx])
    # Test on out-of-sample
    var_estimates = model.forecast(len(test_idx))
    results.append(kupiec_test(returns.iloc[test_idx], var_estimates))

```

**Symptoms:**
- Perfect Kupiec test results
- Model calibrated to specific historical period
- Fails on out-of-sample data

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `option|greeks|derivative` | derivatives-pricing | Options risk calculation |
| `allocat|weight|portfolio.*optim` | portfolio-optimization | Risk-adjusted allocation |
| `backtest|strategy|signal` | algorithmic-trading | Trading strategy risk |
| `blockchain|defi|smart.?contract` | blockchain-defi | DeFi protocol risk |

### Receives Work From

- **algorithmic-trading**: Trade execution data
- **portfolio-optimization**: Portfolio weights

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/finance/risk-modeling/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
