# AIISG Database

The relational database is the durable source of truth for production deployments.

## Design rules

- Tasks are immutable in identity and mutable in state.
- Every execution attempt is recorded separately.
- Verification is a first-class record with evidence.
- Security and audit events are append-oriented.
- Agent state is persisted independently from task execution.
- JSONB is used for extensible agent skills, tool metadata, execution payloads and evidence without sacrificing relational indexing.
- Filesystem JSON stores remain development fallbacks only; they must not be treated as the production source of truth.

## Migration

Apply migrations in lexical order using a PostgreSQL migration runner. Do not manually edit an already-applied migration; add a new migration for schema changes.

## Production requirements

- encrypted database connection
- automated backups
- least-privilege database role
- connection pooling
- migration checks in CI
- row-level authorization at the application boundary (and database RLS where the deployment model requires it)
