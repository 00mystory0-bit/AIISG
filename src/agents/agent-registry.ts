import {randomUUID} from "node:crypto";

export type AgentStatus = "ONLINE"|"WORKING"|"THINKING"|"WAITING"|"COLLABORATING"|"IN_MEETING"|"TESTING"|"BLOCKED"|"ERROR"|"PAUSED"|"OFFLINE"|"COMPLETED";

export interface Agent {
  id:string; name:string; role:string; department:string; skills:string[];
  permissions:string[]; status:AgentStatus; currentTask?:string;
  priority:number; workload:number; createdAt:string;
}

export class AgentRegistry {
  private readonly agents = new Map<string,Agent>();

  register(input: Omit<Agent,"id"|"createdAt"|"status"|"workload">) {
    const agent:Agent={...input,id:randomUUID(),createdAt:new Date().toISOString(),status:"OFFLINE",workload:0};
    this.agents.set(agent.id,agent); return agent;
  }

  setStatus(id:string,status:AgentStatus) {
    const agent=this.agents.get(id); if(!agent) throw new Error("Agent not found");
    agent.status=status; return agent;
  }

  list(){return [...this.agents.values()];}
  get(id:string){return this.agents.get(id);}
}
