import {strict as assert} from "node:assert";
import {VerificationEngine} from "./verification.js";
const v=new VerificationEngine();
assert.equal(v.verifyTaskResult(undefined).verified,false);
assert.equal(v.verifyTaskResult({ok:true}).verified,true);
console.log("verification tests passed");
