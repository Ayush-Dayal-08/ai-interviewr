import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Award, Target, Calendar, Zap } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface SessionSummary {
  date: string;
  score: number;
  wpm: number;
  fillerCount: number;
  duration: number;
  confidence: number;
  clarity: number;
  pace: number;
}

const STORAGE_KEY = "session_analytics";

function getSessionData(): SessionSummary[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// Generate demo data if none exists
function getDemoData(): SessionSummary[] {
  const existing = getSessionData();
  if (existing.length > 0) return existing;

  const data: SessionSummary[] = [];
  const now = Date.now();
  for (let i = 14; i >= 0; i--) {
    const baseScore = 50 + Math.random() * 35 + (14 - i) * 1.5;
    data.push({
      date: new Date(now - i * 86400000).toISOString().split("T")[0],
      score: Math.min(100, Math.round(baseScore)),
      wpm: Math.round(120 + Math.random() * 40),
      fillerCount: Math.max(0, Math.round(12 - i * 0.5 + Math.random() * 4)),
      duration: Math.round(60 + Math.random() * 240),
      confidence: Math.min(100, Math.round(40 + Math.random() * 30 + (14 - i) * 2)),
      clarity: Math.min(100, Math.round(50 + Math.random() * 30 + (14 - i) * 1.5)),
      pace: Math.min(100, Math.round(55 + Math.random() * 25 + (14 - i) * 1)),
    });
  }
  return data;
}

export function AdvancedAnalytics() {
  const [data, setData] = useState<SessionSummary[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");

  useEffect(() => {
    setData(getDemoData());
  }, []);

  const filteredData = (() => {
    const days = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30;
    return data.slice(-days);
  })();

  if (data.length === 0) return null;

  const latest = filteredData[filteredData.length - 1];
  const first = filteredData[0];
  const avgScore = Math.round(filteredData.reduce((s, d) => s + d.score, 0) / filteredData.length);
  const avgWPM = Math.round(filteredData.reduce((s, d) => s + d.wpm, 0) / filteredData.length);
  const avgFillers = (filteredData.reduce((s, d) => s + d.fillerCount, 0) / filteredData.length).toFixed(1);
  const totalTime = Math.round(filteredData.reduce((s, d) => s + d.duration, 0) / 60);
  const bestScore = Math.max(...filteredData.map(d => d.score));
  const scoreChange = latest.score - first.score;

  const radarData = [
    { subject: "Clarity", value: latest.clarity, fullMark: 100 },
    { subject: "Pace", value: latest.pace, fullMark: 100 },
    { subject: "Confidence", value: latest.confidence, fullMark: 100 },
    { subject: "Fillers", value: Math.max(0, 100 - latest.fillerCount * 5), fullMark: 100 },
    { subject: "Duration", value: Math.min(100, (latest.duration / 300) * 100), fullMark: 100 },
    { subject: "Overall", value: latest.score, fullMark: 100 },
  ];

  const weeklyData = (() => {
    const weeks: Record<string, { scores: number[]; sessions: number }> = {};
    filteredData.forEach(d => {
      const weekNum = `Week ${Math.ceil((filteredData.indexOf(d) + 1) / 7)}`;
      if (!weeks[weekNum]) weeks[weekNum] = { scores: [], sessions: 0 };
      weeks[weekNum].scores.push(d.score);
      weeks[weekNum].sessions++;
    });
    return Object.entries(weeks).map(([week, { scores, sessions }]) => ({
      week,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      sessions,
    }));
  })();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Advanced Analytics</h3>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          {(["7d", "14d", "30d"] as const).map(range => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === range ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {range === "7d" ? "7 Days" : range === "14d" ? "14 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Avg Score", value: avgScore, icon: Target, color: "text-primary", suffix: "" },
          { label: "Best Score", value: bestScore, icon: Award, color: "text-success", suffix: "" },
          { label: "Score Δ", value: `${scoreChange > 0 ? "+" : ""}${scoreChange}`, icon: TrendingUp, color: scoreChange >= 0 ? "text-success" : "text-destructive", suffix: "" },
          { label: "Avg WPM", value: avgWPM, icon: Zap, color: "text-warning", suffix: "" },
          { label: "Avg Fillers", value: avgFillers, icon: Target, color: "text-destructive", suffix: "/session" },
          { label: "Total Time", value: totalTime, icon: Clock, color: "text-primary", suffix: " min" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-lg border border-border p-3 text-center">
            <kpi.icon className={`w-4 h-4 mx-auto ${kpi.color}`} />
            <p className="text-lg font-bold text-foreground mt-1">{kpi.value}{kpi.suffix}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Score Trend */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">📈 Score Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Radar */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">🎯 Skills Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WPM & Fillers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">🗣️ Words Per Minute</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">🚫 Filler Words Over Time</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="fillerCount" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">📅 Weekly Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {weeklyData.map(w => (
            <div key={w.week} className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">{w.week}</p>
              <p className="text-lg font-bold text-foreground">{w.avgScore}</p>
              <p className="text-xs text-muted-foreground">{w.sessions} sessions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">💡 AI Insights</h4>
        <div className="space-y-2">
          {scoreChange > 0 && (
            <p className="text-sm text-success">📈 Your score improved by {scoreChange} points! Keep up the great work.</p>
          )}
          {avgWPM > 160 && (
            <p className="text-sm text-warning">⚡ Your average pace ({avgWPM} WPM) is fast. Try slowing down for impact.</p>
          )}
          {avgWPM < 120 && (
            <p className="text-sm text-warning">🐌 Your average pace ({avgWPM} WPM) is slow. Try adding more energy.</p>
          )}
          {Number(avgFillers) > 5 && (
            <p className="text-sm text-destructive">🚫 You're averaging {avgFillers} filler words per session. Practice pausing instead.</p>
          )}
          {Number(avgFillers) <= 2 && (
            <p className="text-sm text-success">✨ Excellent filler word control! Average of only {avgFillers} per session.</p>
          )}
          {filteredData.length >= 5 && (
            <p className="text-sm text-primary">🔥 {filteredData.length} sessions in this period. Consistency is key to improvement!</p>
          )}
        </div>
      </div>
    </div>
  );
}
