import {randomUUID} from "node:crypto";
export type AuditOutcome="SUCCESS"|"FAILURE"|"DENIED";
export interface AuditRecord{id:string;timestamp:string;actor:string;action:string;target?:string;result?:unknown;outcome:AuditOutcome;error?:string;}
export class AuditLog{
 private records:AuditRecord[]=[];
 append(input:Omit<AuditRecord,"id"|"timestamp">){const r={id:randomUUID(),timestamp:new Date().toISOString(),...input};this.records.push(Object.freeze(r));return r;}
 list(){return [...this.records];}
}
