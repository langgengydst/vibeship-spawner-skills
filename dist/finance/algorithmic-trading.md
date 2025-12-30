# Algorithmic Trading

> Use when building trading systems, backtesting strategies, implementing execution algorithms, or analyzing market microstructure - covers strategy development, risk management, and production deployment

**Category:** finance | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Signal uses information not available at trade time

**Why it happens:**
Look-ahead bias occurs when the backtest uses data that wouldn't
have been available at the time of the trading decision.
Common sources: using same-day close for signals, peak prices,
or data that gets revised after publication.


**Solution:**
```
# Shift signal by 1 to trade on next bar
signal = df['close'].pct_change(20)
df['position'] = np.where(signal.shift(1) > 0, 1, -1)

# Or use event-driven backtest that respects time

```

**Symptoms:**
- Backtest returns unrealistically high
- Live trading dramatically underperforms
- Strategy 'knows' exact highs and lows

---

### [CRITICAL] Backtest excludes delisted stocks

**Why it happens:**
Most data providers only include currently listed stocks.
This biases results because you're only seeing winners.
The stocks that failed are missing from your universe.


**Solution:**
```
# Use point-in-time constituents
for date in trading_dates:
    constituents = get_sp500_at_date(date)
    signals = generate_signals(constituents, date)

# Use survivorship-bias-free data sources
# - Sharadar, Quandl/Nasdaq, Bloomberg include delistings

```

**Symptoms:**
- Strategy performs well on historical data
- Selecting 'value' stocks that all recovered
- Missing the companies that went bankrupt

---

### [HIGH] Strategy has more parameters than predictive value

**Why it happens:**
With enough parameters, you can fit any historical pattern.
But this memorizes noise, not signal.
Rule of thumb: need 252 observations per parameter.


**Solution:**
```
# Keep it simple
def strategy(lookback: int, threshold: float):
    # 2 parameters - much more robust
    pass

# Use cross-validation
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
for train_idx, test_idx in tscv.split(data):
    # Optimize on train, validate on test

```

**Symptoms:**
- Perfect in-sample performance
- Terrible out-of-sample performance
- Strategy breaks on slight market changes

---

### [HIGH] Backtest assumes zero or minimal costs

**Why it happens:**
Real costs include: commissions, bid-ask spread, slippage,
market impact. For high-frequency, impact dominates.
A strategy with 2% annual edge can easily lose 3% to costs.


**Solution:**
```
@dataclass
class RealisticCosts:
    commission_per_share: float = 0.005
    spread_bps: float = 10.0  # Half spread
    slippage_bps: float = 10.0  # Market impact
    min_commission: float = 1.0

    def calculate(self, shares, price):
        commission = max(shares * self.commission_per_share, self.min_commission)
        spread = shares * price * (self.spread_bps / 10000)
        slippage = shares * price * (self.slippage_bps / 10000)
        return commission + spread + slippage

```

**Symptoms:**
- Profitable backtest, losing live trades
- High turnover strategy
- Trading illiquid instruments

---

### [MEDIUM] Profitable at $10K, fails at $10M

**Why it happens:**
Small strategies have unlimited capacity.
Large strategies move markets.
A 1% edge disappears when you need 5% of daily volume to enter.


**Solution:**
```
def calculate_capacity(
    target_shares: int,
    average_daily_volume: int,
    max_participation: float = 0.10  # 10% of ADV
) -> int:
    """Limit position to what market can absorb."""
    max_shares = int(average_daily_volume * max_participation)
    return min(target_shares, max_shares)

# Also consider: number of days to enter/exit

```

**Symptoms:**
- Works on paper, fails with real capital
- Market impact exceeds expected returns
- Can't get fills at expected prices

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `var|value.at.risk|stress.test` | risk-modeling | Risk measurement |
| `allocat|weight|portfolio.*optim` | portfolio-optimization | Portfolio construction |
| `option|greeks|derivative` | derivatives-pricing | Options trading |
| `blockchain|defi|crypto.*protocol` | blockchain-defi | Crypto trading |

### Receives Work From

- **risk-modeling**: Risk metrics and limits
- **portfolio-optimization**: Asset allocation targets

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/finance/algorithmic-trading/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
