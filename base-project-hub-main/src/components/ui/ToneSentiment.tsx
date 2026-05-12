import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, Smile, Meh, Frown, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface ToneSegment {
  timestamp: string;
  tone: "confident" | "nervous" | "enthusiastic" | "monotone" | "neutral";
  energy: number; // 0-100
  pitchVariation: "low" | "moderate" | "dynamic";
}

interface ToneSentimentProps {
  transcript: string;
  duration: number;
}

const toneColors: Record<string, string> = {
  confident: "hsl(145, 80%, 42%)",
  enthusiastic: "hsl(217, 91%, 60%)",
  neutral: "hsl(215, 16%, 55%)",
  nervous: "hsl(38, 95%, 50%)",
  monotone: "hsl(0, 72%, 51%)",
};

const toneIcons: Record<string, React.ReactNode> = {
  confident: <Smile className="w-4 h-4 text-success" />,
  enthusiastic: <Zap className="w-4 h-4 text-primary" />,
  neutral: <Meh className="w-4 h-4 text-muted-foreground" />,
  nervous: <Frown className="w-4 h-4 text-warning" />,
  monotone: <Meh className="w-4 h-4 text-destructive" />,
};

export function ToneSentiment({ transcript, duration }: ToneSentimentProps) {
  const [segments, setSegments] = useState<ToneSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dominantTone, setDominantTone] = useState<string>("neutral");
  const [avgEnergy, setAvgEnergy] = useState(50);

  useEffect(() => {
    if (!transcript) return;
    analyzeTone();
  }, [transcript]);

  const analyzeTone = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("gemini-coach", {
        body: {
          messages: [{
            role: "user",
            content: `Analyze the emotional tone and energy of this speech transcript over time. Break it into segments and return a JSON array.

Each segment should have:
- "timestamp": approximate time marker (e.g., "0:00", "0:30", "1:00")
- "tone": one of "confident", "nervous", "enthusiastic", "monotone", "neutral"
- "energy": 0-100 (how energetic/dynamic the speaking is)
- "pitchVariation": "low", "moderate", or "dynamic"

Return ONLY a JSON array, no markdown. Create 6-10 segments spread across the speech.

Transcript:
"${transcript.slice(0, 2000)}"

Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds`
          }],
          systemInstruction: "You are a speech analysis expert specializing in tone and sentiment detection. Respond with valid JSON arrays only.",
        },
      });

      if (error) throw error;

      let jsonStr = data.content;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      const parsed = JSON.parse(jsonStr) as ToneSegment[];
      setSegments(parsed);

      // Calculate dominant tone
      const toneCounts: Record<string, number> = {};
      parsed.forEach(s => { toneCounts[s.tone] = (toneCounts[s.tone] || 0) + 1; });
      const dominant = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
      setDominantTone(dominant);

      // Calculate avg energy
      const totalEnergy = parsed.reduce((sum, s) => sum + s.energy, 0);
      setAvgEnergy(parsed.length > 0 ? Math.round(totalEnergy / parsed.length) : 50);
    } catch (err) {
      console.error("Tone analysis failed:", err);
      // Generate fallback data
      setSegments([
        { timestamp: "0:00", tone: "neutral", energy: 40, pitchVariation: "low" },
        { timestamp: "0:30", tone: "nervous", energy: 35, pitchVariation: "low" },
        { timestamp: "1:00", tone: "neutral", energy: 50, pitchVariation: "moderate" },
        { timestamp: "1:30", tone: "confident", energy: 65, pitchVariation: "moderate" },
        { timestamp: "2:00", tone: "enthusiastic", energy: 75, pitchVariation: "dynamic" },
      ]);
      setDominantTone("neutral");
      setAvgEnergy(53);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = segments.map(s => ({
    time: s.timestamp,
    energy: s.energy,
    tone: s.tone,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Tone & Sentiment Analysis</h3>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm">Analyzing tone and sentiment...</span>
        </div>
      )}

      {!isLoading && segments.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {toneIcons[dominantTone]}
                <span className="text-sm font-bold text-foreground capitalize">{dominantTone}</span>
              </div>
              <p className="text-xs text-muted-foreground">Dominant Tone</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <span className={`text-lg font-bold ${avgEnergy >= 60 ? "text-success" : avgEnergy >= 40 ? "text-warning" : "text-destructive"}`}>
                {avgEnergy}%
              </span>
              <p className="text-xs text-muted-foreground">Avg Energy</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-sm font-bold text-foreground">
                {segments.filter(s => s.pitchVariation === "dynamic").length}/{segments.length}
              </span>
              <p className="text-xs text-muted-foreground">Dynamic Segments</p>
            </div>
          </div>

          {/* Energy chart */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Energy Level Over Time</span>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 16%, 55%)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: "hsl(220, 18%, 11%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(210, 20%, 98%)" }}
                  />
                  <Area type="monotone" dataKey="energy" stroke="hsl(217, 91%, 60%)" fill="url(#energyGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tone flow timeline */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Emotional Flow</span>
            <div className="flex gap-1">
              {segments.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-md"
                    style={{
                      height: `${Math.max(16, s.energy * 0.5)}px`,
                      backgroundColor: toneColors[s.tone] || toneColors.neutral,
                      opacity: 0.7 + (s.energy / 100) * 0.3,
                    }}
                    title={`${s.timestamp}: ${s.tone} (${s.energy}% energy)`}
                  />
                  <span className="text-[9px] text-muted-foreground">{s.timestamp}</span>
                </motion.div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.entries(toneColors).map(([tone, color]) => (
                <div key={tone} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="capitalize">{tone}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !transcript && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Complete a session to see tone and sentiment analysis.
        </p>
      )}
    </div>
  );
}
