import {AgentRegistry} from "./agent-registry.js";
import {AssignmentPolicy} from "./assignment-policy.js";
import {TaskManager} from "./task-manager.js";
import {WorkflowEngine} from "./workflow-engine.js";

export interface Subtask{id?:string;goal:string;requiredSkills?:string[];dependsOn?:number[];}
export interface SubtaskResult{taskId:string;agentId:string;result:unknown;}

type VerificationCarrier={verification?:{verified?:boolean}};

export class MultiAgentOrchestrator{
 private readonly policy=new AssignmentPolicy();
 constructor(private readonly agents:AgentRegistry,private readonly tasks:TaskManager,private readonly workflows=new WorkflowEngine(tasks)){}
 async execute(subtasks:Subtask[]){
  const results:Array<SubtaskResult|{taskId:string;blocked:true;reason:string}>=[]; const selected=[] as ReturnType<AgentRegistry["list"]>; const reserved=new Set<string>();
  for(const sub of subtasks){
   const agent=this.policy.choose(this.agents.list().filter(a=>!reserved.has(a.id)),sub.requiredSkills??[]);
   reserved.add(agent.id); selected.push(agent);
  }
  for(let i=0;i<subtasks.length;i++){
   const sub=subtasks[i];
   const dependencyFailed=(sub.dependsOn??[]).some(d=>{
    const dependency=results[d];
    if(!dependency || !("result" in dependency)) return true;
    const verification=(dependency.result as VerificationCarrier).verification;
    return verification?.verified===false;
   });
   if(dependencyFailed){
    const task=await this.tasks.create(sub.goal);
    await this.tasks.updateStatus(task.id,"BLOCKED");
    results[i]={taskId:task.id,blocked:true,reason:"Dependency did not verify"};
    continue;
   }
   const task=await this.tasks.create(sub.goal);
   await this.tasks.updateStatus(task.id,"QUEUED");
   this.agents.assign(selected[i].id,task.id);
   const dependencyResults=(sub.dependsOn??[]).map(d=>results[d]);
   const result=await this.workflows.execute(task.id,async()=>({
    ok:true,
    taskId:task.id,
    agentId:selected[i].id,
    response:"Executed: "+sub.goal,
    dependencies:dependencyResults
   }));
   if(result.verification?.verified)this.agents.release(selected[i].id); else this.agents.setStatus(selected[i].id,"ERROR");
   results[i]={taskId:task.id,agentId:selected[i].id,result};
  }
  return results;
 }
}
