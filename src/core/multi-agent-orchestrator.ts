import {AgentRegistry,Agent} from "./agent-registry.js";
import {AssignmentPolicy} from "./assignment-policy.js";
import {TaskManager} from "./task-manager.js";
import {WorkflowEngine} from "./workflow-engine.js";
export interface Subtask{id?:string;goal:string;requiredSkills?:string[];dependsOn?:number[];}
export interface SubtaskResult{taskId:string;agentId:string;result:unknown;}
export class MultiAgentOrchestrator{
 private readonly policy=new AssignmentPolicy();
 constructor(private readonly agents:AgentRegistry,private readonly tasks:TaskManager,private readonly workflows=new WorkflowEngine(tasks)){}
 async execute(subtasks:Subtask[]){
  const results:Array<SubtaskResult|{taskId:string;blocked:true;reason:string}>=[]; const selected:Agent[]=[]; const reserved=new Set<string>(); const pending=new Set(subtasks.map((_,i)=>i));
   for(const [i,s] of subtasks.entries()) for(const d of s.dependsOn??[]) if(d<0||d>=subtasks.length||d===i) throw new Error(`Invalid dependency for subtask ${i}: ${d}`);
  while(pending.size){
   const ready=[...pending].filter(i=>(subtasks[i].dependsOn??[]).every(d=>results[d]&&"result" in results[d]&&(results[d] as SubtaskResult).result && (results[d] as SubtaskResult).result.verification?.verified!==false));
   const blocked=[...pending].filter(i=>(subtasks[i].dependsOn??[]).some(d=>results[d]&&(!("result" in results[d])||((results[d] as SubtaskResult).result?.verification?.verified===false))));
   for(const i of blocked){const task=await this.tasks.create(subtasks[i].goal);await this.tasks.updateStatus(task.id,"BLOCKED");results[i]={taskId:task.id,blocked:true,reason:"Dependency did not verify"};pending.delete(i);}
   if(!ready.length){if(pending.size)throw new Error("Dependency cycle or unresolved dependency graph");continue;}
   const batch=ready.map(i=>({i,sub:subtasks[i]})); const available=this.agents.list().filter(a=>a.status==="ONLINE");
   if(available.length<batch.length) throw new Error("Insufficient available agents for ready subtasks");
   const batchAgents:Agent[]=[]; const used=new Set<string>();
   for(const {sub} of batch){const agent=this.policy.choose(available.filter(a=>!used.has(a.id)),sub.requiredSkills??[]);used.add(agent.id);batchAgents.push(agent);}
   await Promise.all(batch.map(async({i,sub},j)=>{
    const task=await this.tasks.create(sub.goal);await this.tasks.updateStatus(task.id,"QUEUED");this.agents.assign(batchAgents[j].id,task.id);
    const dependencyResults=(sub.dependsOn??[]).map(d=>results[d]);
    const result=await this.workflows.execute(task.id,async()=>({taskId:task.id,agentId:batchAgents[j].id,response:"Executed: "+sub.goal,dependencies:dependencyResults}));
    if(result.verification?.verified)this.agents.release(batchAgents[j].id);else this.agents.setStatus(batchAgents[j].id,"ERROR");
    results[i]={taskId:task.id,agentId:batchAgents[j].id,result};pending.delete(i);
   }));
  }
  return results;
 }
}
