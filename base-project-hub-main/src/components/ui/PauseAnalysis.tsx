import { motion } from "framer-motion";
import { Clock, VolumeX, Volume2, BarChart3 } from "lucide-react";

interface PauseData {
  timestamp: number;
  duration: number;
  type: "strategic" | "awkward" | "natural";
}

interface PauseAnalysisProps {
  pauses: PauseData[];
  totalDuration: number;
  speakingTime: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getPauseColor(type: PauseData["type"]) {
  switch (type) {
    case "strategic": return "bg-success";
    case "awkward": return "bg-destructive";
    default: return "bg-muted-foreground";
  }
}

function getPauseLabel(type: PauseData["type"]) {
  switch (type) {
    case "strategic": return "Strategic";
    case "awkward": return "Awkward";
    default: return "Natural";
  }
}

export function PauseAnalysis({ pauses, totalDuration, speakingTime }: PauseAnalysisProps) {
  const silenceTime = Math.max(0, totalDuration - speakingTime);
  const speakingRatio = totalDuration > 0 ? (speakingTime / totalDuration) * 100 : 0;
  const strategicCount = pauses.filter(p => p.type === "strategic").length;
  const awkwardCount = pauses.filter(p => p.type === "awkward").length;
  const avgPauseDuration = pauses.length > 0
    ? pauses.reduce((sum, p) => sum + p.duration, 0) / pauses.length
    : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <VolumeX className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Pause Analysis</h3>
      </div>

      {/* Speech vs Silence ratio bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Speech vs Silence Ratio</span>
          <span>{Math.round(speakingRatio)}% speaking</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          <motion.div
            className="bg-primary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${speakingRatio}%` }}
            transition={{ duration: 0.6 }}
          />
          <div className="bg-muted-foreground/30 h-full flex-1" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> Speaking: {formatTime(speakingTime)}
          </span>
          <span className="flex items-center gap-1">
            <VolumeX className="w-3 h-3" /> Silence: {formatTime(silenceTime)}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <span className="text-lg font-bold text-foreground">{pauses.length}</span>
          <p className="text-xs text-muted-foreground">Total Pauses</p>
        </div>
        <div className="bg-success/10 rounded-lg p-3 text-center border border-success/20">
          <span className="text-lg font-bold text-success">{strategicCount}</span>
          <p className="text-xs text-muted-foreground">Strategic</p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-3 text-center border border-destructive/20">
          <span className="text-lg font-bold text-destructive">{awkwardCount}</span>
          <p className="text-xs text-muted-foreground">Awkward</p>
        </div>
      </div>

      {/* Timeline visualization */}
      {pauses.length > 0 && totalDuration > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium">Pause Timeline</span>
          <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
            {/* Speaking base */}
            <div className="absolute inset-0 bg-primary/20" />
            
            {/* Pause markers */}
            {pauses.map((pause, i) => {
              const left = (pause.timestamp / totalDuration) * 100;
              const width = Math.max(1, (pause.duration / totalDuration) * 100);
              return (
                <motion.div
                  key={i}
                  className={`absolute top-0 h-full ${getPauseColor(pause.type)} opacity-70`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.02 }}
                  title={`${getPauseLabel(pause.type)} pause: ${pause.duration.toFixed(1)}s at ${formatTime(pause.timestamp)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0:00</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Average pause duration */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Avg pause duration</span>
        <span className={`font-semibold ${avgPauseDuration > 3 ? "text-destructive" : avgPauseDuration > 1.5 ? "text-warning" : "text-success"}`}>
          {avgPauseDuration.toFixed(1)}s
        </span>
      </div>

      {/* Suggestions */}
      {pauses.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium">💡 Suggestions</span>
          <ul className="space-y-1.5 text-xs text-secondary-foreground">
            {awkwardCount > 2 && (
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                You had {awkwardCount} awkward pauses. Try bridging phrases like "Let me elaborate..." to fill gaps naturally.
              </li>
            )}
            {strategicCount < 2 && totalDuration > 60 && (
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                Add more strategic pauses after key points — they help your audience absorb information.
              </li>
            )}
            {speakingRatio > 95 && (
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                You spoke almost continuously. Intentional pauses make you sound more confident and deliberate.
              </li>
            )}
            {avgPauseDuration > 3 && (
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                Your average pause is over 3 seconds. Practice transitioning between ideas more smoothly.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Utility to analyze pauses from transcript segments
export function analyzePauses(
  segments: Array<{ timestamp: number; text: string }>,
  totalDuration: number
): { pauses: PauseData[]; speakingTime: number } {
  const pauses: PauseData[] = [];
  let speakingTime = 0;

  for (let i = 0; i < segments.length; i++) {
    // Estimate speaking time per segment (~150 WPM = ~2.5 words/sec)
    const wordCount = segments[i].text.split(/\s+/).filter(w => w.length > 0).length;
    const estimatedSpeakingDuration = wordCount / 2.5;
    speakingTime += estimatedSpeakingDuration;

    if (i < segments.length - 1) {
      const gap = segments[i + 1].timestamp - (segments[i].timestamp + estimatedSpeakingDuration);
      
      if (gap > 0.5) {
        let type: PauseData["type"] = "natural";
        
        if (gap >= 1 && gap <= 2.5) {
          // Short deliberate pause — likely strategic
          const endsWithPunctuation = /[.!?]$/.test(segments[i].text.trim());
          type = endsWithPunctuation ? "strategic" : "natural";
        } else if (gap > 3) {
          type = "awkward";
        }

        pauses.push({
          timestamp: segments[i].timestamp + estimatedSpeakingDuration,
          duration: gap,
          type,
        });
      }
    }
  }

  return { pauses, speakingTime: Math.min(speakingTime, totalDuration) };
}
