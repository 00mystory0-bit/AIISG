import "dotenv/config";
import express from "express";
import cors from "cors";
import {WebSocketServer} from "ws";
import {createServer} from "node:http";
import {TaskManager} from "./core/task-manager.js";
import {AgentRegistry} from "./core/agent-registry.js";
import {seedInitialAgents} from "./core/agent-seed.js";
import {Commander} from "./core/commander.js";
import {executeTool,listTools} from "./core/tools.js";
import {RateLimiter} from "./security/rate-limiter.js";
import {assertPermission,type Role} from "./security/access-policy.js";
import {authenticateRequest,authenticateToken} from "./security/auth.js";

const app=express();
const httpServer=createServer(app);
const ws=new WebSocketServer({server:httpServer,path:"/ws"});
const tasks=new TaskManager();
await tasks.init();
const agents=new AgentRegistry();
seedInitialAgents(agents);
agents.list().forEach(a=>agents.setStatus(a.id,"ONLINE"));
const commander=new Commander(tasks,agents);
const limiter=new RateLimiter();

const configuredOrigins=(process.env.AIISG_CORS_ORIGINS??"").split(",").map(v=>v.trim()).filter(Boolean);
app.use(cors({origin: configuredOrigins.length ? configuredOrigins : false}));
app.use(express.json({limit:"256kb"}));
app.use((req,res,next)=>{
  if(!limiter.allow(req.ip||"unknown")) return res.status(429).json({error:"Rate limit exceeded"});
  next();
});

function requirePermission(req:express.Request, permission:Parameters<typeof assertPermission>[1]) {
  const identity=authenticateRequest(req);
  if(!identity) throw new Error("Authentication required");
  assertPermission(identity.role,permission);
  return identity;
}

app.get("/health",(_req,res)=>res.json({ok:true,service:"AIISG",version:"0.1.0"}));

app.get("/api/tools",(req,res)=>{
  try { requirePermission(req,"read"); res.json({tools:listTools()}); }
  catch(e) { res.status(401).json({error:e instanceof Error?e.message:"Authentication required"}); }
});
app.get("/api/tasks",(req,res)=>{
  try { requirePermission(req,"read"); res.json({tasks:tasks.list()}); }
  catch(e) { res.status(401).json({error:e instanceof Error?e.message:"Authentication required"}); }
});
app.get("/api/safety",(req,res)=>{
  try { requirePermission(req,"read"); res.json(commander.getSafetyStatus()); }
  catch(e) { res.status(401).json({error:e instanceof Error?e.message:"Authentication required"}); }
});

app.post("/api/emergency-stop",async(req,res)=>{
  try {
    requirePermission(req,"security:approve");
    res.json(commander.emergencyStop(typeof req.body?.reason==="string"?req.body.reason:"Owner emergency stop"));
  } catch(e) {
    const message=e instanceof Error?e.message:"Emergency stop denied";
    res.status(message==="Authentication required"?401:403).json({error:message});
  }
});
app.post("/api/emergency-reset",async(req,res)=>{
  try {
    requirePermission(req,"security:approve");
    res.json(commander.resetEmergencyStop());
  } catch(e) {
    const message=e instanceof Error?e.message:"Emergency reset denied";
    res.status(message==="Authentication required"?401:403).json({error:message});
  }
});
app.post("/api/command",async(req,res)=>{
  try {
    const identity=requirePermission(req,"task:execute");
    const goal=typeof req.body?.goal==="string"?req.body.goal.trim():"";
    if(!goal) return res.status(400).json({error:"goal is required"});
    const identity=requirePermission(req,"task:execute");
    res.json(await commander.handle(goal,Array.isArray(req.body?.requiredSkills)?req.body.requiredSkills:[],identity.role));
  } catch(e) {
    const message=e instanceof Error?e.message:"Command failed";
    res.status(message==="Authentication required"?401:403).json({error:message});
  }
});
app.post("/api/tools/:name",async(req,res)=>{
  try {
    requirePermission(req,"tool:execute");
    res.json(await executeTool(req.params.name,req.body??{}));
  } catch(e) {
    const message=e instanceof Error?e.message:"Tool execution denied";
    res.status(message==="Authentication required"?401:403).json({error:message});
  }
});

ws.on("connection",socket=>{
  let identity:{role:Role}|null=null;
  socket.send(JSON.stringify({type:"auth.required"}));
  socket.on("message",async raw=>{
    try {
      const message=JSON.parse(raw.toString()) as {type?:string;token?:string;goal?:string};
      if(!identity) {
        if(message.type!=="auth" || typeof message.token!=="string") throw new Error("Authentication required");
        identity=authenticateToken(message.token);
        if(!identity) throw new Error("Invalid credentials");
        socket.send(JSON.stringify({type:"authenticated",role:identity.role}));
        return;
      }
      if(message.type!=="command" || typeof message.goal!=="string") throw new Error("Expected command");
      assertPermission(identity.role,"task:execute");
      socket.send(JSON.stringify({type:"task.result",data:await commander.handle(message.goal,[],identity.role)}));
    } catch(e) {
      socket.send(JSON.stringify({type:"error",error:e instanceof Error?e.message:"Unknown error"}));
    }
  });
});

const port=Number(process.env.PORT??8787);
httpServer.listen(port,()=>console.log(`AIISG listening on ${port}`));
