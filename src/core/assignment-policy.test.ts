import {strict as assert} from "node:assert";
import {AssignmentPolicy} from "./assignment-policy.js";
const p=new AssignmentPolicy();
const a=p.choose([{id:"1",name:"a",role:"dev",department:"software",skills:["ts"],tools:[],permissions:[],status:"ONLINE",workload:2},{id:"2",name:"b",role:"dev",department:"software",skills:["ts"],tools:[],permissions:[],status:"ONLINE",workload:1}],["ts"]);
assert.equal(a.id,"2"); console.log("assignment policy tests passed");
