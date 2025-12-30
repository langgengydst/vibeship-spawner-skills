# Spawner Skills

**273+ skills** for Claude Code. Zero cost, works offline.

## Quick Start

```bash
# One-command install
npx vibeship-spawner-skills install

# Update to latest
npx vibeship-spawner-skills update
```

### Alternative: Manual Clone

```bash
# Clone to your home directory
git clone https://github.com/vibeforge1111/vibeship-spawner-skills ~/.spawner/skills

# Update skills
cd ~/.spawner/skills && git pull
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `npx vibeship-spawner-skills install` | Install skills to ~/.spawner/skills |
| `npx vibeship-spawner-skills update` | Update to latest version |
| `npx vibeship-spawner-skills status` | Check installation status |
| `npx vibeship-spawner-skills list` | List installed categories |

## After Installation

**[Read the Getting Started Guide](GETTING_STARTED.md)** for:
- How to load skills in Claude
- Common workflows (SaaS, AI agents, marketing)
- Best practices
- Using skill packs

## How It Works

1. You install skills locally with `npx vibeship-spawner-skills install`
2. Tell Claude to read a skill: `Read: ~/.spawner/skills/development/backend/skill.yaml`
3. Claude now has specialist knowledge - ask it to build something!

## Skill Categories (24)

| Category | Count | Description |
|----------|-------|-------------|
| development | 57 | Backend, frontend, devops, security, testing |
| marketing | 33 | AI video, copywriting, SEO, content |
| strategy | 15 | Product strategy, growth, founder skills |
| integrations | 14 | AWS, GCP, Stripe, Discord, Slack, Twilio |
| ai-ml | 12 | Code generation, image editing, safety |
| ai | 12 | LLM architect, fine-tuning, NLP |
| agents | 10 | Autonomous agents, browser automation |
| mind | 10 | Debugging, decision-making, system design |
| data | 8 | Postgres, Redis, vectors, graphs |
| hardware | 6 | Embedded, FPGA, robotics, sensors |
| frameworks | 6 | Next.js, React, Svelte, Supabase |
| finance | 6 | Algo trading, DeFi, derivatives |
| enterprise | 6 | Compliance, governance, architecture |
| biotech | 6 | Genomics, drug discovery, lab automation |
| space | 5 | Orbital mechanics, mission planning |
| simulation | 5 | Monte Carlo, digital twin, physics |
| legal | 5 | Contracts, GDPR, patents, SOX |
| communications | 5 | Dev comms, crisis, stakeholder |
| climate | 5 | Carbon, energy, sustainability |
| science | 4 | Experimental design, statistics |
| product | 4 | A/B testing, analytics, PM |
| integration | 4 | Auth, email, Stripe, Vercel |
| design | 4 | UI, UX, branding, landing pages |
| startup | 3 | YC playbook, founder mode |

## Skill Packs

| Pack | Description |
|------|-------------|
| `essentials` | Core skills for building apps (auto-installed) |
| `agents` | Autonomous agents and automation |
| `enterprise` | Compliance and governance |
| `finance` | Trading and fintech |
| `mind` | Debugging and decision-making |
| `specialized` | Biotech, space, climate, hardware |
| `complete` | All 273 skills |

## Directory Structure

```
~/.spawner/skills/
├── registry.yaml          # Pack definitions
├── development/           # 57 skills
├── marketing/             # 33 skills
├── strategy/              # 15 skills
├── integrations/          # 14 skills (AWS, Stripe, etc.)
├── ai-ml/                 # 12 skills
├── ai/                    # 12 skills
├── agents/                # 10 skills
├── mind/                  # 10 skills
├── data/                  # 8 skills
├── hardware/              # 6 skills
├── frameworks/            # 6 skills
├── finance/               # 6 skills
├── enterprise/            # 6 skills
├── biotech/               # 6 skills
├── space/                 # 5 skills
├── simulation/            # 5 skills
├── legal/                 # 5 skills
├── communications/        # 5 skills
├── climate/               # 5 skills
├── science/               # 4 skills
├── product/               # 4 skills
├── integration/           # 4 skills
├── design/                # 4 skills
└── startup/               # 3 skills
```

## Skill Format

Each skill has 4 YAML files:

```
backend/
├── skill.yaml           # Identity, patterns, anti-patterns
├── sharp-edges.yaml     # Gotchas and warnings
├── validations.yaml     # Code checks
└── collaboration.yaml   # Handoffs and prerequisites
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or improve skills.

## License

MIT
