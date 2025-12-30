# Contract Analysis

> Use when reviewing contracts, extracting key terms, identifying risks, or building contract analysis tools - covers NLP approaches, clause identification, and risk scoring

**Category:** legal | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Indemnity obligations with no cap create unlimited liability

**Why it happens:**
Indemnification means you pay for the other party's losses from
third-party claims. Without a cap, you could owe unlimited amounts.
This is especially dangerous for IP indemnification where a single
patent claim could cost millions.


**Solution:**
```
Negotiate for:
1. Mutual indemnification (both parties indemnify each other)
2. Cap tied to contract value or insurance limits
3. Exclusions for gross negligence, willful misconduct
4. Reasonable survival period (1-3 years)

Example cap language:
"Vendor's aggregate indemnification liability shall not exceed
 two times (2x) the fees paid under this Agreement."

```

**Symptoms:**
- Contract has indemnification clause
- No cap or limit specified
- Survives termination indefinitely

---

### [HIGH] You have unlimited liability while counterparty has a cap

**Why it happens:**
One-sided liability caps mean you bear all the risk. If something
goes wrong, the other party's exposure is limited but yours is not.
This is common in vendor-drafted contracts.


**Solution:**
```
Insist on mutual caps:

"NEITHER PARTY'S AGGREGATE LIABILITY SHALL EXCEED [2X] THE FEES
 PAID OR PAYABLE UNDER THIS AGREEMENT IN THE [12] MONTHS PRECEDING
 THE CLAIM."

Also review carve-outs - unlimited liability for:
- Gross negligence/willful misconduct (usually acceptable)
- Indemnification (review separately)
- Confidentiality breach (negotiate cap)

```

**Symptoms:**
- Limitation of liability section exists
- Cap applies only to 'Vendor' or 'Provider'
- Your liability has no cap

---

### [HIGH] Locked into contract with no exit option

**Why it happens:**
Without termination for convenience, you're locked in even if
the service is terrible or your needs change. Combined with
auto-renewal, this can trap you for years.


**Solution:**
```
Add termination for convenience:

"Either party may terminate this Agreement for any reason upon
 [60/90] days prior written notice."

Or at minimum:
"Customer may terminate upon [30] days notice, subject to payment
 of fees for services already rendered."

```

**Symptoms:**
- Termination clause only allows for material breach
- No termination for convenience provision
- Long contract term with auto-renewal

---

### [HIGH] Counterparty owns everything you create, including background IP

**Why it happens:**
Broad IP assignment can transfer ownership of your background
intellectual property used in the work. You could lose rights
to your own tools, frameworks, or prior work.


**Solution:**
```
1. Carve out background IP:
   "Vendor's Background IP shall remain the property of Vendor.
    Vendor grants Customer a perpetual license to use Background IP
    solely as incorporated in the Deliverables."

2. Define work product narrowly:
   "Work Product means new and original works created specifically
    for Customer under this Agreement, excluding Background IP."

3. Clearly list your background IP in an exhibit.

```

**Symptoms:**
- IP section assigns 'all work product'
- No carve-out for pre-existing IP
- License-back provisions unclear

---

### [HIGH] Contract doesn't require timely breach notification

**Why it happens:**
GDPR requires 72-hour breach notification. If your vendor doesn't
have to notify you promptly, you can't meet your regulatory
obligations. You're liable even if the vendor caused the breach.


**Solution:**
```
Add Data Protection Addendum (DPA) with:

1. Breach notification timeline:
   "Vendor shall notify Customer of any Security Breach within
    [24-48] hours of becoming aware."

2. Security standards:
   "Vendor shall maintain security measures consistent with
    SOC 2 Type II / ISO 27001 standards."

3. Audit rights:
   "Customer may audit Vendor's security practices annually."

```

**Symptoms:**
- Handles personal data but no DPA
- No breach notification timeline
- No security requirements specified

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `gdpr|dpa|data.protection|privacy` | gdpr-privacy | Data processing agreements |
| `patent|ip.license|intellectual.property` | patent-drafting | IP licensing provisions |
| `sox|audit|financial.controls` | sox-compliance | Compliance provisions |
| `export|itar|technology.transfer` | export-control | Export control provisions |

### Receives Work From

- **gdpr-privacy**: Data protection requirements
- **patent-drafting**: IP licensing terms

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/legal/contract-analysis/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
