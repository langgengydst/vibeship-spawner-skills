# Wallet Integration Specialist

> Expert in Web3 wallet integration for DApps. Masters wallet connectivity,
transaction signing, account management, and blockchain UX patterns.


**Category:** development | **Version:** 1.0.0

**Tags:** wallet, web3, metamask, wagmi, rainbowkit, walletconnect, ethereum, dapp, blockchain

---

## Identity

[object Object]

## Expertise Areas

- Wallet connection flows
- Transaction signing and submission
- Account and chain management
- Web3 frontend integration
- Wallet UX patterns
- Multi-chain wallet support

## Patterns

### Progressive Wallet Connection
Guide users through connection step by step
**When:** Building wallet connection flow
```
- Detect available wallet providers
- Show clear connection options
- Handle installation prompts for missing wallets
- Persist connection state across sessions
- Support multiple wallet types

```

### Transaction Preview
Show clear transaction details before signing
**When:** Any write transaction
```
- Decode function call to human-readable format
- Show token amounts and recipients
- Display gas estimates and total cost
- Warn about unusual or high-value transactions
- Allow transaction simulation preview

```

### Optimistic Updates
Update UI before transaction confirms
**When:** Improving perceived performance
```
- Update UI immediately on tx submission
- Show pending state clearly
- Handle tx failure and revert UI
- Use tx receipt for final confirmation
- Clear pending state on confirmation

```

### Chain Awareness
Handle multi-chain gracefully
**When:** DApp supports multiple networks
```
- Detect current chain on connection
- Prompt chain switch when needed
- Handle chain switch errors gracefully
- Support adding custom chains
- Show chain-specific assets and data

```

### Signature Authentication
Use wallet signatures for auth
**When:** Need authenticated sessions without passwords
```
- Generate server-side nonce
- Sign structured message (EIP-712 preferred)
- Verify signature server-side
- Issue session token on success
- Handle signature rejection gracefully

```

### Batch Transactions
Group multiple operations
**When:** User needs multiple contract calls
```
- Multicall for read operations
- Multicall3 for write batching
- Show aggregated gas savings
- Handle partial failures
- Support smart account batching

```


## Anti-Patterns

### Wallet Lock-in
Only supporting one wallet provider

### Silent Transactions
Submitting transactions without clear user consent

### Ignoring Rejection
Not handling user rejection of wallet prompts

### Chain Confusion
Not checking or handling wrong chain

### Connection Spam
Repeatedly prompting for wallet connection

### Raw Error Display
Showing raw wallet/RPC errors to users


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Only supporting MetaMask or single wallet

**Situation:** Hardcoding MetaMask detection or connection

**Why it happens:**
Users have different wallets (Coinbase Wallet, WalletConnect, Rainbow,
etc.). Supporting only MetaMask excludes a significant portion of users.
Mobile users especially use non-MetaMask wallets.


**Solution:**
```
Use wallet aggregators:
- RainbowKit or Web3Modal for wallet selection
- wagmi for standardized connection hooks
- Support WalletConnect for mobile
- Detect and list available wallets

```

**Symptoms:**
- Users can't connect their wallet
- Mobile users report issues
- Low wallet connection rates

---

### [HIGH] Not handling user wallet rejection

**Situation:** Wallet prompts can be rejected by user

**Why it happens:**
Users reject wallet prompts for many reasons - wrong account, changed
mind, accidental click. Unhandled rejections leave UI in broken state
or show cryptic errors.


**Solution:**
```
Handle all rejection cases:
- Connection rejection → clear UI state, show retry
- Transaction rejection → revert optimistic updates
- Signature rejection → allow retry without restart
- Show user-friendly messages

```

**Symptoms:**
- UI stuck after user cancels
- Cryptic error messages
- Users confused about state

---

### [CRITICAL] Not checking or handling wrong chain

**Situation:** User on different chain than app expects

**Why it happens:**
Users submit transactions to wrong network and can't understand why
things don't work. Worse, they might send tokens to wrong chain
addresses, losing funds.


**Solution:**
```
Chain awareness:
- Check chainId on connection
- Prompt switch to correct chain
- Block transactions on wrong chain
- Show clear chain indicator in UI

```

**Symptoms:**
- Transactions fail with unclear errors
- Users confused about which chain
- Support tickets about lost funds

---

### [HIGH] Signing transactions without preview

**Situation:** Direct transaction submission without showing details

**Why it happens:**
Users sign transactions they don't understand. This erodes trust and
can lead to accidental high-value transfers or approval of malicious
contracts. Users deserve to know what they're signing.


**Solution:**
```
Transaction preview:
- Decode function call to human-readable
- Show token amounts and recipients
- Display gas estimate and total cost
- Simulate transaction before submission

```

**Symptoms:**
- Users unsure what they signed
- Unexpected transaction results
- Low user trust

---

### [MEDIUM] Showing raw RPC/wallet errors to users

**Situation:** Displaying error.message directly

**Why it happens:**
Wallet and RPC errors are technical and unhelpful to users. Messages
like "insufficient funds for gas * price + value" or "nonce too low"
confuse users and look unprofessional.


**Solution:**
```
Error translation:
- Parse common error codes
- Map to user-friendly messages
- Include actionable next steps
- Log technical details for debugging

```

**Symptoms:**
- Confused users
- Support requests about errors
- Unprofessional appearance

---

### [HIGH] Requesting unlimited token approval

**Situation:** Approving type(uint256).max for convenience

**Why it happens:**
Unlimited approval means if the approved contract is compromised, all
tokens can be drained. Users are increasingly aware of this risk and
distrust DApps that request unlimited approvals.


**Solution:**
```
Exact approvals:
- Approve only the amount needed
- Or use permit signatures (EIP-2612)
- Explain approval amounts to users
- Show current approvals and allow revocation

```

**Symptoms:**
- Security-conscious users refuse
- Risk of total loss if contract hacked
- Bad security reputation

---

### [MEDIUM] Repeatedly prompting for wallet connection

**Situation:** Showing connect prompt on every page/action

**Why it happens:**
Constant connection prompts are annoying and desperate-looking. Users
should connect once and stay connected. Aggressive prompting drives
users away.


**Solution:**
```
Respectful connection flow:
- Persist connection state
- Single, clear connect button
- Remember user preference
- Don't block content behind wallet

```

**Symptoms:**
- Users annoyed by prompts
- High bounce rate
- Users report aggressive UX

---

### [MEDIUM] Not showing transaction pending state

**Situation:** UI unchanged while transaction confirms

**Why it happens:**
Blockchain transactions take time. Without pending state, users think
the action failed or click again, potentially submitting duplicate
transactions.


**Solution:**
```
Clear pending UX:
- Show pending state immediately
- Link to block explorer
- Disable repeat actions
- Update on confirmation

```

**Symptoms:**
- Users submit duplicate transactions
- Confusion about transaction status
- Support requests about 'stuck' transactions

---

## Collaboration

### Works Well With

- smart-contract-engineer
- defi-architect
- frontend
- security-analyst

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/wallet-integration/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
