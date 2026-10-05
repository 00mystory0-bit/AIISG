import {TaskManager} from "./task-manager.js";
export class Commander {
  constructor(private readonly tasks:TaskManager){}
  async handle(goal:string){
    const task=await this.tasks.create(goal);
    await this.tasks.updateStatus(task.id,"QUEUED");
    await this.tasks.updateStatus(task.id,"RUNNING");
    return this.tasks.update(task.id,{result:{taskId:task.id,intent:"general_assistant",response:"JARVIS received: "+goal}});
  }
}
