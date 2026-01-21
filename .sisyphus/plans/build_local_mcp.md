# Build Local Spawner MCP Server

## Context
The user wants to replace the broken remote Spawner MCP server with a custom local implementation. The goal is to replicate the core functionality using the local YAML skill definitions as the source of truth.

## Architecture
- **Language:** TypeScript (Node.js)
- **SDK:** `@modelcontextprotocol/sdk`
- **Location:** `/mcp-server` (new directory in repo root)
- **Data Source:** Local filesystem (`registry.yaml` and skill directories)

## Tool Specifications

### 1. `spawner_skills`
- **Goal:** Find and retrieve skill definitions.
- **Logic:**
  - Parse `registry.yaml` to get categories.
  - Recursively search for `skill.yaml` files.
  - Implement fuzzy search on skill names/descriptions.
- **Input Schema:**
  - `query` (string): Search term.
  - `category` (optional string): Filter by category.
- **Verification:** Search for "micro-saas-launcher" and ensure it returns the correct path and description.

### 2. `spawner_validate`
- **Goal:** Run code validation rules defined in skills.
- **Logic:**
  - Locate `validations.yaml` files (either global or specific to a skill context).
  - Iterate through rules (mostly regex-based).
  - Check provided code content against rules.
- **Input Schema:**
  - `code` (string): Content to validate.
  - `language` (optional string): Language identifier.
  - `context` (optional string): Skill ID to load specific validations from.
- **Verification:** Validate code containing "sk_live_" and ensure it triggers the "API Key in Frontend" warning.

### 3. `spawner_remember`
- **Goal:** Persist project context/decisions.
- **Logic:**
  - Use a JSON file (`~/.spawner/memory.json`) as a key-value store.
  - Support set/get/list operations.
- **Input Schema:**
  - `action` (enum: "set", "get", "list")
  - `key` (string)
  - `value` (string, for "set")
- **Verification:** Set a value, restart server, and verify the value can be retrieved.

### 4. `spawner_watch_out`
- **Goal:** Surface relevant sharp edges (gotchas) from skills.
- **Logic:**
  - Load `sharp-edges.yaml` files from installed skills.
  - Check `detection_pattern` regex against user's recent code or context.
  - Alternatively, allow manual lookup by skill ID.
- **Input Schema:**
  - `code` (optional string): Code to scan for sharp edges.
  - `skill_id` (optional string): Specific skill to check.
- **Verification:** Check "marketing later" text against `micro-saas-launcher` to see if it triggers the "no-distribution-plan" warning.

### 5. `spawner_unstick`
- **Goal:** Provide strategies to get unstuck.
- **Logic:**
  - Return a list of oblique strategies (Brian Eno style) or specific debugging steps.
  - Load content from `mind/debugging-master` or `mind/decision-maker` if available.
- **Input Schema:**
  - `problem` (string): Description of the stuck state.
- **Verification:** Send "I can't fix this bug" and receive structured debugging advice.

### 6. `spawner_orchestrate`
- **Goal:** High-level task planning and routing.
- **Logic:**
  - Analyze the user's request.
  - Suggest which other spawner tools to use.
  - (MVP) Simple pass-through prompt/router.
- **Input Schema:**
  - `task` (string): The user's high-level goal.
- **Verification:** Input "Build a SaaS" and ensure it suggests using `spawner_skills` to find "micro-saas-launcher".

## Implementation Roadmap

1. **Scaffold Project**: Init `mcp-server`, deps, tsconfig.
2. **Core Server**: Setup MCP connection and entry point.
3. **Implement Tools**: Add handlers for all 6 tools above.
4. **Configuration**: Point Claude to the local server.
5. **Verification**: Run the verification steps for each tool.
