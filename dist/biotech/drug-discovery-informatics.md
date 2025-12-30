# Drug Discovery Informatics

> Patterns for computer-aided drug discovery including virtual screening,
molecular docking, ADMET prediction, lead optimization, and integration
with AI/ML methods. Covers both structure-based and ligand-based approaches.


**Category:** biotech | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Docking scores poorly correlate with experimental binding

**Why it happens:**
Docking scores are RELATIVE rankings, not absolute affinities.
Correlation with experimental Kd is typically R² = 0.2-0.4.

Common issues:
- Scoring functions trained on limited data
- Solvation effects poorly modeled
- Protein flexibility ignored
- Entropic contributions missed

A compound with docking score -10 isn't "better" than -8
in any absolute sense.


**Solution:**
```
# Use docking for pose prediction, not affinity
# Validate top hits experimentally

# Use consensus scoring
def consensus_rank(scores_dict):
    ranks = {}
    for program, scores in scores_dict.items():
        ranks[program] = scores.rank()
    return pd.DataFrame(ranks).mean(axis=1)

# Report as relative ranking, not absolute
"Compound ranked in top 1% by docking"

# Validate with orthogonal methods
# - FEP calculations for accurate affinity
# - MD simulations for pose stability
# - Experimental binding assays

```

**Symptoms:**
- Ranking compounds purely by docking score
- Reporting docking score as predicted Kd
- Excluding compounds based on score cutoff alone

---

### [HIGH] PAINS give false positives in biochemical assays

**Why it happens:**
Pan-Assay INterference compoundS (PAINS) are promiscuous hitters
that interfere with assays through non-specific mechanisms:
- Redox cycling
- Aggregation
- Fluorescence interference
- Metal chelation
- Covalent modification of assay proteins

~5% of commercial screening compounds are PAINS.
They waste years of medicinal chemistry effort.


**Solution:**
```
from rdkit.Chem.FilterCatalog import FilterCatalog, FilterCatalogParams

def filter_pains(smiles_list):
    params = FilterCatalogParams()
    params.AddCatalog(FilterCatalogParams.FilterCatalogs.PAINS)
    catalog = FilterCatalog(params)

    clean_compounds = []
    for smiles in smiles_list:
        mol = Chem.MolFromSmiles(smiles)
        if not catalog.HasMatch(mol):
            clean_compounds.append(smiles)

    return clean_compounds

# Also check Brenk filters for reactive compounds
# Run orthogonal counter-screens

```

**Symptoms:**
- Hit compound active against many unrelated targets
- Activity doesn't translate to cellular assays
- SAR is flat (all analogs equally active)

---

### [HIGH] Wrong box size or center leads to missed poses

**Why it happens:**
Docking requires defining where ligands can bind.
If the box is:
- Too small: Misses valid binding modes
- Too large: Searches irrelevant space, slower
- Off-center: Best poses at edges (unreliable)

Crystal structure ligand position is best guide.
But for novel sites, use site prediction tools.


**Solution:**
```
# Use known ligand to define site
def define_box_from_ligand(complex_pdb, ligand_name, padding=5):
    ligand_atoms = get_ligand_atoms(complex_pdb, ligand_name)
    center = np.mean(ligand_atoms, axis=0)
    extent = np.ptp(ligand_atoms, axis=0) + 2 * padding
    return center, extent

# For unknown sites, use cavity detection
# fpocket, SiteMap, DoGSiteScorer

# Validate by re-docking known ligand
# RMSD < 2.0 Å from crystal pose = good

```

**Symptoms:**
- Known binders get poor scores
- Re-docking doesn't reproduce crystal pose
- Best poses are at box edges

---

### [CRITICAL] Standard docking cannot model covalent bond formation

**Why it happens:**
Standard docking treats ligand and protein as non-bonded.
Covalent inhibitors form bonds with specific residues
(usually Cys, Ser, Lys). The docking program:
- Doesn't know which atom is the warhead
- Doesn't model bond formation energy
- Places warhead randomly

Results are essentially meaningless.


**Solution:**
```
# Use covalent docking tools
# - Schrödinger CovDock
# - DOCKovalent
# - GOLD covalent mode
# - AutoDock-GPU covalent

# Define reactive residue and warhead type
covalent_config = CovalentDockingConfig(
    reactive_residue="CYS797",
    warhead_type="acrylamide",
    reaction_type="michael_addition"
)

# Gold covalent example
gold_covalent_dock(receptor, ligand, covalent_config)

```

**Symptoms:**
- Covalent inhibitors score poorly
- Warhead not positioned near reactive residue
- Known covalent drugs rank low

---

### [CRITICAL] Leads fail late due to properties known early

**Why it happens:**
~50% of clinical drug development failures are due to ADMET issues.
Many ADMET properties are determined by the chemical scaffold.
If you optimize a flawed scaffold for potency, you can't fix ADMET later.

Common late-stage failures:
- Poor oral bioavailability
- Rapid metabolism (short half-life)
- CYP inhibition (drug-drug interactions)
- hERG liability (cardiac toxicity)


**Solution:**
```
# Multi-parameter optimization from the start
objectives = {
    'potency': 'maximize',
    'logp': ('target', 3.0),  # Keep in sweet spot
    'mw': ('max', 500),
    'tpsa': ('range', (40, 90)),
    'cyp_inhibition': 'minimize',
    'herg_liability': 'minimize'
}

# Filter by ADMET before optimization
def admet_filter(compound):
    props = predict_admet(compound)
    return (
        props['logp'] < 5 and
        props['mw'] < 500 and
        props['herg_risk'] != 'high' and
        not props['ames_mutagenic']
    )

# Track ADMET trajectory during optimization
# Flag if properties trending wrong

```

**Symptoms:**
- Potent compounds fail in PK studies
- Extensive optimization wasted on fundamentally flawed scaffolds
- High attrition in preclinical development

---

### [HIGH] Models perform well on training, fail on new compounds

**Why it happens:**
QSAR models often overfit when:
- Too many descriptors vs. compounds
- No proper train/test split
- Same scaffold in train and test
- Not validating on external set

Overfitted models give false confidence.


**Solution:**
```
# Proper validation
from sklearn.model_selection import cross_val_score

# Use scaffold-based split (not random!)
train, test = scaffold_split(data, test_size=0.2)

# Cross-validation
scores = cross_val_score(model, X, y, cv=5)

# External validation set (new scaffolds)
external_set = compounds_from_different_project

# Applicability domain
# Don't predict outside training space

```

**Symptoms:**
- Model R² = 0.99 on training, 0.3 on test
- Predictions wrong for novel scaffolds
- Activity cliffs not captured

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `clinical trial|IND|phase` | clinical-trial-analysis | Lead compound ready for clinical development |
| `synthesis|make|synthesize` | lab-automation | Need compound synthesis |
| `molecular dynamics|MD simulation|FEP` | molecular-dynamics | Need dynamics validation of binding |
| `machine learning|QSAR|model` | ml-ops | Need ML model for property prediction |

### Receives Work From

- **protein-structure**: Have target structure for drug design
- **genomics-pipelines**: Target identified from genomics

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/biotech/drug-discovery-informatics/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
