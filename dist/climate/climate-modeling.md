# Climate Modeling & Analysis

> Work with climate data, models, and projections for climate impact assessment,
downscaling, and scenario analysis using CMIP6 and other climate datasets.


**Category:** climate | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Single model ignores structural uncertainty

**Why it happens:**
Climate models differ in:
- Physical parameterizations
- Resolution
- Sensitivity to forcing

CMIP6 equilibrium climate sensitivity ranges 1.8-5.6°C.
Single model gives false precision.

"All models are wrong, but some are useful."
Ensemble captures structural uncertainty.


**Solution:**
```
# 1. Use multi-model ensemble
models = ['ACCESS-CM2', 'CESM2', 'GFDL-ESM4', 'MPI-ESM1-2-LR', ...]
ensemble = load_ensemble(models, 'ssp245', 'tas')

# 2. Report range, not point estimate
results = {
    'mean': ensemble.mean(dim='model'),
    'p10': ensemble.quantile(0.1, dim='model'),
    'p90': ensemble.quantile(0.9, dim='model')
}

print(f"Temperature change: {results['mean']:.1f}°C "
      f"(range: {results['p10']:.1f} to {results['p90']:.1f}°C)")

# 3. Check model agreement
agreement = (ensemble > 0).mean(dim='model')
# Report where models disagree

```

**Symptoms:**
- Results change dramatically with different model
- Confidence intervals too narrow
- Surprises when using different CMIP6 model

---

### [HIGH] Presenting scenarios as predictions of what will happen

**Why it happens:**
SSPs are 'what-if' scenarios, not predictions.
No probability assigned to scenarios.

SSP5-8.5 is not 'business as usual' - it's high emissions.
SSP1-2.6 requires massive policy change.

Presenting one scenario as 'the future' is misleading.


**Solution:**
```
# 1. Present multiple scenarios
scenarios = ['ssp126', 'ssp245', 'ssp370', 'ssp585']
results = {}
for ssp in scenarios:
    data = load_ensemble('*', ssp, 'tas')
    results[ssp] = data.sel(time='2081-2100').mean()

# 2. Use conditional language
print("Projected warming by 2081-2100 (relative to 1995-2014):")
for ssp, warming in results.items():
    print(f"  Under {ssp}: {warming.mean():.1f}°C")

# 3. Explain scenario assumptions
# "SSP2-4.5 assumes moderate mitigation efforts..."

```

**Symptoms:**
- Claiming 'by 2100, temperature will be X'
- Single scenario presented without alternatives
- Policy based on one scenario outcome

---

### [HIGH] Standard bias correction doesn't work for rare events

**Why it happens:**
Standard quantile mapping uses historical data.
Extremes (99th percentile, 100-year events) have few samples.

Climate change shifts entire distribution, including tails.
Extrapolation to unseen extremes is uncertain.

Bias correction assumes stationarity in bias.


**Solution:**
```
# 1. Use extreme value theory
from scipy.stats import genextreme

def correct_extremes(model, obs, threshold_percentile=95):
    # Fit GEV to observations
    obs_extreme = obs[obs > obs.quantile(threshold_percentile/100)]
    params_obs = genextreme.fit(obs_extreme)

    # Fit GEV to model
    model_extreme = model[model > model.quantile(threshold_percentile/100)]
    params_model = genextreme.fit(model_extreme)

    # Map through GEV
    # ...

# 2. Use methods designed for non-stationarity
# Quantile Delta Mapping preserves model's projected changes

# 3. Validate with out-of-sample extremes
# Check if corrected extremes match observed in validation period

```

**Symptoms:**
- Corrected extremes still unrealistic
- 100-year events become 10-year events (or vice versa)
- Return periods wrong after correction

---

### [MEDIUM] Different calendar systems create alignment issues

**Why it happens:**
Climate models use different calendars:
- 'standard' (Gregorian with leap years)
- 'noleap' (365 days, no Feb 29)
- '360_day' (12 months of 30 days)
- 'proleptic_gregorian'

Comparing data across calendars:
- Dates don't align
- February 29 may or may not exist
- Day of year 100 is different date

xarray handles this, but be careful with raw dates.


**Solution:**
```
# 1. Convert to common calendar
import cftime

def convert_calendar(ds, target='standard'):
    return ds.convert_calendar(target, align_on='year')

# 2. Use xarray's calendar-aware operations
# time.dt.dayofyear handles different calendars

# 3. Work with monthly data to avoid calendar issues
monthly = ds.resample(time='MS').mean()

# 4. Check calendar before combining
print(f"Calendar: {ds.time.dt.calendar}")

```

**Symptoms:**
- Dates don't match between models
- February 29 or 30 causes errors
- 360-day calendar shifts seasons

---

### [MEDIUM] Direct comparison of coarse GCM to fine observations

**Why it happens:**
GCMs: 50-200 km resolution
Observations: station points or 1-10 km grids

GCM grid cell represents area average.
Point observation is single location.
These are not comparable.

Mountains, coasts, urban heat islands: subgrid.


**Solution:**
```
# 1. Regrid to common resolution
import xesmf as xe

# Regrid GCM to obs grid (or vice versa)
regridder = xe.Regridder(gcm, obs, 'bilinear')
gcm_regridded = regridder(gcm)

# 2. Area-weight station observations
# Match GCM grid cell with all stations inside
# Weight by representativeness

# 3. Use gridded observations for validation
# CRU, ERA5, etc. - already on grids

# 4. Downscale before comparison
# Bring GCM to observation resolution

```

**Symptoms:**
- GCM looks systematically biased in mountains
- Coastal areas poorly represented
- Point observations don't match gridded model

---

### [MEDIUM] Using annual means when daily extremes matter

**Why it happens:**
Climate data often distributed as monthly/annual means.
But impacts often depend on:
- Daily extremes (heat waves)
- Sub-daily intensity (flood peaks)
- Duration above threshold

Annual mean temperature can be same while extremes differ.
Mean annual precipitation doesn't show droughts.


**Solution:**
```
# 1. Use appropriate temporal resolution
daily_temp = load_data('tasmax_day')  # Daily maximum
heat_days = (daily_temp > 35).groupby('time.year').sum()

# 2. Compute indices from daily data, then aggregate
# Don't aggregate first then compute

# 3. Check what temporal resolution impact model needs
# Document data requirements

# 4. Use temporal disaggregation if only monthly available
# (but know limitations)

```

**Symptoms:**
- Impact model gives wrong results
- Extremes underestimated
- Thresholds never exceeded in aggregated data

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `emissions|carbon|GHG|scope` | carbon-accounting | Need emissions data or accounting |
| `solar|wind|renewable resource` | renewable-energy | Climate impact on renewable resources |
| `energy demand|heating|cooling|power` | energy-systems | Climate-energy interactions |
| `sustainability|ESG|SDG` | sustainability-metrics | Climate in sustainability context |
| `Monte Carlo|uncertainty|sensitivity` | monte-carlo | Uncertainty propagation |

### Receives Work From

- **carbon-accounting**: Emissions scenarios driving projections
- **monte-carlo**: Uncertainty quantification

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/climate/climate-modeling/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
