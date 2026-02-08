# 🚀 Job Tracker SaaS

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, **AI-powered job application tracking system** built with Next.js. Automatically imports job applications from Gmail using **ML-based classification**, tracks your progress through an intuitive Kanban board, and provides analytics to optimize your job search.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Job+Tracker+Dashboard)

---

## 🌟 Key Features

### 🤖 ML-Powered Email Classification
Our hybrid classification system combines **rule-based scoring** with **machine learning** for maximum accuracy:

| Component | Description |
|-----------|-------------|
| **Weighted Keyword Scoring** | 150+ job-related phrases with learned weights |
| **Category Detection** | Classifies into: `applied`, `interview`, `rejection`, `not_job` |
| **Sender Domain Bonus** | ATS platforms (Greenhouse, Lever) get priority |
| **Negative Signal Filtering** | Blocks spam, newsletters, banking emails |
| **Confidence Scoring** | Softmax probabilities for each category |

```
High-confidence rules (score ≥5) → Use rules directly
Low-confidence cases            → ML classifier decides
Both uncertain                  → Conservative fallback
```

### 📧 Smart Gmail Integration
- **9 Optimized Search Queries**: Targets ATS platforms, confirmation keywords, interview invites
- **Multi-Stage Job Title Extraction**:
  1. **Regex Patterns** - Matches "Software Engineer at Company" formats
  2. **Sentence Scoring** - NLP-inspired extraction from email body
  3. **URL Parsing** - Extracts from ATS links (greenhouse.io, lever.co)
  4. **Smart Fallback** - Infers role from keywords (DevOps, Data, etc.)
- **Duplicate Prevention**: Gmail message ID + company + date matching
- **20+ ATS Platforms**: Greenhouse, Lever, Workday, LinkedIn, Indeed, Glassdoor, and more

### 📊 Kanban Board
- **4 Columns**: Applied → Interview → Offer → Rejected
- **Drag & Drop**: Move cards between columns
- **Visual Cards**: Company logo, job title, days since applied
- **Quick Actions**: Edit, delete, mark followed up
- **Real-time Sync**: Changes saved instantly to database

### 🎯 Follow-Up Center
- **Needs Attention**: Jobs >7 days without updates
- **Upcoming Interviews**: Scheduled interview reminders
- **Follow-Up Tracking**: One-click to mark as followed up
- **Priority Sorting**: Most urgent items first

### 📈 Analytics Dashboard
| Metric | Description |
|--------|-------------|
| **Application Funnel** | Applied → Interview → Offer conversion rates |
| **Weekly Activity** | Bar chart of applications per week |
| **Top Companies** | Most applied-to companies breakdown |
| **Success Rate** | Interview-to-offer conversion percentage |
| **Response Time** | Average days to hear back |

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Toggle with persistence
- **3D Animated Landing**: "Hyperspeed" starfield background
- **Responsive Design**: Works on mobile, tablet, desktop
- **Onboarding Tour**: Guided walkthrough for new users
- **Glassmorphism**: Modern frosted glass effects

### 📤 Export & Backup
- **CSV Export**: Days Since Applied, Status, Source fields
- **JSON Export**: Full data portability
- **UTF-8 + BOM**: Excel-compatible encoding
- **Filtered Export**: Export by status or date range

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 19, CSS Modules |
| **Backend** | Next.js API Routes (App Router) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth (Email/Password + Google OAuth) |
| **Gmail API** | Google OAuth 2.0, Gmail API v1 (read-only) |
| **ML Training** | Python, PyTorch, Hugging Face Transformers |
| **Deployment** | Vercel (recommended) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Google Cloud Console project

### 1. Clone & Install
```bash
git clone https://github.com/Sumanth12-afk/job-tracker-saas.git
cd job-tracker-saas
npm install
```

### 2. Environment Setup
Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
Run SQL migrations in Supabase SQL Editor (in order):

```bash
supabase/schema.sql                        # Core tables
supabase/gmail_tokens.sql                  # Gmail OAuth tokens
supabase/migrations/add_gmail_message_id.sql
supabase/migrations/create_resume_library.sql
supabase/migrations/add_resume_version.sql
```

### 4. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Gmail API**
4. Create OAuth 2.0 Credentials:
   - Type: Web Application
   - Redirect URI: `http://localhost:3000/api/gmail/callback`
5. Copy Client ID + Secret to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧠 ML Classification System

The app includes a complete ML training pipeline for email classification:

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Gmail Email                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Rule-Based Scoring                         │
│  • ATS domain detection (+3)                            │
│  • Keyword matching (+1 to +2)                          │
│  • Exclusion filters (-10)                              │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │ Score >= 5?       │ Score <= -5?
        ▼                   ▼
   ┌─────────┐         ┌─────────┐
   │ ACCEPT  │         │ REJECT  │
   └─────────┘         └─────────┘
        │
        │ Ambiguous (score 1-4)
        ▼
┌─────────────────────────────────────────────────────────┐
│              ML Classifier                              │
│  • Weighted keyword scoring (TF-IDF inspired)           │
│  • Softmax probability distribution                     │
│  • 4 categories: applied, interview, rejection, not_job │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │ Confidence >= 60% │
        ▼                   ▼
   ┌─────────┐         ┌─────────┐
   │ USE ML  │         │FALLBACK │
   └─────────┘         └─────────┘
```

### Training Your Own Model (Optional)

```bash
cd ml

# 1. Generate synthetic training data
python generate_training_data.py
# Creates 1200 labeled emails in job_emails_dataset.csv

# 2. Install dependencies
pip install torch transformers datasets scikit-learn accelerate

# 3. Train DistilBERT classifier
python train_classifier.py
# Takes ~30-60 min on CPU, ~5-10 min on GPU

# 4. Export to ONNX (optional)
python train_classifier.py export
```

### Category Detection

| Category | Examples | Confidence |
|----------|----------|------------|
| `applied` | "Thank you for applying", "Application received" | 95%+ |
| `interview` | "Schedule interview", "Phone screen", "Next steps" | 90%+ |
| `rejection` | "Unfortunately", "Other candidates", "Position filled" | 95%+ |
| `not_job` | Amazon orders, bank alerts, newsletters, spam | 97%+ |

---

## 📁 Project Structure

```
job-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── gmail/
│   │   │       ├── auth/route.js      # OAuth initiation
│   │   │       ├── callback/route.js  # OAuth callback
│   │   │       ├── scan/route.js      # Email scanning + ML
│   │   │       ├── status/route.js    # Connection status
│   │   │       └── disconnect/route.js
│   │   ├── dashboard/page.js          # Main dashboard
│   │   ├── login/page.js
│   │   ├── signup/page.js
│   │   └── page.js                    # Landing page
│   ├── components/
│   │   ├── Analytics.js               # Charts & metrics
│   │   ├── ExportButton.js            # CSV/JSON export
│   │   ├── FollowUpCenter.js          # Reminders
│   │   ├── GmailConnect.js            # Gmail OAuth UI
│   │   ├── Hyperspeed.js              # 3D background
│   │   ├── KanbanBoard.js             # Drag & drop board
│   │   ├── OnboardingTour.js          # New user guide
│   │   └── SearchFilter.js            # Search & filter
│   └── lib/
│       ├── emailClassifier.js         # ML classifier
│       └── supabase.js                # DB client
├── ml/
│   ├── generate_training_data.py      # Synthetic data
│   ├── train_classifier.py            # DistilBERT training
│   ├── job_emails_dataset.csv         # Training data
│   └── README.md                      # ML documentation
├── supabase/
│   ├── schema.sql                     # Core tables
│   ├── gmail_tokens.sql               # OAuth tokens
│   └── migrations/                    # Schema updates
└── public/
    └── ...
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Add environment variables
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Update Google OAuth redirect URI
6. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🔒 Security

- **Row Level Security (RLS)**: Users can only access their own data
- **OAuth 2.0**: Secure Gmail authentication
- **Read-Only Scope**: Only `gmail.readonly` permission requested
- **Token Encryption**: Refresh tokens stored securely
- **No Email Storage**: Emails are processed but not stored

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use for personal or commercial purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Hugging Face](https://huggingface.co/) - Transformers library
- [Google](https://developers.google.com/gmail/api) - Gmail API

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Sumanth12-afk">Sumanth</a>
</p>
