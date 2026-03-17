# Firebase to Supabase Migration with Discord Authentication

This document outlines the migration from Firebase to Supabase that has been completed for the Galatea AI project, with server-side authentication and Discord as the primary OAuth provider.

## Changes Made

### 1. Database Migration
- **Firebase Firestore** → **Supabase PostgreSQL**
- Updated `lib/companions.ts` to use Supabase client instead of Firestore
- Replaced Firestore operations:
  - `collection()`, `doc()`, `getDocs()`, `getDoc()` → `supabase.from().select()`
  - `addDoc()` → `supabase.from().insert()`
  - `updateDoc()` → `supabase.from().update()`
  - `deleteDoc()` → `supabase.from().delete()`

### 2. Authentication Migration - Server-Side
- **Firebase Auth** → **Supabase Auth with Server Actions**
- Created `lib/auth-actions.ts` with server-side authentication functions
- Created `lib/supabase-server.ts` for server-side Supabase client
- Added `middleware.ts` for route protection
- Updated `contexts/auth-context.tsx` for client-side state (kept for compatibility)
- **Discord** is now the primary authentication method

### 3. Storage Migration
- **Firebase Storage** → **Supabase Storage**
- Updated `lib/storage.ts`:
  - `uploadBytes()`, `getDownloadURL()` → `supabase.storage.from().upload()`, `getPublicUrl()`
  - `deleteObject()` → `supabase.storage.from().remove()`

### 4. Profile Management
- Updated `app/profile/page.tsx`:
  - Removed Firebase `updateProfile()` function
  - Added Supabase user metadata updates via `supabase.auth.updateUser()`
  - Updated storage function calls to use user ID instead of User object

### 5. Authentication Pages
- Updated `app/sign-in/page.tsx` and `app/sign-up/page.tsx`:
  - Discord as primary authentication method
  - Email/password as secondary option
  - Server actions for authentication
  - Error handling via URL parameters

### 6. Configuration Files
- Renamed `lib/firebase.ts` → `lib/supabase.ts`
- Updated all import statements to use new Supabase client
- Added OAuth callback route at `app/auth/callback/page.tsx`
- Added middleware for route protection

## Required Setup

### 1. Supabase Project Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note down your project URL and anon key

### 2. Discord OAuth Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or use existing one
3. Go to OAuth2 section
4. Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Note down Client ID and Client Secret

### 3. Supabase Discord Configuration
1. In Supabase dashboard, go to Authentication → Providers
2. Enable Discord provider
3. Enter your Discord Client ID and Client Secret
4. Set redirect URL to: `http://localhost:3000/auth/callback` (for development)

### 4. Database Schema
Create the following table in your Supabase database:

\`\`\`sql
-- Create companions table
CREATE TABLE companions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  personality TEXT NOT NULL,
  interests TEXT[] NOT NULL,
  bio TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "compatibilityScore" INTEGER,
  "personalityTraits" TEXT[] NOT NULL,
  "communicationStyle" TEXT NOT NULL,
  "learningCapacity" TEXT NOT NULL,
  backstory TEXT NOT NULL,
  "favoriteTopics" TEXT[] NOT NULL,
  "relationshipGoals" TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;

-- Create policy for reading companions (public access)
CREATE POLICY "Anyone can view companions" ON companions
  FOR SELECT USING (true);

-- Create policy for inserting companions (authenticated users only)
CREATE POLICY "Authenticated users can insert companions" ON companions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for updating companions (authenticated users only)
CREATE POLICY "Authenticated users can update companions" ON companions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for deleting companions (authenticated users only)
CREATE POLICY "Authenticated users can delete companions" ON companions
  FOR DELETE USING (auth.role() = 'authenticated');
\`\`\`

### 5. Storage Setup
1. In Supabase dashboard, go to Storage
2. Create a new bucket called `avatars`
3. Set the bucket to public if you want profile pictures to be publicly accessible
4. Configure appropriate policies for the bucket

### 6. Authentication Setup
1. In Supabase dashboard, go to Authentication → Settings
2. Configure Site URL: `http://localhost:3000` (for development)
3. Add redirect URLs: `http://localhost:3000/auth/callback`
4. Configure Discord provider as described above

### 7. Environment Variables
Update your `.env.local` file with the Supabase credentials:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SITE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Discord OAuth Configuration (configure in Supabase dashboard)
# DISCORD_CLIENT_ID=your_discord_client_id_here
# DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# OAuth Configuration (optional - configure in Supabase dashboard)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
# NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
\`\`\`

## Server-Side Authentication Features

### Auth Actions (`lib/auth-actions.ts`)
- `signInWithDiscord()` - Primary authentication method
- `signInWithEmail()` - Email/password authentication
- `signUpWithEmail()` - Email registration
- `signOut()` - Sign out functionality
- `getUser()` - Get current user server-side

### Route Protection (`middleware.ts`)
- Automatic redirect for unauthenticated users on protected routes
- Prevents authenticated users from accessing auth pages
- Handles cookies and session management

### Protected Routes
- `/profile` - User profile management
- `/start-swiping` - Main application
- `/swipe` - Swiping functionality

## Discord Authentication Flow

1. User clicks "Continue with Discord" button
2. `signInWithDiscord()` server action is called
3. User is redirected to Discord OAuth
4. Discord redirects back to `/auth/callback`
5. Callback page processes the authentication
6. User is redirected to `/start-swiping` on success

## Key Differences from Firebase

### User Object Structure
- **Firebase**: `user.uid`, `user.displayName`, `user.email`
- **Supabase**: `user.id`, `user.user_metadata.display_name`, `user.email`

### Authentication Flow
- **Firebase**: Client-side authentication with Firebase SDK
- **Supabase**: Server-side authentication with Next.js Server Actions

### Session Management
- **Firebase**: Client-side session management
- **Supabase**: Server-side session management with cookies

## Testing

After setup:
1. Test Discord authentication flow
2. Test email registration and login
3. Test route protection middleware
4. Test profile picture upload/delete
5. Test companion data fetching

## Notes

- All Firebase packages can be removed from package.json
- The migration uses server-side authentication for better security
- User sessions are handled automatically by Supabase with cookies
- Discord OAuth is configured as the primary authentication method
- Email authentication is still available as a fallback option
