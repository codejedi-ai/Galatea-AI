# Automatic Table Creation System

This system automatically creates database tables when they don't exist, eliminating the need for manual migrations when connecting to a new Supabase instance.

## How It Works

### 1. Database Functions
PostgreSQL functions in `supabase/migrations/20251003000000_auto_create_tables.sql` create tables if they don't exist:
- `create_table_user_profiles()`
- `create_table_companions()`
- `create_table_swipe_decisions()`
- `create_table_matches()`
- `create_table_conversations()`
- `create_table_messages()`
- `create_table_user_preferences()`
- `create_table_user_stats()`
- `create_table_user_profile_pics()`
- `create_table_user_banners()`

### 2. Edge Functions
Supabase Edge Functions in `supabase/functions/create-table-*/` call the database functions:
- `create-table-user-profiles`
- `create-table-companions`
- `create-table-swipe-decisions`
- `create-table-matches`
- `create-table-conversations`
- `create-table-messages`
- `create-table-user-preferences`
- `create-table-user-stats`
- `create-table-user-profile-pics`
- `create-table-user-banners`

### 3. Utility Function
The `ensureTableExists()` utility in `lib/utils/ensure-table.ts`:
- Detects when a table access fails (missing table error)
- Automatically calls the appropriate Edge Function
- Retries the query after table creation

## Usage

### Automatic (Recommended)
Wrap your Supabase queries with `ensureTableExists()`:

```typescript
import { ensureTableExists } from '@/lib/utils/ensure-table'

// Example: Fetch companions
const { data, error } = await ensureTableExists('companions', async () => {
  return await supabase
    .from('companions')
    .select('*')
    .eq('is_active', true)
})
```

### Manual
You can also call Edge Functions directly:

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/create-table-companions`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
  }
)
```

## Table Mapping

| Table Name | Edge Function | Database Function |
|-----------|--------------|-------------------|
| `user_profiles` | `create-table-user-profiles` | `create_table_user_profiles()` |
| `companions` | `create-table-companions` | `create_table_companions()` |
| `swipe_decisions` | `create-table-swipe-decisions` | `create_table_swipe_decisions()` |
| `matches` | `create-table-matches` | `create_table_matches()` |
| `conversations` | `create-table-conversations` | `create_table_conversations()` |
| `messages` | `create-table-messages` | `create_table_messages()` |
| `user_preferences` | `create-table-user-preferences` | `create_table_user_preferences()` |
| `user_stats` | `create-table-user-stats` | `create_table_user_stats()` |
| `user_profile_pics` | `create-table-user-profile-pics` | `create_table_user_profile_pics()` |
| `user_banners` | `create-table-user-banners` | `create_table_user_banners()` |

## Error Detection

The system detects missing table errors by checking for:
- Error code `PGRST116` (PostgREST: relation does not exist)
- Error code `42P01` (PostgreSQL: relation does not exist)
- Error messages containing "does not exist", "relation", or "table"

## Benefits

1. **Zero Configuration**: Tables are created automatically when accessed
2. **New Instance Ready**: Works immediately with fresh Supabase instances
3. **No Manual Migrations**: Tables are created on-demand
4. **Idempotent**: Safe to call multiple times (checks if table exists first)
5. **Complete Schema**: Each function creates the full table with indexes, RLS policies, and triggers

## Setup

1. Apply the migration:
   ```bash
   supabase db reset
   # or
   supabase migration up
   ```

2. Deploy Edge Functions (if using remote Supabase):
   ```bash
   supabase functions deploy create-table-user-profiles
   supabase functions deploy create-table-companions
   # ... deploy all other functions
   ```

3. Use `ensureTableExists()` in your database access code (already integrated in `lib/database/companions.ts` and `lib/database/user-profile.ts`)

## Notes

- Tables are created with full schema including indexes, RLS policies, and triggers
- The system is idempotent - calling it multiple times is safe
- Edge Functions require `SUPABASE_SERVICE_ROLE_KEY` to execute database functions
- The utility automatically retries queries after table creation with a 500ms delay

