import { randomUUID } from "node:crypto";
import type { AgentTask } from "./types.js";

export class TaskManager {
  private readonly tasks = new Map<string, AgentTask>();

  create(goal: string): AgentTask {
    const now = new Date().toISOString();
    const task: AgentTask = {
      id: randomUUID(),
      goal,
      status: "idle",
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, patch: Partial<AgentTask>): AgentTask {
    const current = this.tasks.get(id);
    if (!current) throw new Error("Task not found");
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updated);
    return updated;
  }

  list(): AgentTask[] {
    return [...this.tasks.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
