# AIISG Architecture

## Runtime flow

User -> Authenticated API/WebSocket -> Commander -> Task Manager -> Assignment Policy -> Agent -> Tool -> Verification -> Audit/Event Stream.

Security Guard sits at the execution boundary and can block or require approval before high-risk operations.

## Persistence

Production state is PostgreSQL-backed:

- agents
- tasks
- task executions
- verification results
- security events
- audit events
- memory records

The filesystem implementation is a development fallback and is not the production source of truth.

## Non-negotiable execution contract

1. Authenticate the principal.
2. Authorize the requested capability.
3. Classify risk.
4. Require approval when policy demands it.
5. Execute an explicit tool.
6. Record execution evidence.
7. Independently verify the outcome.
8. Persist state and audit event.
9. Return only verified claims.

No component may claim an action succeeded merely because an LLM generated text describing success.
