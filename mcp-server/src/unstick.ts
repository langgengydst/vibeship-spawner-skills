import { SkillManager } from './skills.js';

export class UnstickManager {
  private skillManager: SkillManager;

  constructor(skillManager: SkillManager) {
    this.skillManager = skillManager;
  }

  async getAdvice(problem: string): Promise<string> {
    const debuggingSkill = await this.skillManager.getSkillById('debugging-master');
    
    if (debuggingSkill && debuggingSkill.patterns) {
        // Find a relevant pattern or just return general debugging advice
        const generalPattern = debuggingSkill.patterns.find((p: any) => p.name.toLowerCase().includes('scientific') || p.name.toLowerCase().includes('process'));
        if (generalPattern) {
            return `## From Debugging Master\n\n${generalPattern.guidance || generalPattern.description}`;
        }
    }

    // Fallback Oblique Strategies
    const strategies = [
        "State the problem in words as clearly as possible.",
        "What is the simplest version of this problem?",
        "Have you tried turning it off and on again?",
        "Explain the problem to a rubber duck.",
        "What assumption are you making that is wrong?",
        "Look at the logs.",
        "Isolate the component.",
        "Write a failing test case."
    ];
    
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    return `## Unstick Strategy\n\n${randomStrategy}\n\n### Debugging Checklist\n1. Reproduce the issue consistently.\n2. Isolate the cause (binary search).\n3. Fix the root cause, not the symptom.\n4. Verify the fix.`;
  }
}
