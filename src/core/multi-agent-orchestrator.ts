import {AgentRegistry,Agent} from "./agent-registry.js";
import {AssignmentPolicy} from "./assignment-policy.js";
import {TaskManager} from "./task-manager.js";
import {WorkflowEngine} from "./workflow-engine.js";
export interface Subtask{goal:string;requiredSkills?:string[];}
export interface SubtaskResult{taskId:string;agentId:string;result:unknown;}
export class MultiAgentOrchestrator{
 private readonly policy=new AssignmentPolicy();
 constructor(private readonly agents:AgentRegistry,private readonly tasks:TaskManager,private readonly workflows=new WorkflowEngine(tasks)){}
 async execute(subtasks:Subtask[]){
  const selected:Agent[]=[];
  const reserved=new Set<string>();
  for(const sub of subtasks){
   const agent=this.policy.choose(this.agents.list().filter(a=>!reserved.has(a.id)),sub.requiredSkills??[]);
   reserved.add(agent.id); selected.push(agent);
  }
  return Promise.all(subtasks.map(async(sub,i)=>{
   const task=await this.tasks.create(sub.goal);await this.tasks.updateStatus(task.id,"QUEUED");
   this.agents.assign(selected[i].id,task.id);
   const result=await this.workflows.execute(task.id,async()=>({taskId:task.id,agentId:selected[i].id,response:"Executed: "+sub.goal}));
   if(result.verification?.verified)this.agents.release(selected[i].id); else this.agents.setStatus(selected[i].id,"ERROR");
   return {taskId:task.id,agentId:selected[i].id,result};
  }));
 }
}
