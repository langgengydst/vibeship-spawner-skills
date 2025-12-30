# Getting Started with Spawner Skills

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ⚡ VIBESHIP SPAWNER SKILLS                                    │
│   270+ Specialist Skills for AI-Powered Product Building        │
│                                                                 │
│   You're about to give Claude superpowers.                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What You Just Installed

```
~/.spawner/skills/
│
├── development/          # 57 skills
│   ├── backend/          # APIs, servers, Node.js
│   ├── frontend/         # React, UI components
│   ├── auth-specialist/  # OAuth, JWT, sessions
│   └── ...
│
├── ai/                   # 12 skills
│   ├── llm-architect/    # LLM integration patterns
│   ├── rag-specialist/   # Retrieval-augmented generation
│   └── ...
│
├── agents/               # 10 skills
│   ├── autonomous-agents/
│   └── multi-agent-orchestration/
│
└── ... (24 categories, 270+ total skills)
```

---

## How to Spawn a Skill

### Step 1: Tell Claude to Load the Skill

Copy and paste this into Claude:

```
Read these files and become a backend specialist:
~/.spawner/skills/development/backend/skill.yaml
~/.spawner/skills/development/backend/sharp-edges.yaml
```

### Step 2: Verify It's Working

After Claude reads the files, it should respond with something like:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ SKILL LOADED: Backend Specialist                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  I now have expertise in:                                       │
│  • REST API design patterns                                     │
│  • Node.js/Express/Fastify                                      │
│  • Database integration                                         │
│  • Authentication flows                                         │
│  • Error handling patterns                                      │
│                                                                 │
│  Sharp edges I'm watching for:                                  │
│  • N+1 query problems                                           │
│  • Missing input validation                                     │
│  • Insecure direct object references                            │
│                                                                 │
│  Ready to build. What do you want to create?                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If Claude doesn't show this visual confirmation**, tell it:

```
After loading a skill, always show a visual confirmation box like this:

┌─────────────────────────────────────────────────────────────────┐
│  ✓ SKILL LOADED: [Skill Name]                                  │
├─────────────────────────────────────────────────────────────────┤
│  I now have expertise in: [list key capabilities]               │
│  Sharp edges I'm watching for: [list gotchas]                   │
│  Ready to build.                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Spawn Commands

Copy-paste these to spawn common skills:

### Backend API Development
```
Read and become a backend specialist. Show a visual confirmation when loaded:
~/.spawner/skills/development/backend/skill.yaml
~/.spawner/skills/development/backend/sharp-edges.yaml
```

### Frontend UI Development
```
Read and become a frontend specialist. Show a visual confirmation when loaded:
~/.spawner/skills/development/frontend/skill.yaml
~/.spawner/skills/development/frontend/sharp-edges.yaml
```

### Full-Stack SaaS
```
Read these skills and become a full-stack SaaS expert. Show what you're now capable of:
~/.spawner/skills/development/backend/skill.yaml
~/.spawner/skills/development/frontend/skill.yaml
~/.spawner/skills/data/postgres-wizard/skill.yaml
~/.spawner/skills/integration/stripe-billing/skill.yaml
~/.spawner/skills/development/auth-specialist/skill.yaml
```

### AI Agent Building
```
Read these skills and become an AI agent architect. Show what you're now capable of:
~/.spawner/skills/agents/autonomous-agents/skill.yaml
~/.spawner/skills/agents/multi-agent-orchestration/skill.yaml
~/.spawner/skills/ai/llm-architect/skill.yaml
```

---

## Confirming It Works

### Test 1: Ask About Sharp Edges

After spawning a skill, ask:

```
What sharp edges should I watch out for with this stack?
```

If the skill loaded correctly, Claude will list specific gotchas from the sharp-edges.yaml file.

### Test 2: Ask for a Pattern

```
Show me the recommended pattern for [relevant task]
```

Claude should show patterns from the skill's best practices, not generic advice.

### Test 3: Build Something

```
Build me a [small example relevant to the skill]
```

Watch for:
- Does Claude follow the skill's patterns?
- Does it avoid the sharp edges?
- Does it mention skill-specific considerations?

---

## Visual Status Check

Ask Claude anytime:

```
Show me which skills are currently active
```

Claude should display:

```
┌─────────────────────────────────────────────────────────────────┐
│  ACTIVE SKILLS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Backend Specialist     (development/backend)                 │
│  ✓ PostgreSQL Wizard      (data/postgres-wizard)                │
│  ✓ Auth Specialist        (development/auth-specialist)         │
│                                                                 │
│  3 skills loaded | Session started 10 mins ago                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Common Workflows

### Building a SaaS Product

```
┌─────────────────────────────────────────────────────────────────┐
│  WORKFLOW: SaaS Product                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Spawn the skills                                       │
│  ────────────────────────                                       │
│  Read and become a full-stack SaaS expert:                      │
│  ~/.spawner/skills/development/backend/skill.yaml               │
│  ~/.spawner/skills/development/frontend/skill.yaml              │
│  ~/.spawner/skills/data/postgres-wizard/skill.yaml              │
│  ~/.spawner/skills/integration/stripe-billing/skill.yaml        │
│  ~/.spawner/skills/development/auth-specialist/skill.yaml       │
│                                                                 │
│  Step 2: Plan                                                   │
│  ────────────────────────                                       │
│  "Plan a SaaS for [your idea]. Show the architecture."          │
│                                                                 │
│  Step 3: Build                                                  │
│  ────────────────────────                                       │
│  "Build the [component]. Follow the skill patterns."            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Building AI Agents

```
┌─────────────────────────────────────────────────────────────────┐
│  WORKFLOW: AI Agent                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Spawn the skills                                       │
│  ────────────────────────                                       │
│  Read and become an AI agent architect:                         │
│  ~/.spawner/skills/agents/autonomous-agents/skill.yaml          │
│  ~/.spawner/skills/agents/multi-agent-orchestration/skill.yaml  │
│  ~/.spawner/skills/ai/llm-architect/skill.yaml                  │
│                                                                 │
│  Step 2: Design                                                 │
│  ────────────────────────                                       │
│  "Design an agent that [your goal]. Show the architecture."     │
│                                                                 │
│  Step 3: Build                                                  │
│  ────────────────────────                                       │
│  "Build the agent. Use the patterns from the skills."           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skill Categories

```
┌─────────────────────────────────────────────────────────────────┐
│  SKILL CATEGORIES                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  development     57 skills    Backend, frontend, auth, testing  │
│  marketing       33 skills    AI video, copy, SEO, content      │
│  strategy        15 skills    Growth, product, founder skills   │
│  integrations    14 skills    AWS, Stripe, Discord, Slack       │
│  ai-ml           12 skills    Code gen, image, safety           │
│  ai              12 skills    LLM, embeddings, RAG              │
│  agents          10 skills    Autonomous, multi-agent           │
│  mind            10 skills    Debugging, decision-making        │
│  data             8 skills    Postgres, Redis, vectors          │
│  hardware         6 skills    Embedded, FPGA, robotics          │
│  frameworks       6 skills    Next.js, Supabase, Svelte         │
│  finance          6 skills    Trading, DeFi, derivatives        │
│  enterprise       6 skills    Compliance, governance            │
│  biotech          6 skills    Genomics, drug discovery          │
│  + 10 more categories                                           │
│                                                                 │
│  Total: 270+ skills                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Claude doesn't seem different after loading the skill"

1. Make sure Claude actually read the files (check for any errors)
2. Ask explicitly: "What patterns from the backend skill should we use?"
3. Try: "Apply the sharp edges from your loaded skills to this code"

### "I'm not sure which skill to use"

List all skills:
```bash
npx vibeship-spawner-skills list
```

Or ask Claude:
```
I want to build [your goal]. Which skills from ~/.spawner/skills/ should I load?
```

### "How do I know skills are working?"

Ask Claude to show its active skills and demonstrate knowledge from them:
```
List your active skills and give me one specific insight from each
```

---

## Updating Skills

New skills are added regularly:

```bash
npx vibeship-spawner-skills update
```

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ UPDATE COMPLETE                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Skills updated: 273 → 278                                      │
│  New skills: 5                                                  │
│                                                                 │
│  • ai/vision-specialist                                         │
│  • agents/browser-use                                           │
│  • development/graphql-expert                                   │
│  • marketing/ai-podcasts                                        │
│  • integrations/vercel-v0                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│  SPAWNER SKILLS - QUICK REFERENCE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INSTALL         npx vibeship-spawner-skills install            │
│  UPDATE          npx vibeship-spawner-skills update             │
│  LIST            npx vibeship-spawner-skills list               │
│  STATUS          npx vibeship-spawner-skills status             │
│                                                                 │
│  SPAWN A SKILL   "Read: ~/.spawner/skills/[cat]/[skill]/*.yaml" │
│  CHECK ACTIVE    "Show me which skills are currently active"    │
│  TEST SKILL      "What sharp edges should I watch out for?"     │
│                                                                 │
│  DOCS            ~/.spawner/skills/GETTING_STARTED.md           │
│  GITHUB          github.com/vibeforge1111/vibeship-spawner-skills│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
