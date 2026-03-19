-- Blueprint Studio: agent architecture blueprints
create table if not exists blueprints (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  name text not null check (char_length(name) between 1 and 128),
  description text check (char_length(description) <= 500),
  version text not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blueprints_agent_id_idx on blueprints (agent_id);
create index if not exists blueprints_public_idx on blueprints (is_public, created_at desc);
