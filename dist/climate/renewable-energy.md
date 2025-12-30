# Renewable Energy Systems

> Design, model, and optimize renewable energy systems including solar PV,
wind power, energy storage, and grid integration.


**Category:** climate | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Year-to-year variability makes single year unreliable

**Why it happens:**
Solar and wind resources vary year-to-year.
Solar: 5-10% interannual variability
Wind: 10-15% interannual variability

Single year might be high or low.
Financial models need P50, P90, P99.

10+ years needed for reliable statistics.
Shorter periods need measure-correlate-predict (MCP).


**Solution:**
```
# 1. Use long-term dataset
wind_data = load_data('2010-2023_wind_speeds.csv')

# 2. Compute P50, P90 production
annual_production = compute_annual_production(wind_data)
p50 = np.percentile(annual_production, 50)
p90 = np.percentile(annual_production, 10)  # Exceedance probability

# 3. For short campaigns, use MCP
def mcp_adjustment(short_term, reference):
    # Correlate with long-term reference
    # Adjust short-term to long-term basis
    correlation = np.corrcoef(short_term, reference)[0, 1]
    if correlation < 0.8:
        raise Warning("Poor correlation, MCP unreliable")
    # Regression and adjustment
    return adjusted_long_term_estimate

# 4. Report uncertainty
print(f"P50: {p50:.0f} MWh/year")
print(f"P90: {p90:.0f} MWh/year")
print(f"P99: {p99:.0f} MWh/year")

```

**Symptoms:**
- Production differs 20-30% from estimate
- Bank won't finance based on limited data
- P90 estimate is too optimistic

---

### [HIGH] Real conditions differ from Standard Test Conditions

**Why it happens:**
STC: 1000 W/m² irradiance, 25°C cell temperature, AM 1.5
Real conditions: rarely at STC.

Cell temperature in field: 40-70°C typical.
Temperature coefficient: -0.35 to -0.45%/°C typical.
At 55°C: 10-15% power loss.

Also: soiling, shading, wiring, inverter losses.
Total DC-to-AC derate: 14-25%.


**Solution:**
```
# 1. Model cell temperature
def cell_temperature(poa, ambient, wind=1.0):
    noct = 45  # Typical NOCT
    return ambient + (noct - 20) * (poa / 800)

# 2. Apply temperature derating
def derate_power(p_stc, t_cell, coeff=-0.004):
    return p_stc * (1 + coeff * (t_cell - 25))

# 3. Apply all loss factors
losses = {
    'soiling': 0.02,
    'shading': 0.03,
    'mismatch': 0.02,
    'wiring_dc': 0.02,
    'inverter': 0.04,
    'wiring_ac': 0.01,
    'availability': 0.02
}
total_derate = 1 - sum(losses.values())  # ~0.84

# 4. Use hourly simulation for accurate estimate
# Don't use simple "peak sun hours" approximation

```

**Symptoms:**
- Actual output 10-25% less than nameplate
- Hot climate systems underperform
- Customers disappointed in production

---

### [HIGH] Turbine spacing ignored, production overestimated

**Why it happens:**
Upwind turbines extract energy, create wake.
Wake: reduced wind speed, increased turbulence.
10-15% loss typical for well-spaced farms.
Poorly spaced: 25%+ losses possible.

Wake depends on:
- Turbine spacing (5-10 rotor diameters typical)
- Wind direction distribution
- Atmospheric stability


**Solution:**
```
# 1. Model wake effects
from windpowerlib import wake_losses

def jensen_wake(d_rotor, distance, ct=0.8, k=0.04):
    """Jensen/Park wake model."""
    if distance <= 0:
        return 0
    wake_radius = d_rotor + 2 * k * distance
    deficit = (1 - np.sqrt(1 - ct)) * (d_rotor / wake_radius) ** 2
    return deficit

# 2. Account for all wind directions
# Wake loss varies with direction

# 3. Use industry tools
# OpenWind, WindPRO, WAsP for detailed modeling

# 4. Apply wake loss factor to simple estimates
wake_loss_factor = 0.85  # 15% typical
adjusted_production = farm_production * wake_loss_factor

```

**Symptoms:**
- Farm produces 15-25% less than sum of turbines
- Downwind turbines underperform
- Annual production falls short of predictions

---

### [MEDIUM] Round-trip losses not accounted for

**Why it happens:**
Lithium-ion round-trip efficiency: 85-95%
Meaning: store 100 kWh, get 85-95 kWh back.

Losses in:
- Battery internal resistance
- Inverter conversion (DC-AC-DC)
- Battery management system
- Thermal management

Over time: degradation further reduces efficiency.


**Solution:**
```
# 1. Use one-way efficiency for calculations
efficiency_oneway = np.sqrt(0.90)  # ~0.95 each way

energy_stored = charge_energy * efficiency_oneway
energy_out = energy_stored * efficiency_oneway
# Total: 90% of input

# 2. Model efficiency vs power
def inverter_efficiency(power, rated_power):
    loading = power / rated_power
    # Efficiency curve (typical)
    return 0.98 - 0.05 * (1 - loading) ** 2

# 3. Include auxiliary loads
# BMS, cooling consume 1-3% of capacity per day

# 4. Model degradation over time
# Year 10: capacity at 80%, efficiency slightly lower

```

**Symptoms:**
- Less energy out than expected
- Economics don't match projections
- Storage value overestimated

---

### [MEDIUM] Assuming all produced energy is sold

**Why it happens:**
Grid can't always accept all renewable output.
Causes:
- Transmission constraints
- Minimum conventional generation
- Negative prices
- Frequency/voltage issues

High renewable grids: 5-15% curtailment common.
Project economics must account for this.


**Solution:**
```
# 1. Model curtailment risk
def estimate_curtailment(penetration_level):
    # Simplified: curtailment increases with penetration
    if penetration_level < 0.2:
        return 0.02
    elif penetration_level < 0.4:
        return 0.05 + 0.15 * (penetration_level - 0.2)
    else:
        return 0.10 + 0.25 * (penetration_level - 0.4)

# 2. Value curtailed energy at zero or negative
revenue = sum(
    min(price, 0) * curtailed + price * (1 - curtailed) * production
    for price, production in zip(prices, productions)
)

# 3. Consider storage to capture curtailed energy

# 4. PPA structure: take-or-pay vs merchant risk

```

**Symptoms:**
- Revenue less than production × price
- PPA shortfall penalties
- Capacity factor drops as more renewables added

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `climate change|future|projection|2050` | climate-modeling | Need climate projections |
| `grid|dispatch|integration|stability` | energy-systems | Grid integration analysis |
| `emissions|carbon|GHG|offset` | carbon-accounting | Emissions accounting |
| `LCOE|finance|investment|NPV` | quantitative-finance | Financial analysis |

### Receives Work From

- **climate-modeling**: Climate impacts on renewable resources
- **energy-systems**: Grid integration modeling
- **carbon-accounting**: Emissions benefits

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/climate/renewable-energy/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
