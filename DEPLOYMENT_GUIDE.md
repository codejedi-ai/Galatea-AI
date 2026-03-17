# Galatea AI - Production Deployment Guide

This guide covers deploying Galatea AI to production with Supabase and Vercel.

## 🎯 Deployment Overview

The application consists of:
- **Frontend**: Next.js app deployed to Vercel
- **Backend**: Supabase (database, auth, storage, edge functions)
- **AI**: OpenAI API for companion responses

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Supabase account and project
- [x] Vercel account (or other hosting platform)
- [x] OpenAI API key
- [x] Discord OAuth application (optional)
- [x] Domain name (optional, for custom domain)

## 🚀 Step-by-Step Deployment

### 1. Supabase Project Setup

#### Create Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Choose organization and region
4. Set database password (save this!)
5. Wait for project to be ready (~2 minutes)

#### Get Project Credentials
From your project dashboard, note:
- Project URL: `https://xxx.supabase.co`
- Project ID: `xxx` (from URL)
- API Keys: anon key and service_role key

### 2. Local Environment Setup

#### Update Environment Variables
Create `.env.local` with production values:

```env
# Supabase Production
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Next.js Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# OpenAI (required for AI responses)
OPENAI_API_KEY=sk-your-openai-api-key

# OAuth (optional - can configure in Supabase dashboard)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### 3. Database Deployment

#### Deploy Database Schema and Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy everything
npm run supabase:deploy
```

This will:
- Link to your Supabase project
- Push all migrations (schema, RLS, storage, functions)
- Deploy Edge Functions
- Set up OpenAI API key secret
- Optionally seed database with sample companions

#### Manual Verification

1. Check your Supabase dashboard:
   - **Database**: Verify all tables exist
   - **Storage**: Check buckets are created
   - **Edge Functions**: Ensure all 4 functions deployed
   - **Authentication**: Verify settings

### 4. Authentication Setup

#### Configure OAuth Providers

In Supabase Dashboard > Authentication > Providers:

**Discord (Recommended Primary)**
1. Enable Discord provider
2. Add Client ID and Secret
3. Set redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for testing)

**Email (Fallback)**
1. Enable Email provider
2. Configure email templates if desired
3. Set email confirmation requirements

#### Site URL Configuration

In Authentication > Settings:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: Add all callback URLs

### 5. Vercel Deployment

#### Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Choose "Next.js" framework
4. Configure project settings

#### Environment Variables

Add these in Vercel dashboard (Project > Settings > Environment Variables):

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

OPENAI_API_KEY=sk-your-openai-api-key
```

#### Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Get your deployment URL

### 6. DNS and Domain Setup (Optional)

#### Custom Domain
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` in environment variables

#### SSL Certificate
Vercel automatically provisions SSL certificates for custom domains.

## 🔧 Post-Deployment Configuration

### 1. Test Authentication Flow
1. Visit your deployed app
2. Try Discord login
3. Verify user profile creation
4. Test logout functionality

### 2. Test Core Features
- **Swiping**: Try liking/passing companions
- **Matching**: Verify matches are created
- **Conversations**: Test AI responses
- **Profile**: Update user profile

### 3. Monitor Edge Functions
Check function logs in Supabase dashboard:
```bash
supabase functions logs --project-ref your-project-id
```

### 4. Database Health Check
Verify in Supabase dashboard:
- Tables have proper RLS policies
- Sample companions exist
- User creation trigger works
- Statistics are updating

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Redirect Errors
**Problem**: OAuth redirects fail
**Solution**: 
- Check redirect URLs in Supabase and OAuth provider
- Ensure URLs match exactly (no trailing slashes)
- Verify Site URL is set correctly

#### 2. Edge Function Errors
**Problem**: AI responses fail
**Solution**:
- Check OpenAI API key is set in Supabase secrets
- Verify function deployment: `supabase functions list`
- Check function logs for errors

#### 3. Database Connection Issues
**Problem**: Database queries fail
**Solution**:
- Verify environment variables are correct
- Check RLS policies allow expected operations
- Test database connection in Supabase dashboard

#### 4. CORS Errors
**Problem**: API calls fail from frontend
**Solution**:
- Verify Site URL in Supabase settings
- Check CORS headers in Edge Functions
- Ensure environment variables match

### Debugging Commands

```bash
# Check Supabase status
supabase status --project-ref your-project-id

# View function logs
supabase functions logs generate-companion-response

# Test database connection
supabase db remote --project-ref your-project-id

# Reset database (CAUTION: destroys data)
supabase db reset --linked
```

## 📊 Monitoring and Analytics

### 1. Supabase Analytics
Monitor in Supabase dashboard:
- Database performance
- Function invocations
- Authentication events
- Storage usage

### 2. Vercel Analytics
Monitor in Vercel dashboard:
- Page load times
- Function execution
- Build performance
- Traffic patterns

### 3. Application Metrics
Key metrics to track:
- User signups
- Swipe activity
- Match rates
- Message volume
- Active conversations

## 🔄 Updates and Maintenance

### Database Schema Updates
1. Create new migration file
2. Test locally first: `supabase db reset`
3. Deploy: `npm run supabase:migrations`

### Edge Function Updates
1. Modify function code
2. Deploy: `npm run supabase:functions:deploy`
3. Test in production

### Frontend Updates
1. Push to main branch
2. Vercel auto-deploys
3. Monitor deployment in Vercel dashboard

### Adding New Companions
1. Update `supabase/seed.sql`
2. Run SQL in Supabase dashboard or use migrations

## 🚨 Security Checklist

- [x] RLS policies enabled on all tables
- [x] Service role key secured (server-side only)
- [x] OAuth redirect URLs restricted
- [x] CORS properly configured
- [x] API keys stored as secrets
- [x] HTTPS enforced (Vercel automatic)
- [x] Environment variables secured

## 📱 Mobile Considerations

The app is responsive and works on mobile, but consider:
- PWA capabilities for app-like experience
- Push notifications for new messages
- Offline functionality for cached conversations

## 🔮 Scaling Considerations

As your app grows:
- **Database**: Monitor connection pooling
- **Edge Functions**: Check cold start times
- **Storage**: Consider CDN for images
- **AI**: Monitor OpenAI usage and costs

## 📞 Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🎉 Launch Checklist

Before announcing your app:

- [x] All features tested in production
- [x] SSL certificate active
- [x] OAuth providers working
- [x] AI responses functional
- [x] Error monitoring setup
- [x] Analytics tracking
- [x] Privacy policy updated
- [x] Terms of service updated
- [x] Contact information available

## 📈 Post-Launch

After launching:
1. Monitor error rates and performance
2. Gather user feedback
3. Track key metrics
4. Plan feature iterations
5. Scale infrastructure as needed

Congratulations on deploying Galatea AI! 🎉
