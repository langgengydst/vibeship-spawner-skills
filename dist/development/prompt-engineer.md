# Prompt Engineer

> Expert in designing effective prompts for LLM-powered applications. Masters
prompt structure, context management, output formatting, and prompt evaluation.


**Category:** development | **Version:** 1.0.0

**Tags:** prompts, llm, gpt, claude, system-prompt, few-shot, chain-of-thought, evaluation

---

## Identity

[object Object]

## Expertise Areas

- Prompt design and optimization
- System prompt architecture
- Context window management
- Output format specification
- Prompt testing and evaluation
- Few-shot example design

## Patterns

### Structured System Prompt
Well-organized system prompt with clear sections
**When:** Designing any LLM application
```
- Role: who the model is
- Context: relevant background
- Instructions: what to do
- Constraints: what NOT to do
- Output format: expected structure
- Examples: demonstration of correct behavior

```

### Few-Shot Examples
Include examples of desired behavior
**When:** Task is complex or has specific format
```
- Show 2-5 diverse examples
- Include edge cases in examples
- Match example difficulty to expected inputs
- Use consistent formatting across examples
- Include negative examples when helpful

```

### Chain-of-Thought
Request step-by-step reasoning
**When:** Complex reasoning or multi-step problems
```
- Ask model to think step by step
- Provide reasoning structure
- Request explicit intermediate steps
- Parse reasoning separately from answer
- Use for debugging model failures

```

### Output Schema
Specify exact output format
**When:** Need parseable, structured output
```
- Use JSON schema or XML tags
- Provide output example
- Include all required fields
- Specify types and constraints
- Validate output programmatically

```

### Prompt Decomposition
Break complex tasks into smaller prompts
**When:** Single prompt fails or is unreliable
```
- Identify distinct subtasks
- Create focused prompt per subtask
- Chain outputs as inputs
- Parallelize independent subtasks
- Aggregate results appropriately

```

### Evaluation Framework
Systematically test prompt changes
**When:** Optimizing prompt performance
```
- Create golden test set with expected outputs
- Define evaluation metrics (accuracy, format, etc.)
- Run A/B tests on prompt variations
- Track metrics over time
- Version control prompts like code

```


## Anti-Patterns

### Vague Instructions
Using imprecise language in prompts

### Kitchen Sink Prompt
Cramming everything into one prompt

### No Negative Instructions
Only saying what to do, not what to avoid

### Prompt Guessing
Changing prompts without measuring impact

### Context Overload
Including irrelevant context to be safe

### Format Ambiguity
Expecting specific format without specifying it


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Using imprecise language in prompts

**Situation:** Instructions like 'be helpful' or 'do a good job'

**Why it happens:**
LLMs interpret vague instructions differently than humans expect.
"Be concise" means different things to different models and contexts.
Without specific criteria, output varies unpredictably.


**Solution:**
```
Be explicit:
- "Respond in 2-3 sentences"
- "List exactly 5 items"
- "Use only information from the provided context"
- Test how model interprets your instructions

```

**Symptoms:**
- Output varies between runs
- Model doesn't do what you meant
- Works sometimes, fails sometimes

---

### [HIGH] Expecting specific format without specifying it

**Situation:** Wanting JSON but not requiring it in prompt

**Why it happens:**
Models default to natural language. Without explicit format requirements,
you get inconsistent structures that break parsing. Even with format
instructions, examples are more reliable than descriptions.


**Solution:**
```
Specify format explicitly:
- Include output schema or example
- Use JSON mode when available
- Show exact format in examples
- Validate output programmatically

```

**Symptoms:**
- Parse errors on model output
- Inconsistent JSON structure
- Model adds explanatory text

---

### [MEDIUM] Only saying what to do, not what to avoid

**Situation:** Prompts without explicit don'ts

**Why it happens:**
Models make predictable mistakes you could prevent. Without negative
instructions, they hallucinate, add unwanted content, or format
incorrectly. Don'ts are as important as dos.


**Solution:**
```
Include explicit don'ts:
- "Do NOT make up information"
- "Do NOT include explanatory text"
- "NEVER mention that you're an AI"
- Test for common failure modes

```

**Symptoms:**
- Model adds unwanted content
- Predictable but undesired behaviors
- Same mistakes repeatedly

---

### [MEDIUM] Changing prompts without measuring impact

**Situation:** Tweaking prompts based on intuition alone

**Why it happens:**
Prompt changes have non-obvious effects. A 'better' prompt by intuition
might actually hurt performance. Without measurement, you're guessing
and may be making things worse.


**Solution:**
```
Systematic evaluation:
- Create test set with expected outputs
- Measure before and after changes
- Track metrics over time
- A/B test significant changes

```

**Symptoms:**
- Performance regresses unexpectedly
- No idea if changes help
- Endless prompt tweaking

---

### [MEDIUM] Including irrelevant context 'just in case'

**Situation:** Stuffing all available information into prompt

**Why it happens:**
More context can dilute important information, confuse the model,
and increase costs. Models have attention limits - irrelevant content
competes with relevant content.


**Solution:**
```
Curate context:
- Include only relevant information
- Use retrieval for large docs
- Order context by importance
- Set relevance thresholds

```

**Symptoms:**
- Model ignores key information
- High token costs
- Answers drift with more context

---

### [MEDIUM] Biased or unrepresentative examples

**Situation:** Examples that don't represent expected inputs

**Why it happens:**
Models learn patterns from examples. If examples are biased toward
certain cases, the model performs poorly on others. Examples should
cover the expected distribution.


**Solution:**
```
Diverse examples:
- Include edge cases
- Cover expected input distribution
- Balance example types
- Include negative examples when helpful

```

**Symptoms:**
- Works on examples, fails on real inputs
- Biased toward certain outputs
- Narrow success patterns

---

### [MEDIUM] Using default temperature for all tasks

**Situation:** Not adjusting temperature for task type

**Why it happens:**
Temperature affects output determinism. High temperature for factual
tasks causes errors. Low temperature for creative tasks causes
repetitive, boring outputs.


**Solution:**
```
Task-appropriate temperature:
- 0-0.3 for factual/structured tasks
- 0.5-0.7 for balanced tasks
- 0.8-1.0 for creative tasks
- Test different values

```

**Symptoms:**
- Factual errors from high temperature
- Boring outputs from low temperature
- Inconsistent creative quality

---

### [HIGH] Not considering prompt injection in user input

**Situation:** Concatenating user input directly into prompt

**Why it happens:**
User input can contain instructions that override your prompt. This
is prompt injection - users can make the model ignore your instructions
and follow theirs instead.


**Solution:**
```
Defend against injection:
- Clearly delimit user input
- Use XML tags or quotes
- Instruction hierarchy (system > user)
- Validate/sanitize user input

```

**Symptoms:**
- Model follows user instructions over yours
- Unexpected behaviors with certain inputs
- Security issues in production

---

## Collaboration

### Works Well With

- ai-agents-architect
- rag-engineer
- backend
- product-manager

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/prompt-engineer/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
