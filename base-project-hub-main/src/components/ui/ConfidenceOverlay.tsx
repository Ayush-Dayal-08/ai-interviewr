import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Eye, UserCheck } from "lucide-react";

interface ConfidenceOverlayProps {
  score: number;
  eyeContact?: "Good" | "Fair" | "Poor";
}

export function ConfidenceOverlay({ score, eyeContact = "Fair" }: ConfidenceOverlayProps) {
  const isLow = score < 50;
  const isMedium = score >= 50 && score < 75;
  const isHigh = score >= 75;

  const getScoreColor = () => {
    if (isHigh) return "text-success";
    if (isMedium) return "text-warning";
    return "text-destructive";
  };

  const getBarColor = () => {
    if (isHigh) return "bg-success";
    if (isMedium) return "bg-warning";
    return "bg-destructive";
  };

  const getGlowClass = () => {
    if (isHigh) return "confidence-glow-green";
    if (isMedium) return "confidence-glow-amber";
    return "confidence-flash-red";
  };

  const getTrendIcon = () => {
    if (isHigh) return <TrendingUp className="w-4 h-4 text-success" />;
    if (isMedium) return <Minus className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-destructive animate-pulse" />;
  };

  const getCoachingTip = () => {
    if (score < 30) return "Sit up straight and take a deep breath";
    if (score < 50) return "Try to maintain eye contact with the camera";
    if (score < 75) return "Great progress! Keep that energy up";
    return "Excellent confidence! You're doing great";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/95 backdrop-blur-xl rounded-xl border-2 border-border p-3 sm:p-4 ${getGlowClass()}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
        {/* Confidence Score */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <UserCheck className={`w-4 sm:w-5 h-4 sm:h-5 ${getScoreColor()}`} />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Confidence</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial">
            <div className={`relative flex-1 sm:w-40 h-3 bg-muted rounded-full overflow-hidden ${isLow ? 'confidence-flash-red' : ''}`}>
              <motion.div
                className={`h-full rounded-full ${getBarColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className={`text-lg sm:text-xl font-bold tabular-nums ${getScoreColor()}`}>
              {score}%
            </span>
            {getTrendIcon()}
          </div>
        </div>

        {/* Eye Contact Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
          <Eye className={`w-4 h-4 ${
            eyeContact === "Good" ? "text-success" : 
            eyeContact === "Fair" ? "text-warning" : "text-destructive"
          }`} />
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Eye: <span className={
              eyeContact === "Good" ? "text-success" : 
              eyeContact === "Fair" ? "text-warning" : "text-destructive"
            }>{eyeContact}</span>
          </span>
        </div>

        {/* Coaching Tip */}
        {isLow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-lg w-full sm:w-auto"
          >
            <span className="text-xs sm:text-sm text-destructive font-medium">
              💡 {getCoachingTip()}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
