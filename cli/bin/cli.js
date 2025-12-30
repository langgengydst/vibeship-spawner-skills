#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_URL = 'https://github.com/vibeforge1111/vibeship-spawner-skills.git';
const SKILLS_DIR = path.join(os.homedir(), '.spawner', 'skills');
const SPAWNER_DIR = path.join(os.homedir(), '.spawner');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

// Terminal hyperlink (OSC 8) - makes text clickable in supported terminals
function hyperlink(url, text) {
  // Check if terminal supports hyperlinks (most modern terminals do)
  const supportsHyperlinks = process.env.TERM_PROGRAM || process.env.WT_SESSION || process.env.COLORTERM;
  if (supportsHyperlinks) {
    return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
  }
  return text;
}

// Convert file path to file:// URL
function fileUrl(filePath) {
  // Handle Windows paths
  const normalizedPath = filePath.replace(/\\/g, '/');
  return `file://${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
}

function log(msg, color = '') {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function logStep(step, msg) {
  log(`\n${COLORS.cyan}[${step}]${COLORS.reset} ${msg}`);
}

function logSuccess(msg) {
  log(`${COLORS.green}✓${COLORS.reset} ${msg}`);
}

function logError(msg) {
  log(`${COLORS.red}✗${COLORS.reset} ${msg}`);
}

function logInfo(msg) {
  log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`);
}

function checkGitInstalled() {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function skillsExist() {
  return fs.existsSync(SKILLS_DIR) && fs.existsSync(path.join(SKILLS_DIR, '.git'));
}

function countSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return 0;

  let count = 0;
  const categories = fs.readdirSync(SKILLS_DIR).filter(f => {
    const fullPath = path.join(SKILLS_DIR, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.') && f !== 'scripts' && f !== 'cli';
  });

  for (const category of categories) {
    const categoryPath = path.join(SKILLS_DIR, category);
    const skills = fs.readdirSync(categoryPath).filter(f => {
      const skillPath = path.join(categoryPath, f);
      return fs.statSync(skillPath).isDirectory();
    });
    count += skills.length;
  }

  return count;
}

function printBanner() {
  console.log(`
${COLORS.magenta}┌─────────────────────────────────────────────────────────┐${COLORS.reset}
${COLORS.magenta}│${COLORS.reset}                                                         ${COLORS.magenta}│${COLORS.reset}
${COLORS.magenta}│${COLORS.reset}   ${COLORS.bright}VIBESHIP SPAWNER SKILLS${COLORS.reset}                              ${COLORS.magenta}│${COLORS.reset}
${COLORS.magenta}│${COLORS.reset}   ${COLORS.cyan}Specialist Skills for AI-Powered Product Building${COLORS.reset}     ${COLORS.magenta}│${COLORS.reset}
${COLORS.magenta}│${COLORS.reset}                                                         ${COLORS.magenta}│${COLORS.reset}
${COLORS.magenta}└─────────────────────────────────────────────────────────┘${COLORS.reset}
`);
}

function printUsage() {
  console.log(`
${COLORS.bright}Usage:${COLORS.reset}
  npx vibeship-spawner-skills <command>

${COLORS.bright}Commands:${COLORS.reset}
  install              Install skills to ~/.spawner/skills
  update               Update skills to latest version
  status               Check installation status
  list                 List installed skill categories
  list <category>      List all skills in a category
  list --all           List all 273 skills
  help                 Show this help message

${COLORS.bright}Examples:${COLORS.reset}
  npx vibeship-spawner-skills install           # First-time installation
  npx vibeship-spawner-skills update            # Pull latest skills
  npx vibeship-spawner-skills list development  # Show all 57 dev skills
  npx vibeship-spawner-skills list --all        # Show all 273 skills

${COLORS.bright}After Installation:${COLORS.reset}
  Skills are available at: ~/.spawner/skills/

  Load skills in Claude:
    Read: ~/.spawner/skills/development/backend/skill.yaml
    Read: ~/.spawner/skills/development/backend/sharp-edges.yaml

${COLORS.bright}Skill Categories:${COLORS.reset}
  development, data, ai, agents, marketing, design, enterprise,
  finance, mind, frameworks, startup, strategy, and more...

${COLORS.bright}Documentation:${COLORS.reset}
  https://github.com/vibeforge1111/vibeship-spawner-skills
`);
}

async function install() {
  logStep('1/3', 'Checking prerequisites...');

  if (!checkGitInstalled()) {
    logError('Git is not installed. Please install Git first.');
    logInfo('Download: https://git-scm.com/downloads');
    process.exit(1);
  }
  logSuccess('Git is installed');

  if (skillsExist()) {
    logInfo('Skills already installed at ' + SKILLS_DIR);
    logInfo('Run "npx vibeship-spawner-skills update" to get the latest version');
    const count = countSkills();
    logSuccess(`${count} skills available`);
    return;
  }

  logStep('2/3', 'Creating directory structure...');

  if (!fs.existsSync(SPAWNER_DIR)) {
    fs.mkdirSync(SPAWNER_DIR, { recursive: true });
    logSuccess('Created ~/.spawner/');
  }

  logStep('3/3', 'Cloning skills repository...');
  logInfo('This may take a moment...');

  try {
    execSync(`git clone ${REPO_URL} "${SKILLS_DIR}"`, {
      stdio: 'inherit',
      cwd: SPAWNER_DIR
    });

    const count = countSkills();
    console.log('');
    logSuccess(`Installation complete! ${count} skills installed.`);
    console.log(`
${COLORS.bright}Skills Location:${COLORS.reset} ${SKILLS_DIR}

${COLORS.bright}Quick Start:${COLORS.reset}
  In Claude, load a skill by reading its YAML files:

  ${COLORS.cyan}Read: ~/.spawner/skills/development/backend/skill.yaml
  Read: ~/.spawner/skills/development/backend/sharp-edges.yaml${COLORS.reset}

  Then ask Claude to build something - it now has specialist knowledge!

${COLORS.bright}Popular Skills:${COLORS.reset}
  development/backend      - Backend/API development
  development/frontend     - Frontend/UI development
  data/postgres-wizard     - PostgreSQL expert
  ai/llm-architect         - LLM integration
  agents/autonomous-agents - AI agents

${COLORS.bright}Full Guide:${COLORS.reset}
  ${SKILLS_DIR}/GETTING_STARTED.md

${COLORS.bright}Update Skills:${COLORS.reset}
  npx vibeship-spawner-skills update
`);
  } catch (error) {
    logError('Failed to clone repository');
    logInfo('Check your internet connection and try again');
    process.exit(1);
  }
}

async function update() {
  logStep('1/2', 'Checking installation...');

  if (!skillsExist()) {
    logError('Skills not installed. Run "npx vibeship-spawner-skills install" first.');
    process.exit(1);
  }

  logSuccess('Skills directory found');

  logStep('2/2', 'Pulling latest changes...');

  try {
    execSync('git pull', {
      stdio: 'inherit',
      cwd: SKILLS_DIR
    });

    const count = countSkills();
    console.log('');
    logSuccess(`Update complete! ${count} skills available.`);
  } catch (error) {
    logError('Failed to update. Check your internet connection.');
    process.exit(1);
  }
}

function status() {
  console.log('');
  log('Spawner Skills Status', COLORS.bright);
  console.log('─'.repeat(40));

  if (skillsExist()) {
    logSuccess(`Installed at: ${SKILLS_DIR}`);
    const count = countSkills();
    logSuccess(`Skills count: ${count}`);

    // Get git info
    try {
      const branch = execSync('git branch --show-current', {
        cwd: SKILLS_DIR,
        encoding: 'utf8'
      }).trim();
      const lastCommit = execSync('git log -1 --format="%h %s" --date=short', {
        cwd: SKILLS_DIR,
        encoding: 'utf8'
      }).trim();

      logInfo(`Branch: ${branch}`);
      logInfo(`Last update: ${lastCommit}`);
    } catch {}
  } else {
    logError('Not installed');
    logInfo('Run: npx vibeship-spawner-skills install');
  }
  console.log('');
}

function getCategories() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(f => {
      const fullPath = path.join(SKILLS_DIR, f);
      return fs.statSync(fullPath).isDirectory() &&
             !f.startsWith('.') &&
             f !== 'scripts' &&
             f !== 'cli';
    })
    .sort();
}

function getSkillsInCategory(category) {
  const categoryPath = path.join(SKILLS_DIR, category);
  if (!fs.existsSync(categoryPath)) return [];

  return fs.readdirSync(categoryPath)
    .filter(f => {
      const skillPath = path.join(categoryPath, f);
      return fs.statSync(skillPath).isDirectory();
    })
    .sort();
}

function list(categoryArg, showAll) {
  if (!skillsExist()) {
    logError('Skills not installed. Run "npx vibeship-spawner-skills install" first.');
    process.exit(1);
  }

  const categories = getCategories();

  // Show clickable directory path
  console.log('');
  const clickablePath = hyperlink(fileUrl(SKILLS_DIR), SKILLS_DIR);
  console.log(`${COLORS.dim}Location:${COLORS.reset} ${COLORS.cyan}${clickablePath}${COLORS.reset}`);
  console.log('');

  // List specific category
  if (categoryArg && categoryArg !== '--all') {
    if (!categories.includes(categoryArg)) {
      logError(`Category "${categoryArg}" not found.`);
      console.log('');
      log('Available categories:', COLORS.bright);
      console.log(categories.map(c => `  ${COLORS.cyan}${c}${COLORS.reset}`).join('\n'));
      console.log('');
      process.exit(1);
    }

    const skills = getSkillsInCategory(categoryArg);
    const categoryPath = path.join(SKILLS_DIR, categoryArg);

    log(`${categoryArg} (${skills.length} skills)`, COLORS.bright);
    console.log('─'.repeat(50));

    for (const skill of skills) {
      const skillPath = path.join(categoryPath, skill);
      const skillYaml = path.join(skillPath, 'skill.yaml');

      // Try to get description from skill.yaml
      let description = '';
      if (fs.existsSync(skillYaml)) {
        try {
          const content = fs.readFileSync(skillYaml, 'utf8');
          // Try single-line description first
          let descMatch = content.match(/^description:\s*["']?([^|\n][^\n]*)["']?\s*$/m);
          // If not found or it's a pipe (multiline), try to get the first line after description: |
          if (!descMatch || descMatch[1].trim() === '|') {
            const multilineMatch = content.match(/^description:\s*\|\s*\n\s+(.+)$/m);
            if (multilineMatch) {
              descMatch = multilineMatch;
            }
          }
          if (descMatch && descMatch[1] && descMatch[1].trim() !== '|') {
            description = descMatch[1].trim().substring(0, 50);
            if (descMatch[1].length > 50) description += '...';
          }
        } catch {}
      }

      const clickableSkill = hyperlink(fileUrl(skillPath), skill);
      if (description) {
        console.log(`  ${COLORS.cyan}${clickableSkill}${COLORS.reset} ${COLORS.dim}- ${description}${COLORS.reset}`);
      } else {
        console.log(`  ${COLORS.cyan}${clickableSkill}${COLORS.reset}`);
      }
    }

    console.log('');
    logInfo(`Load with: Read ~/.spawner/skills/${categoryArg}/<skill>/skill.yaml`);
    console.log('');
    return;
  }

  // List all skills (--all flag)
  if (showAll) {
    log('All Skills', COLORS.bright);
    console.log('─'.repeat(50));

    let totalSkills = 0;

    for (const category of categories) {
      const skills = getSkillsInCategory(category);
      totalSkills += skills.length;

      console.log(`\n${COLORS.bright}${category}${COLORS.reset} (${skills.length})`);

      for (const skill of skills) {
        const skillPath = path.join(SKILLS_DIR, category, skill);
        const clickableSkill = hyperlink(fileUrl(skillPath), skill);
        console.log(`  ${COLORS.cyan}${clickableSkill}${COLORS.reset}`);
      }
    }

    console.log('');
    console.log('─'.repeat(50));
    logSuccess(`Total: ${totalSkills} skills across ${categories.length} categories`);
    console.log('');
    return;
  }

  // Default: list categories only
  log('Installed Skill Categories', COLORS.bright);
  console.log('─'.repeat(50));

  let totalSkills = 0;

  for (const category of categories) {
    const skills = getSkillsInCategory(category);
    totalSkills += skills.length;

    const categoryPath = path.join(SKILLS_DIR, category);
    const clickableCategory = hyperlink(fileUrl(categoryPath), category);
    console.log(`${COLORS.cyan}${clickableCategory}${COLORS.reset} (${skills.length} skills)`);
  }

  console.log('─'.repeat(50));
  logSuccess(`Total: ${totalSkills} skills across ${categories.length} categories`);
  console.log('');
  logInfo(`List skills in a category: npx vibeship-spawner-skills list <category>`);
  logInfo(`List all skills: npx vibeship-spawner-skills list --all`);
  console.log('');
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'help';

printBanner();

switch (command) {
  case 'install':
  case 'i':
    install();
    break;
  case 'update':
  case 'u':
  case 'upgrade':
    update();
    break;
  case 'status':
  case 's':
    status();
    break;
  case 'list':
  case 'ls':
  case 'l':
    const listArg = args[1];
    const showAll = args.includes('--all') || args.includes('-a');
    list(listArg, showAll);
    break;
  case 'help':
  case 'h':
  case '--help':
  case '-h':
    printUsage();
    break;
  default:
    logError(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
