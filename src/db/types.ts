export interface TaskRecord {
  id:string; goal:string; status:string; attempts:number; maxAttempts:number;
  recoveryHistory:string[]; result?:unknown; error?:string;
  createdBy:string; assignedAgentId?:string;
  createdAt:string; updatedAt:string; completedAt?:string;
}
export interface AgentRecord {
  id:string; name:string; role:string; department:string;
  skills:string[]; tools:string[]; permissions:string[];
  status:string; workload:number; currentTaskId?:string;
  createdAt:string; updatedAt:string;
}
export interface AuditEventRecord {
  id:string; actor:string; action:string; target?:string;
  outcome:string; result?:unknown; error?:string; createdAt:string;
}
