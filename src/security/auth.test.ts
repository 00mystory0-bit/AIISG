import {strict as assert} from "node:assert";
import {authenticateToken} from "./auth.js";

process.env.AIISG_OWNER_API_KEY="owner-test-key";
process.env.AIISG_OPERATOR_API_KEY="operator-test-key";
process.env.AIISG_OBSERVER_API_KEY="observer-test-key";

assert.equal(authenticateToken("owner-test-key")?.role,"owner");
assert.equal(authenticateToken("operator-test-key")?.role,"operator");
assert.equal(authenticateToken("observer-test-key")?.role,"observer");
assert.equal(authenticateToken(undefined),null);
assert.equal(authenticateToken("owner"),null);
console.log("authentication tests passed");
