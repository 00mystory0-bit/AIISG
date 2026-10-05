export const TASK_STATES = ["PLANNED","QUEUED","RUNNING","BLOCKED","FAILED","VERIFYING","VERIFIED","COMPLETED","CANCELLED","ESCALATED"] as const;
export type TaskState = typeof TASK_STATES[number];

const transitions: Record<TaskState, TaskState[]> = {
  PLANNED:["QUEUED","CANCELLED"],
  QUEUED:["RUNNING","BLOCKED","CANCELLED"],
  RUNNING:["VERIFYING","FAILED","BLOCKED","CANCELLED"],
  BLOCKED:["QUEUED","CANCELLED","ESCALATED"],
  FAILED:["QUEUED","ESCALATED","CANCELLED"],
  VERIFYING:["VERIFIED","FAILED","BLOCKED"],
  VERIFIED:["COMPLETED","FAILED"],
  COMPLETED:[],
  CANCELLED:[],
  ESCALATED:[]
};

export function canTransition(from: TaskState, to: TaskState) {
  return transitions[from].includes(to);
}

export function assertTransition(from: TaskState, to: TaskState) {
  if (!canTransition(from,to)) throw new Error(`Invalid task transition: ${from} -> ${to}`);
}
