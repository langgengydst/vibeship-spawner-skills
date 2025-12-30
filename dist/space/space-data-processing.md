# Space Data Processing

> Use when processing satellite imagery, hyperspectral data, SAR imagery, or applying machine learning to remote sensing data for Earth observation.


**Category:** space | **Version:** 1.0.0

---

## Patterns

### optical_pipeline

### sar_pipeline

### change_detection_pipeline


## Anti-Patterns

### ignoring_atmosphere

### training_single_scene

### no_cloud_mask

### sar_without_speckle

### mixed_sensors_no_harmonization


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Atmospheric scattering makes vegetation look less green

**Why it happens:**
Top-of-atmosphere (TOA) reflectance includes atmospheric effects.
Rayleigh scattering adds blue haze. Water vapor absorbs in specific
bands. If you calculate NDVI from TOA, you'll get lower values
than actual surface NDVI.


**Solution:**
```
1. Always use atmospherically corrected data for surface analysis:
   - Level 2 products
   - Apply 6S, FLAASH, or DOS
   - Use Analysis Ready Data (ARD)

2. Know what you're analyzing:
   - TOA: okay for cloud detection, QA
   - Surface: required for vegetation, water, soil

3. Verify correction:
   - Check for over/under correction
   - Compare to known targets
   - Dark objects should be near zero

```

**Symptoms:**
- NDVI values lower than expected
- Haze visible in imagery
- Results don't match field data

---

### [HIGH] Model trained on one scene doesn't generalize

**Why it happens:**
Machine learning models learn the specific characteristics of
training data. If trained on one scene, they learn that scene's
illumination, atmospheric conditions, and phenology. A different
scene has different conditions and the model fails.


**Solution:**
```
1. Diverse training data:
   - Multiple dates/seasons
   - Multiple sensors
   - Different atmospheric conditions

2. Feature engineering:
   - Use indices rather than raw bands
   - Normalize for illumination
   - Include texture, context

3. Validation strategy:
   - Test on completely separate scenes
   - Cross-validation across dates
   - Report per-scene accuracy

```

**Symptoms:**
- High accuracy on training scene
- Poor accuracy on different scene
- Systematic misclassification

---

### [HIGH] Bright clouds detected as snow, urban, or other bright targets

**Why it happens:**
Clouds are spectrally similar to other bright targets. Without
proper masking, they're classified as snow, bright soil, or
buildings. Cloud shadows appear as water or dark vegetation.


**Solution:**
```
1. Always mask clouds and shadows:
   - Use provided QA bands
   - Apply cloud detection algorithms
   - Buffer cloud edges

2. Multi-temporal compositing:
   - Use best available pixel
   - Median composites
   - Harmonic fitting

3. Quality metrics:
   - Track cloud percentage
   - Flag uncertain pixels
   - Document exclusion criteria

```

**Symptoms:**
- Classification shows features that move between dates
- Unusual patterns in analysis
- Spikes in time series

---

### [HIGH] Coherent noise makes classification impossible

**Why it happens:**
SAR is a coherent imaging system. Random phase interference creates
speckle - multiplicative noise that varies pixel to pixel. Without
filtering, signal-to-noise ratio is terrible for analysis.


**Solution:**
```
1. Apply speckle filtering:
   - Lee, Frost, or Gamma-MAP
   - Match filter to application
   - Accept resolution loss

2. Multi-looking:
   - Average multiple looks
   - Reduces noise, reduces resolution
   - Common for classification

3. Ensemble approach:
   - Use multiple images
   - Temporal averaging
   - Reduces speckle statistically

```

**Symptoms:**
- Salt and pepper appearance
- Classification results noisy
- Small features undetectable

---

### [MEDIUM] Band misalignment creates artifacts in indices

**Why it happens:**
If bands aren't perfectly co-registered, edges create artifacts.
When calculating ratios (NDVI = (NIR-Red)/(NIR+Red)), a 1-pixel
misalignment at a field edge can create large spurious values.


**Solution:**
```
1. Check band registration:
   - Visual inspection at edges
   - Cross-correlation check
   - Use pan-sharpened if available

2. Resampling:
   - Use appropriate interpolation
   - Consistent resampling for all bands
   - Document resolution

3. Accept limitations:
   - Avoid analysis at sharp edges
   - Use larger analysis units
   - Field boundaries particularly sensitive

```

**Symptoms:**
- Edge effects in spectral indices
- Halos around features
- Systematic patterns following edges

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `ground.contact|data.download|telemetry` | ground-station-ops | Data reception and delivery |
| `orbit|coverage|revisit` | orbital-mechanics | Coverage calculations |
| `mission.requirements|data.plan` | mission-planning | Mission-level data planning |

### Receives Work From

- **ground-station-ops**: Raw satellite data delivery
- **mission-planning**: Data collection requirements

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/space/space-data-processing/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
