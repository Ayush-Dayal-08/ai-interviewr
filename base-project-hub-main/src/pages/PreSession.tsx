import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Briefcase, Code2, History, Gamepad2, FileText, Heart, Library, BookOpen, BarChart3 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoFeed } from "@/components/ui/VideoFeed";
import { MicrophoneLevel } from "@/components/ui/MicrophoneLevel";
import { AudioWaveform } from "@/components/ui/AudioWaveform";
import type { InterviewCategory } from "@/data/interviewQuestions";

export default function PreSession() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory>("hr");
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = () => {
    setIsStarting(true);
    // Store the selected category and navigate
    sessionStorage.setItem("interviewCategory", selectedCategory);
    setTimeout(() => {
      navigate("/session");
    }, 300);
  };

  const categories: { id: InterviewCategory; label: string; description: string; icon: React.ReactNode; questions: number }[] = [
    {
      id: "hr",
      label: "HR Interview",
      description: "Behavioral, situational & leadership questions",
      icon: <Briefcase className="w-5 h-5" />,
      questions: 10,
    },
    {
      id: "technical",
      label: "Technical Interview",
      description: "Data structures, system design & CS fundamentals",
      icon: <Code2 className="w-5 h-5" />,
      questions: 10,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground">Interview Coach</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
              Offline
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/practice">
              <Button variant="ghost" size="sm" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Practice</span>
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="ghost" size="sm" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
              </Button>
            </Link>
            <Link to="/training">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Training</span>
              </Button>
            </Link>
            <Link to="/library">
              <Button variant="ghost" size="sm" className="gap-2">
                <Library className="w-4 h-4" />
                <span className="hidden sm:inline">Library</span>
              </Button>
            </Link>
            <Link to="/learn">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Learn</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl space-y-6 sm:space-y-8"
        >
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
              Interview Practice
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              10 questions · TTS reads questions aloud · STT captures your answers · Instant scoring
            </p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <VideoFeed label="Camera Feed" className="w-full aspect-video" />
          </motion.div>

          {/* Audio Waveform Visualizer */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <AudioWaveform isActive={true} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <MicrophoneLevel isActive={true} />
          </motion.div>

          {/* Interview Category Selector */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Choose Interview Type</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-primary/40 hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{cat.questions} Questions</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                  {selectedCategory === cat.id && (
                    <motion.div
                      layoutId="category-indicator"
                      className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-col items-center gap-4">
            {/* No API key needed banner */}
            <div className="w-full p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-sm font-medium text-green-400">100% Offline — No API Key Needed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Built-in questions, browser TTS & STT, instant local scoring.
                </p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 glow-effect"
              onClick={handleStartSession}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start {selectedCategory === "hr" ? "HR" : "Technical"} Interview
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            
            <Link to="/practice" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Gamepad2 className="w-4 h-4" />
              Or try a structured practice mode
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
