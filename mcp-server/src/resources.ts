import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const MANIFEST = {
  name: "Spawner Skills MCP Server",
  version: "1.0.0",
  description: "This MCP server provides 462 expert skills for development, deployment, and project management",
  capabilities: {
    tools: [
      {
        name: "list_available_skills",
        description: "List all available skill categories and skills. Use this to explore what capabilities are available."
      },
      {
        name: "find_expert_skill",
        description: "Use this to find specialized expert knowledge. Input a query like 'react patterns' or 'database migration' to find skills that can help you."
      },
      {
        name: "consult_skill",
        description: "Load the full context and instructions for a specific skill. Use this when you need deep expertise on a topic."
      },
      {
        name: "validate_code_implementation",
        description: "Validate code against defined patterns and rules. Use this before finalizing any code."
      },
      {
        name: "access_project_memory",
        description: "Store or retrieve project-level decisions and context. Use this to maintain continuity."
      },
      {
        name: "analyze_risk_sharp_edges",
        description: "Scan code for 'sharp edges' - high-risk patterns or known gotchas. Use this proactively."
      },
      {
        name: "get_troubleshooting_advice",
        description: "Get expert advice when you are stuck or seeing errors. Provides specific solutions based on the problem."
      },
      {
        name: "orchestrate_development_plan",
        description: "Create a comprehensive development plan for a high-level task. Break down complex goals into actionable steps."
      }
    ],
    prompts: [
      {
        name: "plan-project",
        description: "Analyze the request and create a step-by-step development plan using orchestration."
      },
      {
        name: "review-code",
        description: "Check the code for sharp edges and validation errors."
      },
      {
        name: "debug-error",
        description: "Use unstick strategies to solve this error."
      }
    ],
    resources: [
      {
        name: "manifest",
        uri: "spawner://manifest",
        description: "System manifest describing available capabilities"
      }
    ]
  },
  usage: {
    workflow: [
      "1. Use list_available_skills to explore available skills and categories",
      "2. Use find_expert_skill to search for specific expertise",
      "3. Use consult_skill to load detailed skill instructions",
      "4. Use validate_code_implementation to check code quality",
      "5. Use analyze_risk_sharp_edges to identify potential issues",
      "6. Use get_troubleshooting_advice when stuck",
      "7. Use orchestrate_development_plan for complex tasks",
      "8. Use access_project_memory to maintain state across sessions"
    ],
    tips: [
      "Always consult relevant skills before implementing new features",
      "Run validation and sharp edge checks before finalizing code",
      "Use project memory to preserve important decisions",
      "The orchestrate tool can break down complex tasks automatically"
    ]
  }
};

export function registerResources(server: McpServer): void {
  server.registerResource(
    "manifest",
    "spawner://manifest",
    { description: "System manifest describing available capabilities", mimeType: "application/json" },
    async () => {
      return {
        contents: [
          {
            uri: "spawner://manifest",
            mimeType: "application/json",
            text: JSON.stringify(MANIFEST, null, 2)
          }
        ]
      };
    }
  );
}
