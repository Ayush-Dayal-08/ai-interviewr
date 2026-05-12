import { Gauge, MessageSquare, Timer } from "lucide-react";
import { SparklineChart } from "./SparklineChart";

interface PerformanceMetersProps {
  confidence?: number;
  wpm?: number;
  fillerWords?: number;
  confidenceHistory?: number[];
  wpmHistory?: number[];
}

export function PerformanceMeters({ 
  confidence = 70, 
  wpm = 120, 
  fillerWords = 3,
  confidenceHistory = [],
  wpmHistory = [],
}: PerformanceMetersProps) {
  const getConfidenceColor = () => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-destructive";
  };
  
  const getWpmStatus = () => {
    if (wpm >= 100 && wpm <= 150) return { color: "text-success", label: "Good pace" };
    if (wpm < 100) return { color: "text-warning", label: "Too slow" };
    return { color: "text-warning", label: "Too fast" };
  };
  
  const wpmStatus = getWpmStatus();
  
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-6 p-3 sm:p-4 bg-card rounded-xl border border-border">
      {/* Confidence Meter */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Confidence Meter</span>
          <span className={`text-sm font-bold ${getConfidenceColor()}`}>{confidence}%</span>
        </div>
        <div className={`h-3 bg-muted rounded-full overflow-hidden confidence-pulse ${
          confidence >= 80 ? 'confidence-glow-green' : ''
        }`}>
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              confidence >= 80 ? 'bg-success' : confidence >= 60 ? 'bg-warning' : 'bg-destructive'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        {confidenceHistory.length > 1 && (
          <div className="mt-1">
            <SparklineChart data={confidenceHistory} color={confidence >= 80 ? "hsl(145, 80%, 42%)" : confidence >= 60 ? "hsl(38, 95%, 50%)" : "hsl(0, 72%, 51%)"} height={20} />
          </div>
        )}
      </div>
      
      {/* WPM + Filler row on mobile */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* WPM */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-muted"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-primary transition-all duration-500"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${Math.min((wpm / 200) * 100, 100)}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gauge className={`w-4 h-4 ${wpmStatus.color}`} />
            </div>
          </div>
          <span className={`text-sm font-bold ${wpmStatus.color}`}>{wpm}</span>
          <span className="text-xs text-muted-foreground font-medium">WPM</span>
          {wpmHistory.length > 1 && (
            <div className="w-full">
              <SparklineChart data={wpmHistory} color="hsl(217, 91%, 60%)" height={18} />
            </div>
          )}
        </div>
        
        {/* Filler Words Counter */}
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-muted/50 rounded-lg">
          <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-warning" />
          <div className="text-center">
            <span className="text-lg font-bold text-warning">{fillerWords}</span>
            <p className="text-xs text-muted-foreground">Umms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SessionTimerProps {
  time?: string;
}

export function SessionTimer({ time = "00:05:30" }: SessionTimerProps) {
  return (
    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-card rounded-lg border border-border">
      <Timer className="w-4 h-4 text-muted-foreground" />
      <span className="session-timer text-foreground text-sm sm:text-lg">{time}</span>
    </div>
  );
}
