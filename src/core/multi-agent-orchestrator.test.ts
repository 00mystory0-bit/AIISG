import {strict as assert} from "node:assert";
import {AgentRegistry} from "./agent-registry.js";
import {TaskManager} from "./task-manager.js";
import {MultiAgentOrchestrator} from "./multi-agent-orchestrator.js";
const a=new AgentRegistry();for(const n of ["a","b","c","d"])a.register({name:n,role:"worker",department:"software",skills:[],tools:[],permissions:[],status:"ONLINE",workload:0});
const out=await new MultiAgentOrchestrator(a,new TaskManager()).execute([{goal:"one"},{goal:"two"},{goal:"three",dependsOn:[0,1]}]);
assert.equal(out.length,3);assert.ok("result" in out[0]&&"result" in out[1]&&"result" in out[2]);assert.equal((out[2] as any).result.result.dependencies.length,2);assert.equal(new Set(out.filter(x=>"agentId" in x).map(x=>(x as any).agentId)).size,3);assert.equal(a.list().every(x=>x.status==="ONLINE"),true);
console.log("parallel dependency DAG orchestration passed");
