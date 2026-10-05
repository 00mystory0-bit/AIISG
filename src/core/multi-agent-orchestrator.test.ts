import {strict as assert} from "node:assert";
import {AgentRegistry} from "./agent-registry.js";
import {TaskManager} from "./task-manager.js";
import {MultiAgentOrchestrator} from "./multi-agent-orchestrator.js";
const a=new AgentRegistry();for(const n of ["a","b","c"])a.register({name:n,role:"worker",department:"software",skills:[],tools:[],permissions:[],status:"ONLINE",workload:0});
const out=await new MultiAgentOrchestrator(a,new TaskManager()).execute([{goal:"one"},{goal:"two",dependsOn:[0]}]);
assert.equal(out.length,2);assert.ok("result" in out[0] && out[0].result.verification?.verified);assert.ok("result" in out[1] && out[1].result.verification?.verified);assert.deepEqual((out[1].result as any).result.dependencies.length,1);assert.equal(new Set(out.filter(x=>"agentId" in x).map(x=>(x as any).agentId)).size,2);console.log("multi-agent dependency orchestration passed");
