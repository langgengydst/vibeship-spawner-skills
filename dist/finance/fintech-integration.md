# Fintech Integration

> Use when integrating Plaid, Stripe, payment processors, or financial APIs - covers account linking, payment processing, KYC/AML compliance, and webhook handling

**Category:** finance | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Network retries without idempotency create duplicate payments

**Why it happens:**
Network failures happen. When a payment request times out, the client
retries. Without an idempotency key, Stripe processes each retry as
a new payment. Customer gets charged 2-3x.


**Solution:**
```
# Always include idempotency key
idempotency_key = f"{user_id}:{order_id}:{uuid.uuid4().hex[:8]}"

payment_intent = stripe.PaymentIntent.create(
    amount=5000,
    currency='usd',
    customer=customer_id,
    idempotency_key=idempotency_key  # Safe to retry
)

# Stripe returns same result for same idempotency key

```

**Symptoms:**
- Customer charged multiple times
- Support tickets for double charges
- Refund requests spike after outages

---

### [CRITICAL] Attackers can fake payment confirmations

**Why it happens:**
Webhook endpoints are public URLs. Anyone can POST to them.
Without signature verification, attackers can send fake
payment.succeeded events and get products for free.


**Solution:**
```
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            webhook_secret  # From Stripe Dashboard
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Now safe to process
    if event.type == 'payment_intent.succeeded':
        fulfill_order(event.data.object)

```

**Symptoms:**
- Orders marked paid without actual payment
- Fraudulent refund requests
- Inventory discrepancies

---

### [HIGH] Bank connections break and users must relink

**Why it happens:**
Plaid access tokens can expire when banks require re-authentication.
This happens after password changes, security updates, or bank
policy changes. Without handling, your app silently loses access.


**Solution:**
```
# Handle Plaid webhooks for token issues
@app.post("/webhooks/plaid")
async def plaid_webhook(request: Request):
    payload = await request.json()

    if payload['webhook_type'] == 'ITEM':
        if payload['webhook_code'] == 'ERROR':
            # Token needs refresh
            await notify_user_relink(payload['item_id'])

        elif payload['webhook_code'] == 'PENDING_EXPIRATION':
            # Proactive warning
            await send_relink_reminder(payload['item_id'])

    elif payload['webhook_type'] == 'TRANSACTIONS':
        if payload['webhook_code'] == 'SYNC_UPDATES_AVAILABLE':
            await sync_transactions(payload['item_id'])

```

**Symptoms:**
- Transaction sync stops working
- Users complain about 'disconnected' banks
- ITEM_LOGIN_REQUIRED errors

---

### [MEDIUM] Treating ACH as instant leads to premature fulfillment

**Why it happens:**
ACH bank transfers are not instant. A 'pending' charge can fail
days later due to insufficient funds, closed account, or fraud.
Treating 'pending' as 'succeeded' leads to losses.


**Solution:**
```
# Wait for actual settlement via webhook
@app.post("/webhooks/stripe")
async def handle_ach(request: Request):
    event = verify_webhook(request)

    if event.type == 'charge.succeeded':
        # ACH has actually cleared
        await fulfill_order(event.data.object)

    elif event.type == 'charge.failed':
        # ACH failed after days
        await cancel_order(event.data.object)
        await notify_customer_payment_failed()

# For high-value orders, consider waiting for settlement

```

**Symptoms:**
- Orders shipped before payment clears
- Returns create negative balances
- Fraud via 'succeeded' status confusion

---

### [CRITICAL] Handling card data directly creates compliance nightmare

**Why it happens:**
PCI DSS compliance for storing card numbers is extremely expensive
and complex. One breach can cost millions. Stripe and Plaid handle
this so you don't have to.


**Solution:**
```
# Use Stripe.js to tokenize on frontend
# Card numbers never touch your server

// Frontend (Stripe.js)
const {token} = await stripe.createToken(cardElement);
// Send only token.id to your server

// Backend
customer = stripe.Customer.create(source=token_id)
# Stripe stores card securely, you store customer_id

# Never log card data
logger.info(f"Created customer {customer.id}")  # OK
# logger.info(f"Card: {card_number}")  # NEVER

```

**Symptoms:**
- PCI DSS audit failures
- Security breach liability
- Massive fines and reputation damage

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `database|api|endpoint` | backend | API implementation |
| `login|auth|session` | auth-specialist | User authentication |
| `crypto|blockchain|wallet` | blockchain-defi | Crypto payments |
| `frontend|react|ui` | frontend | Payment UI components |

### Receives Work From

- **backend**: API infrastructure
- **auth-specialist**: User authentication

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/finance/fintech-integration/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
