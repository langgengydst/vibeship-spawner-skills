# Mission Planning

> Use when designing space missions, computing launch windows, optimizing trajectories, analyzing payload constraints, or planning mission phases and contingencies.


**Category:** space | **Version:** 1.0.0

---

## Patterns

### mission_concept_development

### trajectory_design

### operations_planning


## Anti-Patterns

### single_launch_window

### optimistic_mass_budget

### ignoring_station_keeping

### single_string_critical_path

### no_disposal_plan


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Missing the window delays mission by months or years

**Why it happens:**
Interplanetary launch windows occur based on planetary alignment.
Earth-Mars windows are ~26 months apart. If you miss your window
and haven't planned for the next one, your mission waits years.


**Solution:**
```
1. Plan for multiple windows:
   - Design trajectory for primary AND backup windows
   - Budget reserves for slip
   - Understand synodic period for your target

2. Launch vehicle flexibility:
   - Multiple launch sites if possible
   - Range schedule contingency
   - Weather window buffers

3. Program planning:
   - Fund team through backup window
   - Storage plan for spacecraft
   - Perishable items (batteries, propellant) replacement

```

**Symptoms:**
- Mission delayed due to weather/technical issue
- No alternative launch opportunity identified
- Synodic period wait for interplanetary missions

---

### [CRITICAL] Actual mass exceeds capacity, mission redesign required

**Why it happens:**
Mass grows throughout design. Early estimates are optimistic.
Each subsystem adds "just a little" margin. Cables, brackets,
and harnesses are underestimated. Without proper margins,
you exceed launch vehicle capability.


**Solution:**
```
1. Conservative margins:
   - 30%+ at concept phase
   - 20% at PDR
   - 10% at CDR
   - Track actuals vs estimates

2. Mass scrub culture:
   - Regular mass review meetings
   - Challenge every addition
   - Reward mass savings

3. Design for margin:
   - Lighter launch vehicle = cheaper
   - Leave room for problems
   - Plan descope options

```

**Symptoms:**
- Components heavier than estimated
- Margin consumed by changes
- Launch vehicle upgrade needed

---

### [CRITICAL] Not enough propellant for all planned maneuvers

**Why it happens:**
Delta-v budget must cover: orbit insertion, orbit maintenance,
attitude control, contingencies, and disposal. Each is often
estimated separately with optimistic assumptions.
Navigation errors require correction burns not originally planned.


**Solution:**
```
1. Comprehensive budget:
   - List ALL maneuvers including contingency
   - Include navigation errors (3-sigma)
   - Add disposal delta-v
   - Include attitude control if shared system

2. Margins:
   - 10% on each maneuver category
   - 20% overall reserve
   - Track propellant mass vs budget

3. Operations:
   - Minimize unnecessary maneuvers
   - Optimize burn execution
   - Save margin for end of life

```

**Symptoms:**
- Orbit not achievable with remaining propellant
- Station-keeping life shortened
- Contingency maneuvers not possible

---

### [HIGH] No way to meet debris mitigation requirements

**Why it happens:**
Debris mitigation guidelines require LEO spacecraft to deorbit
within 25 years. GEO spacecraft must move to graveyard orbit.
If disposal isn't designed in from the start, you may not have
the capability to comply.


**Solution:**
```
1. Design for disposal:
   - Size propulsion for disposal burn
   - Reserve propellant explicitly
   - Consider drag augmentation devices

2. Orbit selection:
   - Lower altitude = faster natural decay
   - Understand decay timeline
   - GEO: plan graveyard orbit

3. Passivation:
   - Vent remaining propellant
   - Discharge batteries
   - Turn off transmitters

```

**Symptoms:**
- Spacecraft cannot deorbit
- No propellant reserved for disposal
- Orbit doesn't naturally decay in 25 years

---

### [HIGH] One component failure ends the mission

**Why it happens:**
Space is unforgiving. Components fail. If your mission depends
on a single component with no backup, you're betting the entire
investment on that part working perfectly for the mission duration.


**Solution:**
```
1. Failure mode analysis:
   - FMECA on all systems
   - Identify single points
   - Prioritize by criticality

2. Redundancy:
   - 4 wheels for 3-axis control
   - Redundant computers
   - Multiple communication paths

3. Graceful degradation:
   - Safe mode design
   - Reduced capability modes
   - Alternative operating methods

```

**Symptoms:**
- Mission lost to single component failure
- No redundancy in critical path
- Failure modes not analyzed

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `orbit|trajectory|maneuver|delta-v` | orbital-mechanics | Detailed trajectory calculations |
| `subsystem|power|thermal|propulsion` | spacecraft-systems | Spacecraft subsystem design |
| `ground.station|contact|telemetry|command` | ground-station-ops | Ground segment planning |
| `imagery|remote.sensing|earth.observation` | space-data-processing | Payload data processing |

### Receives Work From

- **orbital-mechanics**: Trajectory and maneuver calculations
- **spacecraft-systems**: Spacecraft capabilities and constraints
- **ground-station-ops**: Ground segment capabilities

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/space/mission-planning/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
