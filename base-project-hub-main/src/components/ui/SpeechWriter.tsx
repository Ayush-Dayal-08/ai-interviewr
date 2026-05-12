import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SpeechTemplate {
  id: string;
  name: string;
  icon: string;
  structure: string[];
  tips: string;
}

const TEMPLATES: SpeechTemplate[] = [
  {
    id: "informative", name: "Informative Speech", icon: "📚",
    structure: ["Attention Grabber (hook/question/statistic)", "Thesis Statement", "Preview of Main Points", "Main Point 1 + Supporting Evidence", "Transition", "Main Point 2 + Supporting Evidence", "Transition", "Main Point 3 + Supporting Evidence", "Summary of Key Points", "Memorable Closing Statement"],
    tips: "Focus on clarity and teaching. Use analogies to explain complex ideas.",
  },
  {
    id: "persuasive", name: "Persuasive Speech", icon: "🎯",
    structure: ["Hook (shocking fact or emotional story)", "Problem Statement", "Why the audience should care", "Your Solution / Argument", "Evidence Point 1", "Evidence Point 2", "Counter-argument acknowledgment", "Rebuttal", "Call to Action", "Powerful Closing"],
    tips: "Use ethos (credibility), pathos (emotion), and logos (logic).",
  },
  {
    id: "motivational", name: "Motivational Speech", icon: "🔥",
    structure: ["Personal Story / Struggle", "The Turning Point", "Lesson Learned", "How It Applies to the Audience", "Challenge / Vision for the Future", "Empowerment Statement", "Call to Action", "Inspirational Closing"],
    tips: "Be authentic. Share vulnerability. Use vivid imagery.",
  },
  {
    id: "business", name: "Business Presentation", icon: "💼",
    structure: ["Context / Problem Statement", "Current Situation Analysis", "Data / Key Metrics", "Proposed Solution", "Implementation Plan", "Expected Results / ROI", "Risk Assessment", "Timeline", "Next Steps", "Q&A"],
    tips: "Be data-driven. Keep slides minimal. Focus on actionable takeaways.",
  },
  {
    id: "wedding", name: "Wedding Toast", icon: "🥂",
    structure: ["Introduction (who you are)", "Funny/Sweet Story about One Partner", "Story about the Other Partner", "How They Are Together", "Advice or Wish for Their Future", "Raise the Glass / Toast"],
    tips: "Keep it under 5 minutes. Be heartfelt. Avoid inside jokes.",
  },
  {
    id: "eulogy", name: "Eulogy", icon: "🕊️",
    structure: ["Opening (relationship to the person)", "Who They Were (character traits)", "Meaningful Memory 1", "Meaningful Memory 2", "Their Impact on Others", "What They Taught Us", "Closing (how to honor their memory)"],
    tips: "Be authentic. It's okay to show emotion. Mix sadness with celebration of life.",
  },
];

export function SpeechWriter() {
  const [selectedTemplate, setSelectedTemplate] = useState<SpeechTemplate | null>(null);
  const [outline, setOutline] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!selectedTemplate) return;
    const text = selectedTemplate.structure.map((s, i) => `${i + 1}. ${s}\n   ${outline[s] || "(Your content here)"}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Outline copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Speech Writer & Outline Generator</h3>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => { setSelectedTemplate(t); setOutline({}); }}
            className={`p-3 rounded-lg border text-left transition-all hover:shadow-md ${
              selectedTemplate?.id === t.id
                ? "border-primary bg-primary/10 ring-1 ring-primary"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <p className="text-xs font-medium text-foreground mt-1">{t.name}</p>
          </button>
        ))}
      </div>

      {/* Selected Template */}
      <AnimatePresence mode="wait">
        {selectedTemplate && (
          <motion.div
            key={selectedTemplate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> {selectedTemplate.tips}
              </p>
            </div>

            <div className="space-y-3">
              {selectedTemplate.structure.map((section, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-1">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground">{section}</label>
                    <textarea
                      value={outline[section] || ""}
                      onChange={(e) => setOutline(prev => ({ ...prev, [section]: e.target.value }))}
                      placeholder={`Write your ${section.toLowerCase()} here...`}
                      className="mt-1 w-full bg-background border border-border rounded-md p-2 text-sm text-foreground resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Outline"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
