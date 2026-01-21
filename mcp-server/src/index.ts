import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { SkillManager } from "./skills.js";
import { ValidationManager } from "./validation.js";
import { MemoryManager } from "./memory.js";
import { SharpEdgeManager } from "./sharp-edges.js";
import { UnstickManager } from "./unstick.js";
import { Orchestrator } from "./orchestrate.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Managers (Global State - Shared across connections)
const repoRoot = path.resolve(__dirname, "../../");
const skillManager = new SkillManager(repoRoot);
const validationManager = new ValidationManager(repoRoot);
const memoryManager = new MemoryManager();
const sharpEdgeManager = new SharpEdgeManager(repoRoot);
const unstickManager = new UnstickManager(skillManager);
const orchestrator = new Orchestrator();

// Store active sessions: sessionId -> { server, transport }
const sessions = new Map<string, { server: Server, transport: StreamableHTTPServerTransport }>();

// Factory function to create a new Server instance for a client
function createServer() {
  const server = new Server(
    {
      name: "spawner-skills",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "spawner_skills",
          description: "Find and retrieve skill definitions from the local registry.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search term for skills (name or description)",
              },
              category: {
                type: "string",
                description: "Optional category to filter by",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "spawner_validate",
          description: "Run automated code validation checks defined in skills.",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "Code content to validate",
              },
              language: {
                type: "string",
                description: "Programming language of the code (e.g. typescript, python)",
              },
              context: {
                type: "string",
                description: "Optional skill ID to load specific validations",
              },
            },
            required: ["code"],
          },
        },
        {
          name: "spawner_remember",
          description: "Persist project context and decisions.",
          inputSchema: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["set", "get", "list"],
                description: "Action to perform",
              },
              key: {
                type: "string",
                description: "Key for the memory entry",
              },
              value: {
                type: "string",
                description: "Value to store (only for 'set')",
              },
            },
            required: ["action"],
          },
        },
        {
          name: "spawner_watch_out",
          description: "Surface relevant sharp edges and gotchas.",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "Code content to scan for sharp edges",
              },
              skill_id: {
                type: "string",
                description: "Specific skill to check for sharp edges",
              },
            },
          },
        },
        {
          name: "spawner_unstick",
          description: "Get strategies to get unstuck.",
          inputSchema: {
            type: "object",
            properties: {
              problem: {
                type: "string",
                description: "Description of the stuck state",
              },
            },
            required: ["problem"],
          },
        },
        {
          name: "spawner_orchestrate",
          description: "Analyze request and route to appropriate tools.",
          inputSchema: {
            type: "object",
            properties: {
              task: {
                type: "string",
                description: "The user's high-level goal",
              },
            },
            required: ["task"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "spawner_skills") {
      const query = String(args?.query);
      const category = args?.category ? String(args.category) : undefined;
      
      try {
          const skills = await skillManager.searchSkills(query, category);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(skills, null, 2),
              },
            ],
          };
      } catch (error) {
          return {
              content: [
                  {
                      type: "text",
                      text: `Error searching skills: ${error}`
                  }
              ],
              isError: true
          }
      }
    }

    if (name === "spawner_validate") {
        const code = String(args?.code);
        const language = args?.language ? String(args.language) : undefined;
        const context = args?.context ? String(args.context) : undefined;
        
        try {
            const results = await validationManager.validate(code, language, context);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error validating code: ${error}` }],
                isError: true
            }
        }
    }

    if (name === "spawner_remember") {
        const action = String(args?.action);
        const key = args?.key ? String(args.key) : undefined;
        const value = args?.value ? String(args.value) : undefined;
        
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
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
             return {
                content: [{ type: "text", text: `Error accessing memory: ${error}` }],
                isError: true
            }
        }
    }

    if (name === "spawner_watch_out") {
        const code = args?.code ? String(args.code) : undefined;
        const skillId = args?.skill_id ? String(args.skill_id) : undefined;
        
        try {
            const results = await sharpEdgeManager.check(code, skillId);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error checking sharp edges: ${error}` }],
                isError: true
            }
        }
    }

    if (name === "spawner_unstick") {
        const problem = String(args?.problem);
        try {
            const advice = await unstickManager.getAdvice(problem);
            return {
                content: [
                    {
                        type: "text",
                        text: advice
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error getting unstick advice: ${error}` }],
                isError: true
            }
        }
    }

    if (name === "spawner_orchestrate") {
        const task = String(args?.task);
        try {
            const plan = await orchestrator.plan(task);
            return {
                content: [
                    {
                        type: "text",
                        text: plan
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error orchestrating: ${error}` }],
                isError: true
            }
        }
    }

    throw new Error(`Tool not found: ${name}`);
  });

  return server;
}

async function runServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  
  app.all('/mcp', async (req, res) => {
    // Check for sessionId in query parameters (used by Streamable HTTP clients)
    const sessionId = req.query.sessionId as string;
    
    if (sessionId && sessions.has(sessionId)) {
        // Existing session
        const session = sessions.get(sessionId)!;
        await session.transport.handleRequest(req, res, req.body);
    } else {
        // New session (or invalid ID, treat as new)
        const newSessionId = sessionId || uuidv4();
        console.log(`Creating new session: ${newSessionId}`);
        
        const server = createServer();
        // Create transport with the specific session ID
        const transport = new StreamableHTTPServerTransport({
            sessionId: newSessionId,
            endpoint: '/mcp'
        } as any); // Type cast might be needed depending on exact SDK version options
        
        await server.connect(transport);
        sessions.set(newSessionId, { server, transport });
        
        // Handle the initial request
        await transport.handleRequest(req, res, req.body);
        
        // Cleanup when transport closes (if applicable/detectable)
        transport.onclose = () => {
            console.log(`Session closed: ${newSessionId}`);
            sessions.delete(newSessionId);
        };
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.error(`Spawner Skills MCP Server running on port ${port}`);
    console.error(`MCP endpoint: http://localhost:${port}/mcp`);
  });
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
