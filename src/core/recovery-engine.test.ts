import {strict as assert} from "node:assert";
import {RecoveryEngine} from "./recovery-engine.js";
import {TaskManager} from "./task-manager.js";
const t=new TaskManager();const task=await t.create("retry");
let n=0;const r=await new RecoveryEngine(t).run(task.id,async()=>{n++;if(n<2)throw new Error("transient");return "ok"},{maxAttempts:3,retryable:()=>true,backoffMs:1,timeoutMs:100});assert.equal(r,"ok");assert.equal(n,2);
const task2=await t.create("timeout");await assert.rejects(()=>new RecoveryEngine(t).run(task2.id,()=>new Promise(r=>setTimeout(r,50)),{maxAttempts:1,retryable:()=>true,timeoutMs:5}),/timeout/i);console.log("recovery timeout and backoff tests passed");
