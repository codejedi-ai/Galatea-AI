# Galatea AI - Supabase Setup Guide

This guide will help you set up and deploy the Galatea AI application with Supabase as the backend.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or later)
2. **Docker** (for local development)
3. **Supabase CLI** (will be installed automatically)
4. **OpenAI API Key** (for AI companion responses)

### 1. Environment Setup

1. Copy the environment template:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:
   - For local development, use the provided local Supabase values
   - For production, use your Supabase project credentials

### 2. Local Development Setup

Run the automated setup script:

```bash
npm run supabase:setup
```

This will:
- Install Supabase CLI if not present
- Initialize Supabase project
- Start local Supabase services
- Run database migrations
- Seed the database with sample companions

### 3. Start Development

```bash
npm run dev
```

Your app will be available at `http://localhost:3000` with local Supabase running on `http://localhost:54323`.

## 🏗️ Manual Setup

If you prefer to set up manually or need more control:

### Install Supabase CLI

```bash
npm install -g supabase
```

### Initialize and Start Supabase

```bash
supabase init
supabase start
```

### Run Migrations

```bash
supabase db reset
```

### Deploy Edge Functions (Local)

```bash
supabase functions deploy generate-companion-response --no-verify-jwt
supabase functions deploy get-recommendations --no-verify-jwt
supabase functions deploy process-swipe --no-verify-jwt
supabase functions deploy get-conversations --no-verify-jwt
```

## 🌐 Production Deployment

### 1. Create Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Create a new project
3. Note your project ID, URL, and API keys

### 2. Configure Environment

Update your `.env.local` with production values:

```env
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Deploy to Production

```bash
npm run supabase:deploy
```

This automated script will:
- Link to your Supabase project
- Push database migrations
- Deploy Edge Functions
- Set up function secrets
- Optionally seed the database

### 4. Configure OAuth Providers

In your Supabase dashboard:

1. Go to **Authentication > Providers**
2. Enable **Discord** (primary)
3. Add your Discord Client ID and Secret
4. Set redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

## 📊 Database Schema

The application uses the following main tables:

- **user_profiles** - Extended user information
- **companions** - AI companion profiles
- **swipe_decisions** - User swipe history
- **matches** - When users like companions
- **conversations** - Chat sessions
- **messages** - Individual messages
- **user_preferences** - User matching preferences
- **user_stats** - User engagement statistics

## ⚡ Edge Functions

The application includes several Edge Functions:

### 1. generate-companion-response
- **Purpose**: Generate AI responses for companions
- **Endpoint**: `/functions/v1/generate-companion-response`
- **Requirements**: OpenAI API key

### 2. get-recommendations
- **Purpose**: Get personalized companion recommendations
- **Endpoint**: `/functions/v1/get-recommendations`

### 3. process-swipe
- **Purpose**: Handle user swipe decisions
- **Endpoint**: `/functions/v1/process-swipe`

### 4. get-conversations
- **Purpose**: Retrieve user conversations and messages
- **Endpoint**: `/functions/v1/get-conversations`

## 🛠️ Development Commands

```bash
# Supabase Management
npm run supabase:start      # Start local Supabase
npm run supabase:stop       # Stop local Supabase
npm run supabase:status     # Check service status
npm run supabase:reset      # Reset database with migrations
npm run supabase:logs       # View service logs

# Database Operations
npm run supabase:migrations # Push migrations to linked project
npm run supabase:populate   # Populate with sample data
npm run db:generate-types   # Generate TypeScript types

# Deployment
npm run supabase:deploy           # Full production deployment
npm run supabase:functions:deploy # Deploy only Edge Functions
```

## 🔧 Configuration Files

### supabase/config.toml
Main Supabase configuration file with:
- Database settings
- API configuration
- Auth providers
- Storage settings
- Edge runtime configuration

### Database Migrations
Located in `supabase/migrations/`:
- `20241201000001_initial_schema.sql` - Core tables and types
- `20241201000002_rls_policies.sql` - Row Level Security
- `20241201000003_storage_setup.sql` - File storage buckets
- `20241201000004_functions.sql` - Database functions and triggers

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Companions are publicly readable but admin-managed
- Messages are only accessible to conversation participants

### Storage Policies
- Users can manage their own avatar uploads
- Companion images are publicly readable
- File uploads are organized by user ID

### Authentication
- Server-side authentication with Supabase Auth
- Discord OAuth as primary method
- Email/password as fallback
- Session management via HTTP-only cookies

## 🐛 Troubleshooting

### Local Development Issues

**Docker not running:**
```bash
# Make sure Docker Desktop is running
docker --version
```

**Port conflicts:**
```bash
# Check if ports are in use
supabase status
# Stop and restart if needed
supabase stop && supabase start
```

**Migration errors:**
```bash
# Reset and reapply migrations
supabase db reset
```

### Production Issues

**Function deployment fails:**
```bash
# Check if you're logged in
supabase login

# Verify project link
supabase projects list
supabase link --project-ref your-project-id
```

**OpenAI API errors:**
- Verify your OpenAI API key is set in Supabase secrets
- Check your OpenAI account has sufficient credits
- Ensure the key has the correct permissions

### Environment Variable Issues

**Missing variables:**
- Double-check all required variables are in `.env.local`
- Ensure no extra spaces or quotes around values
- Restart your development server after changes

## 📱 Testing

### Local Testing
```bash
# Start local environment
npm run supabase:start
npm run dev

# Test endpoints
curl http://localhost:54321/functions/v1/get-recommendations
```

### Production Testing
1. Deploy to staging environment first
2. Test OAuth flows
3. Verify Edge Functions work
4. Check database connections
5. Test file uploads

## 🔄 Updates and Maintenance

### Database Schema Changes
1. Create new migration file in `supabase/migrations/`
2. Test locally with `supabase db reset`
3. Deploy with `npm run supabase:deploy`

### Edge Function Updates
1. Modify function code
2. Test locally
3. Deploy with `npm run supabase:functions:deploy`

### Adding New Companions
1. Update `supabase/seed.sql`
2. Run `npm run supabase:populate`

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Support

If you encounter issues:

1. Check the logs: `npm run supabase:logs`
2. Review the troubleshooting section above
3. Check Supabase dashboard for errors
4. Verify all environment variables are set correctly

For additional help, consult the Supabase documentation or community forums.
