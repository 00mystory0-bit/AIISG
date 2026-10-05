import type {AgentTask} from "./types.js";
import {DurableStore} from "./durable-store.js";
import type {TaskStore} from "./task-store.js";

export class DurableTaskStore implements TaskStore {
  private readonly store=new DurableStore<AgentTask>("data/tasks.json");
  async list(){return (await this.store.load()).map(record=>record.value);}
  async upsert(task:AgentTask){
    const records=await this.store.load();
    const record={id:task.id,value:task,updatedAt:new Date().toISOString()};
    const index=records.findIndex(r=>r.id===task.id);
    if(index>=0)records[index]=record; else records.push(record);
    await this.store.save(records);
    return task;
  }
}
