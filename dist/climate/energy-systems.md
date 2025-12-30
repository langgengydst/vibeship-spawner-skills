# Energy Systems & Grid Modeling

> Power systems engineering covering grid modeling, power flow analysis,
energy storage dispatch, demand response, and electricity market economics.
Spans transmission/distribution planning to real-time operations.


**Category:** climate | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] DC approximation ignores reactive power and voltage magnitudes

**Why it happens:**
DC power flow assumes:
- All voltages = 1.0 per unit
- Angle differences small (sin θ ≈ θ)
- No reactive power flows
- No losses

Good for: Fast contingency screening, market dispatch
Bad for: Voltage stability, VAR planning, loss calculation

Errors can be 10-20% for heavily loaded lines.
Voltage collapse scenarios completely missed.


**Solution:**
```
# 1. Use AC power flow for planning studies
import pandapower as pp

net = create_network()

# AC power flow - captures voltage and reactive power
pp.runpp(net, algorithm='nr', numba=True)

if not net.converged:
    print("Power flow did not converge - check model")
    return

# 2. Check voltage violations
voltage_violations = net.res_bus[
    (net.res_bus['vm_pu'] < 0.95) |
    (net.res_bus['vm_pu'] > 1.05)
]

# 3. Check reactive power margins
for i, gen in net.gen.iterrows():
    q_actual = net.res_gen.loc[i, 'q_mvar']
    q_max = gen['max_q_mvar']
    q_min = gen['min_q_mvar']

    if q_actual > 0.9 * q_max or q_actual < 0.9 * q_min:
        print(f"Gen {i} near reactive power limit")

# 4. Use DC only for screening, then AC for detailed
def contingency_screening(net, contingencies):
    # DC screening (fast)
    dc_overloads = []
    for c in contingencies:
        net_temp = net.deepcopy()
        apply_contingency(net_temp, c)
        pp.rundcpp(net_temp)
        if has_overload(net_temp):
            dc_overloads.append(c)

    # AC analysis (accurate) on flagged cases
    ac_violations = []
    for c in dc_overloads:
        net_temp = net.deepcopy()
        apply_contingency(net_temp, c)
        pp.runpp(net_temp)
        if has_violations(net_temp):
            ac_violations.append(c)

    return ac_violations

```

**Symptoms:**
- Voltage violations not detected
- VAR support needs missed
- Capacitor/reactor sizing wrong
- Transformer tap settings ineffective

---

### [HIGH] Cycle life and capacity fade not in optimization

**Why it happens:**
Li-ion battery degradation depends on:
- Cycle depth (deeper = more degradation)
- Temperature (higher = faster fade)
- State of charge (high SOC = faster calendar aging)
- C-rate (faster charging = more stress)

Ignoring degradation leads to:
- Aggressive cycling that kills battery early
- Underestimated levelized storage cost
- Warranty issues (cycle count limits)


**Solution:**
```
# 1. Include degradation cost in optimization
class BatteryWithDegradation:
    def __init__(self, capacity_mwh, power_mw, efficiency=0.90,
                 replacement_cost=200000, cycle_life=3000):
        self.capacity = capacity_mwh
        self.power = power_mw
        self.efficiency = efficiency
        self.replacement_cost = replacement_cost
        self.cycle_life = cycle_life

        # Cost per kWh throughput
        self.degradation_cost = replacement_cost / (cycle_life * capacity_mwh * 1000)

    def cost_per_cycle(self, depth_of_discharge):
        """Non-linear degradation - deeper cycles cost more."""
        # Empirical: DoD^1.5 relationship
        return self.degradation_cost * depth_of_discharge ** 1.5

# 2. Include in dispatch optimization
def optimize_with_degradation(prices, battery):
    n = len(prices)

    def objective(dispatch):
        revenue = np.sum(dispatch * prices)

        # Calculate cycle degradation cost
        energy_throughput = np.sum(np.abs(dispatch))
        equivalent_cycles = energy_throughput / (2 * battery.capacity)
        degradation_cost = equivalent_cycles * battery.replacement_cost / battery.cycle_life

        return -(revenue - degradation_cost)  # Maximize net value

    # Solve with degradation in objective
    result = minimize(objective, ...)
    return result

# 3. Enforce SOC limits to reduce calendar aging
# Keeping SOC between 20-80% reduces stress

# 4. Temperature-aware dispatch
# Limit power in high ambient temperatures

```

**Symptoms:**
- Battery degrades faster than expected
- Warranty violated by excessive cycling
- Replacement costs underestimated
- NPV of storage project negative

---

### [HIGH] Generators can't change output instantaneously

**Why it happens:**
Generator ramp rates (typical):
- Coal: 1-3% of capacity per minute
- CCGT: 5-8% per minute
- Simple cycle GT: 10-15% per minute
- Hydro: 50%+ per minute

Ignoring ramp rates leads to:
- Scheduled output physically impossible
- Need for expensive balancing reserves
- Reliability standard violations


**Solution:**
```
# 1. Include ramp constraints in optimization
import pyomo.environ as pyo

def unit_commitment_with_ramps(generators, demand, timesteps):
    model = pyo.ConcreteModel()

    # Sets
    model.G = pyo.Set(initialize=range(len(generators)))
    model.T = pyo.Set(initialize=range(timesteps))

    # Variables
    model.p = pyo.Var(model.G, model.T, domain=pyo.NonNegativeReals)
    model.u = pyo.Var(model.G, model.T, domain=pyo.Binary)  # On/off

    # Ramp constraints
    def ramp_up_rule(m, g, t):
        if t == 0:
            return pyo.Constraint.Skip
        return m.p[g,t] - m.p[g,t-1] <= generators[g].ramp_up_mw

    def ramp_down_rule(m, g, t):
        if t == 0:
            return pyo.Constraint.Skip
        return m.p[g,t-1] - m.p[g,t] <= generators[g].ramp_down_mw

    model.ramp_up = pyo.Constraint(model.G, model.T, rule=ramp_up_rule)
    model.ramp_down = pyo.Constraint(model.G, model.T, rule=ramp_down_rule)

    # Min up/down time constraints
    # ... (additional constraints)

    return model

# 2. Look-ahead dispatch
# Consider ramp needs for future periods

# 3. Include startup/shutdown trajectories
# Generators have specific ramp profiles during transitions

```

**Symptoms:**
- Infeasible schedules
- Frequency deviations
- ACE violations
- Operator manual interventions

---

### [HIGH] Single contingency analysis misses cascading failures

**Why it happens:**
N-1 contingency standard:
- System must survive loss of any single element
- Standard for normal planning

But critical systems need N-1-1:
- Loss of element, then loss of another before restoration
- Common mode failures (same corridor, same weather)
- Protection system failures

2003 Northeast blackout: N-1-1 would have flagged issues.


**Solution:**
```
# 1. N-1-1 for critical infrastructure
def n1_1_analysis(net, elements, critical_elements):
    violations = []

    for first in critical_elements:
        net_temp = net.deepcopy()
        trip_element(net_temp, first)

        # System must be secure after first contingency
        if not is_secure(net_temp):
            violations.append((first, None))
            continue

        # Now check second contingency
        for second in elements:
            if second == first:
                continue

            net_temp2 = net_temp.deepcopy()
            trip_element(net_temp2, second)

            if not is_secure(net_temp2):
                violations.append((first, second))

    return violations

# 2. Common mode contingencies
# Elements in same corridor, subject to same weather
def identify_common_mode(net):
    corridors = group_by_corridor(net.line)
    weather_zones = group_by_weather_zone(net)

    common_mode_groups = []
    for corridor, lines in corridors.items():
        if len(lines) > 1:
            common_mode_groups.append(lines)

    return common_mode_groups

# 3. Protection system failures
# Analyze breaker failure contingencies

# 4. Extreme event analysis
# Beyond N-1-1 for rare but high-impact events

```

**Symptoms:**
- Cascading outages
- Multiple element failures cause blackouts
- NERC Category D events
- Wide-area disturbances

---

### [MEDIUM] Loads change with voltage and frequency

**Why it happens:**
Real loads are voltage/frequency dependent:
- Resistive loads: P ∝ V²
- Motor loads: Complex P-V characteristic, can stall
- Electronic loads: Constant power (bad for voltage stability)

ZIP model:
P = P0 * (Z*V² + I*V + P*1)
where Z + I + P = 1

WECC composite load model includes:
- Motor dynamics
- Electronic load fraction
- Distributed generation


**Solution:**
```
# 1. Use ZIP load model
def create_zip_load(net, bus, p_mw, q_mvar,
                    zip_p=(0.3, 0.4, 0.3),  # Constant Z, I, P fractions
                    zip_q=(0.3, 0.4, 0.3)):
    """Create voltage-dependent load."""
    # During simulation, P scales with voltage
    # P = P0 * (z*V² + i*V + p)
    pass  # Depends on simulation tool

# 2. Include motor models for industrial loads
class MotorLoad:
    def __init__(self, p_mw, power_factor=0.85):
        self.p_mw = p_mw
        self.pf = power_factor
        self.stall_voltage = 0.7  # Stalls below 70%

    def current(self, voltage_pu):
        if voltage_pu < self.stall_voltage:
            return self.locked_rotor_current()
        return self.normal_current(voltage_pu)

# 3. Use composite load models for bulk system
# WECC CLM, EPRI LOADSYN

# 4. Validate against actual events
# Compare simulation to recorded disturbances

```

**Symptoms:**
- Simulation doesn't match field events
- Voltage recovery too fast or slow
- Frequency response inaccurate
- Motor stalling not captured

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `solar|wind|pv|renewable|generation` | renewable-energy | Renewable resource assessment |
| `emission|carbon|ghg|scope` | carbon-accounting | Emissions accounting |
| `climate|scenario|temperature|projection` | climate-modeling | Climate projections |
| `probability|uncertainty|monte carlo|lolp` | monte-carlo | Probabilistic analysis |
| `finance|npv|lcoe|investment` | quantitative-finance | Economic analysis |

### Receives Work From

- **renewable-energy**: Renewable generation integration
- **climate-modeling**: Climate impacts on energy system
- **carbon-accounting**: Grid emissions calculation
- **monte-carlo**: Uncertainty and reliability

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/climate/energy-systems/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
