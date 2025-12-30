# Shopify Apps

> Expert patterns for Shopify app development including Remix/React Router apps,
embedded apps with App Bridge, webhook handling, GraphQL Admin API,
Polaris components, billing, and app extensions.


**Category:** integrations | **Version:** 1.0.0

**Tags:** shopify, ecommerce, apps, embedded-apps, polaris, app-bridge

---

## Patterns

### React Router App Setup
Modern Shopify app template with React Router
**When:** Starting a new Shopify app

### Embedded App with App Bridge
Render app embedded in Shopify Admin
**When:** Building embedded admin app

### Webhook Handling
Secure webhook processing with HMAC verification
**When:** Receiving Shopify webhooks

### GraphQL Admin API
Query and mutate shop data with GraphQL
**When:** Interacting with Shopify Admin API

### Billing API Integration
Implement subscription billing for your app
**When:** Monetizing Shopify app

### App Extension Development
Extend Shopify checkout, admin, or storefront
**When:** Building app extensions


## Anti-Patterns

### REST API for New Apps
REST API deprecated, GraphQL required for new public apps (April 2025)
**Instead:** Use GraphQL Admin API

### Webhook Processing Before Response
Processing webhooks before responding causes timeout
**Instead:** Respond immediately, process asynchronously

### Polling Instead of Webhooks
Wastes rate limits, slower than event-driven
**Instead:** Use webhooks for event notifications

### Duplicate Webhook Definitions
Defining webhooks in both TOML and code causes conflicts
**Instead:** Define webhooks in shopify.app.toml only

### Ignoring Rate Limits
Not handling 429 responses causes app failures
**Instead:** Implement exponential backoff and request queuing


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] undefined

**Situation:** Receiving webhooks from Shopify

**Why it happens:**
Shopify expects a 2xx response within 5 seconds. If your app processes
the webhook data before responding, you'll timeout.

Shopify retries failed webhooks up to 19 times over 48 hours.
After continued failures, webhooks may be cancelled entirely.

Heavy processing (API calls, database operations) must happen
after the response is sent.


**Solution:**
```
## Respond immediately, process asynchronously

```typescript
// app/routes/webhooks.tsx
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // Queue for async processing
  await jobQueue.add("process-webhook", {
    topic,
    shop,
    payload,
  });

  // CRITICAL: Return 200 immediately
  return new Response(null, { status: 200 });
};

// Worker process handles the actual work
// workers/webhook-processor.ts
import { Worker } from "bullmq";

const worker = new Worker("process-webhook", async (job) => {
  const { topic, shop, payload } = job.data;

  switch (topic) {
    case "ORDERS_CREATE":
      await processOrder(shop, payload);
      break;
    // ... other handlers
  }
});
```

## For simple operations, be quick

```typescript
// Simple database update is OK if fast
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, payload } = await authenticate.webhook(request);

  // Quick database update (< 1 second)
  await db.product.update({
    where: { shopifyId: payload.id },
    data: { title: payload.title },
  });

  return new Response(null, { status: 200 });
};
```

## Monitor webhook performance

```typescript
// Log response times
const start = Date.now();

await handleWebhook(payload);

const duration = Date.now() - start;
console.log(`Webhook processed in ${duration}ms`);

// Alert if approaching timeout
if (duration > 3000) {
  console.warn("Webhook processing taking too long!");
}
```

```

---

### [HIGH] undefined

**Situation:** Making API calls to Shopify

**Why it happens:**
Shopify enforces strict rate limits:
- REST: 2 requests per second per store
- GraphQL: 1000 points per 60 seconds

Exceeding limits causes immediate 429 errors.
Continuous violations can result in temporary bans.

Bulk operations count against limits.


**Solution:**
```
## Check rate limit headers

```typescript
// REST API
// X-Shopify-Shop-Api-Call-Limit: 39/40

// GraphQL - check response extensions
const response = await admin.graphql(`...`);
const { data, extensions } = await response.json();

const cost = extensions?.cost;
// {
//   "requestedQueryCost": 42,
//   "actualQueryCost": 42,
//   "throttleStatus": {
//     "maximumAvailable": 1000,
//     "currentlyAvailable": 958,
//     "restoreRate": 50
//   }
// }
```

## Implement retry with exponential backoff

```typescript
async function shopifyRequest(
  fn: () => Promise<Response>,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fn();

      if (response.status === 429) {
        // Get retry-after header or default
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "2"
        );
        await sleep(retryAfter * 1000 * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw lastError!;
}
```

## Use bulk operations for large datasets

```typescript
// Instead of 1000 individual calls, use bulk mutation
const response = await admin.graphql(`
  mutation {
    bulkOperationRunMutation(
      mutation: "mutation($input: ProductInput!) {
        productUpdate(input: $input) { product { id } }
      }",
      stagedUploadPath: "..."
    ) {
      bulkOperation { id status }
      userErrors { message }
    }
  }
`);
```

## Queue requests

```typescript
import { RateLimiter } from "limiter";

// 2 requests per second for REST
const limiter = new RateLimiter({
  tokensPerInterval: 2,
  interval: "second",
});

async function rateLimitedRequest(fn: () => Promise<any>) {
  await limiter.removeTokens(1);
  return fn();
}
```

```

---

### [HIGH] undefined

**Situation:** Accessing customer PII in webhooks or API

**Why it happens:**
Since April 2024, accessing protected customer data (PII) requires
explicit approval from Shopify. This is separate from OAuth scopes.

Protected data includes:
- Customer names, emails, addresses
- Order customer information
- Subscription customer details

Even with read_orders scope, you won't receive customer data
in webhooks without protected data access.


**Solution:**
```
## Request protected customer data access

1. Go to Partner Dashboard > App > API access
2. Under "Protected customer data access"
3. Request access for needed data types
4. Justify your use case
5. Wait for Shopify approval (can take days)

## Check your data access level

```typescript
// Query your app's data access
const response = await admin.graphql(`
  query {
    currentAppInstallation {
      accessScopes {
        handle
      }
    }
  }
`);
```

## Handle missing data gracefully

```typescript
// Webhook payload may have redacted fields
async function processOrder(payload: any) {
  const customerEmail = payload.customer?.email;

  if (!customerEmail) {
    // Customer data not available
    // Either no protected access or data redacted
    console.log("Customer data not available");
    return;
  }

  await sendOrderConfirmation(customerEmail);
}
```

## Use customer account API for direct access

```typescript
// If customer is logged in, can access their data
// through Customer Account API (different from Admin API)
```

```

---

### [MEDIUM] undefined

**Situation:** Configuring webhooks in both TOML and code

**Why it happens:**
Shopify apps can define webhooks in two places:
1. shopify.app.toml (declarative, recommended)
2. afterAuth hook in code (imperative, legacy)

If you define the same webhook in both places, you get:
- Duplicate subscriptions
- Race conditions during registration
- Conflicts during app updates


**Solution:**
```
## Use TOML only (recommended)

```toml
# shopify.app.toml
[webhooks]
api_version = "2024-10"

[webhooks.subscriptions]
topics = [
  "orders/create",
  "orders/updated",
  "products/create",
  "products/update",
  "app/uninstalled"
]
uri = "/webhooks"
```

## Remove code-based registration

```typescript
// DON'T do this if using TOML
const shopify = shopifyApp({
  // ...
  hooks: {
    afterAuth: async ({ session }) => {
      // Remove webhook registration from here
      // Let TOML handle it
    },
  },
});
```

## Deploy to apply TOML changes

```bash
# Webhooks registered on deploy
shopify app deploy
```

## Check current subscriptions

```typescript
const response = await admin.graphql(`
  query {
    webhookSubscriptions(first: 50) {
      edges {
        node {
          id
          topic
          endpoint {
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
    }
  }
`);
```

```

---

### [MEDIUM] undefined

**Situation:** Setting up webhook endpoints

**Why it happens:**
Shopify automatically adds a trailing slash to webhook URLs.
If your server doesn't handle both /webhooks and /webhooks/,
the webhook will 404.

Common with frameworks that are strict about trailing slashes.


**Solution:**
```
## Handle both URL formats

```typescript
// Remix/React Router - both work by default
// app/routes/webhooks.tsx handles /webhooks

// Express - add middleware
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safePath = req.path.slice(0, -1);
    res.redirect(301, safePath + query);
  }
  next();
});
```

## Configure web server

```nginx
# Nginx - strip trailing slashes
location ~ ^(.+)/$ {
  return 301 $1;
}

# Or rewrite to handler
location /webhooks {
  try_files $uri $uri/ @webhooks;
}
location @webhooks {
  proxy_pass http://app:3000/webhooks;
}
```

## Test both formats

```bash
# Test without slash
curl -X POST https://your-app.com/webhooks

# Test with slash
curl -X POST https://your-app.com/webhooks/
```

```

---

### [HIGH] undefined

**Situation:** Building new public apps or maintaining existing

**Why it happens:**
As of October 2024, REST Admin API is legacy.
Starting April 2025, new public apps MUST use GraphQL.

REST endpoints will continue working for existing apps,
but new features are GraphQL-only.

Metafields, bulk operations, and many new features
require GraphQL.


**Solution:**
```
## Use GraphQL for all new code

```typescript
// REST (legacy)
const response = await fetch(
  `https://${shop}/admin/api/2024-10/products.json`,
  {
    headers: { "X-Shopify-Access-Token": token },
  }
);

// GraphQL (recommended)
const response = await admin.graphql(`
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`);
```

## Migrate existing REST calls

```typescript
// REST: GET /products/{id}.json
// GraphQL equivalent:
const response = await admin.graphql(`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      status
      variants(first: 10) {
        edges {
          node {
            id
            price
            inventoryQuantity
          }
        }
      }
    }
  }
`, {
  variables: { id: `gid://shopify/Product/${productId}` },
});
```

## Use GraphQL for webhooks too

```toml
# shopify.app.toml
[webhooks]
api_version = "2024-10"  # Use latest GraphQL version
```

```

---

### [HIGH] undefined

**Situation:** Building embedded Shopify apps

**Why it happens:**
Effective July 2025, all apps seeking "Built for Shopify" status
must use the latest version of App Bridge and be embedded.

Apps using old App Bridge versions or not embedded will
lose built for Shopify benefits (better placement, badges).

Shopify now serves App Bridge and Polaris via unversioned
script tags that auto-update.


**Solution:**
```
## Use latest App Bridge via script tag

```html
<!-- Automatically stays up to date -->
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
```

## Use AppProvider in React

```typescript
// app/routes/app.tsx
import { AppProvider } from "@shopify/shopify-app-remix/react";

export default function App() {
  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Outlet />
    </AppProvider>
  );
}
```

## Enable embedded auth strategy

```typescript
// shopify.server.ts
const shopify = shopifyApp({
  // ...
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
});
```

## Check embedded status

```typescript
import { useAppBridge } from "@shopify/app-bridge-react";

function MyComponent() {
  const app = useAppBridge();
  const isEmbedded = app.hostOrigin !== window.location.origin;
}
```

```

---

### [HIGH] undefined

**Situation:** Submitting app to Shopify App Store

**Why it happens:**
Shopify requires all apps to handle three GDPR webhooks:
1. customers/data_request - Provide customer data
2. customers/redact - Delete customer data
3. shop/redact - Delete all shop data

These are automatically subscribed when you create an app.
You MUST implement handlers even if you don't store data.


**Solution:**
```
## Implement all GDPR handlers

```typescript
// app/routes/webhooks.tsx
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, payload, shop } = await authenticate.webhook(request);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      await handleDataRequest(shop, payload);
      break;

    case "CUSTOMERS_REDACT":
      await handleCustomerRedact(shop, payload);
      break;

    case "SHOP_REDACT":
      await handleShopRedact(shop, payload);
      break;
  }

  return new Response(null, { status: 200 });
};

async function handleDataRequest(shop: string, payload: any) {
  const customerId = payload.customer.id;

  // Return customer data within 30 days
  // Usually send to data_request.destination_url
  const customerData = await db.customer.findUnique({
    where: { shopifyId: customerId, shop },
  });

  if (customerData) {
    // Send to provided URL or email
    await sendDataToMerchant(payload.data_request, customerData);
  }
}

async function handleCustomerRedact(shop: string, payload: any) {
  const customerId = payload.customer.id;

  // Delete customer's personal data
  await db.customer.deleteMany({
    where: { shopifyId: customerId, shop },
  });

  await db.order.updateMany({
    where: { customerId, shop },
    data: { customerEmail: null, customerName: null },
  });
}

async function handleShopRedact(shop: string, payload: any) {
  // Shop uninstalled 48+ hours ago
  // Delete ALL data for this shop
  await db.session.deleteMany({ where: { shop } });
  await db.customer.deleteMany({ where: { shop } });
  await db.order.deleteMany({ where: { shop } });
  await db.settings.deleteMany({ where: { shop } });
}
```

## Even if you store nothing

```typescript
// You must still respond 200
case "CUSTOMERS_DATA_REQUEST":
case "CUSTOMERS_REDACT":
case "SHOP_REDACT":
  // No data stored, but must acknowledge
  console.log(`GDPR ${topic} for ${shop} - no data stored`);
  break;
```

```

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `user needs payment processing` | stripe-integration | Shopify Payments or Stripe integration |
| `user needs custom authentication` | auth-specialist | Beyond Shopify OAuth |
| `user needs email/SMS notifications` | twilio-communications | Customer notifications outside Shopify |
| `user needs AI features` | llm-architect | Product descriptions, chatbots |
| `user needs serverless deployment` | aws-serverless | Lambda or Vercel deployment |

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/integrations/shopify-apps/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
