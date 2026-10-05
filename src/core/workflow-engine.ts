import {TaskManager} from "./task-manager.js";
import {VerificationEngine} from "./verification.js";
export class WorkflowEngine {
  constructor(private readonly tasks:TaskManager,private readonly verifier=new VerificationEngine()){}
  async execute(taskId:string,executor:()=>Promise<unknown>){
    this.tasks.updateStatus(taskId,"RUNNING");
    try{
      const result=await executor();
      this.tasks.update(taskId,{result});
      this.tasks.updateStatus(taskId,"VERIFYING");
      const verification=this.verifier.verifyTaskResult(result);
      if(!verification.verified){this.tasks.update(taskId,{error:verification.reason});this.tasks.updateStatus(taskId,"FAILED");return {taskId,result,verification};}
      this.tasks.update(taskId,{result:{value:result,verification}});
      this.tasks.updateStatus(taskId,"VERIFIED");
      this.tasks.updateStatus(taskId,"COMPLETED");
      return {taskId,result,verification};
    }catch(error){
      const message=error instanceof Error?error.message:"Unknown execution error";
      this.tasks.update(taskId,{error:message});
      this.tasks.updateStatus(taskId,"FAILED");
      return {taskId,error:message,verification:{verified:false,evidence:[],reason:message}};
    }
  }
}
