import {TaskManager} from "./task-manager.js";
export interface RecoveryPolicy {maxAttempts:number; retryable:(error:unknown)=>boolean;}
export class RecoveryEngine {
  constructor(private readonly tasks:TaskManager){}
  async run<T>(taskId:string,executor:()=>Promise<T>,policy:RecoveryPolicy){
    const max=Math.max(1,policy.maxAttempts);
    for(let attempt=1;attempt<=max;attempt++){
      await this.tasks.setAttempt(taskId,attempt);
      try{return await executor();}
      catch(error){
        const message=error instanceof Error?error.message:String(error);
        await this.tasks.recordRecovery(taskId,message);
        if(!policy.retryable(error) || attempt===max){
          await this.tasks.update(taskId,{error:message});
          await this.tasks.updateStatus(taskId,"ESCALATED");
          throw error;
        }
      }
    }
    throw new Error("Recovery exhausted");
  }
}
