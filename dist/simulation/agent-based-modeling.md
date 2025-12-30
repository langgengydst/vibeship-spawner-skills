# Agent-Based Modeling

> Design and implement agent-based models (ABM) for simulating complex systems
with emergent behavior from individual agent interactions.


**Category:** simulation | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Sequential updates give unfair advantage to early agents

**Why it happens:**
Sequential update: agent 1 acts, then agent 2 sees result, then acts.
Agent 1 always gets first pick of resources.
Agent 2 always reacts to agent 1's action.

Real systems are often simultaneous or asynchronous.
Sequential creates artificial causal ordering.

Worse: deterministic order = deterministic artifacts.


**Solution:**
```
# 1. Shuffle agent order each step
def step():
    agent_order = list(agents)
    np.random.shuffle(agent_order)
    for agent in agent_order:
        agent.step()

# 2. Simultaneous update (two-phase)
def simultaneous_step():
    # Phase 1: All agents decide
    decisions = {a.id: a.decide() for a in agents}

    # Phase 2: All agents act (seeing old state)
    for agent in agents:
        agent.act(decisions[agent.id])

# 3. Event-driven (truly asynchronous)
# Each agent has next_action_time
# Process in time order

```

**Symptoms:**
- Results change when agent order changes
- First agents always win in competition
- Patterns emerge that don't exist in real system

---

### [HIGH] Square grid creates directional bias in movement

**Why it happens:**
Square grids have anisotropic distance:
- Diagonal neighbors: sqrt(2) * cell_size away
- Cardinal neighbors: 1 * cell_size away

Moore neighborhood (8 neighbors): diagonal is closer in grid steps
Von Neumann (4 neighbors): diagonal is further

Neither matches Euclidean distance.
Agents "see" grid structure, patterns emerge from grid.


**Solution:**
```
# 1. Continuous space
def move_continuous(agent, angle, speed):
    agent.x += speed * np.cos(angle)
    agent.y += speed * np.sin(angle)

# 2. Hexagonal grid (more isotropic)
# 6 neighbors all equidistant

# 3. Correct diagonal cost
def move_with_distance(agent, direction):
    dx, dy, cost = movements[direction]
    if agent.movement_budget >= cost:
        agent.x += dx
        agent.y += dy
        agent.movement_budget -= cost

movements = {
    'N': (0, 1, 1.0),
    'NE': (1, 1, 1.414),  # sqrt(2)
    # ...
}

# 4. Off-lattice with spatial hashing for queries

```

**Symptoms:**
- Agents cluster in grid patterns
- Diagonal movement faster than cardinal
- Eight-directional movement visible in emergent patterns

---

### [HIGH] Patterns change qualitatively with population size

**Why it happens:**
Many ABM phenomena have critical population thresholds:
- Disease: herd immunity requires N > threshold
- Flocking: need enough neighbors for alignment
- Markets: liquidity requires sufficient traders

Testing with N=100, deploying with N=10000 can show
completely different dynamics.

Finite-size effects: fluctuations scale as 1/sqrt(N).


**Solution:**
```
# 1. Test at multiple scales
def scale_analysis():
    for n in [100, 1000, 10000, 100000]:
        env = Environment(n_agents=n)
        metrics = run_and_measure(env)
        plot_vs_scale(n, metrics)

# 2. Identify critical thresholds
# Look for non-linear changes in metrics vs N

# 3. Use finite-size scaling theory
# Rescale by N^alpha to collapse curves

# 4. Mean-field approximation for large N
# Analytic solution for N -> infinity

# 5. Normalize interaction parameters
def interaction_strength(n_agents):
    # Keep total interaction constant as N grows
    return base_strength / np.sqrt(n_agents)

```

**Symptoms:**
- Small test runs behave differently from large runs
- Threshold behaviors at certain population sizes
- Results not generalizable across scales

---

### [MEDIUM] Model is on edge of phase transition, unstable

**Why it happens:**
ABMs often have phase transitions (order/disorder, survival/extinction).
Near transition, system is sensitive.

If calibrated near transition:
- High variance across runs
- Sensitivity to numerical precision
- Non-reproducible results

Real systems may actually be near transitions (critical phenomena).


**Solution:**
```
# 1. Map phase diagram
def phase_diagram():
    for r in np.linspace(0, 0.1, 50):
        for d in np.linspace(0, 0.1, 50):
            outcome = run_many_replications(r, d)
            plot_phase(r, d, outcome)

# 2. Identify stable operating regions
# Stay away from phase boundaries

# 3. Report variance, not just means
def robust_analysis(params):
    results = [run_simulation(params) for _ in range(100)]
    return {
        'mean': np.mean(results),
        'std': np.std(results),
        'min': np.min(results),
        'max': np.max(results),
        'bimodal': is_bimodal(results)
    }

# 4. Sensitivity analysis (Sobol indices)
# Quantify which parameters matter most

```

**Symptoms:**
- Different random seeds give completely different outcomes
- Tiny parameter change causes regime shift
- Bistability: same parameters, different outcomes

---

### [MEDIUM] O(N^2) interactions or too-small timesteps

**Why it happens:**
Common ABM operations are O(N^2):
- Every agent checks every other agent
- Full interaction matrix updates
- All-to-all communication

For N=10000: 100 million pairs per step.

Also: very small timesteps for stability compound issue.


**Solution:**
```
# 1. Spatial data structures
from scipy.spatial import cKDTree

def efficient_neighbors(agents, radius):
    positions = np.array([a.position for a in agents])
    tree = cKDTree(positions)

    neighbors = {}
    for i, agent in enumerate(agents):
        indices = tree.query_ball_point(agent.position, radius)
        neighbors[agent.id] = [agents[j] for j in indices if j != i]
    return neighbors

# 2. Grid-based spatial hashing
class SpatialHash:
    def __init__(self, cell_size):
        self.cell_size = cell_size
        self.grid = defaultdict(list)

    def insert(self, agent):
        cell = self._cell(agent.position)
        self.grid[cell].append(agent)

    def query(self, position, radius):
        # Only check nearby cells
        cells_to_check = self._cells_in_radius(position, radius)
        return [a for cell in cells_to_check for a in self.grid[cell]]

# 3. Reduce interaction frequency
# Not every agent needs to interact every step

# 4. Coarse-grained models for large N
# Represent groups of agents as single entities

```

**Symptoms:**
- Simulation slows exponentially with agent count
- Can't run enough replications for statistics
- Forced to use unrealistically small populations

---

### [MEDIUM] Model produces patterns but no proof they match reality

**Why it happens:**
ABMs are easy to build, hard to validate.
Emergence looks impressive but may be artifact.

Multiple models can produce same macro pattern
from very different micro rules (equifinality).

Without validation: model is speculation.


**Solution:**
```
# 1. Pattern-oriented modeling
# Define specific patterns the model must reproduce
validation_targets = {
    'population_cycles': (period=5, amplitude=0.3),
    'spatial_clustering': (index=0.7),
    'size_distribution': 'power_law',
}

# 2. Quantitative comparison to data
def validate(model, empirical_data):
    model_output = model.run()
    for pattern, target in validation_targets.items():
        score = compare_pattern(model_output, target, empirical_data)
        if score < threshold:
            raise ValidationError(f"{pattern} doesn't match")

# 3. Out-of-sample prediction
# Calibrate on one dataset, validate on another

# 4. Document assumptions explicitly (ODD protocol)
# Make clear what is assumed vs what is validated

```

**Symptoms:**
- Pretty visualizations but no quantitative validation
- Emergent patterns assumed correct without data
- Policy recommendations from unvalidated model

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `uncertainty|parameter sweep|sensitivity` | monte-carlo | Need parameter uncertainty analysis |
| `collision|physics|dynamics` | physics-simulation | Need realistic physical interactions |
| `learning|neural|RL|reinforcement` | neural-networks | Need learning-based agent behavior |
| `queue|waiting|processing time` | discrete-event-simulation | Need discrete event handling |
| `GIS|geographic|spatial data` | geospatial | Need real geographic environment |

### Receives Work From

- **monte-carlo**: Uncertainty quantification for ABM
- **physics-simulation**: Physical agent dynamics
- **neural-networks**: Learned agent behaviors

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/simulation/agent-based-modeling/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
