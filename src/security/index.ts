export * from "./security-guard.js";


export type Permission = "read" | "think" | "tool:execute" | "security:approve" | "memory:write";
export type Role = "owner" | "operator" | "observer";
const permissions: Record<Role, Permission[]> = {
  owner: ["read","think","tool:execute","security:approve","memory:write"],
  operator: ["read","think","tool:execute","memory:write"],
  observer: ["read","think"]
};
export function can(role: Role, permission: Permission) { return permissions[role].includes(permission); }
export function assertPermission(role: Role, permission: Permission) { if (!can(role, permission)) throw new Error("Permission denied"); }

export class RateLimiter {
  private readonly buckets = new Map<string, { count:number; reset:number }>();
  constructor(private readonly max=60, private readonly windowMs=60_000) {}
  allow(key:string) {
    const now=Date.now(); const current=this.buckets.get(key);
    if(!current || now>=current.reset){this.buckets.set(key,{count:1,reset:now+this.windowMs});return true;}
    if(current.count>=this.max)return false; current.count+=1; return true;
  }
}
