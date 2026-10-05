import { TaskManager } from "./task-manager.js";

export class Commander {
  constructor(private readonly tasks: TaskManager) {}

  async handle(goal: string) {
    const task = this.tasks.create(goal);
    this.tasks.update(task.id, { status: "thinking" });

    // v1 keeps orchestration deterministic. Provider/model execution is added
    // behind this boundary so the rest of AIISG stays provider-agnostic.
    const result = {
      taskId: task.id,
      intent: "general_assistant",
      response: `JARVIS received: ${goal}`,
      next: "connect an authorized tool or AI provider for execution"
    };

    return this.tasks.update(task.id, {
      status: "completed",
      result
    });
  }
}
