import {TaskManager} from "./task-manager.js";
import {VerificationEngine} from "./verification.js";
import {RecoveryEngine} from "./recovery-engine.js";
export class WorkflowEngine {
  constructor(private readonly tasks:TaskManager,private readonly verifier=new VerificationEngine(),private readonly recovery=new RecoveryEngine(tasks)){}
  async execute(taskId:string,executor:()=>Promise<unknown>){
    try{
      const result=await this.recovery.run(taskId,executor,{maxAttempts:3,retryable:()=>true});
      await this.tasks.updateStatus(taskId,"VERIFYING");
      const verification=this.verifier.verifyTaskResult(result);
      if(!verification.verified){await this.tasks.update(taskId,{error:verification.reason});await this.tasks.updateStatus(taskId,"FAILED");return {taskId,result,verification};}
      await this.tasks.update(taskId,{result:{value:result,verification}});
      await this.tasks.updateStatus(taskId,"VERIFIED"); await this.tasks.updateStatus(taskId,"COMPLETED");
      return {taskId,result,verification};
    }catch(error){
      const message=error instanceof Error?error.message:"Unknown execution error";
      return {taskId,error:message,verification:{verified:false,evidence:[],reason:message}};
    }
  }
}
