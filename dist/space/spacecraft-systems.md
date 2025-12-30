# Spacecraft Systems

> Use when designing or analyzing spacecraft subsystems including ADCS, power, thermal control, propulsion, communications, and command & data handling.


**Category:** space | **Version:** 1.0.0

---

## Patterns

### power_budget_analysis

### link_budget_analysis

### thermal_analysis


## Anti-Patterns

### single_string_adcs

### battery_too_small

### cold_side_facing_sun

### undersized_comm_link

### no_safe_mode


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Wheels absorb momentum until they can't spin faster

**Why it happens:**
Reaction wheels absorb angular momentum from disturbances (gravity
gradient, solar pressure, magnetic). They spin faster to compensate.
Eventually they hit max speed and can't absorb more - you lose control.


**Solution:**
```
1. Plan momentum management:
   - Calculate secular momentum buildup
   - Size wheel momentum capacity for dump interval
   - Allocate time for desaturation

2. Dumping methods:
   - Magnetorquers (LEO, continuous)
   - Thrusters (any orbit, uses propellant)
   - Gravity gradient (specific orientations)

3. Monitor and act:
   - Track wheel speeds in telemetry
   - Automatic desaturation triggers
   - Safe mode if approaching limits

```

**Symptoms:**
- Pointing accuracy degrades
- Wheels at maximum speed
- Spacecraft begins tumbling

---

### [CRITICAL] Discharging below 70% SOC accelerates degradation

**Why it happens:**
Li-ion batteries degrade faster with deep discharge cycles.
Rated for 50000 cycles at 30% DOD, but only 5000 cycles at 80% DOD.
Each eclipse counts as a cycle. Deeper discharge = shorter life.


**Solution:**
```
1. Size conservatively:
   - Design for 30% DOD maximum
   - Include degradation in sizing
   - Account for cell imbalance

2. Thermal management:
   - Battery operates best at 10-25C
   - Avoid thermal cycling
   - Dedicated thermal control

3. Monitor health:
   - Track capacity vs prediction
   - Cell voltage monitoring
   - End-of-life planning

```

**Symptoms:**
- Battery capacity decreasing over time
- Eclipse duration margins shrinking
- Mission life shortened

---

### [HIGH] Bright objects in FOV prevent attitude determination

**Why it happens:**
Star trackers image stars to determine attitude. Sun, Moon, or
Earth limb in the FOV saturates the detector. The tracker can't
see stars and loses its attitude solution.


**Solution:**
```
1. Multiple trackers:
   - Different boresight directions
   - Can always see stars in some direction
   - Typically 2-3 trackers

2. Exclusion zones:
   - Define Sun/Moon/Earth avoidance
   - ~30-40 deg exclusion typical
   - Mission planning for geometry

3. Fallback sensors:
   - Sun sensors for coarse attitude
   - Gyro propagation during blind periods
   - Magnetometer for LEO

```

**Symptoms:**
- Star tracker reports no solution
- Attitude accuracy degrades
- Occurs at certain orbit positions

---

### [HIGH] Power system has no redundancy path

**Why it happens:**
Power is required by everything. A single power bus design means
one failure (short, open, regulator) can take out the entire
spacecraft. No power = no communication = mission lost.


**Solution:**
```
1. Redundant architecture:
   - Multiple solar array strings
   - Cross-strapped batteries
   - Redundant regulators

2. Protection:
   - Current limiters
   - Fuses or circuit breakers
   - Autonomous load shedding

3. Safe mode power:
   - Minimum configuration survives
   - Critical loads always powered
   - Can communicate for recovery

```

**Symptoms:**
- One component failure causes total loss
- No way to isolate failed element
- Cannot shed loads to survive

---

### [HIGH] Rapid temperature change stresses structure beyond limits

**Why it happens:**
Eclipse entry/exit causes rapid temperature changes. Different
materials expand/contract at different rates. Large temperature
gradients create stress. This can crack structures or cause
permanent deformation.


**Solution:**
```
1. Design for thermal environment:
   - CTE matching for bonded joints
   - Flexible connections where needed
   - Thermal analysis of gradients

2. Slow transitions:
   - Heater pre-conditioning
   - Attitude maneuvers to reduce gradient
   - Operational procedures

3. Test:
   - Thermal vacuum testing
   - Multiple cycles
   - Include mechanisms in test

```

**Symptoms:**
- Cracking sounds in telemetry
- Misalignment of components
- Solar array deployment issues

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `orbit|trajectory|delta-v|maneuver` | orbital-mechanics | Orbital mechanics calculations |
| `mission.phase|timeline|operations` | mission-planning | Mission-level planning |
| `ground.contact|telemetry|command` | ground-station-ops | Ground segment interface |

### Receives Work From

- **mission-planning**: Mission requirements driving spacecraft design
- **orbital-mechanics**: Orbit environment for subsystem sizing

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/space/spacecraft-systems/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
