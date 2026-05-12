# 🎤 AI Powered Public Speaking & Interview Coach

An AI-powered web application that provides real-time speech coaching, interview practice, and comprehensive performance analytics using Google Gemini AI.

---

## 👨‍💻 Author
**Ayush Dayal**  
BCA Student

---

## 🚀 Project Overview
This platform helps users practice public speaking and interview skills using AI. It records voice & video, generates live transcripts, analyzes speaking patterns, and provides actionable feedback — all in real-time.

---

## ✨ Features

### Phase 1 — Core Features
- 🎙️ Voice recording with real-time audio waveform visualization
- 📝 Live speech transcript generation with Web Speech API
- 📊 Words-per-minute (WPM) tracking
- 🤖 AI coaching using Google Gemini (via Supabase Edge Functions)
- 😶 Enhanced filler word detection (17+ patterns including "like", "you know", "basically", etc.)
- 💬 Confidence & clarity analysis with real-time meters
- 🎨 Color-coded annotated transcript (red=fillers, yellow=pace, blue=pauses, green=strong)
- 🏆 Scoring system with 6 categories + badges (Filler Fighter, Speed Demon, etc.)
- 🌊 Canvas-based audio waveform visualization

### Phase 2 — Analytics & Practice
- ⏸️ Pause analysis (strategic vs awkward silences, speech/silence ratio)
- 📈 Progress tracking over time with score trend charts
- 📄 PDF & text report export
- 🎯 4 structured practice modes:
  - Elevator Pitch (60s)
  - Impromptu Speaking (random topic, 2 min)
  - Debate Mode (AI counter-arguments)
  - Storytelling (narrative structure feedback)

### Phase 3 — AI & Advanced Analytics
- 🎭 Tone & sentiment analysis with energy level charts
- 📊 Speaker benchmarks vs TED speakers & pro speakers
- 🧠 AI content suggestions (opening hooks, vocabulary, structure, closing)
- 🗣️ Accent & pronunciation coaching tips
- 📉 Recharts-based analytics dashboard (confidence, WPM, filler breakdown)

### Phase 4 — Platform Features
- 🎥 Webcam video recording with session playback
- 📱 Progressive Web App (PWA) — installable, offline-capable
- 🌍 Multi-language support (10 languages with localized filler detection):
  - English, Español, Français, Deutsch, हिन्दी, Português, 日本語, 中文, العربية, 한국어
- 🔐 Google OAuth authentication
- 🤖 In-app Help Bot for guided navigation

### Phase 5 — Intelligent Speech Analysis Engine
- 📖 Speech Complexity Analyzer (Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, SMOG Index)
- 🎯 Audience level recommendation based on readability
- 📊 Sentence variety analysis & vocabulary richness (Type-Token Ratio)
- ✍️ Active vs Passive voice detection
- 🔬 Jargon detection with simpler alternatives
- 🎤 Rhetorical & Persuasion Techniques Detector (9 types: Rhetorical Questions, Rule of Three, Anaphora, Metaphors, Call to Action, Storytelling, Data & Evidence, Emotional Appeals, Contrast)
- 📈 Persuasion diversity score with missing technique recommendations

### Phase 6 — Smart Teleprompter & Speech Prep Tools
- 📺 AI-Powered Teleprompter with auto-scroll and adjustable speed
- ✨ Word-by-word highlighting during playback
- 📋 Speech template presets (Elevator Pitch, TED Talk, Business Presentation)
- 📝 Speech Writer & Outline Generator with 6 templates (Informative, Persuasive, Motivational, Business, Wedding Toast, Eulogy)
- 📎 Copy to clipboard functionality
- 🔄 Speech Version Control with side-by-side comparison (score, WPM, filler words, duration)

### Phase 7 — Audience Simulation & Stress Training
- 👥 Virtual Audience Simulator with emoji-based audience
- 🎚️ 4 difficulty levels: Easy (8), Medium (20), Hard (40), Nightmare (60)
- 🎲 Random events: phone rings, yawning, whispering, applause, confusion, laptop, leaving
- 📊 Real-time engagement meter with event log
- 🧘 Anxiety & Stress Training Mode with 10 progressive levels (Comfort Zone → Master Speaker)
- 🔓 Level unlock progression system
- 🌬️ 3 breathing exercises: 4-7-8 Breathing, Box Breathing, Energizing Breath
- 💪 3 power poses with animated guides

### Phase 8 — Speech Recording Library
- 📚 Full CRUD for speeches with categories and tags
- 🔍 Search and filter by category/status
- 📋 Status workflow: Draft → Practicing → Ready → Delivered
- 📜 Version history tracking
- ⭐ Favorites and export to JSON
- 📊 Stats dashboard (total speeches, practice runs, avg score)

### Phase 9 — Micro-Learning & Skill Building
- 📖 4 interactive learning modules:
  - 🚀 Powerful Openings (5 lessons)
  - 🎭 Body Language Mastery (3 lessons)
  - 📖 Storytelling Mastery (3 lessons)
  - 🎯 Art of Persuasion (3 lessons)
- 📚 Each lesson includes: Theory, Good Example, Bad Example, Practice Prompt
- 🧠 Built-in quizzes with explanations
- 📊 Progress tracking with completion certificates

### Phase 10 — Advanced Analytics Dashboard
- 📈 Time-range filtering (7/14/30 days)
- 📊 6 KPI cards: Avg Score, Best Score, Score Change, Avg WPM, Avg Fillers, Total Time
- 📉 Score trend area chart
- 🎯 Skills radar chart (Clarity, Pace, Confidence, Fillers, Duration, Overall)
- 📊 WPM bar chart and filler words trend chart
- 📅 Weekly summary breakdown
- 💡 AI-generated performance insights

---

## 🛠️ Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** Google Gemini API (via Edge Functions)
- **Speech:** Web Speech API (real-time transcription)
- **Charts:** Recharts (area, bar, radar, sparkline)
- **Deployment:** Self-hosted / Vercel / Netlify

---

## 📂 Project Structure
```
src/
├── pages/           # Route pages (12 pages)
│   ├── PreSession, LiveSession, SessionReport
│   ├── SessionHistory, PracticeModes, SpeechTools
│   ├── StressTraining, SpeechLibraryPage
│   ├── LearningPage, AnalyticsPage, ChangelogPage
│   └── Auth, NotFound
├── components/ui/   # 40+ reusable UI components
│   ├── Core: VideoFeed, AudioWaveform, MicrophoneLevel
│   ├── Analysis: SpeechComplexityPanel, RhetoricalAnalysisPanel
│   ├── Coaching: CoachChat, FeedbackPanel, ContentSuggestions
│   ├── Tools: Teleprompter, SpeechWriter, SpeechVersionControl
│   ├── Training: AudienceSimulator, AnxietyTrainer
│   ├── Learning: LearningModules, AdvancedAnalytics
│   └── Library: SpeechLibrary
├── hooks/           # 7 custom React hooks
├── integrations/    # Supabase client & types
└── lib/             # Utility functions & analyzers
supabase/
├── functions/       # Edge functions (gemini-coach, generate-summary, etc.)
└── migrations/      # Database schema migrations
public/
├── manifest.json    # PWA manifest
├── sw.js            # Service worker
└── icons/           # App icons
```

---

## 🗺️ Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | PreSession | Home — setup camera/mic, select persona & language |
| `/session` | LiveSession | Active coaching session with real-time feedback |
| `/report` | SessionReport | Post-session analysis with all panels |
| `/history` | SessionHistory | Past session list with progress charts |
| `/practice` | PracticeModes | 4 structured practice modes |
| `/tools` | SpeechTools | Teleprompter, writer, version control |
| `/training` | StressTraining | Audience simulator & anxiety training |
| `/library` | SpeechLibraryPage | Speech recording library |
| `/learn` | LearningPage | Micro-learning modules with quizzes |
| `/analytics` | AnalyticsPage | Advanced analytics dashboard |
| `/changelog` | ChangelogPage | Version history & release notes |
| `/auth` | Auth | Google OAuth sign-in |

---

## ⚙️ How It Works
1. User allows camera & microphone access
2. Selects interviewer persona and language
3. AI coach conducts mock interview in real-time
4. Speech is captured and analyzed for:
   - Speaking speed (WPM)
   - Filler words (17+ patterns, language-specific)
   - Pauses (strategic vs awkward)
   - Confidence & tone
   - Speech complexity & readability
   - Rhetorical techniques used
5. AI generates personalized feedback with Gemini
6. Comprehensive report with charts, benchmarks & video playback
7. Progress tracked across sessions with advanced analytics

---

## 🖥️ How to Run Locally
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and configure environment variables
4. Run development server: `npm run dev`
5. Open in browser and allow microphone/camera permissions

---

## 📄 License
This project is for academic and learning purposes.

---

**Built with ❤️ by Ayush Dayal (BCA Student)**
