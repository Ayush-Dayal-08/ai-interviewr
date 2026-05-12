import { motion } from "framer-motion";
import { Award, Clock, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SessionSummary {
  id: string;
  createdAt: string;
  duration: number;
  overallScore: number;
}

interface ProgressDashboardProps {
  sessions: SessionSummary[];
}

export function ProgressDashboard({ sessions }: ProgressDashboardProps) {
  if (sessions.length === 0) return null;

  const totalPracticeTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const bestScore = Math.max(...sessions.map(s => s.overallScore));
  const avgScore = Math.round(sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = sessions.filter(s => new Date(s.createdAt) >= weekAgo).length;
  const sessionsThisMonth = sessions.filter(s => new Date(s.createdAt) >= monthAgo).length;

  const trendData = sessions
    .slice(0, 10)
    .reverse()
    .map((s, i) => ({
      session: i + 1,
      score: s.overallScore,
    }));

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <Award className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{bestScore}</p>
          <p className="text-xs text-muted-foreground">Best Score</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{avgScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{formatTotalTime(totalPracticeTime)}</p>
          <p className="text-xs text-muted-foreground">Total Practice</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{sessionsThisWeek}/{sessionsThisMonth}</p>
          <p className="text-xs text-muted-foreground">Week / Month</p>
        </div>
      </div>

      {/* Score Trend */}
      {trendData.length > 1 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Score Trend (last {trendData.length} sessions)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={trendData}>
              <Tooltip
                contentStyle={{ background: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: 12 }}
                labelStyle={{ color: "hsl(210, 20%, 98%)" }}
              />
              <Line type="monotone" dataKey="score" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(217, 91%, 60%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
