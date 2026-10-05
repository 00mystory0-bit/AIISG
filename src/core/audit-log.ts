import {randomUUID} from "node:crypto";
import {DurableAuditStore} from "./durable-audit-store.js";
export type AuditOutcome="SUCCESS"|"FAILURE"|"DENIED";
export interface AuditRecord{id:string;timestamp:string;actor:string;action:string;target?:string;result?:unknown;outcome:AuditOutcome;error?:string;}
export class AuditLog{
 private records:AuditRecord[]=[];
 constructor(private readonly durable=new DurableAuditStore()){}
 async init(){this.records=await this.durable.list();}
 async append(input:Omit<AuditRecord,"id"|"timestamp">){const r={id:randomUUID(),timestamp:new Date().toISOString(),...input};this.records.push(Object.freeze(r));await this.durable.append(r);return r;}
 list(){return [...this.records];}
}
