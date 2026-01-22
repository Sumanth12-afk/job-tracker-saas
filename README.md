# 🚀 Job Tracker SaaS

A modern, AI-powered job application tracking system built with Next.js. Automatically imports job applications from Gmail, tracks your progress through an intuitive Kanban board, and provides analytics to optimize your job search.

## ✨ Features

### 📧 Smart Gmail Integration
- **Multi-Stage AI Extraction**: 4-stage confidence-based pipeline extracts job titles from emails
  - Regex pattern matching
  - Contextual sentence scoring
  - URL slug parsing (ATS links)
  - Smart fallback inference
- **Automatic Duplicate Detection**: Prevents duplicate entries using Gmail message IDs
- **ATS Platform Support**: Greenhouse, Lever, Workday, LinkedIn, Indeed, and 20+ more

### 📊 Kanban Board
- Drag-and-drop job cards across 4 columns: Applied, Interview, Offer, Rejected
- Visual status tracking with color-coded cards
- Quick actions: edit, delete, mark as followed up

### 🎯 Follow-Up Center
- "Needs Attention" alerts for jobs >7 days without updates
- Upcoming interview reminders
- One-click follow-up tracking

### 📈 Analytics Dashboard
- Application funnel visualization
- Weekly activity charts
- Top companies breakdown
- Success rate metrics

### 🎨 Modern UI/UX
- Dark/Light mode toggle
- Responsive design (mobile-friendly)
- Onboarding tour for new users
- 3D animated landing page with "Hyperspeed" background

### 📤 Export & Backup
- CSV export with Days Since Applied, Status, and Source
- JSON export for data portability
- UTF-8 encoding with Excel compatibility

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React, CSS Modules |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email + Google OAuth) |
| **Gmail API** | Google OAuth 2.0, Gmail API v1 |
| **Deployment** | Vercel (recommended) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Google Cloud Console project for Gmail API

### 1. Clone & Install
```bash
git clone https://github.com/Sumanth12-afk/job-tracker-saas.git
cd job-tracker-saas
npm install
```

### 2. Environment Setup
Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
Run the SQL migrations in your Supabase SQL editor:

```bash
# In order:
supabase/schema.sql
supabase/gmail_tokens.sql
supabase/migrations/add_gmail_message_id.sql
supabase/migrations/create_resume_library.sql
supabase/migrations/add_resume_version.sql
```

### 4. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/gmail/callback`
5. Copy Client ID and Client Secret to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local`
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Update Google OAuth redirect URI to `https://your-domain.vercel.app/api/gmail/callback`
6. Deploy!

## 🎯 How It Works

### Gmail Scan Process
1. User connects Gmail via OAuth 2.0
2. System searches for job-related emails using 9 optimized queries
3. Each email is scored based on:
   - ATS domain (Greenhouse, Lever, etc.) → +3 points
   - Confirmation keywords ("application received") → +2 points
   - Interview keywords ("schedule interview") → +2 points
   - Rejection keywords → +1 point
4. Emails with score ≥2 are processed through the extraction pipeline
5. Job title is extracted using 4-stage confidence system
6. Duplicate check via Gmail message ID + company name + date
7. Jobs are imported and displayed on the Kanban board

### Multi-Stage Extraction Pipeline
```
Email → Stage 1: Regex (subject/snippet) → Found? Return
     → Stage 2: Sentence Scoring (body) → Found? Return
     → Stage 3: URL Parsing (ATS links) → Found? Return
     → Stage 4: Smart Fallback (infer from keywords) → Always returns a title
```

## 📸 Screenshots

*Coming soon*

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Google for Gmail API access
