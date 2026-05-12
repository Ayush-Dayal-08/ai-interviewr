import React from "react";

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", 
  "literally", "sort of", "kind of", "i mean", "right", "so yeah",
  "well", "er", "umm", "uhh", "so"
];

interface AnnotatedTranscriptProps {
  transcript: string;
  className?: string;
}

interface AnnotatedWord {
  text: string;
  type: "normal" | "filler" | "pause" | "timestamp";
}

function tokenize(transcript: string): AnnotatedWord[] {
  const tokens: AnnotatedWord[] = [];
  
  // Split by timestamps and pauses first
  const parts = transcript.split(/(\[[\d:]+\]|\[pause\]|\[\.\.\.+\])/gi);
  
  for (const part of parts) {
    if (!part) continue;
    
    // Timestamp
    if (/^\[[\d:]+\]$/.test(part)) {
      tokens.push({ text: part, type: "timestamp" });
      continue;
    }
    
    // Pause marker
    if (/^\[pause\]$|^\[\.\.\.+\]$/i.test(part)) {
      tokens.push({ text: "[pause]", type: "pause" });
      continue;
    }
    
    // Process words for filler detection
    const words = part.split(/(\s+)/);
    let i = 0;
    while (i < words.length) {
      const word = words[i];
      if (!word) { i++; continue; }
      
      // Check multi-word fillers
      const remaining = words.slice(i).join("");
      let matched = false;
      
      for (const filler of FILLER_WORDS) {
        if (filler.includes(" ")) {
          const fillerLower = filler.toLowerCase();
          if (remaining.toLowerCase().trimStart().startsWith(fillerLower)) {
            const fillerWords = filler.split(" ");
            const matchedText = words.slice(i, i + fillerWords.length * 2 - 1).join("");
            if (matchedText.trim().toLowerCase() === fillerLower) {
              tokens.push({ text: matchedText, type: "filler" });
              i += fillerWords.length * 2 - 1;
              matched = true;
              break;
            }
          }
        }
      }
      
      if (!matched) {
        const clean = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
        const isFiller = FILLER_WORDS.some(f => !f.includes(" ") && clean === f);
        tokens.push({ text: word, type: isFiller ? "filler" : "normal" });
      }
      
      i++;
    }
  }
  
  return tokens;
}

export function AnnotatedTranscript({ transcript, className = "" }: AnnotatedTranscriptProps) {
  if (!transcript) {
    return (
      <div className={`text-muted-foreground text-sm text-center py-6 ${className}`}>
        No transcript available yet.
      </div>
    );
  }

  const tokens = tokenize(transcript);
  
  // Count fillers
  const fillerCount = tokens.filter(t => t.type === "filler").length;

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-destructive/30 border border-destructive/50" />
          <span className="text-muted-foreground">Filler words ({fillerCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary/30 border border-primary/50" />
          <span className="text-muted-foreground">Timestamps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-warning/30 border border-warning/50" />
          <span className="text-muted-foreground">Pauses</span>
        </div>
      </div>

      {/* Annotated text */}
      <div className="bg-secondary rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {tokens.map((token, i) => {
            switch (token.type) {
              case "filler":
                return (
                  <span
                    key={i}
                    className="bg-destructive/20 text-destructive px-0.5 rounded border-b-2 border-destructive/40"
                    title="Filler word detected"
                  >
                    {token.text}
                  </span>
                );
              case "timestamp":
                return (
                  <span
                    key={i}
                    className="text-primary font-semibold"
                  >
                    {token.text}
                  </span>
                );
              case "pause":
                return (
                  <span
                    key={i}
                    className="bg-warning/20 text-warning px-1 rounded text-xs"
                    title="Pause detected"
                  >
                    {token.text}
                  </span>
                );
              default:
                return <span key={i}>{token.text}</span>;
            }
          })}
        </div>
      </div>
    </div>
  );
}
