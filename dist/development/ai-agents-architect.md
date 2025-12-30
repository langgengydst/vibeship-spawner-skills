# AI Agents Architect

> Expert in designing and building autonomous AI agents. Masters tool use,
memory systems, planning strategies, and multi-agent orchestration.


**Category:** development | **Version:** 1.0.0

**Tags:** ai-agents, langchain, autogen, crewai, tool-use, function-calling, autonomous, llm, orchestration

---

## Identity

[object Object]

## Expertise Areas

- Agent architecture design
- Tool and function calling
- Agent memory systems
- Planning and reasoning strategies
- Multi-agent orchestration
- Agent evaluation and debugging

## Patterns

### ReAct Loop
Reason-Act-Observe cycle for step-by-step execution
**When:** Simple tool use with clear action-observation flow
```
- Thought: reason about what to do next
- Action: select and invoke a tool
- Observation: process tool result
- Repeat until task complete or stuck
- Include max iteration limits

```

### Plan-and-Execute
Plan first, then execute steps
**When:** Complex tasks requiring multi-step planning
```
- Planning phase: decompose task into steps
- Execution phase: execute each step
- Replanning: adjust plan based on results
- Separate planner and executor models possible

```

### Tool Registry
Dynamic tool discovery and management
**When:** Many tools or tools that change at runtime
```
- Register tools with schema and examples
- Tool selector picks relevant tools for task
- Lazy loading for expensive tools
- Usage tracking for optimization

```

### Hierarchical Memory
Multi-level memory for different purposes
**When:** Long-running agents needing context
```
- Working memory: current task context
- Episodic memory: past interactions/results
- Semantic memory: learned facts and patterns
- Use RAG for retrieval from long-term memory

```

### Supervisor Pattern
Supervisor agent orchestrates specialist agents
**When:** Complex tasks requiring multiple skills
```
- Supervisor decomposes and delegates
- Specialists have focused capabilities
- Results aggregated by supervisor
- Error handling at supervisor level

```

### Checkpoint Recovery
Save state for resumption after failures
**When:** Long-running tasks that may fail
```
- Checkpoint after each successful step
- Store task state, memory, and progress
- Resume from last checkpoint on failure
- Clean up checkpoints on completion

```


## Anti-Patterns

### Unlimited Autonomy
Letting agents run without guardrails

### Tool Overload
Giving agent too many tools

### Memory Hoarding
Storing everything in agent memory

### Brittle Tool Definitions
Vague or incomplete tool descriptions

### Silent Failures
Catching errors without surfacing them

### Premature Multi-Agent
Using multiple agents when one suffices


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Agent loops without iteration limits

**Situation:** Agent runs until 'done' without max iterations

**Why it happens:**
Agents can get stuck in loops, repeating the same actions, or spiral
into endless tool calls. Without limits, this drains API credits,
hangs the application, and frustrates users.


**Solution:**
```
Always set limits:
- max_iterations on agent loops
- max_tokens per turn
- timeout on agent runs
- cost caps for API usage
- Circuit breakers for tool failures

```

**Symptoms:**
- Agent runs forever
- Unexplained high API costs
- Application hangs

---

### [HIGH] Vague or incomplete tool descriptions

**Situation:** Tool descriptions don't explain when/how to use

**Why it happens:**
Agents choose tools based on descriptions. Vague descriptions lead to
wrong tool selection, misused parameters, and errors. The agent
literally can't know what it doesn't see in the description.


**Solution:**
```
Write complete tool specs:
- Clear one-sentence purpose
- When to use (and when not to)
- Parameter descriptions with types
- Example inputs and outputs
- Error cases to expect

```

**Symptoms:**
- Agent picks wrong tools
- Parameter errors
- Agent says it can't do things it can

---

### [HIGH] Tool errors not surfaced to agent

**Situation:** Catching tool exceptions silently

**Why it happens:**
When tool errors are swallowed, the agent continues with bad or missing
data, compounding errors. The agent can't recover from what it can't
see. Silent failures become loud failures later.


**Solution:**
```
Explicit error handling:
- Return error messages to agent
- Include error type and recovery hints
- Let agent retry or choose alternative
- Log errors for debugging

```

**Symptoms:**
- Agent continues with wrong data
- Final answers are wrong
- Hard to debug failures

---

### [MEDIUM] Storing everything in agent memory

**Situation:** Appending all observations to memory without filtering

**Why it happens:**
Memory fills with irrelevant details, old information, and noise.
This bloats context, increases costs, and can cause the model to
lose focus on what matters.


**Solution:**
```
Selective memory:
- Summarize rather than store verbatim
- Filter by relevance before storing
- Use RAG for long-term memory
- Clear working memory between tasks

```

**Symptoms:**
- Context window exceeded
- Agent references outdated info
- High token costs

---

### [MEDIUM] Agent has too many tools

**Situation:** Giving agent 20+ tools for flexibility

**Why it happens:**
More tools means more confusion. The agent must read and consider all
tool descriptions, increasing latency and error rate. Long tool lists
get cut off or poorly understood.


**Solution:**
```
Curate tools per task:
- 5-10 tools maximum per agent
- Use tool selection layer for large tool sets
- Specialized agents with focused tools
- Dynamic tool loading based on task

```

**Symptoms:**
- Wrong tool selection
- Agent overwhelmed by options
- Slow responses

---

### [MEDIUM] Using multiple agents when one would work

**Situation:** Starting with multi-agent architecture for simple tasks

**Why it happens:**
Multi-agent adds coordination overhead, communication failures,
debugging complexity, and cost. Each agent handoff is a potential
failure point. Start simple, add agents only when proven necessary.


**Solution:**
```
Justify multi-agent:
- Can one agent with good tools solve this?
- Is the coordination overhead worth it?
- Are the agents truly independent?
- Start with single agent, measure limits

```

**Symptoms:**
- Agents duplicating work
- Communication overhead
- Hard to debug failures

---

### [MEDIUM] Agent internals not logged or traceable

**Situation:** Running agents without logging thoughts/actions

**Why it happens:**
When agents fail, you need to see what they were thinking, which
tools they tried, and where they went wrong. Without observability,
debugging is guesswork.


**Solution:**
```
Implement tracing:
- Log each thought/action/observation
- Track tool calls with inputs/outputs
- Trace token usage and latency
- Use structured logging for analysis

```

**Symptoms:**
- Can't explain agent failures
- No visibility into agent reasoning
- Debugging takes hours

---

### [MEDIUM] Fragile parsing of agent outputs

**Situation:** Regex or exact string matching on LLM output

**Why it happens:**
LLMs don't produce perfectly consistent output. Minor format variations
break brittle parsers. This causes agent crashes or incorrect behavior
from parsing errors.


**Solution:**
```
Robust output handling:
- Use structured output (JSON mode, function calling)
- Fuzzy matching for actions
- Retry with format instructions on parse failure
- Handle multiple output formats

```

**Symptoms:**
- Parse errors in agent loop
- Works sometimes, fails sometimes
- Small prompt changes break parsing

---

## Collaboration

### Works Well With

- rag-engineer
- prompt-engineer
- backend
- mcp-builder

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/ai-agents-architect/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
