import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Shield, Star, Target } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
}

interface ScoringBreakdown {
  clarity: number;
  pace: number;
  confidence: number;
  fillerWords: number;
  structure: number;
  engagement: number;
}

interface ScoringPanelProps {
  overallScore: number;
  breakdown: ScoringBreakdown;
  sessionCount?: number;
  bestScore?: number;
  streakDays?: number;
}

function getMeter(value: number) {
  const filled = Math.round(value);
  const empty = 10 - filled;
  return "█".repeat(Math.round(filled / 10 * 10)) + "░".repeat(Math.round(empty / 10 * 10));
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

export function ScoringPanel({ 
  overallScore, 
  breakdown, 
  sessionCount = 0, 
  bestScore = 0,
  streakDays = 0 
}: ScoringPanelProps) {
  const badges: Badge[] = [
    {
      id: "filler-fighter",
      name: "Filler Fighter",
      description: "< 3 filler words in 5 min",
      icon: <Shield className="w-5 h-5" />,
      earned: breakdown.fillerWords >= 80,
    },
    {
      id: "speed-demon",
      name: "Speed Demon",
      description: "Maintained 130-150 WPM",
      icon: <Zap className="w-5 h-5" />,
      earned: breakdown.pace >= 80,
    },
    {
      id: "streak-7",
      name: "7-Day Streak",
      description: "Practiced 7 days in a row",
      icon: <Flame className="w-5 h-5" />,
      earned: streakDays >= 7,
    },
    {
      id: "first-speech",
      name: "First Speech",
      description: "Completed first recording",
      icon: <Star className="w-5 h-5" />,
      earned: sessionCount >= 1,
    },
    {
      id: "high-scorer",
      name: "High Scorer",
      description: "Score 80+ on any session",
      icon: <Trophy className="w-5 h-5" />,
      earned: bestScore >= 80,
    },
    {
      id: "consistent",
      name: "Consistency King",
      description: "Complete 10 sessions",
      icon: <Target className="w-5 h-5" />,
      earned: sessionCount >= 10,
    },
  ];

  const breakdownItems = [
    { label: "Clarity", value: breakdown.clarity },
    { label: "Pace", value: breakdown.pace },
    { label: "Confidence", value: breakdown.confidence },
    { label: "Filler Words", value: breakdown.fillerWords },
    { label: "Structure", value: breakdown.structure },
    { label: "Engagement", value: breakdown.engagement },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-5 sm:p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Speech Score</h3>
        </div>
        <div className={`text-5xl sm:text-6xl font-bold ${getScoreColor(overallScore)} mb-1`}>
          {overallScore}<span className="text-2xl text-muted-foreground">/100</span>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          {breakdownItems.map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-muted-foreground w-24 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    item.value >= 80 ? "bg-success" : item.value >= 60 ? "bg-primary" : item.value >= 40 ? "bg-warning" : "bg-destructive"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                />
              </div>
              <span className={`text-sm font-bold w-8 text-right ${getScoreColor(item.value)}`}>
                {Math.round(item.value / 10)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">🎖️ Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-all ${
                badge.earned 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/30 border border-border opacity-50"
              }`}
            >
              <div className={badge.earned ? "text-primary" : "text-muted-foreground"}>
                {badge.icon}
              </div>
              <span className="text-xs font-medium text-foreground">{badge.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{badge.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
