export type AgentStatus = "idle" | "thinking" | "executing" | "completed" | "failed";

export interface AgentTask {
  id: string;
  goal: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
  result?: unknown;
  error?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  risk: "low" | "medium" | "high";
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}
