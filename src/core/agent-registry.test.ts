import {strict as assert} from "node:assert";
import {AgentRegistry} from "./agent-registry.js";

const r=new AgentRegistry();
const a=r.register({
  name:"Senior Software Engineer",
  role:"developer",
  department:"software",
  skills:["typescript"],
  tools:["workspace"],
  permissions:["read"],
  status:"ONLINE",
  workload:0
});
assert.equal(r.list().length,1);
r.setStatus(a.id,"WORKING");
assert.equal(r.get(a.id)?.status,"WORKING");
assert.throws(()=>r.assign(a.id,"task-1"),/not available/);
r.setStatus(a.id,"ONLINE");
r.assign(a.id,"task-1");
assert.equal(r.get(a.id)?.currentTask,"task-1");
assert.equal(r.get(a.id)?.workload,1);
r.release(a.id);
assert.equal(r.get(a.id)?.status,"ONLINE");
console.log("agent registry tests passed");
