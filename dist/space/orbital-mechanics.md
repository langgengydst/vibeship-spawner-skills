# Orbital Mechanics

> Use when computing orbits, planning maneuvers, propagating trajectories, or analyzing orbital perturbations for spacecraft or celestial bodies.


**Category:** space | **Version:** 1.0.0

---

## Patterns

### orbit_determination

### maneuver_sequence

### orbit_maintenance


## Anti-Patterns

### ignoring_j2_for_leo

### two_body_long_propagation

### hohmann_always_optimal

### ignoring_sphere_of_influence

### plane_change_at_periapsis


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Ignoring J2 causes km-level errors in hours

**Why it happens:**
Earth's oblateness (J2) causes RAAN to drift ~7 deg/day for typical LEO.
Two-body assumes spherical Earth. After one day, your predicted orbital
plane can be wrong by degrees - that's hundreds of km in position.


**Solution:**
```
1. Always include J2 for LEO:
   - Use at minimum J2 secular rates
   - Better: full J2 in numerical propagation
   - Best: J2-J6 + drag + solar pressure

2. Know your error growth:
   - Two-body: km/day error for LEO
   - J2 only: 100m/day error
   - Full model: cm-level possible

3. Use appropriate tools:
   - SGP4/SDP4 for TLE propagation
   - GMAT/STK for precision work

```

**Symptoms:**
- Predicted position differs from actual by kilometers
- Satellite not where expected during pass
- Collision avoidance calculations wrong

---

### [HIGH] Plane changes at periapsis cost 2x more than at apoapsis

**Why it happens:**
Delta-v for plane change is proportional to velocity: dv = 2*v*sin(di/2).
Velocity is highest at periapsis, lowest at apoapsis. Same inclination
change costs much more at periapsis.


**Solution:**
```
1. Plan plane changes at apoapsis:
   - Velocity is lowest
   - Delta-v is minimized
   - Worth waiting half an orbit

2. Combined maneuvers:
   - If raising orbit AND changing plane
   - Do both at same point
   - Vector sum is less than separate burns

3. Analysis:
   - Calculate both options
   - Factor in mission constraints
   - Sometimes timing matters more than fuel

```

**Symptoms:**
- Excessive fuel consumption
- Shorter mission life than planned
- Maneuver sequence seems inefficient

---

### [HIGH] Newton-Raphson fails for high eccentricity with poor initial guess

**Why it happens:**
The Kepler equation M = E - e*sin(E) is solved iteratively. For high
eccentricity, the function has steep regions. A poor initial guess
can cause Newton-Raphson to diverge or oscillate.


**Solution:**
```
1. Adaptive initial guess:
   - e < 0.8: E_0 = M
   - e >= 0.8: E_0 = pi
   - Or use series expansion for first guess

2. Robust solver:
   - Limit maximum iterations
   - Use bisection as fallback
   - Consider Laguerre's method

3. Test edge cases:
   - e = 0 (circular)
   - e = 0.9 (highly elliptical)
   - e approaching 1 (near-parabolic)

```

**Symptoms:**
- Solver throws convergence error
- NaN in orbital calculations
- Highly elliptical orbits fail to propagate

---

### [HIGH] Discontinuities at sphere of influence boundaries

**Why it happens:**
Patched conic is an approximation - we switch gravity sources at the
sphere of influence (SOI). In reality, both bodies pull simultaneously.
The transition introduces discontinuities in trajectory.


**Solution:**
```
1. Understand the approximation:
   - SOI is where gravitational influences are roughly equal
   - Not a sharp boundary
   - Error is inherent to method

2. Add margins:
   - 10-20% delta-v margin for captures
   - More for low-altitude captures
   - Less for high flybys

3. Higher fidelity when needed:
   - Full N-body for critical phases
   - Restricted three-body for libration points
   - Monte Carlo for uncertainty

```

**Symptoms:**
- Trajectory jumps at planetary arrival
- Energy not conserved across transition
- Capture calculations wrong

---

### [MEDIUM] Using true anomaly where mean anomaly expected or vice versa

**Why it happens:**
Three anomaly types exist: Mean (M), Eccentric (E), True (nu).
They're related but NOT interchangeable. Mean anomaly increases
linearly with time. True anomaly is actual angle from periapsis.
For eccentric orbits, they differ significantly.


**Solution:**
```
1. Be explicit about anomaly type:
   - nu = true anomaly (geometric angle)
   - E = eccentric anomaly (auxiliary)
   - M = mean anomaly (linear in time)

2. Convert correctly:
   - M -> E: Solve Kepler equation
   - E -> nu: tan(nu/2) = sqrt((1+e)/(1-e))*tan(E/2)
   - Know which your tools expect

3. Verify with sanity checks:
   - M=E=nu=0 at periapsis
   - M=E=nu=pi at apoapsis
   - For circular orbits, all equal

```

**Symptoms:**
- Position calculations completely wrong
- Time-of-flight calculations incorrect
- Rendezvous timing errors

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `mission.timeline|launch.window|phase.planning` | mission-planning | Mission-level trajectory planning |
| `propulsion|thruster|attitude.control` | spacecraft-systems | Spacecraft subsystem capabilities |
| `ground.contact|visibility|pass.prediction` | ground-station-ops | Ground segment coverage analysis |

### Receives Work From

- **mission-planning**: Mission trajectory requirements
- **spacecraft-systems**: Propulsion system capabilities

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/space/orbital-mechanics/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
