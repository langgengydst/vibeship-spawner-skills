# Reinforcement Learning

> Use when implementing RL algorithms, training agents with rewards, or aligning LLMs with human feedback - covers policy gradients, PPO, Q-learning, RLHF, and GRPO

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Model finds exploits in reward model instead of being helpful

**Why it happens:**
The reward model is an imperfect proxy for human preferences.
Given enough optimization pressure, the policy finds reward model exploits.
Common exploits: verbosity, sycophancy, specific phrases reward model likes.


**Solution:**
```
# 1. KL penalty to stay close to reference
reward = reward_model(response) - kl_coef * kl_divergence(policy, reference)

# 2. Periodically refresh reward model on new data
# 3. Ensemble multiple reward models
# 4. Human evaluation checkpoints

# 5. Early stopping based on held-out evaluation
if eval_score < best_score - tolerance:
    break  # Stop before overfitting to reward model

```

**Symptoms:**
- Reward score increases but quality decreases
- Model produces verbose but unhelpful responses
- Responses game the reward model's biases
- Human evaluators disagree with high reward scores

---

### [CRITICAL] Policy suddenly degenerates after seeming stable

**Why it happens:**
Without proper constraints, policy gradient updates can be too large.
A large bad update can push the policy into a degenerate state.
From there, all samples reinforce the bad behavior.


**Solution:**
```
# PPO clipping prevents catastrophic updates
ratio = torch.exp(new_log_prob - old_log_prob)

surr1 = ratio * advantage
surr2 = torch.clamp(ratio, 1 - clip_epsilon, 1 + clip_epsilon) * advantage

loss = -torch.min(surr1, surr2).mean()

# Also: monitor entropy, add entropy bonus
entropy_bonus = -entropy_coef * entropy.mean()
total_loss = loss + entropy_bonus

```

**Symptoms:**
- Entropy drops to near zero
- Policy outputs become deterministic/repetitive
- Reward suddenly crashes
- All samples look identical

---

### [HIGH] Reward signal too rare for learning to occur

**Why it happens:**
If reward only comes at episode end (or rarely), the agent gets no
feedback about which intermediate actions were good.
Credit assignment becomes impossible.


**Solution:**
```
# 1. Reward shaping - add intermediate rewards
def shaped_reward(state, action, next_state):
    sparse = 1.0 if is_goal_reached(next_state) else 0.0

    # Potential-based shaping (preserves optimal policy)
    potential_diff = gamma * potential(next_state) - potential(state)

    return sparse + shaping_coef * potential_diff

# 2. Curiosity-driven exploration
# 3. Hierarchical RL with subgoals
# 4. Curriculum learning - start with easier tasks

```

**Symptoms:**
- Agent takes random actions indefinitely
- No improvement over random baseline
- Policy gradient has near-zero signal

---

### [HIGH] Q-learning systematically overestimates values

**Why it happens:**
max_a Q(s,a) takes the maximum over noisy estimates.
This systematically picks the action with the highest positive noise.
Over many updates, this bias compounds.


**Solution:**
```
# Double DQN - use online net to select, target net to evaluate
next_actions = online_net(next_state).argmax(dim=1)
target_q = reward + gamma * target_net(next_state).gather(1, next_actions)

# The action selection and value estimation use different networks
# This breaks the overestimation cycle

```

**Symptoms:**
- Q-values grow unrealistically large
- Agent is overconfident about bad actions
- Performance is worse than expected from Q-values

---

### [HIGH] Policy drifts too far from reference model

**Why it happens:**
Without proper KL constraint, the policy can drift arbitrarily far.
The reference model represents the base capabilities we want to preserve.
Drifting too far means catastrophic forgetting.


**Solution:**
```
# 1. Appropriate KL coefficient (0.1 - 0.5 typical)
kl_coef = 0.1

# 2. Adaptive KL penalty
if kl > target_kl * 1.5:
    kl_coef *= 1.5
elif kl < target_kl / 1.5:
    kl_coef /= 1.5

# 3. Hard KL constraint (TRPO-style)
if kl > max_kl:
    reject_update()

```

**Symptoms:**
- KL penalty term dominates the loss
- Model forgets base capabilities
- Responses become incoherent
- Generation quality degrades

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `transformer|attention|model.*architecture` | transformer-architecture | Policy network design |
| `sft|supervised.*fine.?tun|instruction.*tun` | llm-fine-tuning | SFT before RLHF |
| `multi.*gpu|distributed|scale.*training` | distributed-training | Scaling RL training |
| `quantiz|deploy|inference.*optim` | model-optimization | Optimizing trained policy |

### Receives Work From

- **transformer-architecture**: Policy network architecture
- **llm-fine-tuning**: SFT phase before RLHF
- **distributed-training**: Scaling RL training

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/reinforcement-learning/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
