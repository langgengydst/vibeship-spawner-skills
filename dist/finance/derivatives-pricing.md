# Derivatives Pricing

> Use when pricing options, calculating Greeks, implementing exotic derivatives, or building pricing engines - covers Black-Scholes, binomial trees, Monte Carlo, and QuantLib integration

**Category:** finance | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Using historical volatility for pricing ignores market expectations

**Why it happens:**
Implied volatility is extracted from market prices and reflects
collective expectations. Historical volatility is backward-looking.
Using historical vol for pricing ignores information in option prices.


**Solution:**
```
# Extract implied vol from market prices
market_price = get_option_price(ticker, strike, expiry)
implied_vol = implied_volatility(
    market_price, S, K, T, r, option_type
)

# Use implied vol for consistent pricing
# Build vol surface for all strikes/expiries

```

**Symptoms:**
- Pricing doesn't match market quotes
- Hedges consistently lose money
- Model prices diverge from dealers

---

### [HIGH] Flat vol assumption misprices OTM options

**Why it happens:**
Black-Scholes assumes constant volatility across strikes.
Markets show higher implied vol for OTM puts (skew) and
higher vol for both OTM puts and calls (smile). Using
ATM vol for all strikes misprices wings.


**Solution:**
```
# Build volatility surface
vol_surface = build_vol_surface(market_data, S, r)

for strike in strikes:
    vol = vol_surface.get_vol(strike, expiry)  # Strike-specific
    price = black_scholes(S, strike, T, r, vol)

# Or use Heston, SABR, or local vol models

```

**Symptoms:**
- OTM puts underpriced relative to market
- Hedges perform poorly in tail events
- Risk metrics understate downside

---

### [HIGH] Black-Scholes underprices options with early exercise value

**Why it happens:**
American options can be exercised early, which has value.
ITM puts on non-dividend stocks and ITM calls before
dividends have early exercise premium. Black-Scholes
can't capture this.


**Solution:**
```
# Use binomial tree for American options
price = binomial_american(S, K, T, r, sigma, n_steps=500, 'put')

# Or use Longstaff-Schwartz for path-dependent Americans
price = lsm_american(S, K, T, r, sigma, n_paths=100000)

# Compare to European to see early exercise premium

```

**Symptoms:**
- Model prices below market for ITM puts
- Dividend-paying stocks show large errors
- Early exercise never considered

---

### [MEDIUM] Misprices options around ex-dividend dates

**Why it happens:**
Discrete dividends cause stock price to drop by dividend
amount on ex-date. Using continuous yield doesn't capture
this discrete jump, leading to mispricing for short-dated
options near ex-dates.


**Solution:**
```
# For short-dated options, use discrete dividends
dividend_dates = [(0.038, 0.50), (0.288, 0.50)]  # (time, amount)

# Adjust spot for present value of dividends
S_adj = S - sum(d * np.exp(-r * t) for t, d in dividend_dates if t < T)

# Price with adjusted spot
option_price = black_scholes(S_adj, K, T, r, sigma)

```

**Symptoms:**
- Large pricing errors around ex-dates
- Call prices jump unexpectedly
- Dividend arbitrage opportunities appear

---

### [MEDIUM] Formula errors in Greeks go undetected

**Why it happens:**
Analytical Greek formulas are complex and easy to get wrong.
Sign errors, missing discount factors, or wrong derivatives
are common. Without numerical validation, errors persist.


**Solution:**
```
# Always verify Greeks numerically
def verify_delta(S, K, T, r, sigma, q):
    bump = 0.01  # 1% bump
    price_up = black_scholes(S * 1.01, K, T, r, sigma, q)
    price_down = black_scholes(S * 0.99, K, T, r, sigma, q)
    numerical_delta = (price_up - price_down) / (2 * S * bump)

    analytical_delta = calculate_delta(S, K, T, r, sigma, q)

    assert abs(numerical_delta - analytical_delta) < 0.001

```

**Symptoms:**
- Delta hedges don't neutralize as expected
- P&L attribution doesn't match Greek decomposition
- Vega hedges underperform

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `var|value.at.risk|stress.test` | risk-modeling | Portfolio risk with options |
| `allocat|weight|portfolio.*optim` | portfolio-optimization | Options in portfolio |
| `execute|algo|order` | algorithmic-trading | Options execution |
| `smart.?contract|defi|on.?chain` | blockchain-defi | DeFi options protocols |

### Receives Work From

- **risk-modeling**: Volatility estimates
- **algorithmic-trading**: Options execution

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/finance/derivatives-pricing/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
