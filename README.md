# Galatea AI - AI Companion Dating App

A Next.js application that connects users with AI companions through a modern dating app interface. Built with Supabase for backend services and OpenAI for intelligent companion interactions. Deployed on Bolt Cloud.

## ✨ Features

- 🤖 **AI Companions**: Unique personalities with OpenAI-powered conversations
- 💬 **Real-time Chat**: Seamless messaging with AI companions
- 🎯 **Smart Matching**: Personalized recommendations based on preferences
- 🔐 **Secure Authentication**: Discord OAuth and email authentication
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- 📊 **User Analytics**: Track swipes, matches, and engagement
- 🗄️ **Robust Backend**: Supabase with PostgreSQL, real-time subscriptions
- ⚡ **Edge Functions**: Serverless AI processing for fast responses

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-username/galatea-ai.git
cd galatea-ai
npm install
```

### 2. Set Up Environment
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

### 3. Start Local Development
```bash
npm run supabase:setup  # Sets up local Supabase
npm run dev            # Starts Next.js dev server
```

Visit `http://localhost:3000` to see your app running!

## 📚 Documentation

- **[Supabase Setup Guide](SUPABASE_SETUP.md)** - Complete local development setup
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment walkthrough
- **[Migration Guide](SUPABASE_MIGRATION.md)** - Firebase to Supabase migration notes

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS + Radix UI components
- **Authentication**: Supabase Auth with server-side sessions
- **State Management**: React hooks + Supabase real-time

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Multi-provider OAuth (Discord, Email)
- **Storage**: File uploads for avatars and images
- **Edge Functions**: AI processing and API endpoints
- **Real-time**: Live updates for messages and matches

### AI Integration
- **Provider**: OpenAI GPT-4o-mini
- **Features**: Personality-driven responses, conversation memory
- **Processing**: Server-side Edge Functions for security

## 🗄️ Database Schema

### Core Tables
- **`user_profiles`** - Extended user information and preferences
- **`companions`** - AI companion profiles and personalities
- **`swipe_decisions`** - User swipe history (like/pass/super_like)
- **`matches`** - Successful matches between users and companions
- **`conversations`** - Chat sessions with message history
- **`messages`** - Individual messages with metadata
- **`user_stats`** - Engagement analytics and metrics

### Key Features
- **Row Level Security**: Users can only access their own data
- **Automatic Triggers**: Stats updates, match creation, profile setup
- **Indexed Queries**: Optimized for performance at scale
- **JSON Support**: Flexible metadata and preferences storage

## ⚡ Edge Functions

### `/functions/v1/generate-companion-response`
Generates AI responses based on companion personality and conversation history.

### `/functions/v1/get-recommendations`
Returns personalized companion recommendations using collaborative filtering.

### `/functions/v1/process-swipe`
Handles swipe decisions and automatic match creation.

### `/functions/v1/get-conversations`
Retrieves conversation lists and message history with real-time updates.

## 🎨 UI Components

Built with Radix UI and Tailwind CSS:
- **SwipeCard**: Tinder-style companion cards
- **ChatInterface**: Real-time messaging components
- **ProfileSetup**: Onboarding and preference configuration
- **ProtectedRoute**: Authentication boundaries

## 🔧 Development Scripts

```bash
# Supabase Management
npm run supabase:setup      # Initial local setup
npm run supabase:start      # Start local services
npm run supabase:stop       # Stop local services
npm run supabase:reset      # Reset database with fresh migrations

# Database Operations
npm run supabase:migrations # Push schema changes
npm run supabase:populate   # Add sample companion data
npm run db:generate-types   # Generate TypeScript types

# Deployment
npm run supabase:deploy     # Full production deployment
npm run build              # Build Next.js application
```

## 🌍 Environment Variables

Required environment variables (see `env.example`):

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (required for AI responses)
OPENAI_API_KEY=your_openai_api_key

# OAuth (optional - can configure in Supabase dashboard)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

## 🚀 Deployment

### Quick Deploy to Production

```bash
# 1. Create Supabase project at app.supabase.com
# 2. Update .env.local with production credentials
# 3. Deploy everything:
npm run supabase:deploy
```

### Platform Options
- **Current**: Bolt Cloud (deployed)
- **Alternative**: Vercel, Netlify, Railway, or any Node.js hosting

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure session management
- **HTTPS Enforcement**: SSL/TLS in production
- **CORS Configuration**: Restricted API access
- **Environment Isolation**: Separate dev/prod configurations
- **API Key Security**: Server-side only sensitive keys

## 📊 Performance Optimizations

- **Database Indexing**: Optimized queries for large datasets
- **Edge Functions**: Serverless processing close to users
- **Image Optimization**: Next.js automatic image optimization
- **Caching Strategy**: Static generation where possible
- **Bundle Splitting**: Optimized JavaScript loading

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Test database connection
npm run supabase:status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the guides in this repository
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Supabase**: [Official documentation](https://supabase.com/docs)

## 🔮 Roadmap

- [ ] **Mobile App**: React Native companion app
- [ ] **Voice Messages**: Audio message support
- [ ] **Group Conversations**: Multi-companion chats
- [ ] **Advanced AI**: Memory persistence across sessions
- [ ] **Push Notifications**: Real-time message alerts
- [ ] **Analytics Dashboard**: User engagement insights
- [ ] **Admin Panel**: Companion management interface

## 🙏 Acknowledgments

- **Supabase** - Backend-as-a-Service platform
- **OpenAI** - AI language model capabilities
- **Vercel** - Hosting and deployment platform
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework

---

Built with ❤️ by the Galatea AI team

**[Live Demo](https://your-app-url.vercel.app)** | **[Documentation](SUPABASE_SETUP.md)** | **[Deploy Guide](DEPLOYMENT_GUIDE.md)**
