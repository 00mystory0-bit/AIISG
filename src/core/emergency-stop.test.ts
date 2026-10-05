import {strict as assert} from "node:assert";
import {EmergencyStop} from "./emergency-stop.js";
const e=new EmergencyStop();assert.equal(e.isActive(),false);e.activate("test");assert.equal(e.status().active,true);assert.throws(()=>e.assertRunning(),/emergency stop/);e.reset();assert.doesNotThrow(()=>e.assertRunning());console.log("emergency stop tests passed");
