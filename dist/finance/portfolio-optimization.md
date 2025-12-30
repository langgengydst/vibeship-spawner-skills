# Portfolio Optimization

> Use when constructing portfolios, implementing mean-variance optimization, factor models, risk parity, or Black-Litterman allocation - covers modern portfolio theory and practical enhancements

**Category:** finance | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Raw covariance matrix leads to extreme weights

**Why it happens:**
Sample covariance from limited data has huge estimation error.
With 50 assets and 250 days, you're estimating 1275 parameters
from 250 observations. The matrix is nearly singular and
optimization exploits estimation errors.


**Solution:**
```
# Use Ledoit-Wolf shrinkage
from sklearn.covariance import LedoitWolf
lw = LedoitWolf().fit(returns)
cov_matrix = lw.covariance_ * 252

# Or shrink to diagonal
shrinkage = 0.5
diag_cov = np.diag(np.diag(sample_cov))
cov_matrix = shrinkage * diag_cov + (1 - shrinkage) * sample_cov

```

**Symptoms:**
- Optimizer puts 100% in few assets
- Small data changes flip entire portfolio
- Out-of-sample performance terrible

---

### [HIGH] Return estimates drive optimization but have huge error bars

**Why it happens:**
Estimating expected returns requires decades of data to achieve
statistical significance. A 1% annual return estimate has a
standard error of about 5% with 5 years of data. The optimizer
treats these noisy estimates as truth.


**Solution:**
```
# Option 1: Shrink returns toward equal (or zero)
raw_returns = returns.mean() * 252
global_mean = raw_returns.mean()
shrinkage = 0.5
expected_returns = shrinkage * global_mean + (1 - shrinkage) * raw_returns

# Option 2: Use Black-Litterman with market equilibrium
market_weights = market_caps / market_caps.sum()
equilibrium_returns = risk_aversion * cov_matrix @ market_weights

# Option 3: Skip returns entirely - use risk parity
weights = risk_parity(cov_matrix)

```

**Symptoms:**
- Portfolio changes dramatically with small return changes
- Optimizer chases noise in return estimates
- Consistent underperformance vs equal weight

---

### [HIGH] Optimization overfits to historical patterns

**Why it happens:**
Mean-variance optimization finds weights that maximize Sharpe
in the optimization window. This exploits idiosyncratic patterns
that don't persist. The more degrees of freedom (assets), the
worse the overfitting.


**Solution:**
```
# Walk-forward validation
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
results = []

for train_idx, test_idx in tscv.split(returns):
    # Optimize on train period only
    weights = optimize(returns.iloc[train_idx])
    # Evaluate on unseen test period
    perf = evaluate(weights, returns.iloc[test_idx])
    results.append(perf)

# Average across folds is realistic estimate

```

**Symptoms:**
- Perfect Sharpe ratio in backtest
- Terrible real-world performance
- Strategy 'finds' patterns that don't persist

---

### [MEDIUM] Simple equal weight outperforms in practice

**Why it happens:**
DeMiguel et al. (2009) showed 1/N beats most optimization
strategies out-of-sample. Why? Equal weight has no estimation
error. The 'optimal' portfolio has so much estimation error
that the simpler approach wins on net.


**Solution:**
```
# Always compare to 1/N benchmark
equal_weight_sharpe = calculate_sharpe(equal_weight_returns)
optimized_sharpe = calculate_sharpe(optimized_returns)

print(f"1/N Sharpe: {equal_weight_sharpe:.2f}")
print(f"Optimized Sharpe: {optimized_sharpe:.2f}")

# If you can't beat 1/N, use 1/N
# Consider: HRP as middle ground

```

**Symptoms:**
- Spent months on optimization
- Can't beat equal weight out-of-sample
- Transaction costs from rebalancing hurt further

---

### [MEDIUM] Frequent rebalancing costs more than it adds

**Why it happens:**
Optimal weights change with each new data point. But trading
costs are real - spreads, market impact, commissions.
A 1% monthly turnover with 0.1% cost is 1.2% annual drag.


**Solution:**
```
# Add turnover constraint
def objective_with_turnover(w, current_w, turnover_penalty=0.01):
    sharpe = calculate_sharpe(w)
    turnover = np.sum(np.abs(w - current_w))
    return -(sharpe - turnover_penalty * turnover)

# Or use threshold rebalancing
if np.max(np.abs(current_weights - target_weights)) > 0.05:
    rebalance()

```

**Symptoms:**
- Portfolio changes 50%+ at each rebalance
- Trading costs exceed optimization gains
- Net-of-cost returns negative

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `var|value.at.risk|stress.test` | risk-modeling | Portfolio risk metrics |
| `execute|trade|rebalance.*order` | algorithmic-trading | Portfolio rebalancing |
| `option|derivative|hedge` | derivatives-pricing | Options overlay |
| `defi|yield|liquidity` | blockchain-defi | DeFi portfolio strategies |

### Receives Work From

- **risk-modeling**: Risk constraints and metrics
- **algorithmic-trading**: Execution feedback

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/finance/portfolio-optimization/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
