import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

interface MetricSnapshot {
  timestamp: number;
  confidence: number;
  wpm: number;
  fillerCount: number;
}

interface FillerBreakdown {
  word: string;
  count: number;
}

interface SessionScore {
  date: string;
  score: number;
}

interface AnalyticsDashboardProps {
  metricsOverTime?: MetricSnapshot[];
  fillerBreakdown?: FillerBreakdown[];
  recentSessionScores?: SessionScore[];
}

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(145, 80%, 42%)",
  "hsl(38, 95%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 65%, 60%)",
];

export function AnalyticsDashboard({
  metricsOverTime = [],
  fillerBreakdown = [],
  recentSessionScores = [],
}: AnalyticsDashboardProps) {
  const confidenceData = metricsOverTime.map((m, i) => ({
    time: `${Math.floor(m.timestamp / 60)}:${(m.timestamp % 60).toString().padStart(2, "0")}`,
    value: m.confidence,
  }));

  const wpmData = metricsOverTime.map((m, i) => ({
    time: `${Math.floor(m.timestamp / 60)}:${(m.timestamp % 60).toString().padStart(2, "0")}`,
    value: m.wpm,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Session Analytics</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Confidence Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Confidence Over Time</h3>
          </div>
          {confidenceData.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: 12 }}
                  labelStyle={{ color: "hsl(210, 20%, 98%)" }}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Not enough data yet</p>
          )}
        </motion.div>

        {/* WPM Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-success" />
            <h3 className="text-sm font-medium text-foreground">Speaking Pace (WPM)</h3>
          </div>
          {wpmData.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={wpmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: 12 }}
                  labelStyle={{ color: "hsl(210, 20%, 98%)" }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(145, 80%, 42%)" fill="hsl(145, 80%, 42%, 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Not enough data yet</p>
          )}
        </motion.div>

        {/* Filler Words Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-medium text-foreground">Filler Words Breakdown</h3>
          </div>
          {fillerBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={fillerBreakdown}
                    dataKey="count"
                    nameKey="word"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {fillerBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {fillerBreakdown.map((item, i) => (
                  <div key={item.word} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-foreground">{item.word}</span>
                    <span className="text-muted-foreground">({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No filler words detected! 🎉</p>
          )}
        </motion.div>

        {/* Session Score Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Recent Session Scores</h3>
          </div>
          {recentSessionScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={recentSessionScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: 12 }}
                  labelStyle={{ color: "hsl(210, 20%, 98%)" }}
                />
                <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Complete more sessions to compare</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
