# Microservices Patterns

> Patterns for designing, building, and operating microservices architectures.
Covers service decomposition, inter-service communication, resilience patterns,
data consistency, and observability in distributed systems.


**Category:** development | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Building a distributed monolith is worse than a real monolith

**Situation:** You decompose your monolith into microservices. Each service calls
other services synchronously for every operation. When one service
is slow or down, the entire system fails. Deployments require
coordinating all services. You have all the complexity of microservices
with none of the benefits.


**Why it happens:**
Distributed monoliths combine the worst of both worlds:
- Network latency on every operation
- Cascade failures when any service fails
- Deployment coupling
- No independent scaling
- Added operational complexity

You've distributed your code but not your ownership.


**Solution:**
```
Design for loose coupling:

// BAD: Sync call chain for every request
async function createOrder(data) {
  const user = await userService.get(data.userId);        // Sync
  const product = await productService.get(data.productId); // Sync
  const inventory = await inventoryService.check(data);    // Sync
  const payment = await paymentService.authorize(data);    // Sync
  // All must succeed, any failure = order failure
}

// GOOD: Async events, eventual consistency
async function createOrder(data) {
  // Validate essential data locally
  if (!data.userId || !data.items.length) {
    throw new ValidationError('Invalid order');
  }

  // Create order immediately
  const order = await orderRepo.create({
    ...data,
    status: 'pending',
  });

  // Publish event - other services react asynchronously
  await eventBus.publish('order.created', {
    orderId: order.id,
    ...order,
  });

  return order; // Return immediately
}

// Inventory service subscribes and reacts
eventBus.subscribe('order.created', async (event) => {
  try {
    await reserveInventory(event.items);
    await eventBus.publish('inventory.reserved', { orderId: event.orderId });
  } catch (error) {
    await eventBus.publish('inventory.failed', {
      orderId: event.orderId,
      reason: error.message,
    });
  }
});

// Order service handles the outcome
eventBus.subscribe('inventory.failed', async (event) => {
  await orderRepo.update(event.orderId, { status: 'failed' });
  await notifyCustomer(event.orderId, 'Order failed - out of stock');
});

```

**Symptoms:**
- One service down takes down everything
- Can't deploy services independently
- High latency due to call chains
- Why is this so slow?

---

### [CRITICAL] Missing timeouts cause cascade failures

**Situation:** Your service calls another service without timeout. That service
hangs due to database lock. Your service waits. Thread pool exhausted.
All requests to your service timeout. Cascade failure spreads.


**Why it happens:**
Without timeouts:
- One slow service blocks all callers
- Threads/connections exhausted
- Memory grows as requests queue
- No way to recover without restart

Hangs are worse than failures - at least failures are fast.


**Solution:**
```
Always set timeouts:

import axios from 'axios';
import CircuitBreaker from 'opossum';

// Axios with timeout
const client = axios.create({
  timeout: 5000,  // 5 seconds
  // Also set socket timeout
  httpAgent: new http.Agent({ timeout: 10000 }),
});

// Circuit breaker adds another layer
const breaker = new CircuitBreaker(
  (url) => client.get(url),
  {
    timeout: 3000,              // Fail fast
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

// Fallback for when circuit is open
breaker.fallback(() => {
  return { cached: true, data: getCachedData() };
});

// gRPC with deadline
const deadline = new Date(Date.now() + 5000);
client.getOrder(request, { deadline }, (err, response) => {
  if (err?.code === grpc.status.DEADLINE_EXCEEDED) {
    handleTimeout();
  }
});

// Database queries with timeout
await prisma.$queryRaw`
  SET statement_timeout = '5000';
  SELECT * FROM large_table WHERE ...;
`;

```

**Symptoms:**
- Threads stuck in WAITING state
- Memory grows until OOM
- Service stops responding but process alive
- It was working until it suddenly wasn't

---

### [CRITICAL] Missing circuit breaker causes cascade failures

**Situation:** Your service calls payment service. Payment service goes down.
Every request to your service now waits for timeout, then fails.
With 100 requests/second and 30 second timeout, you queue 3000
requests. Memory exhausted. Your service crashes. Upstream callers
now fail. The entire system collapses.


**Why it happens:**
Without circuit breakers:
- Failed calls keep trying
- Resources exhausted waiting for hopeless calls
- No way to fail fast
- No automatic recovery detection


**Solution:**
```
Use circuit breaker for all external calls:

import CircuitBreaker from 'opossum';

// Circuit breaker configuration
const paymentBreaker = new CircuitBreaker(
  async (orderId, amount) => {
    return paymentGateway.charge(orderId, amount);
  },
  {
    timeout: 5000,               // Fail after 5s
    errorThresholdPercentage: 50, // Open after 50% failures
    resetTimeout: 30000,          // Try again after 30s
    volumeThreshold: 10,          // Need 10 requests to trip
  }
);

// Monitor circuit state
paymentBreaker.on('open', () => {
  alerting.send('Payment circuit OPEN - service down');
  metrics.increment('circuit.payment.open');
});

paymentBreaker.on('halfOpen', () => {
  console.log('Payment circuit testing...');
});

paymentBreaker.on('close', () => {
  console.log('Payment circuit recovered');
  metrics.increment('circuit.payment.close');
});

// Use with fallback
async function processPayment(orderId: string, amount: number) {
  try {
    return await paymentBreaker.fire(orderId, amount);
  } catch (error) {
    if (error.message === 'Breaker is open') {
      // Graceful degradation
      await queueForRetry(orderId, amount);
      return { status: 'pending', message: 'Payment processing delayed' };
    }
    throw error;
  }
}

```

**Symptoms:**
- One service failure takes down many
- Memory grows during outages
- Slow recovery after dependency recovers
- Everything failed for 30 minutes

---

### [CRITICAL] Shared database between services defeats microservices benefits

**Situation:** Both order service and inventory service read/write to the same
products table. You need to change the schema. Which team owns it?
Both teams need to coordinate deploys. You can't scale them independently.
You've just split a monolith into two pieces that must deploy together.


**Why it happens:**
Shared database = tight coupling:
- Schema changes require coordination
- No clear ownership
- Can't optimize for different access patterns
- Can't scale independently
- Transaction boundaries unclear


**Solution:**
```
Each service owns its data:

// Order Service - owns orders and denormalized product info
interface OrderDatabase {
  orders: Order[];
  orderItems: OrderItem[];
  // Copy of product info at order time
  products: { id: string; name: string; price: number }[];
}

// Inventory Service - owns inventory data
interface InventoryDatabase {
  products: Product[];
  stockLevels: StockLevel[];
  reservations: Reservation[];
}

// Sync via events
class ProductEventHandler {
  async handleProductUpdated(event: ProductUpdatedEvent) {
    // Update denormalized product data in order service
    await this.orderDb.products.update({
      where: { id: event.productId },
      data: { name: event.name, price: event.price },
    });
  }

  async handleProductDeleted(event: ProductDeletedEvent) {
    // Mark as deleted, don't delete - orders reference it
    await this.orderDb.products.update({
      where: { id: event.productId },
      data: { deleted: true },
    });
  }
}

// Accept eventual consistency
// Order service might have slightly stale product names
// That's OK - order captured data at order time anyway

```

**Symptoms:**
- Schema changes require coordinating teams
- Can't deploy services independently
- Database becomes bottleneck
- We can't change this table, three services use it

---

### [HIGH] Using synchronous calls where async would work

**Situation:** Order creation calls inventory, payment, shipping, and notification
services synchronously. Total latency is sum of all services.
If any is slow, order is slow. You're blocking on services that
don't need to block.


**Why it happens:**
Not everything needs immediate consistency:
- User doesn't need to wait for email to send
- Inventory check could be eventual
- Analytics definitely doesn't need to block

Sync calls multiply latency and failure probability.


**Solution:**
```
Use async for non-blocking operations:

async function createOrder(data) {
  // SYNC: Things that must happen before returning to user
  const order = await orderRepo.create(data);
  const payment = await paymentService.charge(order.total);

  // ASYNC: Things that can happen eventually
  await eventBus.publish('order.created', { order, payment });

  return order; // Return immediately
}

// Other services handle async
// Notification: sends email (user doesn't wait)
// Analytics: records event (definitely doesn't block)
// Inventory: reserves stock (could be eventual)

// Rule of thumb:
// - User sees result immediately? → Sync
// - User doesn't need to wait? → Async
// - Can retry later? → Async
// - Failure OK to handle later? → Async

```

**Symptoms:**
- High latency on operations
- Timeout increases with each new service
- Simple operations become slow
- Why does checkout take 5 seconds?

---

### [HIGH] Can't trace requests across services

**Situation:** User reports "my order failed." You check order service logs - no
error. You check payment service - an error! But which request?
There are thousands. You spend hours correlating timestamps.


**Why it happens:**
Without correlation IDs:
- Can't trace request flow
- Log correlation is guesswork
- Debugging takes hours
- Can't build request timeline


**Solution:**
```
Pass correlation ID through every request:

// Generate at edge (API gateway or first service)
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// Include in all logs
function log(level: string, message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: getCorrelationId(),  // From async context
    service: process.env.SERVICE_NAME,
    ...data,
  }));
}

// Pass in service calls
async function callPaymentService(orderId: string) {
  return axios.post(`${PAYMENT_URL}/charge`, data, {
    headers: {
      'x-correlation-id': getCorrelationId(),
    },
  });
}

// Use in events
await eventBus.publish('order.created', {
  ...orderData,
  metadata: {
    correlationId: getCorrelationId(),
    timestamp: new Date().toISOString(),
  },
});

// Now you can: grep "correlation-id: abc123" across all services

```

**Symptoms:**
- Which request caused this error?
- Hours spent correlating logs manually
- Can't trace request through system
- Debugging distributed issues is nightmare

---

### [HIGH] Too many small calls between services

**Situation:** To render order page, you call order service (1 call), then user
service for customer (1 call), then product service for each item
(N calls), then shipping for rates (1 call). 3 + N network round
trips for one page.


**Why it happens:**
Each network call adds:
- Latency (10-100ms+)
- Failure probability
- Resource consumption
- Complexity

N calls = N x latency = unusable.


**Solution:**
```
Aggregate data or use denormalization:

// Option 1: Aggregate endpoint
// Order service returns everything needed
async function getOrderDetails(orderId: string) {
  return orderRepo.findWithDetails(orderId);
  // Returns: order + items + denormalized customer/product data
}

// Option 2: Backend for Frontend (BFF)
async function getOrderPageData(orderId: string) {
  const [order, customer, shipping] = await Promise.all([
    orderService.get(orderId),
    userService.get(order.customerId),
    shippingService.getRates(order.shippingAddress),
  ]);
  // One call to BFF, BFF makes parallel calls
  return { order, customer, shipping };
}

// Option 3: GraphQL Federation
// Let gateway compose data from multiple services

// Option 4: Denormalize aggressively
// Store customer name, product name in order
// Accept eventual consistency for read performance

```

**Symptoms:**
- Page load requires many API calls
- Latency grows linearly with features
- One slow service slows entire page
- Adding one more field adds 200ms

---

### [MEDIUM] Non-idempotent operations cause duplicate processing

**Situation:** Order service publishes "order.created" event. Payment service
processes it and charges card. Network hiccup - event redelivered.
Payment service charges card again. Customer charged twice.


**Why it happens:**
In distributed systems, messages can be:
- Delivered multiple times
- Delivered out of order
- Delivered after long delay

At-least-once is easy. Exactly-once is a lie. Idempotency is required.


**Solution:**
```
Make all operations idempotent:

class PaymentHandler {
  async handleOrderCreated(event: OrderCreatedEvent) {
    const idempotencyKey = `payment:order:${event.orderId}`;

    // Check if already processed
    const existing = await redis.get(idempotencyKey);
    if (existing) {
      console.log(`Payment for order ${event.orderId} already processed`);
      return JSON.parse(existing);
    }

    // Process payment with Stripe's idempotency
    const payment = await stripe.charges.create({
      amount: event.total,
      currency: 'usd',
      idempotency_key: event.orderId,  // Stripe prevents duplicates
    });

    // Store result for our idempotency
    await redis.setex(idempotencyKey, 86400, JSON.stringify(payment));

    return payment;
  }
}

// Database operations
async function reserveInventory(orderId: string, items: Item[]) {
  // Use orderId as idempotency key
  const existing = await db.reservation.findUnique({
    where: { orderId },
  });

  if (existing) {
    return existing;  // Already reserved
  }

  // Upsert pattern
  return db.reservation.upsert({
    where: { orderId },
    create: { orderId, items, status: 'reserved' },
    update: {},  // No-op if exists
  });
}

```

**Symptoms:**
- Duplicate charges on retries
- Duplicate emails
- Duplicate records
- Customer was charged 3 times

---

### [MEDIUM] All services must deploy together due to API coupling

**Situation:** You change order API response format. Payment service expects old
format. You must deploy both together. But inventory service also
calls order service... You end up deploying everything together,
just like a monolith.


**Why it happens:**
Tight API coupling defeats independent deployment:
- Change one service, break callers
- Must coordinate deploys
- No incremental rollout
- High risk changes


**Solution:**
```
Use API versioning and backward compatibility:

// Version in URL
app.get('/v1/orders/:id', getOrderV1);
app.get('/v2/orders/:id', getOrderV2);

// Backward compatible changes
// ADD fields: ✓ Safe (callers ignore new fields)
// REMOVE fields: ✗ Breaking (use deprecation)
// CHANGE field types: ✗ Breaking

// Deprecation with sunset header
app.get('/v1/orders/:id', (req, res) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Sat, 1 Jan 2025 00:00:00 GMT');
  // Still works, but warns callers
  return getOrderV1(req, res);
});

// Consumer-driven contracts (Pact)
// Callers define expectations, provider verifies

// Tolerant reader pattern
function parseOrderResponse(response: any): Order {
  return {
    id: response.id,
    total: response.total,
    // Use defaults for new optional fields
    currency: response.currency || 'USD',
    // Ignore unknown fields
  };
}

```

**Symptoms:**
- Deploys require coordination
- Fear of changing APIs
- All services deploy together
- We can't change this, everyone uses it

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `async|event|message|queue` | queue-workers | Need async service communication |
| `api|contract|version` | api-designer | Need to design service APIs |
| `deploy|kubernetes|docker` | infrastructure-as-code | Need to deploy services |
| `trace|monitor|observe` | observability-sre | Need distributed tracing |
| `database|data|schema` | database-schema-design | Need per-service databases |
| `rate limit|throttle` | rate-limiting | Need rate limiting between services |
| `cache|performance|latency` | caching-patterns | Need caching between services |

### Receives Work From

- **backend**: Backend needs to scale or evolve independently
- **api-designer**: Need to design inter-service APIs
- **infrastructure-as-code**: Need to deploy microservices
- **performance-optimization**: Need to optimize distributed system

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/microservices-patterns/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
