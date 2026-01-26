import { describe, it, expect } from "bun:test";
import { SkillManager, Skill } from "../src/skills.js";

describe("SkillManager - Search Tests", () => {
  it("should find skill with multi-word query across name and description", async () => {
    const skillManager = new SkillManager("/fake/path");

    const mockSkills: Skill[] = [
      {
        id: "llamaindex",
        name: "LlamaIndex",
        category: "ai",
        description: "RAG framework for building AI applications with retrieval-augmented generation",
        path: "/fake/path/ai/llamaindex/skill.yaml",
      },
      {
        id: "react",
        name: "React",
        category: "frontend",
        description: "JavaScript library for building user interfaces",
        path: "/fake/path/frontend/react/skill.yaml",
      },
    ];

    (skillManager as any).skills = mockSkills;

    const results = await skillManager.searchSkills("LlamaIndex RAG");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("llamaindex");
  });

  it("should find skill with single keyword query", async () => {
    const skillManager = new SkillManager("/fake/path");

    const mockSkills: Skill[] = [
      {
        id: "llamaindex",
        name: "LlamaIndex",
        category: "ai",
        description: "RAG framework for building AI applications with retrieval-augmented generation",
        path: "/fake/path/ai/llamaindex/skill.yaml",
      },
      {
        id: "react",
        name: "React",
        category: "frontend",
        description: "JavaScript library for building user interfaces",
        path: "/fake/path/frontend/react/skill.yaml",
      },
    ];

    (skillManager as any).skills = mockSkills;

    // This should work with current implementation
    const results = await skillManager.searchSkills("React");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("react");
    expect(results[0].name).toBe("React");
  });

  it("should find skill when query matches description exactly", async () => {
    const skillManager = new SkillManager("/fake/path");

    const mockSkills: Skill[] = [
      {
        id: "llamaindex",
        name: "LlamaIndex",
        category: "ai",
        description: "RAG framework for building AI applications",
        path: "/fake/path/ai/llamaindex/skill.yaml",
      },
    ];

    (skillManager as any).skills = mockSkills;

    // This works because "RAG" is in description
    const results = await skillManager.searchSkills("RAG");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("llamaindex");
  });

  it("should find skill when query contains words from both name and description", async () => {
    const skillManager = new SkillManager("/fake/path");

    const mockSkills: Skill[] = [
      {
        id: "stripe-payments",
        name: "Stripe",
        category: "integrations",
        description: "Payment processing and subscription billing",
        path: "/fake/path/integrations/stripe-payments/skill.yaml",
      },
    ];

    (skillManager as any).skills = mockSkills;

    const results = await skillManager.searchSkills("Stripe payments");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("stripe-payments");
  });

  it("should filter by category when provided", async () => {
    const skillManager = new SkillManager("/fake/path");

    const mockSkills: Skill[] = [
      {
        id: "react",
        name: "React",
        category: "frontend",
        description: "JavaScript library for building user interfaces",
        path: "/fake/path/frontend/react/skill.yaml",
      },
      {
        id: "llamaindex",
        name: "LlamaIndex",
        category: "ai",
        description: "RAG framework for building AI applications",
        path: "/fake/path/ai/llamaindex/skill.yaml",
      },
    ];

    (skillManager as any).skills = mockSkills;

    // Filter by category
    const results = await skillManager.searchSkills("React", "frontend");

    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("frontend");
  });
});
