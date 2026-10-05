import type {AgentTask} from "./types.js";
import {DurableStore} from "./durable-store.js";

export class DurableTaskStore{
  private readonly store=new DurableStore<AgentTask>("data/tasks.json");
  async list(){return this.store.load();}
  async upsert(task:AgentTask){
    const records=await this.store.load();
    const now=new Date().toISOString();
    const index=records.findIndex(r=>r.id===task.id);
    const record={id:task.id,value:task,updatedAt:now};
    if(index>=0)records[index]=record;else records.push(record);
    await this.store.save(records); return task;
  }
}
