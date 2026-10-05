import {strict as assert} from "node:assert";
import {assertTransition,canTransition} from "./task-state.js";

assert.equal(canTransition("PLANNED","QUEUED"),true);
assert.equal(canTransition("COMPLETED","RUNNING"),false);
assert.throws(()=>assertTransition("COMPLETED","RUNNING"));
console.log("task-state tests passed");
