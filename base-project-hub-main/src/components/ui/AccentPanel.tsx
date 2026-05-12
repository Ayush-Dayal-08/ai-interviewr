import { motion, AnimatePresence } from "framer-motion";
import { Languages, Volume2, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface AccentPanelProps {
  clarityScore?: number;
  accentTips?: string[];
}

export function AccentPanel({ clarityScore = 70, accentTips = [] }: AccentPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getClarityColor = () => {
    if (clarityScore >= 80) return "text-success";
    if (clarityScore >= 60) return "text-warning";
    return "text-destructive";
  };

  const getClarityBarColor = () => {
    if (clarityScore >= 80) return "bg-success";
    if (clarityScore >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Accent & Pronunciation</h3>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {/* Clarity Score Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Clarity Score</span>
                <span className={`text-sm font-bold ${getClarityColor()}`}>{clarityScore}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getClarityBarColor()}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${clarityScore}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Accent Tips */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Pronunciation Tips</span>
              </div>
              <AnimatePresence mode="popLayout">
                {accentTips.length > 0 ? (
                  accentTips.map((tip, index) => (
                    <motion.div
                      key={`${tip}-${index}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs text-foreground leading-relaxed"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      {tip}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic px-1">
                    Tips will appear as you speak...
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
