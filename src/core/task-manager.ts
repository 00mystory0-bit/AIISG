import { randomUUID } from "node:crypto";
import type {AgentTask,TaskStatus} from "./types.js";
import {assertTransition} from "./task-state.js";
import {DurableTaskStore} from "./durable-task-store.js";

export class TaskManager {
  private readonly tasks=new Map<string,AgentTask>();
  constructor(private readonly durable=new DurableTaskStore()){}
  async init(){for(const record of await this.durable.list())this.tasks.set(record.id,record.value);}
  async create(goal:string):Promise<AgentTask>{
    const now=new Date().toISOString(); const task={id:randomUUID(),goal,status:"PLANNED" as const,createdAt:now,updatedAt:now};
    this.tasks.set(task.id,task); await this.durable.upsert(task); return task;
  }
  async updateStatus(id:string,status:TaskStatus):Promise<AgentTask>{
    const current=this.tasks.get(id); if(!current)throw new Error("Task not found");
    assertTransition(current.status,status); const updated={...current,status,updatedAt:new Date().toISOString()};
    this.tasks.set(id,updated); await this.durable.upsert(updated); return updated;
  }
  async update(id:string,patch:Partial<Omit<AgentTask,"id"|"status">>):Promise<AgentTask>{
    const current=this.tasks.get(id); if(!current)throw new Error("Task not found");
    const updated={...current,...patch,updatedAt:new Date().toISOString()}; this.tasks.set(id,updated); await this.durable.upsert(updated); return updated;
  }
  list(){return [...this.tasks.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
}
