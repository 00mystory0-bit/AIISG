import {strict as assert} from "node:assert";
import {AgentRegistry} from "./agent-registry.js";
const r=new AgentRegistry();const a=r.register({name:"Senior Software Engineer",role:"developer",department:"software",skills:["typescript"],tools:["workspace"],permissions:["read"],status:"ONLINE",workload:0});
assert.equal(r.list().length,1);r.setStatus(a.id,"WORKING");assert.equal(r.get(a.id)?.status,"WORKING");r.assign(a.id,"task-1");assert.equal(r.get(a.id)?.currentTask,"task-1");console.log("agent registry tests passed");
\nassert.throws(()=>{const b=r.register({name:"offline",role:"dev",department:"software",skills:["ts"],tools:[],permissions:[],status:"OFFLINE",workload:0});r.assign(b.id,"task-2")},/not available/);\n