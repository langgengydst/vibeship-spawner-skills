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
};

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
${COLORS.magenta}╔═══════════════════════════════════════════════════════════╗
║                                                             ║
║   ${COLORS.bright}SPAWNER SKILLS${COLORS.reset}${COLORS.magenta}                                          ║
║   ${COLORS.cyan}245 Specialist Skills for AI-Powered Product Building${COLORS.reset}${COLORS.magenta}    ║
║                                                             ║
╚═══════════════════════════════════════════════════════════╝${COLORS.reset}
`);
}

function printUsage() {
  console.log(`
${COLORS.bright}Usage:${COLORS.reset}
  npx spawner-skills <command>

${COLORS.bright}Commands:${COLORS.reset}
  install     Install skills to ~/.spawner/skills
  update      Update skills to latest version
  status      Check installation status
  list        List installed skill categories
  help        Show this help message

${COLORS.bright}Examples:${COLORS.reset}
  npx spawner-skills install     # First-time installation
  npx spawner-skills update      # Pull latest skills
  npx spawner-skills status      # Check if installed

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
    logInfo('Run "npx spawner-skills update" to get the latest version');
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

${COLORS.bright}Popular Skills:${COLORS.reset}
  development/backend     - Backend/API development
  development/frontend    - Frontend/UI development
  data/postgres-wizard    - PostgreSQL expert
  ai/llm-architect        - LLM integration
  agents/autonomous-agents - AI agents

${COLORS.bright}Update Skills:${COLORS.reset}
  npx spawner-skills update
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
    logError('Skills not installed. Run "npx spawner-skills install" first.');
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
    logInfo('Run: npx spawner-skills install');
  }
  console.log('');
}

function list() {
  if (!skillsExist()) {
    logError('Skills not installed. Run "npx spawner-skills install" first.');
    process.exit(1);
  }

  console.log('');
  log('Installed Skill Categories', COLORS.bright);
  console.log('─'.repeat(40));

  const categories = fs.readdirSync(SKILLS_DIR)
    .filter(f => {
      const fullPath = path.join(SKILLS_DIR, f);
      return fs.statSync(fullPath).isDirectory() &&
             !f.startsWith('.') &&
             f !== 'scripts' &&
             f !== 'cli';
    })
    .sort();

  let totalSkills = 0;

  for (const category of categories) {
    const categoryPath = path.join(SKILLS_DIR, category);
    const skills = fs.readdirSync(categoryPath).filter(f => {
      const skillPath = path.join(categoryPath, f);
      return fs.statSync(skillPath).isDirectory();
    });

    totalSkills += skills.length;
    console.log(`${COLORS.cyan}${category}${COLORS.reset} (${skills.length} skills)`);
  }

  console.log('─'.repeat(40));
  logSuccess(`Total: ${totalSkills} skills across ${categories.length} categories`);
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
    list();
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
