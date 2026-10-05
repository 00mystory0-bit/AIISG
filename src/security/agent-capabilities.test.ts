import {strict as assert} from "node:assert";
import {assertCapability} from "./agent-capabilities.js";
assert.doesNotThrow(()=>assertCapability({capabilities:["task:execute"]},"task:execute"));
assert.throws(()=>assertCapability({capabilities:[]},"tool:medium-risk"),/denied/);
console.log("agent capability tests passed");
