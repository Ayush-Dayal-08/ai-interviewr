import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Wind, Zap, Lock, CheckCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Level {
  level: number;
  name: string;
  description: string;
  stressors: string[];
  duration: number;
  tips: string[];
}

const LEVELS: Level[] = [
  { level: 1, name: "🌱 Comfort Zone", description: "Speak alone with no distractions", stressors: [], duration: 60, tips: ["Just speak naturally", "Focus on your breathing"] },
  { level: 2, name: "🎯 Gentle Push", description: "Speak with a visible countdown timer", stressors: ["countdown_timer"], duration: 90, tips: ["Ignore the timer after noting it", "Focus on content"] },
  { level: 3, name: "👀 Being Watched", description: "Virtual audience of 5 calm faces watching", stressors: ["small_audience"], duration: 120, tips: ["Make eye contact with the camera", "Pretend talking to friends"] },
  { level: 4, name: "🔔 Minor Disruptions", description: "Small audience with occasional sounds", stressors: ["small_audience", "random_sounds"], duration: 120, tips: ["Pause briefly if disrupted, then continue"] },
  { level: 5, name: "📋 Under Pressure", description: "Medium audience + strict time limit", stressors: ["medium_audience", "strict_timer"], duration: 150, tips: ["Practice pacing your content"] },
  { level: 6, name: "❓ Q&A Challenge", description: "AI interrupts with questions", stressors: ["medium_audience", "ai_questions"], duration: 180, tips: ["It's okay to say 'Great question'", "Take a breath before answering"] },
  { level: 7, name: "😕 Tough Crowd", description: "Some audience members look bored", stressors: ["tough_audience", "random_sounds"], duration: 240, tips: ["Not everyone will be engaged — that's normal"] },
  { level: 8, name: "🎭 Role Switch", description: "Mid-speech topic change", stressors: ["tough_audience", "topic_switch"], duration: 240, tips: ["Stay calm and adapt", "Use transitions like 'Shifting gears...'"] },
  { level: 9, name: "💀 Chaos Mode", description: "Multiple disruptions, hostile questions", stressors: ["large_audience", "hostile_questions", "random_sounds"], duration: 300, tips: ["Breathe deeply", "Handle each challenge one at a time"] },
  { level: 10, name: "👑 Master Speaker", description: "Everything thrown at you", stressors: ["huge_audience", "hostile_questions", "topic_switch", "heckler"], duration: 300, tips: ["You've trained for this", "Channel nervous energy into passion"] },
];

interface BreathingExercise {
  name: string;
  icon: string;
  description: string;
  steps: Array<{ action: string; duration: number; color: string }>;
  rounds: number;
}

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    name: "4-7-8 Breathing", icon: "🌊", description: "Calming technique before speaking",
    steps: [{ action: "Breathe IN", duration: 4, color: "text-primary" }, { action: "HOLD", duration: 7, color: "text-warning" }, { action: "Breathe OUT", duration: 8, color: "text-success" }],
    rounds: 3,
  },
  {
    name: "Box Breathing", icon: "📦", description: "Used by Navy SEALs for stress management",
    steps: [{ action: "Breathe IN", duration: 4, color: "text-primary" }, { action: "HOLD", duration: 4, color: "text-warning" }, { action: "Breathe OUT", duration: 4, color: "text-success" }, { action: "HOLD", duration: 4, color: "text-warning" }],
    rounds: 4,
  },
  {
    name: "Energizing Breath", icon: "⚡", description: "Quick energy boost before speaking",
    steps: [{ action: "Quick IN", duration: 1, color: "text-primary" }, { action: "Quick OUT", duration: 1, color: "text-destructive" }],
    rounds: 10,
  },
];

const POWER_POSES = [
  { name: "Victory Pose", icon: "🏆", description: "Arms raised in V shape, chin up", duration: 120, benefit: "Increases testosterone, decreases cortisol" },
  { name: "Wonder Woman", icon: "💪", description: "Hands on hips, feet apart, chest out", duration: 120, benefit: "Projects and creates confidence" },
  { name: "CEO Lean", icon: "👔", description: "Lean back, hands behind head", duration: 120, benefit: "Signals dominance and comfort" },
];

export function AnxietyTrainer() {
  const [activeTab, setActiveTab] = useState<"levels" | "breathing" | "poses">("levels");
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    const stored = localStorage.getItem("anxiety_completed_levels");
    return stored ? JSON.parse(stored) : [];
  });
  const [activeBreathing, setActiveBreathing] = useState<BreathingExercise | null>(null);
  const [breathingState, setBreathingState] = useState({ step: 0, round: 0, timeLeft: 0, isActive: false, isDone: false });
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleLevel = (level: number) => {
    setCompletedLevels(prev => {
      const next = prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level];
      localStorage.setItem("anxiety_completed_levels", JSON.stringify(next));
      return next;
    });
  };

  const startBreathing = (exercise: BreathingExercise) => {
    setActiveBreathing(exercise);
    setBreathingState({ step: 0, round: 0, timeLeft: exercise.steps[0].duration, isActive: true, isDone: false });
  };

  useEffect(() => {
    if (!breathingState.isActive || !activeBreathing) return;
    breathingTimerRef.current = setInterval(() => {
      setBreathingState(prev => {
        if (!activeBreathing) return prev;
        let { step, round, timeLeft } = prev;
        timeLeft--;
        if (timeLeft < 0) {
          step++;
          if (step >= activeBreathing.steps.length) {
            step = 0;
            round++;
            if (round >= activeBreathing.rounds) {
              return { ...prev, isActive: false, isDone: true };
            }
          }
          timeLeft = activeBreathing.steps[step].duration;
        }
        return { ...prev, step, round, timeLeft };
      });
    }, 1000);
    return () => { if (breathingTimerRef.current) clearInterval(breathingTimerRef.current); };
  }, [breathingState.isActive, activeBreathing]);

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Anxiety & Stress Training</h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-lg p-1 gap-1">
        {(["levels", "breathing", "poses"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors capitalize ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            {tab === "levels" ? "🏋️ Levels" : tab === "breathing" ? "🌬️ Breathing" : "💪 Power Poses"}
          </button>
        ))}
      </div>

      {/* Levels Tab */}
      {activeTab === "levels" && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {LEVELS.map(level => {
            const isCompleted = completedLevels.includes(level.level);
            const isUnlocked = level.level === 1 || completedLevels.includes(level.level - 1);
            return (
              <button
                key={level.level}
                onClick={() => isUnlocked && toggleLevel(level.level)}
                disabled={!isUnlocked}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isCompleted ? "border-success/50 bg-success/5" :
                  isUnlocked ? "border-border hover:border-primary/50" :
                  "border-border/50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? <CheckCircle className="w-5 h-5 text-success" /> :
                     isUnlocked ? <ChevronRight className="w-5 h-5 text-primary" /> :
                     <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{level.name}</p>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Duration: {level.duration}s • Stressors: {level.stressors.length || "None"}</p>
                  </div>
                </div>
                {isUnlocked && !isCompleted && (
                  <div className="mt-2 ml-8 space-y-0.5">
                    {level.tips.map((tip, i) => (
                      <p key={i} className="text-xs text-muted-foreground">💡 {tip}</p>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Breathing Tab */}
      {activeTab === "breathing" && (
        <div className="space-y-3">
          {!breathingState.isActive && !breathingState.isDone && BREATHING_EXERCISES.map(ex => (
            <button key={ex.name} onClick={() => startBreathing(ex)}
              className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ex.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.description} • {ex.rounds} rounds</p>
                </div>
              </div>
            </button>
          ))}

          {/* Active breathing exercise */}
          {breathingState.isActive && activeBreathing && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
              <motion.div
                animate={{ scale: activeBreathing.steps[breathingState.step].action.includes("IN") ? [1, 1.3] : [1.3, 1] }}
                transition={{ duration: activeBreathing.steps[breathingState.step].duration, ease: "easeInOut" }}
                className="w-32 h-32 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center bg-primary/5"
              >
                <span className={`text-2xl font-bold ${activeBreathing.steps[breathingState.step].color}`}>
                  {breathingState.timeLeft}
                </span>
              </motion.div>
              <p className={`text-xl font-bold ${activeBreathing.steps[breathingState.step].color}`}>
                {activeBreathing.steps[breathingState.step].action}
              </p>
              <p className="text-sm text-muted-foreground">Round {breathingState.round + 1} of {activeBreathing.rounds}</p>
              <Button variant="outline" size="sm" onClick={() => { setBreathingState({ step: 0, round: 0, timeLeft: 0, isActive: false, isDone: false }); setActiveBreathing(null); }}>
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Done */}
          {breathingState.isDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-4">
              <span className="text-5xl">✅</span>
              <h4 className="text-lg font-semibold text-foreground">Exercise Complete!</h4>
              <p className="text-sm text-muted-foreground">You should feel calmer and more centered now.</p>
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={() => { setBreathingState({ step: 0, round: 0, timeLeft: 0, isActive: false, isDone: false }); setActiveBreathing(null); }}>
                <RotateCcw className="w-4 h-4" /> Try Another
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Power Poses Tab */}
      {activeTab === "poses" && (
        <div className="space-y-3">
          {POWER_POSES.map(pose => (
            <div key={pose.name} className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pose.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pose.name}</p>
                  <p className="text-xs text-muted-foreground">{pose.description}</p>
                  <p className="text-xs text-primary mt-1">⏱ {pose.duration}s • {pose.benefit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Training Progress: {completedLevels.length}/{LEVELS.length} levels completed
        </p>
        <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedLevels.length / LEVELS.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
