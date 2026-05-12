import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { analyzeRhetoric, type RhetoricalAnalysisResult } from "@/lib/rhetoricalAnalyzer";

interface Props {
  transcript: string;
}

export function RhetoricalAnalysisPanel({ transcript }: Props) {
  const analysis = useMemo(() => analyzeRhetoric(transcript), [transcript]);

  if (!transcript || transcript.trim().length < 20) return null;

  const { techniques, summary, recommendations } = analysis;

  const persuasionColor =
    summary.diversityScore >= 70 ? "text-success" :
    summary.diversityScore >= 40 ? "text-warning" : "text-destructive";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Rhetorical & Persuasion Analysis</h2>
      </div>

      {/* Persuasion Score */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-2xl font-bold ${persuasionColor}`}>{summary.diversityScore}%</p>
            <p className="text-xs text-muted-foreground">Technique Diversity</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${persuasionColor}`}>{summary.persuasionLevel}</p>
            <p className="text-xs text-muted-foreground">{summary.techniqueVariety}/{Object.keys(techniques).length} techniques used</p>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${summary.diversityScore}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${
              summary.diversityScore >= 70 ? "bg-success" :
              summary.diversityScore >= 40 ? "bg-warning" : "bg-destructive"
            }`}
          />
        </div>
      </motion.div>

      {/* Techniques Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <h3 className="text-sm font-medium text-foreground mb-3">Techniques Detected</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.values(techniques).map((t) => (
            <div
              key={t.name}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                t.used ? "border-success/30 bg-success/5" : "border-border bg-muted/30"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{t.name}</span>
                  {t.used ? (
                    <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.impact}</p>
                {t.used && t.count > 0 && (
                  <p className="text-[10px] text-success mt-1">Found {t.count} instance{t.count > 1 ? 's' : ''}</p>
                )}
                {t.used && t.examples.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate italic">
                    e.g. "{t.examples[0].substring(0, 50)}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-medium text-foreground">Persuasion Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    rec.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-xs font-medium text-foreground">{rec.technique}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{rec.suggestion}</p>
                <p className="text-[10px] text-primary/80 italic whitespace-pre-line">{rec.example}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
