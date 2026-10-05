import type {Pool} from "pg";
import type {AgentTask} from "../core/types.js";
import type {TaskStore} from "../core/task-store.js";

export class PostgresTaskStore implements TaskStore {
  constructor(private readonly pool:Pool){}

  async list():Promise<AgentTask[]> {
    const {rows}=await this.pool.query(
      `select id, goal, status, attempts, max_attempts, recovery_history,
              result, error, created_at, updated_at
         from tasks order by created_at desc`
    );
    return rows.map(row=>({
      id:row.id, goal:row.goal, status:row.status, attempts:row.attempts,
      maxAttempts:row.max_attempts, recoveryHistory:row.recovery_history ?? [],
      result:row.result ?? undefined, error:row.error ?? undefined,
      createdAt:new Date(row.created_at).toISOString(),
      updatedAt:new Date(row.updated_at).toISOString()
    }));
  }

  async upsert(task:AgentTask):Promise<AgentTask> {
    await this.pool.query(
      `insert into tasks
        (id,goal,status,attempts,max_attempts,recovery_history,result,error,created_by,created_at,updated_at,completed_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       on conflict (id) do update set
         goal=excluded.goal,status=excluded.status,attempts=excluded.attempts,
         max_attempts=excluded.max_attempts,recovery_history=excluded.recovery_history,
         result=excluded.result,error=excluded.error,updated_at=excluded.updated_at,
         completed_at=excluded.completed_at`,
      [
        task.id,task.goal,task.status,task.attempts,task.maxAttempts,
        JSON.stringify(task.recoveryHistory),task.result==null?null:JSON.stringify(task.result),
        task.error??null,"system",new Date(task.createdAt),new Date(task.updatedAt),
        ["COMPLETED","CANCELLED","FAILED"].includes(task.status)?new Date(task.updatedAt):null
      ]
    );
    return task;
  }
}
