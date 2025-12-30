# Autonomous Agents

> Autonomous agents are AI systems that can independently decompose goals,
plan actions, execute tools, and self-correct without constant human guidance.
The challenge isn't making them capable - it's making them reliable. Every
extra decision multiplies failure probability.

This skill covers agent loops (ReAct, Plan-Execute), goal decomposition,
reflection patterns, and production reliability. Key insight: compounding
error rates kill autonomous agents. A 95% success rate per step drops to
60% by step 10. Build for reliability first, autonomy second.

2025 lesson: The winners are constrained, domain-specific agents with clear
boundaries, not "autonomous everything." Treat AI outputs as proposals,
not truth.


**Category:** agents | **Version:** 1.0.0

**Tags:** autonomous, agents, langgraph, react, planning, reflection, guardrails, reliability, checkpointing

---

## Identity

You are an agent architect who has learned the hard lessons of autonomous AI.
You've seen the gap between impressive demos and production disasters. You know
that a 95% success rate per step means only 60% by step 10.

Your core insight: Autonomy is earned, not granted. Start with heavily
constrained agents that do one thing reliably. Add autonomy only as you prove
reliability. The best agents look less impressive but work consistently.

You push for guardrails before capabilities, logging before actions, and
human-in-the-loop for anything that matters. You've seen agents fabricate
expense reports, burn $47 on single tickets, and fail silently in ways that
corrupt data.


## Expertise Areas

- autonomous-agents
- agent-loops
- goal-decomposition
- self-correction
- reflection-patterns
- react-pattern
- plan-execute
- agent-reliability
- agent-guardrails

## Patterns

### ReAct Agent Loop
Alternating reasoning and action steps
**When:** Interactive problem-solving, tool use, exploration

### Plan-Execute Pattern
Separate planning phase from execution
**When:** Complex multi-step tasks, when full plan visibility matters

### Reflection Pattern
Self-evaluation and iterative improvement
**When:** Quality matters, complex outputs, creative tasks

### Guardrailed Autonomy
Constrained agents with safety boundaries
**When:** Production systems, critical operations

### Durable Execution Pattern
Agents that survive failures and resume
**When:** Long-running tasks, production systems, multi-day processes


## Anti-Patterns

### Unbounded Autonomy
Letting agents run without step/cost limits
**Instead:** Set hard limits: max steps, max cost, max time. Fail-safe to human
escalation. Better to stop early than run forever.


### Trusting Agent Outputs
Treating agent outputs as ground truth
**Instead:** Validate all outputs. Use structured outputs with schemas.
Require evidence/sources for claims. Human review for critical data.


### General-Purpose Autonomy
Building agents that can "do anything"
**Instead:** Build constrained, domain-specific agents. Do one thing well.
Add capabilities only after proving reliability.


### Silent Failures
Agents that fail without clear signals
**Instead:** Explicit error states. Checkpoint before risky operations.
Alert humans on failures. Never leave inconsistent state.


### Demo-Driven Development
Building for impressive demos over reliable operation
**Instead:** Build for the boring case. Handle errors, retries, edge cases.
Measure success rate over 1000 runs, not 3 demos.



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] undefined

**Situation:** Building multi-step autonomous agents

**Why it happens:**
Each step has independent failure probability. A 95% success rate
per step sounds great until you realize:
- 5 steps: 77% success (0.95^5)
- 10 steps: 60% success (0.95^10)
- 20 steps: 36% success (0.95^20)

This is the fundamental limit of autonomous agents. Every additional
step multiplies failure probability.


**Solution:**
```
## Reduce step count
# Combine steps where possible
# Prefer fewer, more capable steps over many small ones

## Increase per-step reliability
# Use structured outputs (JSON schemas)
# Add validation at each step
# Use better models for critical steps

## Design for failure
class RobustAgent:
    def execute_with_retry(self, step, max_retries=3):
        for attempt in range(max_retries):
            try:
                result = step.execute()
                if self.validate(result):
                    return result
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                self.log_retry(step, attempt, e)

## Break into checkpointed segments
# Human review at each segment
# Resume from last good checkpoint

```

---

### [CRITICAL] undefined

**Situation:** Running agents with growing conversation context

**Why it happens:**
Transformer costs scale quadratically with context length. Double
the context, quadruple the compute. A long-running agent that
re-sends its full conversation each turn can burn money exponentially.

Most agents append to context without trimming. Context grows:
- Turn 1: 500 tokens → $0.01
- Turn 10: 5000 tokens → $0.10
- Turn 50: 25000 tokens → $0.50
- Turn 100: 50000 tokens → $1.00+ per message


**Solution:**
```
## Set hard cost limits
class CostLimitedAgent:
    MAX_COST_PER_TASK = 1.00  # USD

    def __init__(self):
        self.total_cost = 0

    def before_call(self, estimated_tokens):
        estimated_cost = self.estimate_cost(estimated_tokens)
        if self.total_cost + estimated_cost > self.MAX_COST_PER_TASK:
            raise CostLimitExceeded(
                f"Would exceed ${self.MAX_COST_PER_TASK} limit"
            )

    def after_call(self, response):
        self.total_cost += self.calculate_actual_cost(response)

## Trim context aggressively
def trim_context(messages, max_tokens=4000):
    # Keep: system prompt + last N messages
    # Summarize: everything in between
    if count_tokens(messages) <= max_tokens:
        return messages

    system = messages[0]
    recent = messages[-5:]
    middle = messages[1:-5]

    if middle:
        summary = summarize(middle)  # Compress history
        return [system, summary] + recent

    return [system] + recent

## Use streaming to track costs in real-time
## Alert at 50% of budget, halt at 90%

```

---

### [CRITICAL] undefined

**Situation:** Moving from prototype to production

**Why it happens:**
Demos show the happy path with curated inputs. Production means:
- Unexpected inputs (typos, ambiguity, adversarial)
- Scale (1000 users, not 3)
- Reliability (99.9% uptime, not "usually works")
- Edge cases (the 1% that breaks everything)

The methodology is questionable, but the core problem is real.
The gap between a working demo and a reliable production system
is where projects die.


**Solution:**
```
## Test at scale before production
# Run 1000+ test cases, not 10
# Measure P95/P99 success rate, not average
# Include adversarial inputs

## Build observability first
import structlog
logger = structlog.get_logger()

class ObservableAgent:
    def execute(self, task):
        with logger.bind(task_id=task.id):
            logger.info("task_started")
            try:
                result = self._execute(task)
                logger.info("task_completed", result=result)
                return result
            except Exception as e:
                logger.error("task_failed", error=str(e))
                raise

## Have escape hatches
# Human takeover when confidence < threshold
# Graceful degradation to simpler behavior
# "I don't know" is a valid response

## Deploy incrementally
# 1% of traffic, then 10%, then 50%
# Monitor error rates at each stage

```

---

### [HIGH] undefined

**Situation:** Agent can't complete task with available information

**Why it happens:**
LLMs are trained to be helpful and produce plausible outputs. When
stuck, they don't say "I can't do this" - they fabricate. Autonomous
agents compound this by acting on fabricated data without human review.

The agent that fabricated expense entries was trying to meet its goal
(complete the expense report). It "solved" the problem by inventing data.


**Solution:**
```
## Validate against ground truth
def validate_expense(expense):
    # Cross-check with external sources
    if expense.restaurant:
        if not verify_restaurant_exists(expense.restaurant):
            raise ValidationError("Restaurant not found")

    # Check for suspicious patterns
    if expense.amount == round(expense.amount, -1):
        flag_for_review("Suspiciously round amount")

## Require evidence
system_prompt = '''
For every factual claim, cite the specific tool output that
supports it. If you cannot find supporting evidence, say
"I could not verify this" rather than guessing.
'''

## Use structured outputs
from pydantic import BaseModel

class VerifiedClaim(BaseModel):
    claim: str
    source: str  # Must reference tool output
    confidence: float

## Detect uncertainty
# Train to output confidence scores
# Flag low-confidence outputs for human review
# Never auto-execute on uncertain data

```

---

### [HIGH] undefined

**Situation:** Connecting agent to external systems

**Why it happens:**
The companies promising "autonomous agents that integrate with your
entire tech stack" haven't built production systems at scale.
Real integrations have:
- Rate limits (429 errors mid-task)
- Auth complexity (OAuth refresh, token expiry)
- Data format variations (API v1 vs v2)
- Partial failures (webhook received, processing failed)
- Eventual consistency (data not immediately available)


**Solution:**
```
## Build robust API clients
from tenacity import retry, stop_after_attempt, wait_exponential

class RobustAPIClient:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=60)
    )
    async def call(self, endpoint, data):
        response = await self.client.post(endpoint, json=data)
        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After", 60)
            await asyncio.sleep(int(retry_after))
            raise RateLimitError()
        return response

## Handle auth lifecycle
class TokenManager:
    def __init__(self):
        self.token = None
        self.expires_at = None

    async def get_token(self):
        if self.is_expired():
            self.token = await self.refresh_token()
        return self.token

    def is_expired(self):
        buffer = timedelta(minutes=5)  # Refresh early
        return datetime.now() > (self.expires_at - buffer)

## Use idempotency keys
# Every external action should be idempotent
# If agent retries, external system handles duplicate

## Design for partial failure
# Each step is independently recoverable
# Checkpoint before external calls
# Rollback capability for each integration

```

---

### [HIGH] undefined

**Situation:** Agent with broad permissions

**Why it happens:**
Agents optimize for their goal. Without guardrails, they'll take the
shortest path - even if that path is destructive. An agent told to
"clean up the database" might interpret that as "delete everything."

Broad permissions + autonomy + goal optimization = danger.


**Solution:**
```
## Least privilege principle
PERMISSIONS = {
    "research_agent": ["read_web", "read_docs"],
    "code_agent": ["read_file", "write_file", "run_tests"],
    "email_agent": ["read_email", "draft_email"],  # NOT send
    "admin_agent": ["all"],  # Rarely used
}

## Separate read/write permissions
# Agent can read anything
# Write requires explicit approval

## Dangerous actions require confirmation
DANGEROUS_ACTIONS = [
    "delete_*",
    "send_email",
    "transfer_money",
    "modify_production",
    "revoke_access",
]

async def execute_action(action):
    if matches_dangerous_pattern(action):
        approval = await request_human_approval(action)
        if not approval:
            return ActionRejected(action)
    return await actually_execute(action)

## Dry-run mode for testing
# Agent describes what it would do
# Human approves the plan
# Then agent executes

## Audit logging for everything
# Every action logged with context
# Who authorized it
# What changed
# How to reverse it

```

---

### [MEDIUM] undefined

**Situation:** Long-running agent tasks

**Why it happens:**
Every message, observation, and thought consumes context. Long tasks
exhaust the window. When context is truncated:
- System prompt gets dropped
- Early important context lost
- Agent loses coherence


**Solution:**
```
## Track context usage
class ContextManager:
    def __init__(self, max_tokens=100000):
        self.max_tokens = max_tokens
        self.messages = []

    def add(self, message):
        self.messages.append(message)
        self.maybe_compact()

    def maybe_compact(self):
        if self.token_count() > self.max_tokens * 0.8:
            self.compact()

    def compact(self):
        # Always keep: system prompt
        system = self.messages[0]

        # Always keep: last N messages
        recent = self.messages[-10:]

        # Summarize: everything else
        middle = self.messages[1:-10]
        if middle:
            summary = summarize_messages(middle)
            self.messages = [system, summary] + recent

## Use external memory
# Don't keep everything in context
# Store in vector DB, retrieve when needed
# See agent-memory-systems skill

## Hierarchical summarization
# Recent: full detail
# Medium: key points
# Old: compressed summary

```

---

### [MEDIUM] undefined

**Situation:** Agent fails mysteriously

**Why it happens:**
Agents make dozens of internal decisions. Without visibility into
each step, you're blind to failure modes. Production debugging
without traces is impossible.


**Solution:**
```
## Structured logging
import structlog

logger = structlog.get_logger()

class TracedAgent:
    def think(self, context):
        with logger.bind(step="think"):
            thought = self.llm.generate(context)
            logger.info("thought_generated",
                thought=thought,
                tokens=count_tokens(thought)
            )
            return thought

    def act(self, action):
        with logger.bind(step="act", action=action.name):
            logger.info("action_started")
            try:
                result = action.execute()
                logger.info("action_completed", result=result)
                return result
            except Exception as e:
                logger.error("action_failed", error=str(e))
                raise

## Use LangSmith or similar
from langsmith import trace

@trace
def agent_step(state):
    # Automatically traced with inputs/outputs
    return next_state

## Save full traces
# Every step, every decision
# Inputs and outputs
# Latency at each step
# Token usage

```

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `user needs multi-agent coordination` | multi-agent-orchestration | Multiple agents working together |
| `user needs to test/evaluate agent` | agent-evaluation | Benchmarking and testing |
| `user needs tools for agent` | agent-tool-builder | Tool design and implementation |
| `user needs persistent memory` | agent-memory-systems | Long-term memory architecture |
| `user needs workflow automation` | workflow-automation | When agent is overkill for the task |
| `user needs computer control` | computer-use-agents | GUI automation, screen interaction |

### Works Well With

- agent-tool-builder
- agent-memory-systems
- multi-agent-orchestration
- agent-evaluation

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/agents/autonomous-agents/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
