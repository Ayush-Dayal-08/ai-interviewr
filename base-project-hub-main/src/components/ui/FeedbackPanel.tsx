import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

interface FeedbackItem {
  id: number;
  message: string;
  type: "tip" | "positive" | "warning";
  timestamp?: Date;
}

interface FeedbackPanelProps {
  items?: FeedbackItem[];
}

const defaultFeedback: FeedbackItem[] = [
  { id: 1, message: "Maintain eye contact.", type: "tip" },
  { id: 2, message: "Elaborate on that project.", type: "tip" },
  { id: 3, message: "Good pause there!", type: "positive" },
  { id: 4, message: "Avoid filler words.", type: "warning" },
];

export function FeedbackPanel({ items = defaultFeedback }: FeedbackPanelProps) {
  const getBorderColor = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "positive": return "border-l-success feedback-positive";
      case "warning": return "border-l-warning feedback-warning";
      default: return "border-l-primary";
    }
  };
  
  const getIcon = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "positive": return <Sparkles className="w-4 h-4 text-success" />;
      case "warning": return <MessageCircle className="w-4 h-4 text-warning" />;
      default: return <MessageCircle className="w-4 h-4 text-primary" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Coach Says:</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/50 border-l-2 ${getBorderColor(item.type)}`}
            >
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <p className="text-sm text-foreground leading-relaxed">{item.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
