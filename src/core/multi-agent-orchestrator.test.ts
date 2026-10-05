import {strict as assert} from "node:assert";
import {AgentRegistry} from "./agent-registry.js";
import {TaskManager} from "./task-manager.js";
import {MultiAgentOrchestrator} from "./multi-agent-orchestrator.js";
const a=new AgentRegistry();for(const n of ["a","b","c"])a.register({name:n,role:"worker",department:"software",skills:[],tools:[],permissions:[],status:"ONLINE",workload:0});
const out=await new MultiAgentOrchestrator(a,new TaskManager()).execute([{goal:"one"},{goal:"two"}]);assert.equal(out.length,2);assert.ok(out.every(x=>x.result.verification?.verified));assert.equal(new Set(out.map(x=>x.agentId)).size,2);assert.equal(a.list().filter(x=>x.status==="ONLINE").length,3);console.log("multi-agent orchestration passed");
