import {randomUUID} from "node:crypto";
export type AgentStatus="ONLINE"|"WORKING"|"THINKING"|"WAITING"|"COLLABORATING"|"IN_MEETING"|"TESTING"|"BLOCKED"|"ERROR"|"PAUSED"|"OFFLINE"|"COMPLETED";
export interface Agent {id:string;name:string;role:string;department:string;skills:string[];tools:string[];permissions:string[];status:AgentStatus;workload:number;currentTask?:string;}
export class AgentRegistry {
 private agents=new Map<string,Agent>();
 register(input:Omit<Agent,"id">){const agent={id:randomUUID(),...input};this.agents.set(agent.id,agent);return agent;}
 get(id:string){return this.agents.get(id);}
 list(){return [...this.agents.values()];}
 setStatus(id:string,status:AgentStatus){const a=this.agents.get(id);if(!a)throw new Error("Agent not found");const updated={...a,status};this.agents.set(id,updated);return updated;}
 assign(id:string,taskId:string){const a=this.agents.get(id);if(!a)throw new Error("Agent not found");if(a.status!=="ONLINE")throw new Error("Agent is not available");return this.update(id,{status:"WORKING",currentTask:taskId,workload:a.workload+1});}
 release(id:string){const a=this.agents.get(id);if(!a)throw new Error("Agent not found");return this.update(id,{status:"ONLINE",currentTask:undefined});}
 update(id:string,patch:Partial<Omit<Agent,"id">>){const a=this.agents.get(id);if(!a)throw new Error("Agent not found");const updated={...a,...patch};this.agents.set(id,updated);return updated;}
}
