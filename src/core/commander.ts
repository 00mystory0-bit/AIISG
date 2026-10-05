import {TaskManager} from "./task-manager.js";
import {AgentRegistry} from "./agent-registry.js";
import {AssignmentPolicy} from "./assignment-policy.js";
import {WorkflowEngine} from "./workflow-engine.js";
import {EmergencyStop} from "./emergency-stop.js";
import {AuditLog} from "./audit-log.js";
export class Commander {
  private readonly policy=new AssignmentPolicy();
  constructor(private readonly tasks:TaskManager,private readonly agents:AgentRegistry,private readonly workflows=new WorkflowEngine(tasks),private readonly stop=new EmergencyStop(),private readonly audit=new AuditLog()){}
  emergencyStop(reason="Emergency stop activated"){this.stop.activate(reason);return this.stop.status();}
  resetEmergencyStop(){this.stop.reset();return this.stop.status();}
  getSafetyStatus(){return this.stop.status();}
  async handle(goal:string,requiredSkills:string[]=[]){
    this.stop.assertRunning();
    const task=await this.tasks.create(goal);
    this.audit.append({actor:"owner",action:"TASK_CREATED",target:task.id,outcome:"SUCCESS",result:{goal}});
    await this.tasks.updateStatus(task.id,"QUEUED");
    const agent=this.policy.choose(this.agents.list(),requiredSkills);
    this.agents.assign(agent.id,task.id);
    this.audit.append({actor:"commander",action:"TASK_ASSIGNED",target:task.id,outcome:"SUCCESS",result:{agentId:agent.id}});
    const result=await this.workflows.execute(task.id,async()=>{this.stop.assertRunning();return {taskId:task.id,agentId:agent.id,response:"JARVIS executed: "+goal};});
    if(result.verification?.verified)this.agents.release(agent.id); else this.agents.setStatus(agent.id,"ERROR");
    this.audit.append({actor:"commander",action:result.verification?.verified?"TASK_COMPLETED":"TASK_FAILED",target:task.id,outcome:result.verification?.verified?"SUCCESS":"FAILURE",result});
    return {...result,agentId:agent.id};
  }
}
