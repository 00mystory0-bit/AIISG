import {strict as assert} from "node:assert";
import {TaskManager} from "./task-manager.js";
import {RecoveryEngine} from "./recovery-engine.js";
const tm=new TaskManager(); const task=await tm.create("retry test"); await tm.updateStatus(task.id,"QUEUED"); await tm.updateStatus(task.id,"RUNNING");
let n=0; const engine=new RecoveryEngine(tm);
const result=await engine.run(task.id,async()=>{n++;if(n<2)throw new Error("transient");return "ok";},{maxAttempts:3,retryable:()=>true});
assert.equal(result,"ok"); assert.equal(n,2); assert.equal((tm.list()[0] as any).attempts,2);
console.log("recovery tests passed");
