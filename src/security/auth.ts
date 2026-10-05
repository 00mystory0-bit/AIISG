import crypto from "node:crypto";
import type {Request} from "express";
import type {Role} from "./access-policy.js";

export interface Principal { role: Role; source: "api-key"; }

const ROLE_KEYS: Array<[Role, string | undefined]> = [
  ["owner", process.env.AIISG_OWNER_API_KEY],
  ["operator", process.env.AIISG_OPERATOR_API_KEY],
  ["observer", process.env.AIISG_OBSERVER_API_KEY]
];

function safeEqual(a:string,b:string) {
  const left=Buffer.from(a); const right=Buffer.from(b);
  return left.length===right.length && crypto.timingSafeEqual(left,right);
}

export function authenticateToken(token:string|undefined):Principal|null {
  if(!token) return null;
  for(const [role,configured] of ROLE_KEYS) {
    if(configured && safeEqual(token,configured)) return {role,source:"api-key"};
  }
  return null;
}

export function bearerToken(req:Request):string|undefined {
  const header=req.header("authorization");
  if(!header) return undefined;
  const match=/^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1];
}

export function authenticateRequest(req:Request):Principal|null {
  return authenticateToken(bearerToken(req));
}
