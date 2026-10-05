import {strict as assert} from "node:assert";
import {TaskManager} from "./task-manager.js";
import {AgentRegistry} from "./agent-registry.js";
import {Commander} from "./commander.js";
const tm=new TaskManager(); const ar=new AgentRegistry();
ar.register({name:"worker",role:"dev",department:"software",skills:[],tools:[],permissions:[],status:"ONLINE",workload:0});
const c=new Commander(tm,ar); const out=await c.handle("test command"); assert.equal(out.verification?.verified,true); assert.equal(ar.list()[0].status,"ONLINE"); console.log("commander e2e passed");
