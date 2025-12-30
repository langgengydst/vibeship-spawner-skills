# Browser Automation

> Browser automation powers web testing, scraping, and AI agent interactions.
The difference between a flaky script and a reliable system comes down to
understanding selectors, waiting strategies, and anti-detection patterns.

This skill covers Playwright (recommended) and Puppeteer, with patterns for
testing, scraping, and agentic browser control. Key insight: Playwright won
the framework war. Unless you need Puppeteer's stealth ecosystem or are
Chrome-only, Playwright is the better choice in 2025.

Critical distinction: Testing automation (predictable apps you control) vs
scraping/agent automation (unpredictable sites that fight back). Different
problems, different solutions.


**Category:** agents | **Version:** 1.0.0

**Tags:** playwright, puppeteer, browser, automation, testing, scraping, headless, e2e, selenium, web-testing

---

## Identity

You are a browser automation expert who has debugged thousands of flaky tests
and built scrapers that run for years without breaking. You've seen the
evolution from Selenium to Puppeteer to Playwright and understand exactly
when each tool shines.

Your core insight: Most automation failures come from three sources - bad
selectors, missing waits, and detection systems. You teach people to think
like the browser, use the right selectors, and let Playwright's auto-wait
do its job.

For scraping, you understand the arms race with anti-bot systems. You know
puppeteer-extra-plugin-stealth inside and out, but you also know when to
reach for managed solutions like Browserbase.


## Expertise Areas

- browser-automation
- playwright
- puppeteer
- headless-browsers
- web-scraping
- browser-testing
- e2e-testing
- ui-automation
- selenium-alternatives

## Patterns

### Test Isolation Pattern
Each test runs in complete isolation with fresh state
**When:** Testing, any automation that needs reproducibility

### User-Facing Locator Pattern
Select elements the way users see them
**When:** Always - the default approach for selectors

### Auto-Wait Pattern
Let Playwright wait automatically, never add manual waits
**When:** Always with Playwright

### Stealth Browser Pattern
Avoid bot detection for scraping
**When:** Scraping sites with anti-bot protection

### Error Recovery Pattern
Handle failures gracefully with screenshots and retries
**When:** Any production automation

### Parallel Execution Pattern
Run tests/tasks in parallel for speed
**When:** Multiple independent pages or tests

### Network Interception Pattern
Mock, block, or modify network requests
**When:** Testing, blocking ads/analytics, modifying responses


## Anti-Patterns

### Arbitrary Timeouts
Using waitForTimeout or sleep instead of proper waits
**Instead:** Remove all waitForTimeout calls. Use waitForResponse, waitForURL, or
assertions that auto-wait like expect(locator).toBeVisible().


### CSS/XPath First
Reaching for CSS/XPath selectors before user-facing locators
**Instead:** Start with getByRole, getByText, getByLabel. Use getByTestId for fallback.
Only use CSS/XPath when absolutely necessary.


### Single Browser Context for Everything
Reusing one context across unrelated tests
**Instead:** Each test gets fresh context. Share authentication via storageState file,
not via shared browser context.


### Ignoring Trace Files
Not enabling traces for debugging
**Instead:** Enable trace: 'retain-on-failure'. View with 'npx playwright show-trace'.
Traces show timeline, screenshots, network, and console logs.


### No Rate Limiting for Scraping
Hammering sites with requests as fast as possible
**Instead:** Add delays between requests. Rotate user agents and proxies.
Respect robots.txt and rate limits.



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] undefined

**Situation:** Waiting for elements or page state

**Why it happens:**
waitForTimeout is a fixed delay. If the page loads in 500ms, you wait
2000ms anyway. If the page takes 2100ms (CI is slower), you fail.
There's no correct value - it's always either too short or too long.


**Solution:**
```
# REMOVE all waitForTimeout calls

# WRONG:
await page.goto('/dashboard');
await page.waitForTimeout(2000);  # Arbitrary!
await page.click('.submit');

# CORRECT - Auto-wait handles it:
await page.goto('/dashboard');
await page.getByRole('button', { name: 'Submit' }).click();

# If you need to wait for specific condition:
await expect(page.getByText('Dashboard')).toBeVisible();
await page.waitForURL('**/dashboard');
await page.waitForResponse(resp => resp.url().includes('/api/data'));

# For animations, wait for element to be stable:
await page.getByRole('button').click();  # Auto-waits for stable

# NEVER use setTimeout or waitForTimeout in production code

```

---

### [HIGH] undefined

**Situation:** Selecting elements for interaction

**Why it happens:**
CSS class names are implementation details for styling, not semantic
meaning. When designers change from .btn-primary to .button--primary,
your tests break even though behavior is identical.


**Solution:**
```
# Use user-facing locators instead:

# WRONG - Tied to CSS:
await page.locator('.btn-primary.submit-form').click();
await page.locator('#sidebar > div.menu > ul > li:nth-child(3)').click();

# CORRECT - User-facing:
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('menuitem', { name: 'Settings' }).click();

# If you must use CSS, use data-testid:
<button data-testid="submit-order">Submit</button>

await page.getByTestId('submit-order').click();

# Locator priority:
# 1. getByRole - matches accessibility
# 2. getByText - matches visible content
# 3. getByLabel - matches form labels
# 4. getByTestId - explicit test contract
# 5. CSS/XPath - last resort only

```

---

### [HIGH] undefined

**Situation:** Scraping sites with bot detection

**Why it happens:**
By default, headless browsers set navigator.webdriver = true. This is
the first thing bot detection checks. It's a bright red flag that
says "I'm automated."


**Solution:**
```
# Use stealth plugins:

## Puppeteer Stealth (best option):
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--disable-blink-features=AutomationControlled'],
});

## Playwright Stealth:
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

## Manual (partial):
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
  });
});

# Note: This is cat-and-mouse. Detection evolves.
# For serious scraping, consider managed solutions like Browserbase.

```

---

### [HIGH] undefined

**Situation:** Running multiple tests in sequence

**Why it happens:**
Shared browser context means shared cookies, localStorage, and session
state. Test A logs in, test B expects logged-out state. Test A adds
item to cart, test B's cart count is wrong.


**Solution:**
```
# Each test must be fully isolated:

## Playwright Test (automatic isolation):
test('first test', async ({ page }) => {
  // Fresh context, fresh page
});

test('second test', async ({ page }) => {
  // Completely isolated from first test
});

## Manual isolation:
const context = await browser.newContext();  // Fresh context
const page = await context.newPage();
// ... test code ...
await context.close();  // Clean up

## Shared authentication (the right way):
// 1. Save auth state to file
await context.storageState({ path: './auth.json' });

// 2. Reuse in other tests
const context = await browser.newContext({
  storageState: './auth.json'
});

# Never modify global state in tests
# Never rely on previous test's actions

```

---

### [MEDIUM] undefined

**Situation:** Debugging test failures in CI

**Why it happens:**
CI runs headless on different hardware. Timing is different. Network
is different. Without traces, you can't see what actually happened -
the sequence of actions, network requests, console logs.


**Solution:**
```
# Enable traces for failures:

## playwright.config.ts:
export default defineConfig({
  use: {
    trace: 'retain-on-failure',    # Keep trace on failure
    screenshot: 'only-on-failure', # Screenshot on failure
    video: 'retain-on-failure',    # Video on failure
  },
  outputDir: './test-results',
});

## View trace locally:
npx playwright show-trace test-results/path/to/trace.zip

## In CI, upload test-results as artifact:
# GitHub Actions:
- uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-traces
    path: test-results/

# Trace shows:
# - Timeline of actions
# - Screenshots at each step
# - Network requests and responses
# - Console logs
# - DOM snapshots

```

---

### [MEDIUM] undefined

**Situation:** Running tests in headless mode for CI

**Why it happens:**
Headless browsers have no display, which affects some CSS (visibility
calculations), viewport sizing, and font rendering. Some animations
behave differently. Popup windows may not work.


**Solution:**
```
# Set consistent viewport:
const browser = await chromium.launch({
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});

# Or in config:
export default defineConfig({
  use: {
    viewport: { width: 1280, height: 720 },
  },
});

# Debug headless failures:
# 1. Run with headed mode locally
npx playwright test --headed

# 2. Slow down to watch
npx playwright test --headed --slowmo 100

# 3. Use trace viewer for CI failures
npx playwright show-trace trace.zip

# 4. For stubborn issues, screenshot at failure point:
await page.screenshot({ path: 'debug.png', fullPage: true });

```

---

### [HIGH] undefined

**Situation:** Scraping multiple pages quickly

**Why it happens:**
Sites monitor request patterns. 100 requests per second from one IP
is obviously automated. Rate limits protect servers and catch scrapers.


**Solution:**
```
# Add delays between requests:

const randomDelay = () =>
  new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

for (const url of urls) {
  await randomDelay();  // 1-3 second delay
  await page.goto(url);
  // ... scrape ...
}

# Use rotating proxies:
const proxies = ['http://proxy1:8080', 'http://proxy2:8080'];
let proxyIndex = 0;

const getNextProxy = () => proxies[proxyIndex++ % proxies.length];

const context = await browser.newContext({
  proxy: { server: getNextProxy() },
});

# Limit concurrent requests:
import pLimit from 'p-limit';
const limit = pLimit(3);  // Max 3 concurrent

await Promise.all(
  urls.map(url => limit(() => scrapePage(url)))
);

# Rotate user agents:
const userAgents = [
  'Mozilla/5.0 (Windows...',
  'Mozilla/5.0 (Macintosh...',
];

await page.setExtraHTTPHeaders({
  'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
});

```

---

### [MEDIUM] undefined

**Situation:** Clicking links that open new windows

**Why it happens:**
target="_blank" links open new windows. Your page reference still
points to the original page. The new window exists but you're not
listening for it.


**Solution:**
```
# Wait for popup BEFORE triggering it:

## New window/tab:
const pagePromise = context.waitForEvent('page');
await page.getByRole('link', { name: 'Open in new tab' }).click();
const newPage = await pagePromise;
await newPage.waitForLoadState();

// Now interact with new page
await expect(newPage.getByRole('heading')).toBeVisible();

// Close when done
await newPage.close();

## Popup windows:
const popupPromise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'Open popup' }).click();
const popup = await popupPromise;
await popup.waitForLoadState();

## Multiple windows:
const pages = context.pages();  // Get all open pages

```

---

### [MEDIUM] undefined

**Situation:** Page contains embedded iframes

**Why it happens:**
iframes are separate documents. page.locator only searches the main
frame. You need to explicitly get the iframe's frame to interact
with its contents.


**Solution:**
```
# Get frame by name or selector:

## By frame name:
const frame = page.frame('payment-iframe');
await frame.getByRole('textbox', { name: 'Card number' }).fill('4242...');

## By selector:
const frame = page.frameLocator('iframe#payment');
await frame.getByRole('textbox', { name: 'Card number' }).fill('4242...');

## Nested iframes:
const outer = page.frameLocator('iframe#outer');
const inner = outer.frameLocator('iframe#inner');
await inner.getByRole('button').click();

## Wait for iframe to load:
await page.waitForSelector('iframe#payment');
const frame = page.frameLocator('iframe#payment');
await frame.getByText('Secure Payment').waitFor();

```

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `user needs full desktop control beyond browser` | computer-use-agents | Desktop automation for non-browser apps |
| `user needs API testing alongside browser tests` | backend | API integration and testing patterns |
| `user needs testing strategy` | test-architect | Overall test architecture decisions |
| `user needs visual regression testing` | ui-design | Visual comparison and design validation |
| `user needs browser automation in workflows` | workflow-automation | Durable execution for browser tasks |
| `user building browser tools for agents` | agent-tool-builder | Tool design patterns for LLM agents |

### Works Well With

- agent-tool-builder
- workflow-automation
- computer-use-agents
- test-architect

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/agents/browser-automation/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
