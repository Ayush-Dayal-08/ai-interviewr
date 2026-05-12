import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff } from "lucide-react";

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  isPartial: boolean;
  isFiller?: boolean;
}

interface LiveTranscriptProps {
  transcripts: TranscriptSegment[];
  partialText: string;
  isConnected: boolean;
}

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", 
  "literally", "sort of", "kind of", "i mean", "right", "so yeah",
  "well", "er", "umm", "uhh", "so"
];

function highlightFillers(text: string): React.ReactNode {
  const words = text.split(/(\s+)/);
  
  return words.map((word, index) => {
    const isFillerWord = FILLER_WORDS.some(filler => 
      word.toLowerCase().replace(/[.,!?]/g, '') === filler
    );
    
    if (isFillerWord) {
      return (
        <span key={index} className="bg-warning/20 text-warning px-0.5 rounded">
          {word}
        </span>
      );
    }
    return <span key={index}>{word}</span>;
  });
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LiveTranscript({ transcripts, partialText, isConnected }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, partialText]);

  return (
    <div className="bg-card rounded-xl border border-border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Mic className="w-4 h-4 text-success animate-pulse" />
          ) : (
            <MicOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">Live Transcript</span>
        </div>
        {isConnected && (
          <span className="text-xs text-success font-medium">● Recording</span>
        )}
      </div>

      {/* Transcript Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {transcripts.length === 0 && !partialText && (
            <p className="text-muted-foreground text-sm text-center py-8">
              {isConnected 
                ? "Listening... Start speaking to see your transcript."
                : "Transcript will appear here when session starts."
              }
            </p>
          )}

          {transcripts.map((segment) => (
            <div key={segment.id} className="animate-fade-in">
              <span className="text-primary font-mono text-xs mr-2">
                [{formatTimestamp(segment.timestamp)}]
              </span>
              <span className="text-secondary-foreground text-sm">
                {highlightFillers(segment.text)}
              </span>
            </div>
          ))}

          {/* Partial/live text */}
          {partialText && (
            <div className="animate-pulse">
              <span className="text-primary font-mono text-xs mr-2">
                [now]
              </span>
              <span className="text-muted-foreground text-sm italic">
                {partialText}...
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
