import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleQuestion, X, Send, Bot, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "bot" | "user";
  content: string;
}

const APP_KNOWLEDGE = `
You are the AI Career Coach Help Bot. You help users navigate and understand the app. Here's what the app offers:

## APP FEATURES:

### 🏠 Home (Pre-Session)
- Camera & microphone check before starting
- Audio waveform visualizer shows mic levels
- Choose interviewer persona (Friendly, Challenging, Technical, Behavioral)
- Language selector supporting 10 languages (English, Spanish, French, German, Hindi, Portuguese, Japanese, Chinese, Arabic, Korean)
- Sign in with Google OAuth for progress tracking

### 🎙️ Live Session
- Real-time AI interview coaching with Gemini AI
- Live video feed with webcam recording
- Performance meters: confidence, WPM, filler words (real-time)
- Coach chat panel with AI interviewer questions
- Live transcript with filler word highlighting
- Accent & pronunciation coaching tips
- Coaching cue overlays for instant tips

### 📊 Session Report
- Overall performance score (0-100) with circular gauge
- AI-generated performance summary
- Strengths & areas for improvement
- Timestamped feedback log
- Color-coded annotated transcript (red=fillers, yellow=pace, blue=pauses, green=strong)
- Scoring panel with 6 categories + badges
- Analytics dashboard with charts (confidence, WPM, filler breakdown)
- Pause analysis with speech vs silence ratio
- Tone & sentiment analysis with energy chart
- Speaker benchmarks vs TED speakers & pros
- AI content suggestions (opening, vocabulary, structure, closing)
- Video playback of recorded session
- Download report as PDF or text

### 🎯 Practice Modes
- Elevator Pitch (60s timed practice)
- Impromptu Speaking (random topic, 2 min)
- Debate Mode (AI counter-arguments)
- Storytelling (narrative structure feedback)

### 📜 Session History
- Progress dashboard with score trends
- Best score, average score, total practice time
- Session cards with score, duration, strengths
- Sort by date, score, or duration

### 🔧 Technical
- PWA: installable on mobile/desktop, works offline
- 10-language support with localized filler detection
- Google OAuth authentication
- Video recording during sessions

## NAVIGATION:
- Home: "/" — Start a free session or pick practice mode
- Practice Modes: "/practice" — Structured practice scenarios
- Session History: "/history" — View past sessions & progress
- Session Report: "/report" — After ending a session
- Sign In: "/auth" — Google OAuth login

## ABOUT:
Built by Ayush Dayal (BCA Student) using React, TypeScript, Supabase, and Google Gemini AI.
`;

const QUICK_ACTIONS = [
  { label: "How do I start?", query: "How do I start a practice session?" },
  { label: "What are practice modes?", query: "What practice modes are available?" },
  { label: "How does scoring work?", query: "How does the scoring system work?" },
  { label: "Session features", query: "What features are available during a live session?" },
  { label: "View my history", query: "How can I see my past sessions?" },
];

function generateBotReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("start") || msg.includes("begin") || msg.includes("how to use")) {
    return "🚀 **Getting Started is easy!**\n\n1. Go to the **Home** page\n2. Allow camera & microphone access\n3. Choose your **interviewer persona** (Friendly, Challenging, etc.)\n4. Select your **language** from the dropdown\n5. Click **\"Start Free Session\"**\n\nOr try a **Practice Mode** for structured scenarios like Elevator Pitch or Debate!";
  }

  if (msg.includes("practice mode") || msg.includes("modes")) {
    return "🎯 **Practice Modes:**\n\n• **Elevator Pitch** — 60-second timed pitch practice\n• **Impromptu Speaking** — Random topic, speak for 2 minutes\n• **Debate Mode** — AI presents arguments, you counter them\n• **Storytelling** — Narrative structure feedback (hook, body, conclusion)\n\nAccess them from the **Practice** button in the header or the link on the home page.";
  }

  if (msg.includes("scor") || msg.includes("badge") || msg.includes("gamif")) {
    return "🏆 **Scoring System:**\n\nYour speech is scored across 6 categories:\n• **Clarity** — How clear your speech is\n• **Pace** — Speaking speed (ideal: 120-150 WPM)\n• **Confidence** — Overall confidence level\n• **Filler Words** — Fewer fillers = higher score\n• **Structure** — How well-organized your speech is\n• **Engagement** — How engaging your delivery is\n\n**Badges** include: Filler Fighter, Speed Demon, Confidence King, 7-Day Streak, and more!";
  }

  if (msg.includes("live") || msg.includes("session") && msg.includes("feature")) {
    return "🎙️ **Live Session Features:**\n\n• Real-time AI coaching with Gemini\n• Live video feed with automatic recording\n• Performance meters (confidence, WPM, fillers)\n• Coach chat panel — AI asks interview questions\n• Live transcript with filler word highlighting\n• Accent & pronunciation tips\n• Instant coaching cue overlays\n\nEnd the session to see your detailed report!";
  }

  if (msg.includes("history") || msg.includes("past") || msg.includes("previous")) {
    return "📜 **Session History:**\n\nClick **History** in the header to view:\n• Progress dashboard with score trends\n• Best score & average score\n• Total practice time\n• Individual session cards\n• Sort by date, score, or duration\n\n*Note: Sign in with Google to save sessions across devices!*";
  }

  if (msg.includes("report") || msg.includes("analytics") || msg.includes("feedback")) {
    return "📊 **Session Report includes:**\n\n• Overall score with circular gauge\n• AI-generated summary\n• Strengths & improvement areas\n• Color-coded transcript\n• Pause analysis (strategic vs awkward)\n• Tone & sentiment analysis with energy chart\n• Speaker benchmarks vs TED & pro speakers\n• AI content suggestions\n• Video playback of your recording\n• Download as PDF or text";
  }

  if (msg.includes("language") || msg.includes("multi")) {
    return "🌍 **Supported Languages:**\n\nEnglish, Español, Français, Deutsch, हिन्दी, Português, 日本語, 中文, العربية, 한국어\n\nEach language has **localized filler word detection**. Select your language from the globe icon in the header before starting a session.";
  }

  if (msg.includes("sign") || msg.includes("login") || msg.includes("auth") || msg.includes("account")) {
    return "🔐 **Authentication:**\n\nClick **Sign In** in the header and sign in with **Google OAuth**.\n\nSigning in allows you to:\n• Save sessions to your account\n• Track progress over time\n• View session history across devices";
  }

  if (msg.includes("install") || msg.includes("pwa") || msg.includes("offline") || msg.includes("app")) {
    return "📱 **Install as App:**\n\nThis is a **Progressive Web App (PWA)**! You can:\n• Install it on your phone's home screen\n• Use it on desktop as a standalone app\n• Access cached content offline\n\nLook for the \"Install\" prompt in your browser's address bar or menu.";
  }

  if (msg.includes("who") || msg.includes("author") || msg.includes("built") || msg.includes("about")) {
    return "👨‍💻 **About this project:**\n\nBuilt by **Ayush Dayal** (BCA Student)\n\n**Tech Stack:**\n• React + TypeScript\n• Tailwind CSS + shadcn/ui\n• Supabase (database & auth)\n• Google Gemini AI (coaching)\n• Web Speech API (transcription)\n• Recharts (analytics)\n• Framer Motion (animations)";
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "👋 **Hello!** Welcome to the AI Career Coach!\n\nI'm here to help you navigate the app. Here are some things I can help with:\n• How to start a session\n• Practice modes explained\n• Scoring & badges\n• Session features\n• Your history & progress\n\nJust ask me anything! 😊";
  }

  return "🤔 I'm not sure about that specific question, but here's what I can help with:\n\n• **\"How do I start?\"** — Getting started guide\n• **\"Practice modes\"** — Structured practice options\n• **\"Scoring\"** — How scoring & badges work\n• **\"Session features\"** — What happens during a session\n• **\"History\"** — Viewing past sessions\n• **\"Languages\"** — Multi-language support\n• **\"About\"** — Project info & tech stack\n\nTry asking one of these! 💡";
}

export function HelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "👋 Hi! I'm your **AI Career Coach Guide**. I can help you navigate the app, explain features, and answer questions.\n\nWhat would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    const userMsg: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate slight delay for natural feel
    setTimeout(() => {
      const reply = generateBotReply(message);
      setMessages(prev => [...prev, { role: "bot", content: reply }]);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors glow-effect"
            aria-label="Open help bot"
          >
            <MessageCircleQuestion className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground text-sm">Help Guide</span>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content.split("\n").map((line, li) => {
                      // Simple markdown-ish rendering
                      const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      if (line.startsWith("• ") || line.startsWith("- ")) {
                        return <div key={li} className="ml-2" dangerouslySetInnerHTML={{ __html: boldParsed }} />;
                      }
                      if (line.trim() === "") return <br key={li} />;
                      return <div key={li} dangerouslySetInnerHTML={{ __html: boldParsed }} />;
                    })}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    className="text-xs bg-muted hover:bg-accent text-foreground px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border px-3 py-2 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
