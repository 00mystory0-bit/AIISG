export type AgentCapability="task:read"|"task:execute"|"tool:low-risk"|"tool:medium-risk"|"security:test"|"memory:write";
export interface CapabilityContext{capabilities:string[];}
export function hasCapability(ctx:CapabilityContext,cap:AgentCapability){return ctx.capabilities.includes(cap);}
export function assertCapability(ctx:CapabilityContext,cap:AgentCapability){if(!hasCapability(ctx,cap))throw new Error("Agent capability denied: "+cap);}
