export type TaskStatus = "PLANNED"|"QUEUED"|"RUNNING"|"BLOCKED"|"FAILED"|"VERIFYING"|"VERIFIED"|"COMPLETED"|"CANCELLED"|"ESCALATED";
export interface AgentTask { id:string; goal:string; status:TaskStatus; createdAt:string; updatedAt:string; result?:unknown; error?:string; }
export interface ToolDefinition { name:string; description:string; risk:"low"|"medium"|"high"; execute(input:Record<string,unknown>):Promise<unknown>; }
