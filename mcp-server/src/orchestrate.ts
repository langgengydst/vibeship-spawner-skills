export class Orchestrator {
  async plan(task: string): Promise<string> {
    const lowerTask = task.toLowerCase();
    
    let plan = `## Orchestration Plan for: "${task}"\n\n`;
    
    if (lowerTask.includes('saas') || lowerTask.includes('build') || lowerTask.includes('create')) {
        plan += `1. **Find Skills**: Use \`spawner_skills\` to find relevant skills (e.g., search for "saas", "launcher").\n`;
        plan += `   - Recommended: Check "micro-saas-launcher".\n`;
    }
    
    if (lowerTask.includes('stuck') || lowerTask.includes('debug') || lowerTask.includes('error')) {
        plan += `1. **Get Unstuck**: Use \`spawner_unstick\` with your problem description.\n`;
    }
    
    if (lowerTask.includes('validate') || lowerTask.includes('check') || lowerTask.includes('review')) {
        plan += `1. **Validate Code**: Use \`spawner_validate\` on your code files.\n`;
    }
    
    if (lowerTask.includes('watch') || lowerTask.includes('warn') || lowerTask.includes('risk')) {
        plan += `1. **Check Sharp Edges**: Use \`spawner_watch_out\` to identify risks.\n`;
    }
    
    if (!plan.includes('1.')) {
        plan += `1. **Explore**: Use \`spawner_skills\` to explore what's available.\n`;
    }
    
    plan += `\nUse these tools to proceed.`;
    return plan;
  }
}
