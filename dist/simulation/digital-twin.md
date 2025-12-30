# Digital Twin Development

> Build and maintain digital twins - virtual representations of physical systems
that synchronize with real-world counterparts for monitoring, prediction, and optimization.


**Category:** simulation | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Digital twin predictions no longer match physical system

**Why it happens:**
Digital twins are only as good as their models.
Physical systems change: wear, damage, environment shifts.
Without monitoring divergence, the twin becomes fiction.

Common causes:
- Model parameters drift (friction, efficiency degrade)
- Unmodeled physics (missing failure mode)
- Sensor drift (calibration changes)
- Environmental changes not captured


**Solution:**
```
# 1. Monitor residuals continuously
class DivergenceMonitor:
    def __init__(self, threshold: float = 0.1):
        self.threshold = threshold
        self.residual_history = []

    def check(self, predicted: float, actual: float) -> bool:
        residual = abs(predicted - actual) / (abs(actual) + 1e-6)
        self.residual_history.append(residual)

        # Check for systematic drift
        if len(self.residual_history) > 100:
            recent = self.residual_history[-100:]
            if np.mean(recent) > self.threshold:
                self.trigger_recalibration()
                return False
        return True

    def trigger_recalibration(self):
        # Flag for model update
        logging.warning("Twin divergence detected, recalibration needed")

# 2. Use Bayesian model updating
# Parameters adapt based on observed data

# 3. A/B testing: run shadow twin with different params

```

**Symptoms:**
- Twin shows normal, physical system fails
- Control based on twin causes problems
- Predictions become increasingly wrong over time

---

### [CRITICAL] Sensor failure not detected, twin operates on stale/wrong data

**Why it happens:**
Sensors fail: stuck values, drift, communication loss.
Without health monitoring, twin trusts bad data.
"Garbage in, garbage out" at machine speed.

Failure modes:
- Stuck at last value (communication failure)
- Drift (calibration degradation)
- Spike/noise (electrical interference)
- Complete loss (hardware failure)


**Solution:**
```
# 1. Track sensor health
@dataclass
class SensorHealth:
    last_update: datetime
    last_change: datetime
    stuck_count: int = 0
    variance_window: List[float] = field(default_factory=list)

    def update(self, value: float) -> float:
        """Return quality score 0-1."""
        now = datetime.now()
        quality = 1.0

        # Check staleness
        age = (now - self.last_update).total_seconds()
        if age > 10:  # No update in 10s
            quality *= max(0.1, 1.0 - age / 60)

        # Check for stuck value
        self.variance_window.append(value)
        if len(self.variance_window) > 20:
            self.variance_window.pop(0)
            if np.var(self.variance_window) < 1e-6:
                self.stuck_count += 1
                quality *= 0.5 ** min(self.stuck_count, 5)
            else:
                self.stuck_count = 0

        self.last_update = now
        return quality

# 2. Require minimum quality for decisions
if sensor_quality < 0.5:
    use_backup_sensor() or enter_safe_mode()

# 3. Cross-validate with physics model
if abs(sensor_value - model_prediction) > 3 * sigma:
    flag_sensor_anomaly()

```

**Symptoms:**
- Twin state frozen while physical changes
- Sudden large jumps when sensor recovers
- Decisions made on wrong state

---

### [HIGH] Buffering and queuing hide latency until control fails

**Why it happens:**
Every queue adds latency. MQTT, databases, processing pipelines.
Latency accumulates through the stack.
By the time twin updates, physical state has changed.

For control: latency > control period = instability
For monitoring: latency > event duration = missed events

Hidden in:
- Message broker buffers
- Database write queues
- Network transmission
- Processing backlogs


**Solution:**
```
# 1. End-to-end latency measurement
class LatencyTracker:
    def __init__(self, max_latency_ms: float):
        self.max_latency = max_latency_ms

    def check(self, message_timestamp: datetime) -> bool:
        latency = (datetime.now() - message_timestamp).total_seconds() * 1000
        if latency > self.max_latency:
            logging.warning(f"Latency {latency}ms exceeds limit {self.max_latency}ms")
            return False
        return True

# 2. Skip stale messages in real-time path
def process_if_fresh(message):
    if latency_tracker.check(message.timestamp):
        return process(message)
    else:
        # Log and skip, or use for batch analytics
        return None

# 3. Direct sensor connection for control loop
# Bypass message broker for <10ms requirements

# 4. Track latency percentiles, alert on degradation

```

**Symptoms:**
- Control oscillates or becomes unstable
- Twin lags behind physical system
- Events processed in wrong order

---

### [HIGH] Memory/compute grows linearly or worse with asset count

**Why it happens:**
Naive: one twin instance per physical asset.
1000 assets = 1000 model instances.
Each with history, state, predictions.

Worse: N^2 if assets interact (fleet optimization).

Production fleets: 10,000+ assets common.
Won't fit in single process memory.


**Solution:**
```
# 1. Lazy loading with LRU cache
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_twin(asset_id: str) -> DigitalTwin:
    return load_twin_from_storage(asset_id)

# 2. Shared model instances
class TwinFactory:
    def __init__(self):
        self.models = {}  # Model type -> shared instance

    def create_twin(self, asset_id: str, model_type: str) -> DigitalTwin:
        if model_type not in self.models:
            self.models[model_type] = load_model(model_type)

        return DigitalTwin(
            model=self.models[model_type],  # Shared!
            state=load_state(asset_id)      # Per-asset
        )

# 3. Tiered storage
# Hot: in-memory for active assets
# Warm: Redis for recent
# Cold: database for historical

# 4. Streaming state (don't keep all history in memory)
class StreamingState:
    def __init__(self, window_size: int = 100):
        self.window = deque(maxlen=window_size)

    def add(self, state):
        self.window.append(state)
        if should_archive(state):
            archive_to_storage(state)

```

**Symptoms:**
- Performance degrades as fleet grows
- Memory exhaustion
- Update frequency drops

---

### [MEDIUM] Clock differences cause event ordering errors and fusion failures

**Why it happens:**
Edge devices, cloud servers, sensors have different clocks.
Without sync, timestamps meaningless for comparison.

1ms drift per hour = 24ms per day
Sensor fusion assumes synchronized timestamps.
Control loops need sub-ms timing.

GPS: ~100ns accuracy
NTP: ~1ms to ~50ms
Unsynchronized: arbitrary drift


**Solution:**
```
# 1. Use centralized time source
import ntplib

def get_synchronized_time() -> datetime:
    """Get NTP-synchronized time."""
    client = ntplib.NTPClient()
    response = client.request('pool.ntp.org')
    return datetime.fromtimestamp(response.tx_time)

# 2. Include clock offset in messages
@dataclass
class TimestampedMessage:
    local_time: datetime
    ntp_offset_ms: float  # Local - NTP
    sequence_number: int  # For ordering

# 3. Logical clocks for ordering
class LamportClock:
    def __init__(self):
        self.counter = 0

    def tick(self) -> int:
        self.counter += 1
        return self.counter

    def receive(self, remote_counter: int):
        self.counter = max(self.counter, remote_counter) + 1

# 4. Vector clocks for causality

```

**Symptoms:**
- Sensor fusion produces wrong results
- Events processed out of order
- Impossible causality (effect before cause)

---

### [MEDIUM] Model calibrated at one condition fails at another

**Why it happens:**
Models calibrated under specific conditions.
Real operations span wide condition range.
Physics changes with temperature, wear, load.

Thermal expansion changes dimensions.
Wear changes friction coefficients.
Load changes dynamic behavior.


**Solution:**
```
# 1. Condition-dependent parameters
class AdaptiveModel:
    def __init__(self):
        self.param_table = {}  # (temp_bin, load_bin) -> params

    def get_params(self, temperature: float, load: float):
        temp_bin = int(temperature / 10) * 10
        load_bin = int(load / 100) * 100
        key = (temp_bin, load_bin)

        if key in self.param_table:
            return self.param_table[key]
        else:
            # Interpolate from nearest known conditions
            return self.interpolate_params(temperature, load)

# 2. Online parameter estimation
# EKF with parameters in state vector

# 3. Physics-based temperature compensation
def compensate_friction(base_friction: float, temperature: float) -> float:
    # Arrhenius-like temperature dependence
    return base_friction * np.exp(-0.01 * (temperature - 20))

# 4. Ensemble models for different conditions

```

**Symptoms:**
- Accuracy varies with temperature/load/age
- Good in lab, wrong in field
- Seasonal accuracy variations

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `physics model|simulation|dynamics` | physics-simulation | Need physics-based prediction model |
| `kalman|sensor fusion|EKF|UKF` | sensor-fusion | Need sensor fusion for state estimation |
| `edge|embedded|MCU|real-time` | embedded-systems | Need edge deployment |
| `control|MPC|PID|setpoint` | control-systems | Twin-based control optimization |
| `uncertainty|confidence|probabilistic` | monte-carlo | Need uncertainty quantification |
| `MQTT|OPC UA|Modbus|protocol` | backend | Industrial protocol integration |

### Receives Work From

- **physics-simulation**: Physics engine for twin simulation
- **sensor-fusion**: Multi-sensor state estimation
- **embedded-systems**: Edge device deployment

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/simulation/digital-twin/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
