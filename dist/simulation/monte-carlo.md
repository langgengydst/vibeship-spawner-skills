# Monte Carlo Simulation

> Design and implement Monte Carlo methods for uncertainty quantification,
risk analysis, and probabilistic simulations across scientific and financial domains.


**Category:** simulation | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Standard MC fails for low-probability events

**Why it happens:**
Standard MC samples uniformly. For probability p, need ~1/p samples
to see one event. For p = 10^-6, need millions of samples.

Worse: variance of rare event estimate is p(1-p)/N ~ p/N
Relative error = 1/sqrt(Np) - huge for small p.

Critical for: safety analysis, risk assessment, extreme events.


**Solution:**
```
# 1. Importance sampling - sample near failure region
def importance_sample_failure():
    # Sample from distribution concentrated near failure
    biased_sample = sample_near_threshold()
    is_failure = evaluate(biased_sample)

    # Correct for bias with likelihood ratio
    weight = true_density(biased_sample) / biased_density(biased_sample)
    return is_failure * weight

# 2. Subset simulation - chain of conditional probabilities
class SubsetSimulation:
    def __init__(self, p0: float = 0.1):
        self.p0 = p0  # Conditional probability per level

    def estimate(self, model, n_samples: int) -> float:
        samples = [sample_prior() for _ in range(n_samples)]
        responses = [model(s) for s in samples]

        levels = []
        current_threshold = np.percentile(responses, (1-self.p0)*100)
        levels.append(current_threshold)

        while current_threshold > target_threshold:
            # MCMC to sample conditional distribution
            # (samples with response > current_threshold)
            samples = self.mcmc_conditional(samples, responses, current_threshold)
            responses = [model(s) for s in samples]
            current_threshold = np.percentile(responses, (1-self.p0)*100)
            levels.append(current_threshold)

        # Probability = p0^(n_levels) * fraction above final threshold
        n_above = sum(1 for r in responses if r > target_threshold)
        return self.p0 ** len(levels) * n_above / n_samples

# 3. Cross-entropy method for rare events

```

**Symptoms:**
- Estimated probability is 0 but event can happen
- Huge variance in rare event estimates
- Different runs give wildly different results

---

### [HIGH] Weak RNG introduces bias or correlation

**Why it happens:**
Not all RNGs are created equal.
Linear congruential generators (LCG): short period, correlations.
Many default RNGs fail statistical tests.

For MC simulation:
- Need long period (> samples you'll ever use)
- Need independence across dimensions
- Need reproducibility for debugging
- Parallel streams must not overlap

Using time-based seeds in parallel = disaster.


**Solution:**
```
# 1. Use modern RNGs with proper seeding
from numpy.random import Generator, PCG64

# Per-thread generators from seed sequence
from numpy.random import SeedSequence

ss = SeedSequence(12345)
child_seeds = ss.spawn(n_processes)
generators = [Generator(PCG64(s)) for s in child_seeds]

# Each process uses its own generator
def worker(rng: Generator):
    samples = rng.uniform(size=(1000, dim))
    # Guaranteed independent from other workers

# 2. For reproducibility
rng = Generator(PCG64(seed=42))  # Local state, not global

# 3. Check RNG quality
# Use Dieharder or TestU01 for serious applications

# 4. For cryptographic/security: use secrets module

```

**Symptoms:**
- Results depend on initial seed in unexpected ways
- Parallel runs produce correlated results
- Patterns appear in 'random' samples

---

### [HIGH] Samples from wrong distribution due to insufficient burn-in

**Why it happens:**
MCMC needs time to "forget" its starting point.
Chain must reach stationary distribution.
No guaranteed time - depends on problem.

Signs of non-convergence:
- Trace plots show trend
- Different chains disagree
- Gelman-Rubin R-hat > 1.1

Can't prove convergence, only detect non-convergence.


**Solution:**
```
# 1. Run multiple chains from dispersed starting points
def run_with_diagnostics(n_chains: int = 4, n_samples: int = 10000):
    chains = []
    for i in range(n_chains):
        initial = sample_overdispersed_prior()
        chain = mcmc.sample(n_samples, initial=initial)
        chains.append(chain)

    # Gelman-Rubin diagnostic
    r_hat = compute_r_hat(chains)
    if r_hat > 1.1:
        raise ValueError(f"Chains not converged: R-hat = {r_hat}")

    return np.concatenate(chains)

# 2. Check trace plots
def visual_diagnostics(chain):
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(2, 1)
    axes[0].plot(chain)  # Trace plot - should be stationary
    axes[1].hist(chain, bins=50)  # Should match expected posterior

# 3. Compute effective sample size
ess = compute_ess(chain)
if ess < 100:
    print(f"Warning: ESS only {ess}, need more samples")

# 4. Use better samplers (HMC, NUTS) for faster mixing

```

**Symptoms:**
- Results depend strongly on starting point
- Multiple chains give different answers
- Posterior mean drifts over long runs

---

### [HIGH] Convergence rate doesn't improve but constant gets worse

**Why it happens:**
MC convergence: O(1/sqrt(N)), independent of dimension.
Sounds good, but the constant grows exponentially!

In d dimensions:
- Volume of hypercube: 1
- Volume of inscribed hypersphere: approaches 0
- Most samples are in "corners", far from center

For integration: most samples contribute nothing.
For MCMC: harder to explore space efficiently.


**Solution:**
```
# 1. Dimension reduction if possible
# Find low-dimensional structure in problem

# 2. Use QMC with dimensionality-aware sampling
from scipy.stats import qmc

# Sobol better than Halton for high-d
sampler = qmc.Sobol(d=dim, scramble=True)
samples = sampler.random(n)

# 3. Importance sampling in important dimensions
# Identify which dimensions matter most

# 4. Sequential Monte Carlo
# Build up distribution through tempering

# 5. Tensor decomposition methods
# Exploit structure to reduce effective dimension

# 6. Active subspaces
# Find low-dim subspace where function varies

```

**Symptoms:**
- Need exponentially more samples as dimension grows
- Integration error grows with dimension
- QMC loses advantage over MC

---

### [MEDIUM] Estimator systematically over/underestimates true value

**Why it happens:**
Not all MC estimators are unbiased.
Common sources of bias:

1. Self-normalized importance sampling
   E[sum(w*f)/sum(w)] != E[f] in general

2. Ratio estimators
   E[X/Y] != E[X]/E[Y]

3. Nonlinear functions of expectations
   E[g(X)] != g(E[X]) unless g linear

4. Truncated or censored samples


**Solution:**
```
# 1. Use unbiased estimators when possible
def unbiased_ratio_estimator(n):
    # Generate paired samples
    pairs = [(simulate_x(), simulate_y()) for _ in range(n)]
    # Use f(x)/g(y) with proper weights
    return np.mean([x / y for x, y in pairs if y != 0])

# 2. For self-normalized IS: use more samples
# Bias is O(1/n), variance is O(1/n)
# Bias becomes negligible with enough samples

# 3. Bias correction
def jackknife_bias_correction(estimates):
    n = len(estimates)
    theta_all = np.mean(estimates)
    theta_i = [(np.sum(estimates) - e) / (n - 1) for e in estimates]
    bias = (n - 1) * (np.mean(theta_i) - theta_all)
    return theta_all - bias

# 4. Bootstrap confidence intervals
# Account for bias in interval construction

```

**Symptoms:**
- Error doesn't decrease with more samples
- Confidence interval excludes true value
- Systematic offset in estimates

---

### [MEDIUM] Heavy-tailed weights cause unstable estimates

**Why it happens:**
Importance sampling weight: w(x) = p(x)/q(x)

If q(x) has lighter tails than p(x):
- w(x) can be huge in tails
- Var(w) may be infinite
- CLT doesn't apply, convergence is slow

One bad sample can dominate thousands of good ones.


**Solution:**
```
# 1. Use proposal with heavier tails than target
# If target is Normal, proposal can be t-distribution

# 2. Truncate weights
def truncate_weights(weights, max_weight=None):
    if max_weight is None:
        max_weight = 10 * np.median(weights)
    return np.minimum(weights, max_weight)

# 3. Self-normalized estimator (reduces variance)
def self_normalized(samples, weights, f):
    return np.sum(weights * f(samples)) / np.sum(weights)

# 4. Monitor effective sample size
def effective_sample_size(weights):
    w_normalized = weights / np.sum(weights)
    return 1 / np.sum(w_normalized ** 2)

# If ESS << n, proposal is poor

# 5. Adaptive importance sampling
# Update proposal based on observed samples

```

**Symptoms:**
- Occasional samples dominate entire estimate
- ESS is tiny compared to sample size
- Estimates jump wildly between runs

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `physics|dynamics|FEM` | physics-simulation | Physical model to run through MC |
| `digital twin|sensor data|real-time` | digital-twin | Twin uncertainty quantification |
| `Bayesian|posterior|inference` | statistical-analysis | Statistical inference from MC samples |
| `agent|population|behavior` | agent-based-modeling | Stochastic agent simulation |
| `option|pricing|finance` | quantitative-finance | Financial Monte Carlo |

### Receives Work From

- **physics-simulation**: Monte Carlo for physics model uncertainty
- **digital-twin**: Probabilistic twin predictions
- **statistical-analysis**: Bayesian inference

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/simulation/monte-carlo/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
