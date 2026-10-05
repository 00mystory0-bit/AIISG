import { randomUUID } from "node:crypto";
import type {AgentTask,TaskStatus} from "./types.js";
import {assertTransition} from "./task-state.js";

export class TaskManager {
  private readonly tasks=new Map<string,AgentTask>();
  create(goal:string):AgentTask { const now=new Date().toISOString(); const task={id:randomUUID(),goal,status:"PLANNED" as const,createdAt:now,updatedAt:now}; this.tasks.set(task.id,task); return task; }
  updateStatus(id:string,status:TaskStatus):AgentTask { const current=this.tasks.get(id); if(!current) throw new Error("Task not found"); assertTransition(current.status,status); const updated={...current,status,updatedAt:new Date().toISOString()}; this.tasks.set(id,updated); return updated; }
  update(id:string,patch:Partial<Omit<AgentTask,"id"|"status">>):AgentTask { const current=this.tasks.get(id); if(!current) throw new Error("Task not found"); const updated={...current,...patch,updatedAt:new Date().toISOString()}; this.tasks.set(id,updated); return updated; }
  list(){return [...this.tasks.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
}
