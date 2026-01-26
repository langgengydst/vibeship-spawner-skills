import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Orchestrator } from "./orchestrate.js";
import { ValidationManager } from "./validation.js";
import { UnstickManager } from "./unstick.js";
import { SkillManager } from "./skills.js";

export function registerPrompts(
  server: McpServer,
  { skillManager, repoRoot }: { skillManager: SkillManager; repoRoot: string }
): void {
  server.registerPrompt(
    "plan-project",
    {
      title: "Plan Project",
      description: "Analyze the request and create a step-by-step development plan using orchestration.",
      argsSchema: {
        task: z.string().describe("The user's high-level goal or task to plan"),
      },
    },
    async ({ task }) => {
      const orchestrator = new Orchestrator();
      const plan = await orchestrator.plan(task);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: plan,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "review-code",
    {
      title: "Review Code",
      description: "Check the code for sharp edges and validation errors.",
      argsSchema: {
        code: z.string().describe("Code content to review"),
        language: z.string().optional().describe("Programming language of code (e.g. typescript, python)"),
        context: z.string().optional().describe("Optional skill ID to load specific validations"),
      },
    },
    async ({ code, language, context }) => {
      const validationManager = new ValidationManager(repoRoot);
      const results = await validationManager.validate(code, language, context);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Here is the code review:\n\n${JSON.stringify(results, null, 2)}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "debug-error",
    {
      title: "Debug Error",
      description: "Use unstick strategies to solve this error.",
      argsSchema: {
        error: z.string().describe("Description of the error or problem"),
      },
    },
    async ({ error }) => {
      const unstickManager = new UnstickManager(skillManager);
      const advice = await unstickManager.getAdvice(error);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: advice,
            },
          },
        ],
      };
    },
  );
}
