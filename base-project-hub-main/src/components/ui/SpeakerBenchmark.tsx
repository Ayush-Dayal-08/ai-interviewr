import { motion } from "framer-motion";
import { BarChart3, Users } from "lucide-react";

interface BenchmarkData {
  metric: string;
  user: number;
  tedAvg: number;
  proSpeaker: number;
  unit: string;
  lowerIsBetter?: boolean;
}

interface SpeakerBenchmarkProps {
  wpm: number;
  fillerWordsPerMin: number;
  pauseUsage: "None" | "Low" | "Strategic" | "Expert";
  vocabularyRange: "Basic" | "Moderate" | "Varied" | "Rich";
  confidenceScore: number;
}

export function SpeakerBenchmark({ 
  wpm, 
  fillerWordsPerMin, 
  pauseUsage,
  vocabularyRange,
  confidenceScore 
}: SpeakerBenchmarkProps) {
  const benchmarks: BenchmarkData[] = [
    { metric: "WPM", user: wpm, tedAvg: 150, proSpeaker: 140, unit: "wpm" },
    { metric: "Filler Words/min", user: fillerWordsPerMin, tedAvg: 0.8, proSpeaker: 0.3, unit: "/min", lowerIsBetter: true },
    { metric: "Confidence", user: confidenceScore, tedAvg: 82, proSpeaker: 95, unit: "%" },
  ];

  const pauseMap = { "None": 0, "Low": 25, "Strategic": 70, "Expert": 95 };
  const vocabMap = { "Basic": 30, "Moderate": 55, "Varied": 75, "Rich": 95 };

  const qualitative = [
    { metric: "Pause Usage", user: pauseUsage, tedAvg: "Strategic", proSpeaker: "Expert", userScore: pauseMap[pauseUsage] },
    { metric: "Vocabulary Range", user: vocabularyRange, tedAvg: "Varied", proSpeaker: "Rich", userScore: vocabMap[vocabularyRange] },
  ];

  function getComparisonColor(user: number, benchmark: number, lowerIsBetter?: boolean) {
    const ratio = lowerIsBetter ? benchmark / (user || 1) : user / (benchmark || 1);
    if (ratio >= 0.9) return "text-success";
    if (ratio >= 0.7) return "text-warning";
    return "text-destructive";
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Speaker Benchmarks</h3>
      </div>

      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2 pr-4 font-medium">Metric</th>
              <th className="text-center py-2 px-2 font-medium">You</th>
              <th className="text-center py-2 px-2 font-medium">TED Avg</th>
              <th className="text-center py-2 px-2 font-medium">Pro Speaker</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, i) => (
              <motion.tr
                key={b.metric}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/50"
              >
                <td className="py-3 pr-4 text-foreground font-medium">{b.metric}</td>
                <td className={`py-3 px-2 text-center font-bold ${getComparisonColor(b.user, b.proSpeaker, b.lowerIsBetter)}`}>
                  {typeof b.user === "number" ? (b.user % 1 === 0 ? b.user : b.user.toFixed(1)) : b.user}
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground">
                  {typeof b.tedAvg === "number" ? b.tedAvg : b.tedAvg}
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground">
                  {typeof b.proSpeaker === "number" ? b.proSpeaker : b.proSpeaker}
                </td>
              </motion.tr>
            ))}
            {qualitative.map((q, i) => (
              <motion.tr
                key={q.metric}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (benchmarks.length + i) * 0.05 }}
                className="border-b border-border/50 last:border-0"
              >
                <td className="py-3 pr-4 text-foreground font-medium">{q.metric}</td>
                <td className={`py-3 px-2 text-center font-bold ${
                  q.userScore >= 70 ? "text-success" : q.userScore >= 40 ? "text-warning" : "text-destructive"
                }`}>
                  {q.user}
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground">{q.tedAvg}</td>
                <td className="py-3 px-2 text-center text-muted-foreground">{q.proSpeaker}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual comparison bars */}
      <div className="space-y-3">
        <span className="text-xs text-muted-foreground font-medium">How You Compare (vs Pro Speaker)</span>
        {benchmarks.map((b, i) => {
          const ratio = b.lowerIsBetter
            ? Math.min(100, ((b.proSpeaker || 1) / (b.user || 1)) * 100)
            : Math.min(100, (b.user / (b.proSpeaker || 1)) * 100);
          return (
            <div key={b.metric} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{b.metric}</span>
                <span className={`font-medium ${ratio >= 80 ? "text-success" : ratio >= 50 ? "text-warning" : "text-destructive"}`}>
                  {Math.round(ratio)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${ratio >= 80 ? "bg-success" : ratio >= 50 ? "bg-warning" : "bg-destructive"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
