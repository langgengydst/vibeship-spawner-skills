#!/usr/bin/env node

/**
 * build-dist.js
 *
 * Generates single SKILL.md files from deep skill format for marketplace compatibility.
 * Source (deep format) remains in category folders, generated files go to /dist.
 *
 * Usage:
 *   node scripts/build-dist.js          # Build all skills
 *   node scripts/build-dist.js backend  # Build specific skill
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SKILLS_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(SKILLS_ROOT, 'dist');

// Categories to process (skip non-skill directories)
const SKIP_DIRS = ['cli', 'scripts', 'dist', '.git', 'node_modules'];

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function log(msg, color = '') {
  console.log(`${color}${msg}${colors.reset}`);
}

/**
 * Read and parse YAML file, returns null if doesn't exist
 * Falls back to regex extraction for files with embedded template literals
 */
function readYaml(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      return yaml.load(content);
    } catch (yamlErr) {
      // Fallback: extract key fields using regex for files with template literals
      log(`  Fallback parsing ${path.basename(filePath)}...`, colors.dim);
      return extractYamlFields(content);
    }
  } catch (err) {
    log(`  Warning: Failed to read ${filePath}: ${err.message}`, colors.yellow);
    return null;
  }
}

/**
 * Extract key YAML fields using regex when js-yaml fails
 * Handles files with embedded backticks/template literals
 */
function extractYamlFields(content) {
  const extracted = {};

  // Extract simple string fields
  const simpleFields = ['id', 'name', 'category', 'version', 'skill_id', 'difficulty'];
  for (const field of simpleFields) {
    const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    if (match) {
      extracted[field] = match[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // Extract description (multiline)
  const descMatch = content.match(/^description:\s*\|?\s*\n((?:[ ]{2,}.+\n?)+)/m);
  if (descMatch) {
    extracted.description = descMatch[1].replace(/^[ ]{2,}/gm, '').trim();
  }

  // Extract tags array
  const tagsMatch = content.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (tagsMatch) {
    extracted.tags = tagsMatch[1].match(/-\s+["']?([^"'\n]+)["']?/g)
      ?.map(t => t.replace(/^-\s+["']?|["']?$/g, '').trim()) || [];
  }

  // Extract triggers array
  const triggersMatch = content.match(/^triggers:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (triggersMatch) {
    extracted.triggers = triggersMatch[1].match(/-\s+["']?([^"'\n]+)["']?/g)
      ?.map(t => t.replace(/^-\s+["']?|["']?$/g, '').trim()) || [];
  }

  // Extract provides array
  const providesMatch = content.match(/^provides:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (providesMatch) {
    extracted.provides = providesMatch[1].match(/-\s+["']?([^"'\n]+)["']?/g)
      ?.map(t => t.replace(/^-\s+["']?|["']?$/g, '').trim()) || [];
  }

  // Mark that patterns exist (don't try to parse the complex structure)
  if (content.includes('patterns:')) {
    extracted.patterns = [{ name: 'See full skill for patterns', description: 'Contains implementation patterns with code examples' }];
  }

  // Mark that anti_patterns exist
  if (content.includes('anti_patterns:')) {
    extracted.anti_patterns = [{ name: 'See full skill for anti-patterns', description: 'Contains anti-patterns with examples' }];
  }

  // Extract handoffs
  const handoffsSection = content.match(/^handoffs:\s*\n((?:\s+-[\s\S]*?)(?=\n\w|\n*$))/m);
  if (handoffsSection) {
    extracted.handoffs = [{ to: 'various', when: 'See full skill' }];
  }

  // Extract references
  const refsMatch = content.match(/^references:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (refsMatch) {
    extracted.references = refsMatch[1].match(/-\s+["']?([^"'\n]+)["']?/g)
      ?.map(t => t.replace(/^-\s+["']?|["']?$/g, '').trim()) || [];
  }

  return Object.keys(extracted).length > 0 ? extracted : null;
}

/**
 * Read markdown file, returns null if doesn't exist
 */
function readMarkdown(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

/**
 * Format sharp edges from YAML to markdown
 */
function formatSharpEdgesYaml(sharpEdgesData) {
  if (!sharpEdgesData || !sharpEdgesData.sharp_edges) return '';

  const edges = sharpEdgesData.sharp_edges;
  let md = '';

  for (const edge of edges.slice(0, 10)) { // Limit to top 10 for readability
    const severity = edge.severity ? `[${edge.severity.toUpperCase()}]` : '';
    md += `### ${severity} ${edge.summary}\n\n`;

    if (edge.situation) {
      md += `**Situation:** ${edge.situation}\n\n`;
    }

    if (edge.why) {
      md += `**Why it happens:**\n${edge.why}\n\n`;
    }

    if (edge.solution) {
      md += `**Solution:**\n\`\`\`\n${edge.solution}\n\`\`\`\n\n`;
    }

    if (edge.symptoms && edge.symptoms.length > 0) {
      md += `**Symptoms:**\n${edge.symptoms.map(s => `- ${s}`).join('\n')}\n\n`;
    }

    md += '---\n\n';
  }

  return md;
}

/**
 * Format collaboration from YAML to markdown
 */
function formatCollaborationYaml(collabData) {
  if (!collabData) return '';

  let md = '';

  // Delegation triggers
  if (collabData.delegation_triggers && collabData.delegation_triggers.length > 0) {
    md += '### When to Hand Off\n\n';
    md += '| Trigger | Delegate To | Context |\n';
    md += '|---------|-------------|--------|\n';

    for (const trigger of collabData.delegation_triggers.slice(0, 8)) {
      const triggerPattern = trigger.trigger || '';
      const delegateTo = trigger.delegate_to || '';
      const context = trigger.context || '';
      md += `| \`${triggerPattern}\` | ${delegateTo} | ${context} |\n`;
    }
    md += '\n';
  }

  // Receives from
  if (collabData.receives_from && collabData.receives_from.length > 0) {
    md += '### Receives Work From\n\n';
    for (const source of collabData.receives_from.slice(0, 5)) {
      md += `- **${source.skill}**: ${source.context || ''}\n`;
    }
    md += '\n';
  }

  return md;
}

/**
 * Format patterns from skill.yaml if no patterns.md exists
 */
function formatPatternsFromSkillYaml(skillData) {
  if (!skillData || !skillData.patterns) return '';
  if (!Array.isArray(skillData.patterns)) return '';

  let md = '';
  for (const pattern of skillData.patterns) {
    if (typeof pattern === 'string') {
      md += `- ${pattern}\n`;
    } else if (pattern.name) {
      md += `### ${pattern.name}\n`;
      if (pattern.description) md += `${pattern.description}\n`;
      if (pattern.when) md += `**When:** ${pattern.when}\n`;
      if (pattern.implementation) md += `\`\`\`\n${pattern.implementation}\n\`\`\`\n`;
      md += '\n';
    }
  }
  return md;
}

/**
 * Format anti-patterns from skill.yaml if no anti-patterns.md exists
 */
function formatAntiPatternsFromSkillYaml(skillData) {
  if (!skillData || !skillData.anti_patterns) return '';
  if (!Array.isArray(skillData.anti_patterns)) return '';

  let md = '';
  for (const anti of skillData.anti_patterns) {
    if (typeof anti === 'string') {
      md += `- ${anti}\n`;
    } else if (anti.name) {
      md += `### ${anti.name}\n`;
      if (anti.description) md += `${anti.description}\n`;
      if (anti.why_bad) md += `**Why it's bad:** ${anti.why_bad}\n`;
      if (anti.instead) md += `**Instead:** ${anti.instead}\n`;
      md += '\n';
    }
  }
  return md;
}

/**
 * Generate SKILL.md content for a skill
 */
function generateSkillMd(skillPath, category, skillName) {
  // Read all source files
  const skillYaml = readYaml(path.join(skillPath, 'skill.yaml'));
  const sharpEdgesYaml = readYaml(path.join(skillPath, 'sharp-edges.yaml'));
  const collaborationYaml = readYaml(path.join(skillPath, 'collaboration.yaml'));
  const validationsYaml = readYaml(path.join(skillPath, 'validations.yaml'));

  const patternsMd = readMarkdown(path.join(skillPath, 'patterns.md'));
  const antiPatternsMd = readMarkdown(path.join(skillPath, 'anti-patterns.md'));
  const sharpEdgesMd = readMarkdown(path.join(skillPath, 'sharp-edges.md'));
  const decisionsMd = readMarkdown(path.join(skillPath, 'decisions.md'));

  if (!skillYaml) {
    log(`  Skipping ${skillName}: no skill.yaml found`, colors.yellow);
    return null;
  }

  // Build the SKILL.md content
  let md = '';

  // Header
  const name = skillYaml.name || skillName;
  const description = skillYaml.description || '';
  const version = skillYaml.version || '1.0.0';

  md += `# ${name}\n\n`;
  md += `> ${description}\n\n`;
  md += `**Category:** ${category} | **Version:** ${version}\n\n`;

  // Tags
  if (skillYaml.tags && skillYaml.tags.length > 0) {
    md += `**Tags:** ${skillYaml.tags.join(', ')}\n\n`;
  }

  md += '---\n\n';

  // Identity
  if (skillYaml.identity) {
    md += '## Identity\n\n';
    md += `${skillYaml.identity}\n\n`;
  }

  // Owns
  if (skillYaml.owns && skillYaml.owns.length > 0) {
    md += '## Expertise Areas\n\n';
    md += skillYaml.owns.map(o => `- ${o}`).join('\n');
    md += '\n\n';
  }

  // Patterns
  md += '## Patterns\n\n';
  if (patternsMd) {
    // Use the dedicated patterns.md file (strip the header if present)
    const patternsContent = patternsMd.replace(/^#\s+Patterns:.*\n+/m, '').trim();
    md += `${patternsContent}\n\n`;
  } else if (skillYaml.patterns) {
    md += formatPatternsFromSkillYaml(skillYaml);
    md += '\n';
  } else {
    md += '*Patterns documented in full version.*\n\n';
  }

  // Anti-patterns
  if (antiPatternsMd || (skillYaml.anti_patterns && skillYaml.anti_patterns.length > 0)) {
    md += '## Anti-Patterns\n\n';
    if (antiPatternsMd) {
      const antiContent = antiPatternsMd.replace(/^#\s+Anti-Patterns:.*\n+/m, '').trim();
      md += `${antiContent}\n\n`;
    } else {
      md += formatAntiPatternsFromSkillYaml(skillYaml);
      md += '\n';
    }
  }

  // Sharp Edges (Gotchas)
  md += '## Sharp Edges (Gotchas)\n\n';
  md += '*Real production issues that cause outages and bugs.*\n\n';
  if (sharpEdgesMd) {
    // Use dedicated sharp-edges.md
    const sharpContent = sharpEdgesMd.replace(/^#\s+Sharp Edges:.*\n+/m, '').trim();
    md += `${sharpContent}\n\n`;
  } else if (sharpEdgesYaml) {
    md += formatSharpEdgesYaml(sharpEdgesYaml);
  } else {
    md += '*Sharp edges documented in full version.*\n\n';
  }

  // Decisions (if exists)
  if (decisionsMd) {
    md += '## Decision Framework\n\n';
    const decisionsContent = decisionsMd.replace(/^#\s+Decisions:.*\n+/m, '').trim();
    md += `${decisionsContent}\n\n`;
  }

  // Collaboration
  if (collaborationYaml) {
    md += '## Collaboration\n\n';
    md += formatCollaborationYaml(collaborationYaml);
  }

  // Pairs with
  if (skillYaml.pairs_with && skillYaml.pairs_with.length > 0) {
    md += '### Works Well With\n\n';
    md += skillYaml.pairs_with.map(p => `- ${p}`).join('\n');
    md += '\n\n';
  }

  // Footer with CTA
  md += '---\n\n';
  md += '## Get the Full Version\n\n';
  md += 'This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** ';
  md += 'that work with the Spawner orchestrator.\n\n';
  md += '```bash\n';
  md += 'npx vibeship-spawner-skills install\n';
  md += '```\n\n';
  md += `Full skill path: \`~/.spawner/skills/${category}/${skillName}/\`\n\n`;
  md += '**Includes:**\n';
  md += '- `skill.yaml` - Structured skill definition\n';
  md += '- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns\n';
  md += '- `validations.yaml` - Automated code checks\n';
  md += '- `collaboration.yaml` - Handoff triggers for skill orchestration\n';

  if (patternsMd || antiPatternsMd || sharpEdgesMd) {
    md += '\n**Deep content:**\n';
    if (patternsMd) md += '- `patterns.md` - Comprehensive pattern library\n';
    if (antiPatternsMd) md += '- `anti-patterns.md` - What to avoid and why\n';
    if (sharpEdgesMd) md += '- `sharp-edges.md` - Detailed gotcha documentation\n';
    if (decisionsMd) md += '- `decisions.md` - Decision frameworks\n';
  }

  md += '\n---\n\n';
  md += '*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*\n';

  return md;
}

/**
 * Get all categories (top-level directories that contain skills)
 */
function getCategories() {
  return fs.readdirSync(SKILLS_ROOT)
    .filter(f => {
      const fullPath = path.join(SKILLS_ROOT, f);
      return fs.statSync(fullPath).isDirectory() &&
             !SKIP_DIRS.includes(f) &&
             !f.startsWith('.');
    })
    .sort();
}

/**
 * Get all skills in a category
 */
function getSkillsInCategory(category) {
  const categoryPath = path.join(SKILLS_ROOT, category);
  return fs.readdirSync(categoryPath)
    .filter(f => {
      const skillPath = path.join(categoryPath, f);
      // Must be a directory with skill.yaml
      return fs.statSync(skillPath).isDirectory() &&
             fs.existsSync(path.join(skillPath, 'skill.yaml'));
    })
    .sort();
}

/**
 * Build all skills or a specific one
 */
function build(specificSkill = null) {
  log('\nVibeShip Spawner - SKILL.md Generator\n', colors.blue);

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const categories = getCategories();
  let totalGenerated = 0;
  let totalSkipped = 0;

  for (const category of categories) {
    const skills = getSkillsInCategory(category);

    if (skills.length === 0) continue;

    // Create category directory in dist
    const distCategoryPath = path.join(DIST_DIR, category);
    if (!fs.existsSync(distCategoryPath)) {
      fs.mkdirSync(distCategoryPath, { recursive: true });
    }

    for (const skillName of skills) {
      // If specific skill requested, skip others
      if (specificSkill && skillName !== specificSkill) continue;

      const skillPath = path.join(SKILLS_ROOT, category, skillName);
      const content = generateSkillMd(skillPath, category, skillName);

      if (content) {
        const outputPath = path.join(distCategoryPath, `${skillName}.md`);
        fs.writeFileSync(outputPath, content, 'utf8');
        log(`  ${colors.green}✓${colors.reset} ${category}/${skillName}.md`);
        totalGenerated++;
      } else {
        totalSkipped++;
      }
    }
  }

  log(`\n${colors.green}Generated:${colors.reset} ${totalGenerated} skills`);
  if (totalSkipped > 0) {
    log(`${colors.yellow}Skipped:${colors.reset} ${totalSkipped} skills`);
  }
  log(`${colors.dim}Output:${colors.reset} ${DIST_DIR}\n`);
}

// Main
const args = process.argv.slice(2);
const specificSkill = args[0];

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  node scripts/build-dist.js          Build all skills
  node scripts/build-dist.js backend  Build specific skill
  node scripts/build-dist.js --help   Show this help

Output:
  Generated SKILL.md files go to /dist/{category}/{skill}.md
`);
  process.exit(0);
}

build(specificSkill);
