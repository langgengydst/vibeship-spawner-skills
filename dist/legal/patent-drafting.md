# Patent Drafting

> Use when drafting patent applications, writing claims, analyzing prior art, or responding to office actions - covers USPTO practice, claim strategies, and specification requirements

**Category:** legal | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Claim term 'means for' limits scope to spec embodiments only

**Why it happens:**
Using "means for [function]" language triggers 112(f) interpretation.
The claim term is limited to the corresponding structure in the
specification plus equivalents. If you only described one way to
do something, that's all your claim covers.


**Solution:**
```
Use structural language instead:

BAD:  "means for processing data"
GOOD: "a processor configured to execute instructions that cause..."

BAD:  "means for storing data"
GOOD: "a memory storing instructions that, when executed, cause..."

Include multiple embodiments in spec for each functional term.

```

**Symptoms:**
- Claim scope unexpectedly narrow
- Competitors avoid infringement with different implementations
- Court limits claim to spec examples

---

### [HIGH] 'The' references something never introduced

**Why it happens:**
When you write "the data" in a claim, there must be an earlier
reference to "a data" or "data." Otherwise, the examiner doesn't
know what "the data" refers to.


**Solution:**
```
Every "the [noun]" must have a prior "a [noun]" or "[noun]":

"A method comprising:
   receiving a data set;
   processing the data set..."  ← Proper antecedent

For multiple instances:
"a first processor... a second processor...
 wherein the first processor communicates with the second processor"

```

**Symptoms:**
- Office action cites 35 USC 112(b)
- Claim term lacks antecedent basis
- Indefiniteness rejection

---

### [CRITICAL] Amendments must be supported by original specification

**Why it happens:**
35 USC 132 prohibits adding new matter after filing. The specification
is frozen at the filing date. If you didn't disclose a feature,
you can't claim it - ever. This is why thorough initial disclosure
is critical.


**Solution:**
```
At drafting time, include:
- All known embodiments
- Alternative implementations
- Future variations you might want to claim
- "In some embodiments" language for flexibility

Example: "In some embodiments, the processing includes
          machine learning, neural networks, or statistical methods"

```

**Symptoms:**
- Examiner rejects amendment as new matter
- Cannot claim feature not in original spec
- Continuation doesn't help - same spec

---

### [HIGH] Alice/Mayo creates 101 rejection for software patents

**Why it happens:**
Post-Alice, many software claims are rejected as abstract ideas.
The two-step test asks: (1) Is it directed to an abstract idea?
(2) If so, does it add "significantly more"? Generic computer
implementation doesn't satisfy step 2.


**Solution:**
```
Integrate practical application:

1. Claim specific technical improvement:
   "...thereby reducing memory usage by 40%"

2. Claim unconventional technical steps:
   "...using a convolutional neural network with architecture X"

3. Claim specific hardware integration:
   "...wherein the sensor captures real-time data at 1000Hz"

4. Focus on HOW, not WHAT:
   Don't just claim the goal; claim the novel technical means

```

**Symptoms:**
- Examiner cites Alice Corp. v. CLS Bank
- Claims characterized as 'abstract idea'
- Told to 'integrate into practical application'

---

### [MEDIUM] Specification only describes one way - claims limited

**Why it happens:**
Claims are limited by the specification. If you only describe
one embodiment, your broad claim language may be construed
narrowly. Competitors can use alternative implementations
you never disclosed.


**Solution:**
```
Describe multiple embodiments:

"In one embodiment, image processing uses algorithm X.
 In another embodiment, algorithm Y may be used.
 In yet another embodiment, machine learning models
 such as CNNs, transformers, or ensemble methods may be employed."

Use open-ended language:
"Processing may include, but is not limited to..."

```

**Symptoms:**
- Examiner narrows claim to match spec
- No support for broader claim language
- Can't claim alternatives not disclosed

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `license|agreement|contract` | contract-analysis | Patent licensing |
| `gdpr|privacy|data.protection` | gdpr-privacy | Privacy implications of invention |
| `export|itar|ear` | export-control | Export-controlled technology |

### Receives Work From

- **contract-analysis**: Licensing terms

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/legal/patent-drafting/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
