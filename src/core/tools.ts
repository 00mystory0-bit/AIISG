import type { ToolDefinition } from "./types.js";

const tools: ToolDefinition[] = [
  {
    name: "system_time",
    description: "Return the server's current ISO time.",
    risk: "low",
    async execute() {
      return { iso: new Date().toISOString() };
    }
  },
  {
    name: "health",
    description: "Return AIISG service health.",
    risk: "low",
    async execute() {
      return { ok: true, service: "AIISG JARVIS", version: "0.1.0" };
    }
  }
];

export function listTools() {
  return tools.map(({ execute, ...definition }) => definition);
}

export async function executeTool(name: string, input: Record<string, unknown> = {}) {
  const tool = tools.find((item) => item.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.execute(input);
}
