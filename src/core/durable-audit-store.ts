import {DurableStore} from "./durable-store.js";
import type {AuditRecord} from "./audit-log.js";
export class DurableAuditStore{
 private readonly store=new DurableStore<AuditRecord>("data/audit.json");
 async list(){return (await this.store.load()).map(r=>r.value);}
 async append(record:AuditRecord){const records=await this.store.load();records.push({id:record.id,value:record,updatedAt:record.timestamp});await this.store.save(records);return record;}
}
