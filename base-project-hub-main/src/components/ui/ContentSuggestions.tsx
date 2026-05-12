import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Lightbulb, Replace, MessageSquareText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContentSuggestionsProps {
  transcript: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

interface SuggestionGroup {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

export function ContentSuggestions({ transcript, overallScore, strengths, improvements }: ContentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (!transcript || hasGenerated) return;
    generateSuggestions();
  }, [transcript]);

  const generateSuggestions = async () => {
    if (!transcript || isLoading) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("gemini-coach", {
        body: {
          messages: [{
            role: "user",
            content: `Analyze this speech transcript and provide SPECIFIC, actionable improvement suggestions. Return a JSON object with exactly this format:
{
  "opening": ["suggestion 1 for improving the opening/hook", "suggestion 2"],
  "vocabulary": ["specific word replacement: instead of 'X' say 'Y'", "another replacement"],
  "structure": ["suggestion about speech structure/flow", "another"],
  "closing": ["suggestion for a stronger conclusion", "another"]
}

The transcript:
"${transcript.slice(0, 2000)}"

Score: ${overallScore}/100
Strengths: ${strengths.join(", ")}
Areas to improve: ${improvements.join(", ")}

Return ONLY the JSON, no markdown.`
          }],
          systemInstruction: "You are an expert speech coach. Provide specific, actionable content suggestions. Always respond with valid JSON only.",
        },
      });

      if (error) throw error;

      try {
        let jsonStr = data.content;
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();
        
        const parsed = JSON.parse(jsonStr);
        
        const groups: SuggestionGroup[] = [];
        
        if (parsed.opening?.length) {
          groups.push({
            title: "Opening & Hook",
            icon: <Sparkles className="w-4 h-4 text-primary" />,
            items: parsed.opening,
          });
        }
        if (parsed.vocabulary?.length) {
          groups.push({
            title: "Vocabulary Enhancement",
            icon: <Replace className="w-4 h-4 text-warning" />,
            items: parsed.vocabulary,
          });
        }
        if (parsed.structure?.length) {
          groups.push({
            title: "Structure & Flow",
            icon: <MessageSquareText className="w-4 h-4 text-success" />,
            items: parsed.structure,
          });
        }
        if (parsed.closing?.length) {
          groups.push({
            title: "Closing & Call to Action",
            icon: <Lightbulb className="w-4 h-4 text-primary" />,
            items: parsed.closing,
          });
        }

        setSuggestions(groups);
        setHasGenerated(true);
      } catch {
        // Fallback: show raw content as single group
        setSuggestions([{
          title: "AI Suggestions",
          icon: <Brain className="w-4 h-4 text-primary" />,
          items: data.content.split("\n").filter((l: string) => l.trim()),
        }]);
        setHasGenerated(true);
      }
    } catch (err) {
      console.error("Failed to generate content suggestions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Content Suggestions</h3>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm">Analyzing your speech content...</span>
        </div>
      )}

      {!isLoading && suggestions.length === 0 && !transcript && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Complete a session to get AI-powered content suggestions.
        </p>
      )}

      {suggestions.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            {group.icon}
            <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
          </div>
          <ul className="space-y-2 pl-6">
            {group.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gi * 0.1 + i * 0.03 }}
                className="text-sm text-secondary-foreground leading-relaxed list-disc"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
