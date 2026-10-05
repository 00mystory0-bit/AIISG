import {TaskManager} from "./task-manager.js";
import {VerificationEngine} from "./verification.js";
import {RecoveryEngine} from "./recovery-engine.js";
import {CancellationRegistry} from "./cancellation.js";
export class WorkflowEngine {
  constructor(private readonly tasks:TaskManager,private readonly verifier=new VerificationEngine(),private readonly recovery=new RecoveryEngine(tasks),private readonly cancellation=new CancellationRegistry()){}
  async execute(taskId:string,executor:(signal?:AbortSignal)=>Promise<unknown>){
    const signal=this.cancellation.create(taskId);
    if(signal.aborted){await this.tasks.updateStatus(taskId,"CANCELLED");return {taskId,error:"Cancelled",verification:{verified:false,evidence:[],reason:"Cancelled"}};}
    try{
      const result=await this.recovery.run(taskId,()=>executor(signal),{maxAttempts:3,retryable:(error)=>!(error instanceof Error&&/permission|denied|invalid/i.test(error.message)),backoffMs:25,timeoutMs:30000});
      await this.tasks.updateStatus(taskId,"VERIFYING");
      const verification=this.verifier.verifyTaskResult(result);
      if(!verification.verified){await this.tasks.update(taskId,{error:verification.reason});await this.tasks.updateStatus(taskId,"FAILED");this.cancellation.remove(taskId); return {taskId,result,verification};}
      await this.tasks.update(taskId,{result:{value:result,verification}});
      await this.tasks.updateStatus(taskId,"VERIFIED"); await this.tasks.updateStatus(taskId,"COMPLETED");
      return {taskId,result,verification};
    }catch(error){
      const message=error instanceof Error?error.message:"Unknown execution error";
      await this.tasks.updateStatus(taskId,"FAILED").catch(()=>{}); this.cancellation.remove(taskId); return {taskId,error:message,verification:{verified:false,evidence:[],reason:message}};
    }
  }
}
