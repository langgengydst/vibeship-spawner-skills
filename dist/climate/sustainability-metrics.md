# Sustainability Metrics & ESG Reporting

> ESG performance measurement, sustainability reporting frameworks,
materiality assessment, and impact quantification. Covers CDP, TCFD,
GRI, SASB, CSRD/ESRS, and emerging disclosure requirements.


**Category:** climate | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Cherry-picking metrics creates legal and reputational risk

**Why it happens:**
Greenwashing occurs when:
- Highlighting small positive actions while ignoring large negatives
- Using vague language without quantification
- Reporting aspirations as achievements
- Claiming carbon neutrality without addressing Scope 3
- Offsetting instead of reducing

Consequences:
- SEC/FTC enforcement actions
- Shareholder lawsuits
- Brand damage
- ESG rating downgrades
- Lost customer trust


**Solution:**
```
# 1. Report on all material topics - good and bad
def prepare_balanced_disclosure(metrics: Dict) -> Dict:
    disclosure = {}

    for topic, data in metrics.items():
        if data['is_material']:
            disclosure[topic] = {
                'performance': data['value'],
                'trend': data['yoy_change'],
                'target': data['target'],
                'gap': data['value'] - data['target'],
                'actions_taken': data['actions'],
                'challenges': data['challenges'],  # Include challenges!
                'outlook': data['forward_looking']
            }

    return disclosure

# 2. Verify claims before publication
def verify_claims(claims: List[str], evidence: Dict) -> List[Dict]:
    verified = []
    for claim in claims:
        verification = {
            'claim': claim,
            'evidence': evidence.get(claim),
            'verified': evidence.get(claim) is not None,
            'third_party_verified': evidence.get(claim, {}).get('assurance')
        }

        if not verification['verified']:
            raise ValueError(f"Unsubstantiated claim: {claim}")

        verified.append(verification)

    return verified

# 3. Use specific, measurable language
# Bad: "We are committed to sustainability"
# Good: "We reduced Scope 1+2 emissions 15% vs 2020 baseline"

# 4. Disclose methodology and limitations
# "Scope 3 Category 1 estimated using spend-based method
#  with ±20% uncertainty"

# 5. Include third-party verification
# "GHG inventory verified by [Auditor] per ISO 14064-3"

```

**Symptoms:**
- Only positive metrics reported
- Negative trends explained away
- Claims don't match operations
- Regulatory investigation
- NGO or media criticism

---

### [HIGH] CSRD requires both financial AND impact materiality

**Why it happens:**
Single materiality: Topics material to financial performance only
Double materiality: Topics material to company OR to society

CSRD/ESRS requires double materiality:
- Financial materiality: Affects enterprise value
- Impact materiality: Company affects society/environment

Example: Chemical company
- Single: Focus on regulatory cost of pollution
- Double: Also disclose actual pollution impact on community

Many topics are only impact-material (no direct financial effect)
but must still be reported under double materiality.


**Solution:**
```
# 1. Assess both dimensions separately
def assess_double_materiality(topic: str) -> Dict:
    # Financial materiality (inside-out)
    financial = assess_financial_materiality(topic)

    # Impact materiality (outside-in)
    impact = assess_impact_materiality(topic)

    return {
        'topic': topic,
        'financial_materiality': financial,
        'impact_materiality': impact,
        'is_material': financial['score'] > 3.5 or impact['score'] > 3.5,
        'materiality_type': classify_materiality(financial, impact)
    }

def assess_financial_materiality(topic: str) -> Dict:
    """How topic affects company's financial position."""
    return {
        'score': ...,
        'time_horizon': ...,  # short, medium, long
        'likelihood': ...,
        'magnitude': ...,
        'sources': ['investor survey', 'risk register', 'analyst reports']
    }

def assess_impact_materiality(topic: str) -> Dict:
    """How company affects society/environment on this topic."""
    return {
        'score': ...,
        'scale': ...,  # Number of people/hectares/etc affected
        'severity': ...,
        'remediability': ...,  # Can harm be undone?
        'sources': ['impact assessment', 'stakeholder input', 'science']
    }

# 2. Engage diverse stakeholders
# Investors care about financial materiality
# NGOs, communities care about impact materiality
# Both perspectives needed

# 3. Document the process
# ESRS requires disclosure of materiality assessment process

```

**Symptoms:**
- EU reporting non-compliant
- Topics material to society missing
- Stakeholder criticism
- Auditor flags materiality gaps

---

### [HIGH] Changing definitions breaks trend analysis and comparability

**Why it happens:**
Consistency issues:
- Changing calculation methodology year-to-year
- Different boundaries for different reports
- Different units or normalization factors
- Restating history without explanation

Example:
- 2022: Report Scope 1 for owned facilities only
- 2023: Include leased facilities = "20% reduction!"
- Reality: Boundary expanded, not emissions reduced


**Solution:**
```
# 1. Maintain methodology register
class MetricMethodology:
    def __init__(self, metric_id: str):
        self.metric_id = metric_id
        self.versions = []

    def add_version(self, year: int, methodology: Dict):
        self.versions.append({
            'effective_year': year,
            'boundary': methodology['boundary'],
            'calculation': methodology['calculation'],
            'data_sources': methodology['data_sources'],
            'assumptions': methodology['assumptions'],
            'change_reason': methodology.get('change_reason')
        })

    def get_methodology(self, year: int) -> Dict:
        # Return methodology effective for given year
        for v in sorted(self.versions, key=lambda x: -x['effective_year']):
            if v['effective_year'] <= year:
                return v
        return self.versions[0]

# 2. Restate historical data when methodology changes
def restate_history(old_values: List, old_method: Dict, new_method: Dict) -> List:
    """Restate historical values under new methodology."""
    restated = []
    for year, value in old_values:
        # Apply adjustment factor
        adjustment = calculate_adjustment(old_method, new_method)
        restated.append((year, value * adjustment))

    return restated

# 3. Disclose methodology clearly
# "Scope 1 includes all facilities under operational control.
#  Prior years restated to reflect inclusion of leased facilities
#  acquired in 2022. Without restatement, 2023 would show
#  10% reduction on like-for-like basis."

# 4. Use same boundaries for all frameworks
# One source of truth for each metric

```

**Symptoms:**
- Trend appears to improve but methodology changed
- Same metric reported differently to different frameworks
- Stakeholders confused by conflicting numbers
- Auditor qualification on comparability

---

### [MEDIUM] Unverified data undermines credibility

**Why it happens:**
ESG data historically less rigorous than financial data.
Issues:
- Data from multiple unconnected systems
- Manual calculations prone to error
- No segregation of duties
- Different standards than financial audit

Verification provides:
- Error detection
- Process improvement
- Stakeholder confidence
- Regulatory compliance (CSRD requires limited assurance)


**Solution:**
```
# 1. Implement internal controls
class ESGDataControl:
    def __init__(self, metric_id: str):
        self.metric_id = metric_id
        self.controls = []

    def add_control(self, control: Dict):
        """Add internal control."""
        self.controls.append({
            'type': control['type'],  # 'reconciliation', 'review', 'validation'
            'frequency': control['frequency'],
            'owner': control['owner'],
            'evidence': control['evidence_required']
        })

    def verify_controls(self) -> bool:
        for control in self.controls:
            if not control_executed(control):
                return False
        return True

# 2. Prepare for external assurance
def assurance_readiness(metric: str) -> Dict:
    """Check readiness for external verification."""
    return {
        'data_trail': has_source_documentation(metric),
        'controls': controls_documented(metric),
        'responsibility': ownership_clear(metric),
        'methodology': methodology_documented(metric),
        'reconciliation': values_reconcile(metric)
    }

# 3. Phase in assurance coverage
# Year 1: Limited assurance on Scope 1+2
# Year 2: Add Scope 3 categories
# Year 3: Reasonable assurance on material metrics

# 4. Choose appropriate standard
# ISAE 3000: General sustainability assurance
# ISAE 3410: Specific to GHG statements
# AA1000AS: Stakeholder-focused

```

**Symptoms:**
- Stakeholder skepticism
- Lower ESG ratings
- Due diligence questions
- Investor requests for verification
- Regulatory scrutiny

---

### [HIGH] Long-term commitment without near-term action

**Why it happens:**
"Net zero by 2050" is easy to announce, hard to achieve.
Credibility requires:
- Near-term interim targets (2025, 2030)
- Sector-specific decarbonization pathway
- Capital allocation aligned with targets
- Executive incentives linked to progress
- Transparent progress reporting

SBTi requirements:
- 90%+ emissions reduction before offsets
- Neutralization of residual emissions only
- Annual reporting on progress


**Solution:**
```
# 1. Set science-aligned interim targets
def create_target_pathway(base_year: int, base_emissions: float,
                           target_year: int = 2050) -> Dict:
    """Create SBTi-aligned target pathway."""
    # 1.5C requires ~4.2% annual reduction
    annual_reduction = 0.042

    pathway = {}
    emissions = base_emissions

    for year in range(base_year, target_year + 1):
        pathway[year] = {
            'target_emissions': emissions,
            'reduction_from_base': (base_emissions - emissions) / base_emissions,
            'is_interim_target': year in [base_year + 5, base_year + 10]
        }
        emissions *= (1 - annual_reduction)

    return pathway

# 2. Map reduction actions to targets
def action_roadmap(pathway: Dict, actions: List[Dict]) -> Dict:
    """Align specific actions to target pathway."""
    roadmap = {}

    for year, target in pathway.items():
        year_actions = [
            a for a in actions
            if a['implementation_year'] <= year
        ]
        expected_reduction = sum(a['reduction_tco2e'] for a in year_actions)

        roadmap[year] = {
            'target': target['target_emissions'],
            'actions': year_actions,
            'expected_reduction': expected_reduction,
            'gap': target['target_emissions'] - expected_reduction
        }

    return roadmap

# 3. Link to capital expenditure
# Climate capex should match target ambition

# 4. Limit offset reliance
# SBTi: >90% actual reduction, offsets for residual only

# 5. Report progress annually
# Show actual vs. target with variance explanation

```

**Symptoms:**
- 2050 target but no 2030 milestones
- Target relies heavily on offsets
- No capital expenditure aligned
- SBTi rejects target
- Stakeholders call out hollow commitment

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `emissions|carbon|ghg|scope` | carbon-accounting | GHG accounting |
| `climate risk|scenario|tcfd|physical` | climate-modeling | Climate projections |
| `energy|renewable|electricity` | energy-systems | Energy analysis |
| `supplier|supply chain|procurement` | supply-chain-analytics | Supply chain assessment |
| `finance|investment|valuation` | quantitative-finance | Financial analysis |

### Receives Work From

- **carbon-accounting**: GHG emissions data for climate metrics
- **climate-modeling**: Climate risk assessment for TCFD
- **energy-systems**: Energy data for environmental metrics
- **supply-chain-analytics**: Supply chain sustainability data

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/climate/sustainability-metrics/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
