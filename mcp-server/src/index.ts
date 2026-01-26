import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { SkillManager } from "./skills.js";
import { ValidationManager } from "./validation.js";
import { MemoryManager } from "./memory.js";
import { SharpEdgeManager } from "./sharp-edges.js";
import { UnstickManager } from "./unstick.js";
import { Orchestrator } from "./orchestrate.js";
import { registerPrompts } from "./prompts.js";
import { registerResources } from "./resources.js";
import { log as logger } from "./logger.js";
import path from "path";
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../");
logger.info(`[Setup] Loading skills from repository root: ${repoRoot}`);

const skillManager = new SkillManager(repoRoot);
const validationManager = new ValidationManager(repoRoot);
const memoryManager = new MemoryManager();
const sharpEdgeManager = new SharpEdgeManager(repoRoot);
const unstickManager = new UnstickManager(skillManager);
const orchestrator = new Orchestrator();

const server = new McpServer({
  name: "spawner-skills",
  version: "1.0.0",
});

registerPrompts(server, { skillManager, repoRoot });
registerResources(server);

server.registerTool("list_available_skills", {
  description: "List all available skill categories and skills. Use this to explore what capabilities are available.",
  inputSchema: {
    category: z.string().optional().describe("Optional category to filter by"),
  },
},
async ({ category }) => {
  try {
    const skills = await skillManager.listSkills(category);
    return {
      content: [{ type: "text", text: JSON.stringify(skills, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing skills: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("find_expert_skill", {
  description: "Use this to find specialized expert knowledge. Input a query like 'react patterns' or 'database migration' to find skills that can help you.",
  inputSchema: {
    query: z.string().describe("Search term for skills (name or description)"),
    category: z.string().optional().describe("Optional category to filter by"),
  },
},
async ({ query, category }) => {
  try {
    const skills = await skillManager.searchSkills(query, category);
    return {
      content: [{ type: "text", text: JSON.stringify(skills, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error searching skills: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("consult_skill", {
  description: "Load the full context and instructions for a specific skill. Use this when you need deep expertise on a topic.",
  inputSchema: {
    id: z.string().describe("The unique ID of skill to load"),
  },
},
async ({ id }) => {
  try {
    const skill = await skillManager.getSkillById(id);
    if (!skill) {
      return {
        content: [{ type: "text", text: `Skill not found: ${id}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(skill, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error loading skill: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("validate_code_implementation", {
  description: "Validate code against defined patterns and rules. Use this before finalizing any code.",
  inputSchema: {
    code: z.string().describe("Code content to validate"),
    language: z.string().optional().describe("Programming language of code (e.g. typescript, python)"),
    context: z.string().optional().describe("Optional skill ID to load specific validations"),
  },
},
async ({ code, language, context }) => {
  try {
    const results = await validationManager.validate(code, language, context);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error validating code: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("access_project_memory", {
  description: "Store or retrieve project-level decisions and context. Use this to maintain continuity.",
  inputSchema: {
    action: z.enum(["set", "get", "list"]).describe("Action to perform"),
    key: z.string().optional().describe("Key for memory entry"),
    value: z.string().optional().describe("Value to store (only for 'set')"),
  },
},
async ({ action, key, value }) => {
  try {
    let result;
    if (action === "set") {
      if (!key || !value) throw new Error("Key and value required for set");
      result = memoryManager.set(key, value);
    } else if (action === "get") {
      if (!key) throw new Error("Key required for get");
      result = memoryManager.get(key);
    } else if (action === "list") {
      result = memoryManager.list();
    } else {
      throw new Error(`Invalid action: ${action}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error accessing memory: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("analyze_risk_sharp_edges", {
  description: "Scan code for 'sharp edges' - high-risk patterns or known gotchas. Use this proactively.",
  inputSchema: {
    code: z.string().optional().describe("Code content to scan for sharp edges"),
    skill_id: z.string().optional().describe("Specific skill to check for sharp edges"),
  },
},
async ({ code, skill_id }) => {
  try {
    const results = await sharpEdgeManager.check(code, skill_id);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error checking sharp edges: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("get_troubleshooting_advice", {
  description: "Get expert advice when you are stuck or seeing errors. Provides specific solutions based on the problem.",
  inputSchema: {
    problem: z.string().describe("Description of stuck state"),
  },
},
async ({ problem }) => {
  try {
    const advice = await unstickManager.getAdvice(problem);
    return {
      content: [
        {
          type: "text",
          text: advice,
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting unstick advice: ${error}` }],
      isError: true,
    };
  }
});

server.registerTool("orchestrate_development_plan", {
  description: "Create a comprehensive development plan for a high-level task. Break down complex goals into actionable steps.",
  inputSchema: {
    task: z.string().describe("The user's high-level goal"),
  },
},
async ({ task }) => {
  try {
    const plan = await orchestrator.plan(task);
    return {
      content: [
        {
          type: "text",
          text: plan,
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error orchestrating: ${error}` }],
      isError: true,
    };
  }
});

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
  enableJsonResponse: true,
});

server.connect(transport);

async function runServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.all('/mcp', async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error({ error }, `[MCP] Error handling request`);
      res.status(500).json({ error: String(error) });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`[Server] Spawner Skills MCP Server running on port ${port}`);
    logger.info(`[Server] MCP endpoint: http://localhost:${port}/mcp`);
  });
}

export { server };

if (import.meta.main) {
  runServer().catch((error) => {
    logger.error("[Server] Fatal error:", error);
    process.exit(1);
  });
}
