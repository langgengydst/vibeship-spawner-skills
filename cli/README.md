# vibeship-spawner-skills

CLI installer for VibeShip Spawner skills - 245 specialist skills for AI-powered product building.

## Quick Install

```bash
npx vibeship-spawner-skills install
```

This clones the skills repository to `~/.spawner/skills/`.

## Commands

| Command | Description |
|---------|-------------|
| `install` | Install skills to ~/.spawner/skills |
| `update` | Update skills to latest version |
| `status` | Check installation status |
| `list` | List installed skill categories |
| `help` | Show help message |

## Usage Examples

```bash
# First-time installation
npx vibeship-spawner-skills install

# Update to latest skills
npx vibeship-spawner-skills update

# Check if installed
npx vibeship-spawner-skills status

# List all categories
npx vibeship-spawner-skills list
```

## After Installation

Skills are available at: `~/.spawner/skills/`

Load skills in Claude by reading their YAML files:

```
Read: ~/.spawner/skills/development/backend/skill.yaml
Read: ~/.spawner/skills/development/backend/sharp-edges.yaml
```

## Skill Categories

- **development** (57 skills) - Backend, frontend, API, auth, testing
- **marketing** (33 skills) - Content, SEO, social, email
- **ai** (12 skills) - LLM, ML, embeddings, RAG
- **agents** (10 skills) - Autonomous agents, multi-agent systems
- **data** (8 skills) - PostgreSQL, Redis, data pipelines
- **mind** (10 skills) - Memory systems, context management
- And many more...

## Documentation

Full documentation: https://github.com/vibeforge1111/vibeship-spawner-skills

## License

MIT
