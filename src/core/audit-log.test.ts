import {strict as assert} from "node:assert";
import {AuditLog} from "./audit-log.js";
const a=new AuditLog();const r=a.append({actor:"commander",action:"TASK_CREATED",target:"task-1",outcome:"SUCCESS"});assert.ok(r.id);assert.equal(a.list().length,1);assert.equal(a.list()[0].action,"TASK_CREATED");console.log("audit log tests passed");
