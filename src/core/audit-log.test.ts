import {strict as assert} from "node:assert";
import {AuditLog} from "./audit-log.js";
const a=new AuditLog();await a.init();const r=await a.append({actor:"commander",action:"TASK_CREATED",target:"task-1",outcome:"SUCCESS"});assert.ok(r.id);assert.ok(a.list().some(x=>x.id===r.id));console.log("audit log tests passed");
