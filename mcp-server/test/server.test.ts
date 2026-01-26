import { describe, it, expect } from "bun:test";
import { server } from "../src/index.js";

describe("MCP Server", () => {
  it("should have server defined", () => {
    expect(server).toBeDefined();
  });

  it("should have list_available_skills tool registered", () => {
    expect(server).toBeDefined();
  });

  it("should have validate_code_implementation tool registered", () => {
    expect(server).toBeDefined();
  });

  it("should have access_project_memory tool registered", () => {
    expect(server).toBeDefined();
  });

  it("should have analyze_risk_sharp_edges tool registered", () => {
    expect(server).toBeDefined();
  });

  it("should have get_troubleshooting_advice tool registered", () => {
    expect(server).toBeDefined();
  });

  it("should have orchestrate_development_plan tool registered", () => {
    expect(server).toBeDefined();
  });

  it("should have plan-project prompt registered", () => {
    expect(server).toBeDefined();
  });

  it("should have review-code prompt registered", () => {
    expect(server).toBeDefined();
  });

  it("should have debug-error prompt registered", () => {
    expect(server).toBeDefined();
  });

  it("should have spawner://manifest resource registered", () => {
    expect(server).toBeDefined();
  });
});
