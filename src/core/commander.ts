import {TaskManager} from "./task-manager.js";
export class Commander {
  constructor(private readonly tasks:TaskManager){}
  async handle(goal:string){
    const task=this.tasks.create(goal);
    this.tasks.updateStatus(task.id,"QUEUED");
    this.tasks.updateStatus(task.id,"RUNNING");
    return this.tasks.update(task.id,{result:{taskId:task.id,intent:"general_assistant",response:`JARVIS received: ${goal}`}});
  }
}
