import type {AgentTask} from "./types.js";

export interface TaskStore {
  list():Promise<AgentTask[]>;
  upsert(task:AgentTask):Promise<AgentTask>;
}
