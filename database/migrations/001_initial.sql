-- AIISG relational persistence foundation
-- PostgreSQL 15+
create extension if not exists pgcrypto;

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  department text not null,
  skills jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  permissions jsonb not null default '[]'::jsonb,
  status text not null,
  workload integer not null default 0 check (workload >= 0),
  current_task_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  goal text not null,
  status text not null,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  recovery_history jsonb not null default '[]'::jsonb,
  result jsonb,
  error text,
  created_by text not null,
  assigned_agent_id uuid references agents(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table agents
  add constraint agents_current_task_fk
  foreign key (current_task_id) references tasks(id) on delete set null;

create table if not exists task_executions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  attempt integer not null check (attempt > 0),
  status text not null,
  input jsonb,
  output jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text
);

create table if not exists verification_results (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  execution_id uuid references task_executions(id) on delete set null,
  verified boolean not null,
  checks jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists security_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  category text not null,
  severity text not null,
  status text not null,
  description text not null,
  requires_approval boolean not null default false,
  actor text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text,
  outcome text not null,
  result jsonb,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists memory_records (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  owner_id text,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_status_updated on tasks(status, updated_at desc);
create index if not exists idx_tasks_agent on tasks(assigned_agent_id, updated_at desc);
create index if not exists idx_executions_task on task_executions(task_id, attempt desc);
create index if not exists idx_verification_task on verification_results(task_id, created_at desc);
create index if not exists idx_security_events_created on security_events(created_at desc);
create index if not exists idx_audit_events_created on audit_events(created_at desc);
create index if not exists idx_memory_namespace on memory_records(namespace, updated_at desc);
