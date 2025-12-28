# Spawner Skills

Local skill packs for Claude Code. Zero cost, works offline.

## Quick Start

Skills are auto-installed when you first use Spawner. No manual setup needed.

**If you need to manually install/update:**

```bash
# Clone to your home directory
git clone https://github.com/vibeforge1111/vibeship-spawner-skills ~/.spawner/skills

# Update skills
cd ~/.spawner/skills && git pull
```

## How It Works

1. You chat with Claude using Spawner
2. Claude reads skills directly from `~/.spawner/skills/`
3. No API calls for skill loading = free, fast, offline

## Skill Categories (148 Total)

| Category | Skills | Description |
|----------|--------|-------------|
| `development` | 43 | Backend, frontend, devops, security, testing |
| `marketing` | 33 | AI video, copywriting, SEO, growth |
| `mind-v5` | 22 | Memory system, semantic search, context management |
| `strategy` | 10 | Product strategy, growth, founder skills |
| `data` | 9 | Postgres, Redis, vectors, graphs, job queues |
| `integration` | 8 | Stripe, email, queues, webhooks, auth |
| `frameworks` | 6 | Next.js, React, Svelte, Tailwind |
| `ai` | 4 | LLM architect, ML memory, RAG |
| `design` | 4 | UI, UX, branding, landing pages |
| `product` | 4 | Analytics, A/B testing, PM |
| `startup` | 3 | YC playbook, founder mode, burn rate |
| `communications` | 2 | Dev comms, community building |

## Directory Structure

```
~/.spawner/skills/
├── registry.yaml          # Pack definitions
├── development/           # Backend, frontend, devops, etc.
├── data/                  # Databases, vectors, graphs, job queues
├── ai/                    # LLM, ML, embeddings
├── design/                # UI, UX, branding
├── frameworks/            # React, Next.js, Vue, etc.
├── marketing/             # Growth, content, SEO
├── mind-v5/               # Memory system, semantic search
├── startup/               # YC, fundraising, founder
├── strategy/              # Business, market analysis
├── communications/        # Writing, pitching
├── integration/           # APIs, webhooks, queues
└── product/               # PM, roadmapping
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
