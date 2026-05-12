import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Zap, MessageSquare, Swords, BookOpen, 
  Timer, ArrowRight, Shuffle, History,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  color: string;
  prompt: string;
}

const PRACTICE_MODES: PracticeMode[] = [
  {
    id: "elevator-pitch",
    title: "Elevator Pitch",
    description: "Deliver a concise 60-second pitch about yourself or an idea. Master the art of being brief and impactful.",
    icon: <Zap className="w-6 h-6" />,
    duration: "60 seconds",
    color: "from-primary/20 to-primary/5 border-primary/30",
    prompt: "You are evaluating a 60-second elevator pitch. Focus on: clarity, hook quality, conciseness, call-to-action. The user should be able to explain their idea compellingly within 60 seconds.",
  },
  {
    id: "impromptu",
    title: "Impromptu Speaking",
    description: "Get a random topic and speak for 2 minutes. Build your ability to think on your feet.",
    icon: <Shuffle className="w-6 h-6" />,
    duration: "2 minutes",
    color: "from-warning/20 to-warning/5 border-warning/30",
    prompt: "You are coaching an impromptu speech. Give the user a random interesting topic first, then evaluate their response for: structure, coherence, creativity, and delivery.",
  },
  {
    id: "debate",
    title: "Debate Mode",
    description: "AI presents arguments — you counter them. Sharpen your persuasion and critical thinking skills.",
    icon: <Swords className="w-6 h-6" />,
    duration: "5 minutes",
    color: "from-destructive/20 to-destructive/5 border-destructive/30",
    prompt: "You are a debate opponent. Present a controversial but reasonable position, then critique the user's counter-arguments. Evaluate: logic, evidence quality, persuasion, rebuttals.",
  },
  {
    id: "storytelling",
    title: "Storytelling",
    description: "Practice narrative structure — hook, build-up, climax, conclusion. Tell stories that captivate.",
    icon: <BookOpen className="w-6 h-6" />,
    duration: "3 minutes",
    color: "from-success/20 to-success/5 border-success/30",
    prompt: "You are a storytelling coach. Evaluate the user's story for: compelling hook, narrative arc, emotional engagement, vivid details, and strong conclusion.",
  },
];

const RANDOM_TOPICS = [
  "Why failure is the best teacher",
  "The future of remote work",
  "Should social media have age restrictions?",
  "The most important invention of the 21st century",
  "Why everyone should learn to cook",
  "The impact of AI on creative industries",
  "What makes a great leader?",
  "Should college education be free?",
  "The importance of mental health awareness",
  "How travel changes your perspective",
  "The role of art in society",
  "Why curiosity is a superpower",
];

export default function PracticeModes() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);

  const handleStart = (mode: PracticeMode) => {
    let prompt = mode.prompt;
    
    // For impromptu, pick a random topic
    if (mode.id === "impromptu") {
      const topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
      prompt += ` The topic is: "${topic}". Start by announcing this topic to the user.`;
    }

    sessionStorage.setItem("selectedPersona", "challenging");
    sessionStorage.setItem("practiceMode", JSON.stringify({
      id: mode.id,
      title: mode.title,
      duration: mode.duration,
      prompt,
    }));
    navigate("/session");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Practice Modes</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/history">
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">Free Practice</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Choose Your Practice Mode</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Structured scenarios to build specific speaking skills</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {PRACTICE_MODES.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <button
                onClick={() => setSelectedMode(selectedMode?.id === mode.id ? null : mode)}
                className={`w-full text-left bg-gradient-to-br ${mode.color} rounded-xl border p-5 transition-all hover:shadow-lg ${
                  selectedMode?.id === mode.id ? "ring-2 ring-primary scale-[1.02]" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-card/80 rounded-lg flex-shrink-0">
                    {mode.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{mode.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Timer className="w-3 h-3" />
                        {mode.duration}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {selectedMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className="gap-2 glow-effect"
              onClick={() => handleStart(selectedMode)}
            >
              Start {selectedMode.title}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
