import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHANGELOG = [
  {
    version: "3.0.0",
    date: "2026-02-17",
    title: "Advanced Analytics & Learning Modules",
    changes: [
      "✨ Interactive Learning Modules with 4 courses (Openings, Body Language, Storytelling, Persuasion)",
      "✨ Advanced Analytics Dashboard with score trends, radar charts, and AI insights",
      "✨ Time-range filtering (7/14/30 days) for analytics",
      "✨ Quiz system with progress tracking",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-02-16",
    title: "Speech Tools, Audience Sim & Library",
    changes: [
      "✨ Smart Teleprompter with auto-scroll and speech templates",
      "✨ Speech Writer & Outline Generator (6 templates)",
      "✨ Speech Version Control with A/B comparison",
      "✨ Virtual Audience Simulator with 4 difficulty levels",
      "✨ Anxiety & Stress Training (10 levels, breathing exercises, power poses)",
      "✨ Speech Recording Library with CRUD, search, categories, and export",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-02-15",
    title: "Intelligent Speech Analysis Engine",
    changes: [
      "✨ Speech Complexity Analyzer (Flesch, Gunning Fog, SMOG)",
      "✨ Rhetorical & Persuasion Techniques Detector (9 techniques)",
      "✨ Vocabulary richness & jargon detection",
      "✨ Active vs Passive voice analysis",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-14",
    title: "Core Platform Launch",
    changes: [
      "🚀 Real-time speech transcription via Web Speech API",
      "🚀 AI coaching powered by Google Gemini",
      "🚀 Filler word detection (17+ patterns)",
      "🚀 Color-coded annotated transcript",
      "🚀 6-category scoring with badge system",
      "🚀 Audio waveform visualization",
      "🚀 Video recording & playback",
      "🚀 Tone & sentiment analysis",
      "🚀 Speaker benchmarks (vs TED/Pro speakers)",
      "🚀 4 practice modes (Elevator Pitch, Impromptu, Debate, Storytelling)",
      "🚀 Progress tracking with trend charts",
      "🚀 PDF/text report export",
      "🚀 PWA support (installable, offline caching)",
      "🚀 10-language support",
      "🚀 Google OAuth authentication",
      "🚀 In-app Help Bot",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Changelog</span>
          </div>
          <Link to="/"><Button variant="outline" size="sm" className="gap-1.5"><Home className="w-4 h-4" /> Home</Button></Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Changelog</h1>
          <p className="text-muted-foreground text-sm">What's new in AI Career Coach — by Ayush Dayal (BCA Student)</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {CHANGELOG.map((release, i) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-10 pb-8 last:pb-0"
            >
              <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />

              <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-bold">v{release.version}</span>
                  <span className="text-xs text-muted-foreground">{release.date}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{release.title}</h3>
                <ul className="space-y-1.5">
                  {release.changes.map((change, j) => (
                    <li key={j} className="text-sm text-muted-foreground">{change}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
