# Blockchain DeFi

> Use when building DeFi protocols, implementing AMMs, yield farming strategies, or integrating with Ethereum/L2s - covers smart contract patterns, liquidity pools, and security considerations

**Category:** finance | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] External calls before state updates enable theft

**Why it happens:**
When a contract sends ETH or calls another contract before
updating its state, the receiving contract can call back
into the original function. This was the DAO hack ($60M).


**Solution:**
```
// Check-Effects-Interactions pattern
function withdraw(uint amount) external nonReentrant {
    require(balances[msg.sender] >= amount);

    // EFFECTS: Update state first
    balances[msg.sender] -= amount;

    // INTERACTIONS: External call last
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}

// Plus use ReentrancyGuard from OpenZeppelin

```

**Symptoms:**
- Funds drained in single transaction
- Balance discrepancies after withdrawals
- Same function called recursively

---

### [CRITICAL] Attackers manipulate price within single transaction

**Why it happens:**
Flash loans give attackers unlimited capital within a transaction.
If your protocol uses spot price (current reserves ratio),
attackers can manipulate it, exploit your protocol, and
return the loan - all atomically.


**Solution:**
```
// Use TWAP (Time-Weighted Average Price)
function getPrice() public view returns (uint) {
    // Uniswap V3 oracle - aggregates over time
    (int24 tick, ) = pool.observe([3600, 0]);  // 1 hour TWAP
    return tickToPrice(tick);
}

// Or use Chainlink with staleness checks
function getPrice() public view returns (uint) {
    (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
    require(block.timestamp - updatedAt < 3600, "Stale price");
    return uint256(price);
}

```

**Symptoms:**
- Massive liquidations in one block
- Protocol loses millions instantly
- Price spikes that don't match market

---

### [HIGH] LPs lose money despite high APY display

**Why it happens:**
AMM LPs are constantly selling winners and buying losers.
If price moves 2x, you lose 5.7% vs holding. At 5x, you
lose 25.5%. Trading fees may not compensate, especially
in low-volume pools.


**Solution:**
```
def should_lp(volatility, pool_fee, expected_volume):
    """Estimate if LP will be profitable."""
    # Simplified model
    daily_vol = volatility / sqrt(365)

    # Expected IL from volatility
    expected_price_move = 1 + daily_vol * 30  # 30-day estimate
    expected_il = 2 * sqrt(expected_price_move) / (1 + expected_price_move) - 1

    # Expected fees
    expected_fees = pool_fee * expected_volume * 30

    return expected_fees > abs(expected_il)

# Also consider: concentrated liquidity, stable pairs, hedging

```

**Symptoms:**
- LP position worth less than holding
- High APY but negative actual returns
- Losses accelerate with price movement

---

### [HIGH] Compromised contract can drain tokens years later

**Why it happens:**
Common practice is approving max uint256 for convenience.
If that contract is ever compromised (or has hidden
functionality), attackers can drain all your tokens
even years later.


**Solution:**
```
// Approve only exact amount needed
const exactAmount = parseUnits("100", 18);
await token.approve(dexRouter, exactAmount);

// Or use permit for single-transaction approval
const { v, r, s } = await signPermit(owner, spender, value, deadline);
await token.permit(owner, spender, value, deadline, v, r, s);

// Revoke unused approvals regularly
await token.approve(oldProtocol, 0);

```

**Symptoms:**
- Tokens disappear from wallet
- User didn't interact with protocol recently
- Exploit uses old approvals

---

### [MEDIUM] Bots front-run and back-run your swaps for profit

**Why it happens:**
MEV bots monitor mempool for pending swaps. They front-run
with a buy to move price, let your trade execute at worse
price, then back-run with a sell. The bot profits from
your slippage.


**Solution:**
```
// Calculate minimum output with slippage tolerance
const quote = await router.getAmountsOut(amountIn, path);
const minOut = quote[1] * 995n / 1000n;  // 0.5% slippage

router.swapExactTokensForTokens(
    amountIn,
    minOut,  // Reject if sandwich pushes price too far
    path,
    recipient,
    deadline
);

// For large trades: use private mempool (Flashbots)
// Or split into smaller chunks

```

**Symptoms:**
- Worse execution price than expected
- Large trades especially affected
- Visible front-run transactions in block

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `backtest|strategy|signal` | algorithmic-trading | Trading strategy development |
| `var|risk.*model|stress.test` | risk-modeling | DeFi risk analysis |
| `fiat|bank|plaid|stripe` | fintech-integration | Fiat on/off ramps |
| `portfolio|allocat|rebalance` | portfolio-optimization | DeFi portfolio management |

### Receives Work From

- **algorithmic-trading**: DeFi trading strategies
- **risk-modeling**: DeFi risk assessment

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/finance/blockchain-defi/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
