import "dotenv/config";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import { TaskManager } from "./core/task-manager.js";
import { Commander } from "./core/commander.js";
import { executeTool, listTools } from "./core/tools.js";

const app = express();
const httpServer = createServer(app);
const ws = new WebSocketServer({ server: httpServer, path: "/ws" });
const tasks = new TaskManager();
const commander = new Commander(tasks);

app.use(cors());
app.use(express.json());
app.use((req,res,next)=>{const key=req.ip||"unknown";if(!limiter.allow(key))return res.status(429).json({error:"Rate limit exceeded"});next();});
const roleOf=(req:express.Request):Role=>{const role=req.header("x-aiisg-role");return role==="owner"||role==="operator"||role==="observer"?role:"observer";};

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "AIISG JARVIS", version: "0.1.0" });
});

app.get("/api/tools", (_req, res) => res.json({ tools: listTools() }));
app.get("/api/tasks", (_req, res) => res.json({ tasks: tasks.list() }));

app.post("/api/command", async (req, res) => {
  const goal = typeof req.body?.goal === "string" ? req.body.goal.trim() : "";
  if (!goal) return res.status(400).json({ error: "goal is required" });

  try {
    res.json(await commander.handle(goal));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/api/tools/:name", async (req, res) => {
  try {
    res.json(await executeTool(req.params.name, req.body ?? {}));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

ws.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "ready", service: "AIISG JARVIS" }));

  socket.on("message", async (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as { type?: string; goal?: string };
      if (message.type !== "command" || typeof message.goal !== "string") {
        socket.send(JSON.stringify({ type: "error", error: "Expected {type:'command',goal:string}" }));
        return;
      }
      const result = await commander.handle(message.goal);
      socket.send(JSON.stringify({ type: "task.completed", data: result }));
    } catch (error) {
      socket.send(JSON.stringify({
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      }));
    }
  });
});

const port = Number(process.env.PORT ?? 8787);
httpServer.listen(port, () => {
  console.log(`AIISG JARVIS listening on http://localhost:${port}`);
});
