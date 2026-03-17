# Edge Functions Architecture

All database queries for profile pictures and banners have been moved to Edge Functions. This provides better security, automatic table creation, and centralized logic.

## Edge Functions

### Profile Picture Functions

1. **`get-profile-picture`** (GET)
   - Retrieves the user's profile picture URL
   - Automatically creates `user_profile_pics` table if it doesn't exist
   - Returns `{ success: true, url: string, key: string }` or `{ success: true, url: null }`

2. **`upload-profile-picture`** (POST)
   - Uploads a profile picture file
   - Validates file type (image only) and size (max 5MB)
   - Deletes old profile picture if exists
   - Stores file as `{userId}/{filename}`
   - Updates `user_profile_pics` table with `{ user_id, profile_pic_key }`
   - Returns `{ success: true, url: string, key: string }`

3. **`delete-profile-picture`** (DELETE)
   - Deletes the user's profile picture
   - Removes file from storage and record from database
   - Returns `{ success: true, message: string }`

### Banner Functions

1. **`get-banner`** (GET)
   - Retrieves the user's banner URL
   - Automatically creates `user_banners` table if it doesn't exist
   - Returns `{ success: true, url: string, key: string }` or `{ success: true, url: null }`

2. **`upload-banner`** (POST)
   - Uploads a banner file
   - Validates file type (image only) and size (max 5MB)
   - Deletes old banner if exists
   - Stores file as `{userId}/banner/{filename}`
   - Updates `user_banners` table with `{ user_id, banner_key }`
   - Returns `{ success: true, url: string, key: string }`

3. **`delete-banner`** (DELETE)
   - Deletes the user's banner
   - Removes file from storage and record from database
   - Returns `{ success: true, message: string }`

## Table Structure

### `user_profile_pics`
```sql
CREATE TABLE user_profile_pics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_pic_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### `user_banners`
```sql
CREATE TABLE user_banners (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  banner_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## Client Usage

### Get Profile Picture
```typescript
import { getUserAvatarUrl } from '@/lib/utils/avatar'

const url = await getUserAvatarUrl(user, cacheBust)
// Returns: string | null
```

### Get Banner
```typescript
import { getUserBannerUrl } from '@/lib/utils/banner'

const url = await getUserBannerUrl(user, cacheBust)
// Returns: string | null
```

### Upload Profile Picture
```typescript
import { uploadProfilePicture } from '@/lib/storage'

const url = await uploadProfilePicture(userId, file)
// Returns: string (public URL)
```

### Upload Banner
```typescript
import { uploadBanner } from '@/lib/storage'

const url = await uploadBanner(userId, file)
// Returns: string (public URL)
```

### Delete Profile Picture
```typescript
import { deleteProfilePicture } from '@/lib/storage'

await deleteProfilePicture(userId)
```

### Delete Banner
```typescript
import { deleteBanner } from '@/lib/storage'

await deleteBanner(userId)
```

## Automatic Table Creation

All Edge Functions automatically ensure tables exist before operations:

1. Each function calls the appropriate `create_table_*` database function
2. If the table doesn't exist, it's created with full schema (columns, indexes, RLS policies, triggers)
3. Operations proceed normally after table creation

## Benefits

1. **Security**: All database operations happen server-side with service role key
2. **Automatic Setup**: Tables are created automatically when needed
3. **Centralized Logic**: All image handling logic in one place
4. **Error Handling**: Consistent error responses across all functions
5. **Validation**: File type and size validation in Edge Functions
6. **Cleanup**: Automatic deletion of old files when uploading new ones

## Deployment

For local development:
```bash
supabase functions serve
```

For production:
```bash
supabase functions deploy get-profile-picture
supabase functions deploy get-banner
supabase functions deploy upload-profile-picture
supabase functions deploy upload-banner
supabase functions deploy delete-profile-picture
supabase functions deploy delete-banner
```

Or deploy all at once:
```bash
supabase functions deploy
```

## Environment Variables

Edge Functions require:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database operations
- `SUPABASE_ANON_KEY` - Anon key for user authentication

These are automatically provided by Supabase when running locally or deployed.

