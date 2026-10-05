import type {Agent} from "./agent-registry.js";
export class AssignmentPolicy {
 choose(agents:Agent[],requiredSkills:string[]=[]){
  const eligible=agents.filter(a=>a.status==="ONLINE"&&requiredSkills.every(s=>a.skills.includes(s)));
  if(!eligible.length)throw new Error("No eligible agent");
  return [...eligible].sort((a,b)=>a.workload-b.workload)[0];
 }
}
