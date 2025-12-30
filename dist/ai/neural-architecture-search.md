# Neural Architecture Search

> Use when automating model architecture design, optimizing hyperparameters, or exploring neural network configurations - covers NAS algorithms, search spaces, Bayesian optimization, and AutoML tools

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Combinatorial explosion makes finding good architectures unlikely

**Why it happens:**
A search space with n choices per layer and L layers has n^L configurations.
Even 5 choices over 12 layers = 244 million configurations.
Random sampling will miss good regions entirely.


**Solution:**
```
# Constrained search space based on domain knowledge
search_space = {
    'num_layers': [6, 8, 12],  # Known good values
    'hidden_dim': [256, 512, 768],  # Reasonable range
    'num_heads': [4, 8, 12],  # Must divide hidden_dim
    'activation': ['gelu', 'swish'],  # Best performers
    'dropout': [0.1, 0.2, 0.3],  # Typical range
}

# Or use cell-based search (DARTS-style)
# Search for cell structure, then stack cells

```

**Symptoms:**
- Search never converges
- Best found architecture is mediocre
- Huge variance between runs
- Compute budget exhausted quickly

---

### [HIGH] Architecture ranked best on proxy fails on real task

**Why it happens:**
Proxy tasks (small data, few epochs) can have different optima
than the full task. What works at small scale may not scale.
Regularization needs differ between small and large data.


**Solution:**
```
# 1. Validate periodically on full task
if trial % 50 == 0:
    full_score = train(best_so_far, full_data, full_epochs)
    if full_score < baseline:
        adjust_search_space()

# 2. Use fidelity-aware methods (Hyperband)
# Train promising configs longer

# 3. Rank correlation check
# Sample configs, evaluate on both proxy and full
# Ensure Spearman correlation > 0.7

```

**Symptoms:**
- Top proxy architecture underperforms baseline on full task
- Rankings don't correlate between proxy and full
- Small models favored on proxy but don't scale

---

### [MEDIUM] Supernet weights don't transfer to standalone training

**Why it happens:**
In weight-sharing NAS, all architectures share the same weights.
This creates coupling: improving one path can hurt another.
The optimal weights for the supernet differ from optimal for any subnet.


**Solution:**
```
# 1. Fair sampling during supernet training
for batch in dataloader:
    # Random architecture each batch
    arch = sample_random_architecture()
    loss = supernet.forward_with_arch(batch, arch)
    loss.backward()

# 2. Longer standalone retraining
# Don't trust supernet rankings directly
# Retrain top-10 from scratch, pick best

# 3. Few-shot NAS
# Partially inherit weights, fine-tune for a few epochs

```

**Symptoms:**
- Top supernet paths perform poorly when trained independently
- All paths have similar performance
- Extracted architecture significantly underperforms

---

### [MEDIUM] Can't replicate found architecture or its performance

**Why it happens:**
NAS involves many sources of randomness:
- Search algorithm randomness
- Weight initialization
- Data shuffling
- GPU non-determinism
Without proper seeding and logging, results are irreproducible.


**Solution:**
```
# 1. Set all seeds
import random
import numpy as np
import torch

def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True

# 2. Log everything
study = optuna.create_study(
    study_name="nas_experiment_001",
    storage="sqlite:///optuna.db",
)

# 3. Save search state for resume
study.optimize(objective, n_trials=100,
               callbacks=[SaveStateCallback()])

```

**Symptoms:**
- Rerunning search finds different architecture
- Same architecture gives different scores
- Published results can't be reproduced

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `transformer|attention|positional` | transformer-architecture | Transformer-specific search space |
| `distributed|multi.*gpu|parallel.*train` | distributed-training | Distributed NAS execution |
| `quantiz|deploy|latency.*optim` | model-optimization | Hardware-aware NAS |
| `fine.?tun|adapt|transfer` | llm-fine-tuning | Fine-tuning found architecture |

### Receives Work From

- **transformer-architecture**: Architecture constraints and patterns
- **distributed-training**: Distributed evaluation

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/neural-architecture-search/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
