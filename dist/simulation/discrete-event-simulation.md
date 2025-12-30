# Discrete Event Simulation

> Design and implement discrete event simulations (DES) for systems where state
changes occur at discrete time points: queues, manufacturing, logistics, networks.


**Category:** simulation | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Accumulated floating point errors corrupt event sequence

**Why it happens:**
Floating point arithmetic is not exact.
0.1 + 0.2 != 0.3 in IEEE 754.

After thousands of additions:
event_time += delta  # Accumulates error

Events scheduled for "same time" may differ by epsilon.
Comparison event.time == target fails.

Priority queue ordering becomes undefined for near-equal times.


**Solution:**
```
# 1. Use integer time units
TIME_SCALE = 1000  # 1000 units per second

def to_sim_time(seconds: float) -> int:
    return int(round(seconds * TIME_SCALE))

def schedule_at(time_sec: float, event):
    time_int = to_sim_time(time_sec)
    event_queue.push((time_int, event))

# 2. Add small tolerance for comparisons
def time_equal(t1: float, t2: float, eps: float = 1e-9) -> bool:
    return abs(t1 - t2) < eps

# 3. Use Decimal for exact arithmetic
from decimal import Decimal
time = Decimal('0.0')

# 4. Use secondary sort key for tiebreaking
@dataclass(order=True)
class Event:
    time: float
    sequence: int  # Tiebreaker: order of scheduling
    data: Any = field(compare=False)

```

**Symptoms:**
- Events processed in wrong order
- Same time events have inconsistent ordering
- Simulation results change with compiler/platform

---

### [HIGH] Initial transient contaminates steady-state statistics

**Why it happens:**
Simulation starts in arbitrary state (usually empty).
Takes time to reach steady state.
Statistics collected during warm-up are biased.

For stable systems: bias decreases with run length.
For unstable systems: never reaches steady state.

Warm-up can be 10-30% of run for complex systems.


**Solution:**
```
# 1. Detect warm-up with MSER
def mser_truncation(observations):
    n = len(observations)
    best_d = 0
    min_mser = float('inf')

    for d in range(n // 4):
        truncated = observations[d:]
        mser = np.var(truncated) / len(truncated)
        if mser < min_mser:
            min_mser = mser
            best_d = d

    return best_d

# 2. Use rule of thumb: truncate first 10-20%
warmup = int(0.1 * run_length)
stats = observations[warmup:]

# 3. Start in "typical" state if known
# Initialize queue with expected steady-state length

# 4. Welch's graphical method for visual inspection
def welch_plot(reps):
    # Average across replications
    # Look for where mean stabilizes

```

**Symptoms:**
- Average queue length depends on initial state
- Results differ with empty vs full initial system
- Mean slowly drifts as run length increases

---

### [HIGH] No estimate of output variability

**Why it happens:**
DES outputs are random variables.
One run = one sample from distribution.

Without replications:
- Can't estimate variance
- Can't compute confidence intervals
- Can't detect if difference is significant

30+ replications for reliable statistics.


**Solution:**
```
# 1. Run multiple replications
def compare_systems(n_reps=30):
    results_a = [run_system_a(seed=i) for i in range(n_reps)]
    results_b = [run_system_b(seed=i) for i in range(n_reps)]

    mean_a = np.mean(results_a)
    mean_b = np.mean(results_b)

    # Paired t-test (with CRN)
    diffs = [a - b for a, b in zip(results_a, results_b)]
    t_stat, p_value = stats.ttest_1samp(diffs, 0)

    print(f"Mean A: {mean_a:.2f}, Mean B: {mean_b:.2f}")
    print(f"Difference significant: {p_value < 0.05}")

# 2. Confidence intervals
mean = np.mean(results)
se = np.std(results, ddof=1) / np.sqrt(len(results))
ci = (mean - 1.96*se, mean + 1.96*se)

```

**Symptoms:**
- Results not reproducible
- No confidence intervals
- Can't distinguish signal from noise

---

### [MEDIUM] Event ordering at same time affects results

**Why it happens:**
Real systems: truly simultaneous events are rare.
Models: often schedule events at same time:
- End of time period events
- Batch arrivals
- Synchronized processes

Priority queue needs tiebreaker.
If arbitrary: results are non-deterministic.
If wrong order: causality violated.


**Solution:**
```
# 1. Define explicit priority
@dataclass(order=True)
class Event:
    time: float
    priority: int  # 0 = highest
    sequence: int  # Tiebreaker: insertion order
    data: Any = field(compare=False)

# Priority scheme:
# 0: End-of-simulation
# 1: Departures (free resources first)
# 2: Arrivals
# 3: Measurements

# 2. Use infinitesimal offsets
EPSILON = 1e-10
schedule(time=10.0, ...)  # Arrival 1
schedule(time=10.0 + EPSILON, ...)  # Arrival 2

# 3. Document assumptions
# "Ties broken by event type, then insertion order"

```

**Symptoms:**
- Results depend on event scheduling order
- Different runs handle ties differently
- Race conditions in what happens first

---

### [MEDIUM] Entities wait forever for resources held by each other

**Why it happens:**
Classic deadlock: A holds X, wants Y; B holds Y, wants X.

In DES:
- Entity 1 has machine A, waiting for machine B
- Entity 2 has machine B, waiting for machine A
- Neither can proceed

More complex cycles possible with multiple resources.


**Solution:**
```
# 1. Order resource acquisition
# Always acquire in same order (A before B)
def process_safe(job):
    with machine_a.request() as req_a:
        yield req_a
    # Release A
    with machine_b.request() as req_b:
        yield req_b
    # Now reacquire A if needed

# 2. Acquire all at once
def process_atomic(job):
    # Request both, wait for both
    req_a = machine_a.request()
    req_b = machine_b.request()
    yield req_a & req_b  # SimPy all-of
    # Now have both

# 3. Timeout and retry
def process_with_timeout(job):
    while True:
        try:
            with machine_a.request() as req_a:
                yield req_a | env.timeout(10)
                if not req_a.triggered:
                    continue  # Retry
                # Got A, try B with timeout
                ...
        except simpy.Interrupt:
            # Release and retry
            continue

# 4. Deadlock detection
# Monitor wait-for graph for cycles

```

**Symptoms:**
- Simulation hangs
- Queue lengths grow unbounded
- Throughput drops to zero

---

### [MEDIUM] Real systems have finite buffers, model assumes infinite

**Why it happens:**
Easy to model infinite queues: just a list.
But real systems have limits:
- Buffer space is finite
- Customers abandon long queues
- Upstream blocked by downstream full

Blocking creates complex dynamics missed by infinite model.


**Solution:**
```
# 1. Finite capacity queue
queue = simpy.Store(env, capacity=10)

def arrival(customer):
    if len(queue.items) < queue.capacity:
        yield queue.put(customer)
    else:
        # Blocked or balked
        lost_customers += 1

# 2. Model abandonment
def arrival_with_patience(customer):
    with queue.request() as req:
        result = yield req | env.timeout(patience)
        if req in result:
            # Got service
            yield service_time
        else:
            # Abandoned
            abandoned += 1

# 3. Blocking protocols
# When downstream full, upstream stops producing

```

**Symptoms:**
- Model shows zero blocking, real system blocks
- Queue lengths grow unrealistically
- No backpressure in model

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `uncertainty|parameter sweep|distribution` | monte-carlo | Need input uncertainty analysis |
| `agent|behavior|spatial` | agent-based-modeling | Need agent-based components |
| `statistics|confidence|hypothesis` | statistical-analysis | Need rigorous output analysis |
| `optimization|best|minimize|maximize` | optimization | Need simulation optimization |
| `machine learning|prediction|forecast` | ml-engineering | Need ML integration with DES |

### Receives Work From

- **monte-carlo**: Input uncertainty and output analysis
- **agent-based-modeling**: Hybrid DES-ABM simulation
- **statistical-analysis**: Output analysis and experimental design

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/simulation/discrete-event-simulation/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
