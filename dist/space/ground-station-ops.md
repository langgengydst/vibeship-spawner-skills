# Ground Station Operations

> Use when designing ground station networks, scheduling satellite contacts, processing telemetry, commanding spacecraft, or analyzing link budgets.


**Category:** space | **Version:** 1.0.0

---

## Patterns

### pass_operations

### telemetry_database_setup

### command_procedure


## Anti-Patterns

### single_ground_station

### no_command_verification

### ignoring_weather

### no_telemetry_archive

### manual_scheduling


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Predictions diverge from reality as TLE ages

**Why it happens:**
TLE (Two-Line Element) sets have built-in epoch time. Prediction
accuracy degrades with age. For LEO, a TLE >3 days old can have
km-level errors. The satellite isn't where you think it is.


**Solution:**
```
1. Fresh TLEs:
   - LEO: Update daily minimum
   - MEO/GEO: Update weekly
   - Get from Space-Track.org

2. Prediction monitoring:
   - Compare actual AOS to predicted
   - Track systematic errors
   - Flag when TLE is stale

3. Acquisition margins:
   - Start tracking before predicted AOS
   - Use search pattern if needed
   - Allow for prediction uncertainty

```

**Symptoms:**
- Satellite not acquired at predicted AOS
- Antenna searching but no signal
- Pass shorter than predicted

---

### [CRITICAL] Wrong command sent without checking echo

**Why it happens:**
Commands can be mistyped, selected incorrectly, or corrupted in
transmission. Without verifying the command echo (what the
spacecraft received), you don't know what was actually executed.


**Solution:**
```
1. Mandatory verification:
   - Always check command echo
   - Compare to intended parameters
   - Block execution until verified

2. Two-person rule:
   - Second operator confirms
   - Required for critical commands
   - Audit trail of both authorizations

3. Constraint checking:
   - Automated prerequisite verification
   - Range/limit checking on parameters
   - State machine validation

```

**Symptoms:**
- Spacecraft in unexpected state
- Command log doesn't match intent
- Operator error propagated to spacecraft

---

### [HIGH] Atmospheric attenuation drops link during rain

**Why it happens:**
Rain absorbs and scatters RF energy, especially at higher
frequencies (Ka-band: 3-10 dB loss, X-band: 1-3 dB).
A link designed with 3 dB margin can fail in moderate rain.


**Solution:**
```
1. Design for weather:
   - Extra margin for rain (location-dependent)
   - Lower frequency backup (X instead of Ka)
   - Diversity sites

2. Weather awareness:
   - Monitor forecasts
   - Real-time attenuation sensing
   - Adaptive data rates

3. Operations:
   - Critical activities during clear weather
   - Backup scheduling
   - Rain rate statistics for site

```

**Symptoms:**
- Link margin degrades during pass
- Data errors increase
- Contact lost before LOS

---

### [HIGH] On-board recorder fills faster than data can be downlinked

**Why it happens:**
Spacecraft generate data continuously but can only downlink during
contacts. If generation rate exceeds average downlink capacity,
the recorder fills up. Then you lose data.


**Solution:**
```
1. Budget data volume:
   - Calculate daily generation
   - Calculate daily downlink capacity
   - Verify positive margin

2. Prioritization:
   - Mark data by priority
   - Oldest-first or priority-first
   - Don't overwrite critical data

3. Operations:
   - More ground stations
   - Higher data rate mode
   - Reduce payload duty cycle

```

**Symptoms:**
- Data recorder approaching full
- Oldest data being overwritten
- Science data lost

---

### [CRITICAL] Multi-satellite constellation command routing error

**Why it happens:**
With multiple satellites, each has a unique address. If the
ground system isn't correctly configured, or operator selects
wrong target, commands go to unintended spacecraft.


**Solution:**
```
1. Configuration management:
   - Unique spacecraft identifiers
   - Session-based target locking
   - Visual confirmation of target

2. Verification:
   - Spacecraft echoes include ID
   - Cross-check before execution
   - Telemetry from correct satellite

3. Automation:
   - Scheduler sets correct target
   - Procedure includes ID verification
   - Block cross-routing

```

**Symptoms:**
- Commanded satellite doesn't respond
- Different satellite executes command
- Constellation coordination broken

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `orbit|trajectory|propagation|TLE` | orbital-mechanics | Orbit prediction calculations |
| `mission.timeline|operations.plan` | mission-planning | Mission-level operations planning |
| `satellite.imagery|remote.sensing` | space-data-processing | Payload data processing |

### Receives Work From

- **orbital-mechanics**: Orbit predictions for pass scheduling
- **mission-planning**: Operations requirements
- **spacecraft-systems**: Spacecraft communication parameters

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/space/ground-station-ops/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
