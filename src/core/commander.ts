import {TaskManager} from "./task-manager.js";
import {AgentRegistry} from "./agent-registry.js";
import {AssignmentPolicy} from "./assignment-policy.js";
import {WorkflowEngine} from "./workflow-engine.js";
export class Commander {
  private readonly policy=new AssignmentPolicy();
  constructor(private readonly tasks:TaskManager,private readonly agents:AgentRegistry,private readonly workflows=new WorkflowEngine(tasks)){}
  async handle(goal:string,requiredSkills:string[]=[]){
    const task=await this.tasks.create(goal);
    await this.tasks.updateStatus(task.id,"QUEUED");
    const agent=this.policy.choose(this.agents.list(),requiredSkills);
    this.agents.assign(agent.id,task.id);
    const result=await this.workflows.execute(task.id,async()=>({taskId:task.id,agentId:agent.id,response:"JARVIS executed: "+goal}));
    if(result.verification?.verified)this.agents.setStatus(agent.id,"ONLINE");
    return {...result,agentId:agent.id};
  }
}
