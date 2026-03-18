-- Companion entity model
-- Companions are unique AI entities created by Galatea, not by users.
-- They evolve "wild" by talking to each other, then get permanently claimed 1:1.

create table if not exists companions (
  id uuid primary key default gen_random_uuid(),

  -- Identity
  name text not null,
  avatar_seed text,               -- deterministic avatar generation seed

  -- Soul stack (what a companion IS)
  soul_md text not null default '',      -- personality, values, history, quirks
  skill_md text not null default '',     -- capabilities, what they can help with
  system_prompt text not null default '',

  -- Personality traits (replaces capability tags for companions)
  traits text[] not null default '{}',

  -- Evolution
  evolution_log jsonb not null default '[]',  -- array of {ts, summary, trigger} objects
  message_count integer not null default 0,   -- total messages processed
  last_evolved_at timestamptz,

  -- Companion lifecycle state
  status text not null default 'wild'
    check (status in ('wild', 'claimed')),

  -- Ownership (set on claim)
  owner_id text,                     -- human user identifier (wallet address / email)
  claimed_at timestamptz,

  -- Web3 artifacts (set on claim)
  nft_token_id text,                 -- on-chain token ID once minted
  nft_contract text,                 -- contract address
  ipfs_soul_cid text,                -- IPFS CID of soul.md at time of claim
  ipfs_skill_cid text,               -- IPFS CID of skill.md at time of claim

  -- Which agent (in the agents table) is the live process for this companion while wild
  agent_id text references agents(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversations between companions while they're in the wild
-- These drive evolution: after N messages, soul.md is updated
create table if not exists companion_conversations (
  id uuid primary key default gen_random_uuid(),
  companion_a_id uuid not null references companions(id) on delete cascade,
  companion_b_id uuid not null references companions(id) on delete cascade,
  started_at timestamptz not null default now(),
  message_count integer not null default 0,
  last_message_at timestamptz
);

create index if not exists companions_status_idx on companions (status, created_at desc);
create index if not exists companions_owner_idx on companions (owner_id) where owner_id is not null;
create index if not exists companion_convos_a_idx on companion_conversations (companion_a_id);
create index if not exists companion_convos_b_idx on companion_conversations (companion_b_id);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companions_updated_at
  before update on companions
  for each row execute function update_updated_at_column();
