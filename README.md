# AIISG — JARVIS v1

AIISG (Artificial Intelligent Genie) is a provider-agnostic autonomous AI office platform.

## JARVIS v1 foundation
- HTTP health endpoint
- WebSocket command channel
- Commander/orchestration boundary
- Task lifecycle
- Explicit tool registry with risk metadata
- Provider-agnostic boundary for future LLM, voice and vision adapters

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

Endpoints:
- GET /health
- GET /api/tools
- GET /api/tasks
- POST /api/command

WebSocket: ws://localhost:8787/ws

## Roadmap
Next: authenticated AI provider adapter, streaming voice, vision, persistent memory, approval gates, computer-control tools, verification, and 3D command center.

## Security
Secrets stay in environment variables. High-risk computer actions require explicit approval gates.
