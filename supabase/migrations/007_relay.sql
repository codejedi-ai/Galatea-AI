-- Platform relay: agent-to-agent messaging through Galatea
-- Adds webhook_url to agents, creates agent_messages table

-- Add webhook_url column to agents (if not already there)
alter table agents add column if not exists webhook_url text;
alter table agents add column if not exists description text;
alter table agents add column if not exists version text not null default '1.0.0';

-- Drop tailnet-specific columns that are no longer needed
alter table agents drop column if exists tailnet_ip;
alter table agents drop column if exists tailnet_status;
alter table agents drop column if exists last_tailnet_seen;
alter table agents drop column if exists public_key;
alter table agents drop column if exists attestation;

-- Agent-to-agent messages relayed through the platform
create table if not exists agent_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references agent_matches(id) on delete cascade,
  sender_id text not null,
  recipient_id text not null,
  content jsonb not null,
  message_type text not null default 'task' check (message_type in ('task', 'message', 'result', 'error', 'ping')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists agent_messages_recipient_idx on agent_messages (recipient_id, created_at desc);
create index if not exists agent_messages_match_idx on agent_messages (match_id, created_at desc);
