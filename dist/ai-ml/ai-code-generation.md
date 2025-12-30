# AI Code Generation

> Comprehensive patterns for building AI-powered code generation tools,
code assistants, automated refactoring, code review, and structured
output generation using LLMs with function calling and tool use.


**Category:** ai-ml | **Version:** 1.0.0

---

## Patterns

### Structured Code Output with Zod
Generate code with strict schema validation
**When:** User needs reliable structured code output
```
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const anthropic = new Anthropic();

// Define schema for code generation output
const CodeGenerationSchema = z.object({
  language: z.enum(["typescript", "python", "javascript", "rust", "go"]),
  code: z.string().describe("The generated code"),
  imports: z.array(z.string()).describe("Required imports/dependencies"),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string().optional(),
  })).describe("NPM/pip packages needed"),
  explanation: z.string().describe("Brief explanation of the code"),
  usage: z.string().describe("Example usage of the generated code"),
});

type CodeGeneration = z.infer<typeof CodeGenerationSchema>;

async function generateCode(
  prompt: string,
  options?: {
    language?: string;
    context?: string;
    style?: "concise" | "documented" | "production";
  }
): Promise<CodeGeneration> {
  const { language = "typescript", context = "", style = "documented" } = options || {};

  const styleGuides = {
    concise: "Write minimal code without comments",
    documented: "Include JSDoc/docstrings and inline comments",
    production: "Production-ready with error handling, types, and tests",
  };

  const jsonSchema = zodToJsonSchema(CodeGenerationSchema);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Generate ${language} code for the following request:

        ${prompt}

        ${context ? `Context:\n${context}` : ""}

        Style: ${styleGuides[style]}

        Return ONLY valid JSON matching this schema:
        ${JSON.stringify(jsonSchema, null, 2)}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  return CodeGenerationSchema.parse(JSON.parse(jsonMatch[0]));
}

// Usage
const result = await generateCode(
  "Create a rate limiter using sliding window algorithm",
  { language: "typescript", style: "production" }
);

```

### Function Calling for Tool Use
Enable LLM to call external functions/APIs
**When:** Building agents that interact with external systems
```
import OpenAI from "openai";

const openai = new OpenAI();

// Define available tools
const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_codebase",
      description: "Search the codebase for files, functions, or patterns",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          fileTypes: {
            type: "array",
            items: { type: "string" },
            description: "File extensions to search (e.g., ['.ts', '.tsx'])",
          },
          maxResults: { type: "number", description: "Maximum results to return" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path relative to project root" },
          startLine: { type: "number", description: "Start line (optional)" },
          endLine: { type: "number", description: "End line (optional)" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write or update a file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path" },
          content: { type: "string", description: "File content" },
          createDirs: { type: "boolean", description: "Create parent directories" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Execute a shell command",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Command to run" },
          cwd: { type: "string", description: "Working directory" },
        },
        required: ["command"],
      },
    },
  },
];

// Tool implementations
const toolHandlers: Record<string, (args: any) => Promise<string>> = {
  search_codebase: async ({ query, fileTypes, maxResults }) => {
    // Implement actual search
    const results = await searchFiles(query, { fileTypes, maxResults });
    return JSON.stringify(results);
  },
  read_file: async ({ path, startLine, endLine }) => {
    const content = await readFile(path);
    if (startLine !== undefined) {
      const lines = content.split("\n");
      return lines.slice(startLine - 1, endLine || lines.length).join("\n");
    }
    return content;
  },
  write_file: async ({ path, content, createDirs }) => {
    await writeFile(path, content, { createDirs });
    return `File written: ${path}`;
  },
  run_command: async ({ command, cwd }) => {
    const result = await exec(command, { cwd });
    return result.stdout + result.stderr;
  },
};

// Agent loop with tool use
async function runCodeAgent(task: string, maxIterations: number = 10) {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a code assistant that can search, read, write files and run commands.
        Complete the user's task step by step.
        Always explain what you're doing before taking action.`,
    },
    { role: "user", content: task },
  ];

  for (let i = 0; i < maxIterations; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    messages.push(message);

    // Check if done
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content;
    }

    // Execute tool calls
    for (const toolCall of message.tool_calls) {
      const handler = toolHandlers[toolCall.function.name];
      const args = JSON.parse(toolCall.function.arguments);

      console.log(`Calling ${toolCall.function.name}:`, args);

      try {
        const result = await handler(args);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      } catch (error: any) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Error: ${error.message}`,
        });
      }
    }
  }

  return "Max iterations reached";
}

```

### AI Code Review
Automated code review with suggestions
**When:** User wants AI-powered code review in CI/CD
```
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface ReviewComment {
  file: string;
  line: number;
  severity: "error" | "warning" | "suggestion" | "info";
  category: "bug" | "security" | "performance" | "style" | "maintainability";
  message: string;
  suggestion?: string;
}

interface CodeReviewResult {
  summary: string;
  score: number; // 0-100
  comments: ReviewComment[];
  approved: boolean;
}

async function reviewCode(
  files: { path: string; content: string; diff?: string }[],
  options?: {
    focus?: ("security" | "performance" | "style" | "bugs")[];
    context?: string;
  }
): Promise<CodeReviewResult> {
  const { focus = ["security", "bugs", "performance"], context = "" } = options || {};

  const fileContents = files.map((f) =>
    `## ${f.path}\n${f.diff ? `### Diff:\n${f.diff}\n### Full file:` : ""}\n\`\`\`\n${f.content}\n\`\`\``
  ).join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Review the following code changes.

        Focus areas: ${focus.join(", ")}

        ${context ? `Context: ${context}` : ""}

        Files to review:
        ${fileContents}

        Provide your review as JSON:
        {
          "summary": "Brief overall assessment",
          "score": 0-100,
          "approved": true/false,
          "comments": [
            {
              "file": "path/to/file",
              "line": 123,
              "severity": "error|warning|suggestion|info",
              "category": "bug|security|performance|style|maintainability",
              "message": "What's wrong",
              "suggestion": "How to fix (optional)"
            }
          ]
        }

        Return ONLY valid JSON.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON in response");
  }

  return JSON.parse(jsonMatch[0]) as CodeReviewResult;
}

// GitHub PR integration
async function reviewPullRequest(
  prNumber: number,
  owner: string,
  repo: string
) {
  // Fetch PR files
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  // Get file contents
  const fileContents = await Promise.all(
    files.map(async (file) => ({
      path: file.filename,
      content: await fetchFileContent(owner, repo, file.sha),
      diff: file.patch,
    }))
  );

  // Run review
  const review = await reviewCode(fileContents);

  // Post comments
  for (const comment of review.comments) {
    await octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: prNumber,
      body: `**${comment.severity.toUpperCase()}** [${comment.category}]: ${comment.message}${
        comment.suggestion ? `\n\n**Suggestion:** ${comment.suggestion}` : ""
      }`,
      path: comment.file,
      line: comment.line,
      side: "RIGHT",
    });
  }

  return review;
}

```

### Multi-File Code Generation
Generate complete features spanning multiple files
**When:** User needs to scaffold entire features or components
```
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface GeneratedFile {
  path: string;
  content: string;
  description: string;
}

interface FeatureGeneration {
  files: GeneratedFile[];
  instructions: string[];
  dependencies: { name: string; version?: string }[];
}

async function generateFeature(
  description: string,
  options: {
    framework: "nextjs" | "express" | "fastapi" | "nest";
    includeTests?: boolean;
    includeTypes?: boolean;
  }
): Promise<FeatureGeneration> {
  const { framework, includeTests = true, includeTypes = true } = options;

  const frameworkPatterns = {
    nextjs: `
      - Use App Router conventions
      - Server Components by default, 'use client' when needed
      - API routes in app/api/
      - Zod for validation`,
    express: `
      - Use Express 4.x patterns
      - Controllers, services, routes separation
      - Error handling middleware`,
    fastapi: `
      - Use FastAPI with Pydantic models
      - Async/await patterns
      - Dependency injection`,
    nest: `
      - Use NestJS decorators
      - Module/Controller/Service pattern
      - DTOs with class-validator`,
  };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Generate a complete feature implementation:

        Feature: ${description}

        Framework: ${framework}
        ${frameworkPatterns[framework]}

        Requirements:
        - ${includeTypes ? "Include TypeScript types/interfaces" : "JavaScript only"}
        - ${includeTests ? "Include test files" : "No tests"}
        - Follow best practices for ${framework}
        - Include error handling
        - Add comments for complex logic

        Return JSON:
        {
          "files": [
            {
              "path": "relative/path/to/file.ts",
              "content": "file contents",
              "description": "what this file does"
            }
          ],
          "instructions": ["Step 1: Install X", "Step 2: Run Y"],
          "dependencies": [{ "name": "package", "version": "^1.0.0" }]
        }

        Return ONLY valid JSON.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON in response");
  }

  return JSON.parse(jsonMatch[0]) as FeatureGeneration;
}

// Write generated files to disk
async function scaffoldFeature(
  description: string,
  baseDir: string,
  options: Parameters<typeof generateFeature>[1]
) {
  const feature = await generateFeature(description, options);

  // Write files
  for (const file of feature.files) {
    const fullPath = path.join(baseDir, file.path);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.content);
    console.log(`Created: ${file.path}`);
  }

  // Install dependencies
  if (feature.dependencies.length > 0) {
    const deps = feature.dependencies.map(
      (d) => d.version ? `${d.name}@${d.version}` : d.name
    );
    console.log(`\nInstall dependencies:\nnpm install ${deps.join(" ")}`);
  }

  return feature;
}

```

### Test Generation from Code
Generate tests for existing code
**When:** User needs to add tests to existing code
```
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface GeneratedTest {
  testFile: string;
  content: string;
  coverage: {
    functions: string[];
    scenarios: string[];
  };
}

async function generateTests(
  sourceCode: string,
  options: {
    framework: "vitest" | "jest" | "pytest" | "mocha";
    style: "unit" | "integration" | "e2e";
    coverage?: "basic" | "comprehensive";
  }
): Promise<GeneratedTest> {
  const { framework, style, coverage = "comprehensive" } = options;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Generate ${style} tests for this code using ${framework}:

        \`\`\`
        ${sourceCode}
        \`\`\`

        Coverage level: ${coverage}
        ${coverage === "comprehensive" ? "Include edge cases, error handling, and boundary conditions." : "Cover happy paths."}

        Requirements:
        - Use ${framework} syntax and best practices
        - Include descriptive test names
        - Add setup/teardown if needed
        - Mock external dependencies
        - Test error cases

        Return JSON:
        {
          "testFile": "filename.test.ts",
          "content": "test file content",
          "coverage": {
            "functions": ["list of functions tested"],
            "scenarios": ["list of test scenarios"]
          }
        }

        Return ONLY valid JSON.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON in response");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedTest;
}

```

### Automated Refactoring
Suggest and apply code refactoring
**When:** User needs to improve existing code structure
```
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface RefactoringResult {
  original: string;
  refactored: string;
  changes: {
    type: string;
    description: string;
    before: string;
    after: string;
  }[];
  improvements: string[];
}

async function suggestRefactoring(
  code: string,
  options?: {
    focus?: ("readability" | "performance" | "maintainability" | "dry")[];
    preserveApi?: boolean;
  }
): Promise<RefactoringResult> {
  const { focus = ["readability", "maintainability"], preserveApi = true } = options || {};

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Refactor this code:

        \`\`\`
        ${code}
        \`\`\`

        Focus areas: ${focus.join(", ")}
        ${preserveApi ? "Preserve the public API (function signatures, exports)" : "API changes allowed"}

        Apply these refactoring patterns where appropriate:
        - Extract functions for repeated logic
        - Simplify conditional expressions
        - Use modern language features
        - Improve naming
        - Reduce complexity

        Return JSON:
        {
          "original": "original code",
          "refactored": "refactored code",
          "changes": [
            {
              "type": "extract-function|simplify|rename|etc",
              "description": "what changed and why",
              "before": "code snippet before",
              "after": "code snippet after"
            }
          ],
          "improvements": ["List of improvements made"]
        }

        Return ONLY valid JSON.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON in response");
  }

  return JSON.parse(jsonMatch[0]) as RefactoringResult;
}

```


## Anti-Patterns

### Blindly accepting generated code
**Why it's bad:** AI generates plausible but often incorrect code

### No schema validation on outputs
**Why it's bad:** LLMs produce malformed JSON, missing fields

### Unbounded agent loops
**Why it's bad:** Agents can loop forever, consuming tokens/money

### Executing generated code without sandboxing
**Why it's bad:** Generated code may be malicious or destructive


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] LLMs hallucinate non-existent APIs and methods

**Situation:** Generated code uses APIs that don't exist

**Why it happens:**
LLMs are trained on historical data and may:
- Invent methods that seem plausible but don't exist
- Mix up APIs from different libraries
- Use outdated API signatures from older versions
- Combine patterns from different languages incorrectly

Studies show 4x increase in defects with AI-assisted code.


**Solution:**
```
Always validate generated code:

```typescript
import ts from "typescript";

async function validateGeneratedCode(code: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  // 1. TypeScript type checking
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      strict: true,
      noEmit: true,
    },
    reportDiagnostics: true,
  });

  const errors = result.diagnostics?.map(
    (d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")
  ) || [];

  // 2. ESLint check
  const lintResults = await eslint.lintText(code);
  errors.push(...lintResults.flatMap((r) => r.messages.map((m) => m.message)));

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Use it
const generated = await generateCode(prompt);
const validation = await validateGeneratedCode(generated.code);

if (!validation.valid) {
  console.error("Generated code has issues:", validation.errors);
  // Retry with feedback
  const fixed = await generateCode(prompt + "\n\nFix these issues: " + validation.errors.join("\n"));
}
```

```

---

### [CRITICAL] Generated code contains security vulnerabilities

**Situation:** AI generates code with SQL injection, XSS, or other vulnerabilities

**Why it happens:**
LLMs learn patterns from training data that includes insecure code.
They optimize for "looks correct" not "is secure."
Common issues:
- SQL string concatenation
- Unsanitized user input in HTML
- Hardcoded credentials
- Missing input validation
- Insecure cryptography


**Solution:**
```
Run security scanning on all generated code:

```typescript
import { exec } from "child_process";

async function securityScan(code: string, language: string) {
  const tempFile = `/tmp/scan-${Date.now()}.${language === "python" ? "py" : "ts"}`;
  fs.writeFileSync(tempFile, code);

  try {
    // Run semgrep with security rules
    const { stdout } = await exec(
      `semgrep --config=p/security-audit --json ${tempFile}`
    );

    const results = JSON.parse(stdout);
    return {
      vulnerabilities: results.results.map((r: any) => ({
        rule: r.check_id,
        severity: r.extra.severity,
        message: r.extra.message,
        line: r.start.line,
      })),
    };
  } finally {
    fs.unlinkSync(tempFile);
  }
}

// Integration in generation pipeline
async function safeGenerateCode(prompt: string) {
  const generated = await generateCode(prompt);
  const scan = await securityScan(generated.code, generated.language);

  if (scan.vulnerabilities.length > 0) {
    // Either fix or reject
    const criticals = scan.vulnerabilities.filter((v) => v.severity === "ERROR");
    if (criticals.length > 0) {
      throw new Error(`Generated code has critical vulnerabilities: ${criticals.map((c) => c.message).join(", ")}`);
    }
  }

  return generated;
}
```

```

---

### [CRITICAL] Malicious prompts can trigger unintended tool calls

**Situation:** User input influences function calling decisions

**Why it happens:**
If user input is included in prompts that trigger function calling,
attackers can craft inputs that:
- Trigger file deletion
- Execute arbitrary commands
- Exfiltrate data via tool calls
- Bypass access controls

This is "prompt injection" applied to tool use.


**Solution:**
```
Sanitize inputs and validate tool calls:

```typescript
// Dangerous tools that modify state
const DANGEROUS_TOOLS = ["write_file", "delete_file", "run_command"];

// Validate tool calls before execution
function validateToolCall(
  toolName: string,
  args: any,
  userTier: "admin" | "user" | "readonly"
): { allowed: boolean; reason?: string } {
  // Check user permissions
  if (DANGEROUS_TOOLS.includes(toolName) && userTier !== "admin") {
    return { allowed: false, reason: "Insufficient permissions" };
  }

  // Validate file paths
  if (toolName === "write_file" || toolName === "read_file") {
    const path = args.path;
    // Prevent directory traversal
    if (path.includes("..") || path.startsWith("/")) {
      return { allowed: false, reason: "Invalid path" };
    }
    // Block sensitive files
    if (path.includes(".env") || path.includes("credentials")) {
      return { allowed: false, reason: "Access to sensitive files denied" };
    }
  }

  // Validate commands
  if (toolName === "run_command") {
    const dangerous = ["rm -rf", "sudo", "chmod", "curl | sh", "eval"];
    if (dangerous.some((d) => args.command.includes(d))) {
      return { allowed: false, reason: "Dangerous command blocked" };
    }
  }

  return { allowed: true };
}

// Use in agent loop
for (const toolCall of message.tool_calls) {
  const validation = validateToolCall(
    toolCall.function.name,
    JSON.parse(toolCall.function.arguments),
    userTier
  );

  if (!validation.allowed) {
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: `Blocked: ${validation.reason}`,
    });
    continue;
  }

  // Execute only if validated
  const result = await toolHandlers[toolCall.function.name](args);
}
```

```

---

### [HIGH] Code generation agents consume unlimited tokens

**Situation:** Agent loops without cost limits

**Why it happens:**
Code generation is token-intensive:
- Large code context = many input tokens
- Multiple iterations = multiplicative cost
- Function calling adds overhead
- No limits = $100+ bills in minutes


**Solution:**
```
Implement token budgets and limits:

```typescript
const TOKEN_COSTS = {
  "gpt-4o": { input: 5, output: 15 },      // per million
  "claude-sonnet": { input: 3, output: 15 },
};

class TokenBudget {
  private used = { input: 0, output: 0 };

  constructor(
    private maxCost: number = 1.0,
    private model: keyof typeof TOKEN_COSTS = "gpt-4o"
  ) {}

  record(inputTokens: number, outputTokens: number) {
    this.used.input += inputTokens;
    this.used.output += outputTokens;
  }

  get currentCost(): number {
    const rates = TOKEN_COSTS[this.model];
    return (
      (this.used.input / 1_000_000) * rates.input +
      (this.used.output / 1_000_000) * rates.output
    );
  }

  canContinue(): boolean {
    return this.currentCost < this.maxCost;
  }

  remainingBudget(): number {
    return this.maxCost - this.currentCost;
  }
}

// Use in agent
async function runBudgetedAgent(task: string, maxCost: number = 1.0) {
  const budget = new TokenBudget(maxCost);

  for (let i = 0; i < 20; i++) {
    if (!budget.canContinue()) {
      return { error: "Budget exhausted", cost: budget.currentCost };
    }

    const response = await openai.chat.completions.create({...});

    budget.record(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    );

    // ... process response
  }
}
```

```

---

### [MEDIUM] LLM structured output breaks JSON parsing

**Situation:** LLM returns malformed JSON despite instructions

**Why it happens:**
Even with clear JSON instructions, LLMs often:
- Add markdown code fences around JSON
- Include explanatory text before/after
- Use trailing commas (invalid JSON)
- Include comments in JSON
- Escape characters incorrectly
- Truncate long outputs mid-JSON


**Solution:**
```
Use robust JSON extraction:

```typescript
function extractJSON(text: string): any {
  // Try to find JSON object in text
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/,  // Markdown code block
    /```\s*([\s\S]*?)\s*```/,       // Any code block
    /(\{[\s\S]*\})/,                 // Raw JSON object
    /(\[[\s\S]*\])/,                 // Raw JSON array
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Clean common issues
        let cleaned = match[1]
          .replace(/,\s*([}\]])/g, "$1")  // Remove trailing commas
          .replace(/\/\/.*$/gm, "")        // Remove // comments
          .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove /* */ comments

        return JSON.parse(cleaned);
      } catch {
        continue;
      }
    }
  }

  throw new Error("No valid JSON found in response");
}

// Or use response_format for guaranteed JSON (OpenAI)
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  response_format: { type: "json_object" }, // Guarantees valid JSON
});
```

```

---

### [MEDIUM] Generated code uses deprecated or old API patterns

**Situation:** LLM generates code with outdated patterns

**Why it happens:**
LLM training data has a cutoff date.
Libraries evolve faster than model updates.
Common issues:
- Next.js Pages Router when App Router is standard
- React class components instead of hooks
- Old Express.js patterns
- Deprecated npm packages


**Solution:**
```
Include version context in prompts:

```typescript
async function generateCurrentCode(
  prompt: string,
  dependencies: Record<string, string>
) {
  const versionContext = Object.entries(dependencies)
    .map(([pkg, version]) => `${pkg}@${version}`)
    .join(", ");

  const enhancedPrompt = `${prompt}

  IMPORTANT: Use these exact library versions and their current APIs:
  ${versionContext}

  For React, use:
  - Function components with hooks (not class components)
  - TypeScript with strict mode
  - Modern patterns (use client/server if Next.js App Router)

  For Next.js 14+:
  - Use App Router (/app directory)
  - Server Components by default
  - Server Actions for mutations`;

  return generateCode(enhancedPrompt);
}

// Read versions from package.json
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
const result = await generateCurrentCode(
  "Add user authentication",
  pkg.dependencies
);
```

```

---

### [MEDIUM] Large codebases exceed context window

**Situation:** Trying to include too much code context

**Why it happens:**
Even with 128k+ context windows:
- Performance degrades with length
- Costs scale linearly
- Important info gets "lost in the middle"
- Truncation may cut off critical context


**Solution:**
```
Use intelligent context selection:

```typescript
async function selectRelevantContext(
  query: string,
  codebase: Map<string, string>,
  maxTokens: number = 50000
): Promise<string[]> {
  // 1. Embed the query
  const queryEmbedding = await embed(query);

  // 2. Embed and rank code files
  const rankedFiles: { path: string; score: number }[] = [];

  for (const [path, content] of codebase.entries()) {
    const embedding = await embed(content.slice(0, 2000)); // First 2k chars
    const score = cosineSimilarity(queryEmbedding, embedding);
    rankedFiles.push({ path, score });
  }

  rankedFiles.sort((a, b) => b.score - a.score);

  // 3. Select files until token limit
  const selected: string[] = [];
  let tokens = 0;

  for (const { path } of rankedFiles) {
    const content = codebase.get(path)!;
    const fileTokens = estimateTokens(content);

    if (tokens + fileTokens > maxTokens) break;

    selected.push(`## ${path}\n\`\`\`\n${content}\n\`\`\``);
    tokens += fileTokens;
  }

  return selected;
}
```

```

---

### [MEDIUM] Generated async code has race conditions

**Situation:** LLM generates concurrent code without proper synchronization

**Why it happens:**
LLMs often generate async code that:
- Doesn't properly await promises
- Has race conditions in parallel operations
- Missing error handling in Promise.all
- Doesn't handle cancellation


**Solution:**
```
Review async patterns in generated code:

```typescript
const asyncAntiPatterns = [
  // Missing await
  /async\s+\w+\([^)]*\)\s*{[^}]*(?<!await\s)fetch\(/,
  // Promise.all without error handling
  /Promise\.all\([^)]+\)(?!\s*\.catch)/,
  // forEach with async (doesn't await)
  /\.forEach\(\s*async/,
  // Race condition: read-modify-write without lock
  /let\s+\w+\s*=\s*await[^;]+;\s*\w+\s*[+\-*/]=.*await/,
];

function checkAsyncPatterns(code: string): string[] {
  const issues: string[] = [];

  for (const pattern of asyncAntiPatterns) {
    if (pattern.test(code)) {
      issues.push(`Potential async issue: ${pattern.source}`);
    }
  }

  return issues;
}
```

```

---

## Collaboration

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai-ml/ai-code-generation/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
