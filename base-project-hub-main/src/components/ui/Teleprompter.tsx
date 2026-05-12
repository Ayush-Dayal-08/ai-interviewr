import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, ChevronDown, ChevronUp, Mic, MicOff, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TeleprompterProps {
  onScriptChange?: (script: string) => void;
}

const SAMPLE_SCRIPTS: Record<string, string> = {
  "Elevator Pitch": "Good morning everyone. My name is [Your Name], and I'm here to talk about something that affects every single one of us — the way we communicate.\n\nDid you know that 75% of people rank public speaking as their number one fear? That means most of us would rather face almost anything else than stand up and speak.\n\nBut here's the thing — communication is the single most important skill in your career. It's not just about presentations. It's about interviews, meetings, negotiations, and everyday conversations.\n\nThat's why I built this AI coaching platform — to give everyone a safe space to practice, get real-time feedback, and become confident speakers.\n\nImagine having a personal speech coach available 24/7, analyzing your pace, your filler words, your confidence — and helping you improve with every session.\n\nThat's what we offer. And I'd love to show you how it works.",
  "TED Talk Opening": "Three years ago, I stood on a stage just like this one. My hands were shaking. My voice was trembling. And I forgot everything I was supposed to say.\n\nThat moment of complete failure taught me more about public speaking than any book, any course, any coach ever could.\n\nBecause here's what I learned: the fear never goes away. The greatest speakers in history — Martin Luther King Jr., Steve Jobs, Malala Yousafzai — they all felt fear.\n\nThe difference is what they did with it.\n\nToday, I want to share with you three techniques that transformed me from someone who could barely introduce himself to someone who now coaches others to find their voice.",
  "Business Presentation": "Good afternoon. Thank you all for being here today.\n\nI want to start with a number: 2.3 billion dollars. That's how much companies lose every year due to poor communication in the workplace.\n\nLet that sink in. 2.3 billion dollars — lost to misunderstandings, unclear presentations, and ineffective meetings.\n\nBut it doesn't have to be this way.\n\nToday I'm going to walk you through three key findings from our Q4 analysis, show you where the opportunities are, and present a clear action plan for the next quarter.\n\nLet's start with the data.",
};

export function Teleprompter({ onScriptChange }: TeleprompterProps) {
  const [script, setScript] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [autoFollow, setAutoFollow] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number | null>(null);
  const words = script.split(/\s+/).filter(w => w.length > 0);
  const progress = words.length > 0 ? Math.round((currentWordIndex / words.length) * 100) : 0;

  const startScrolling = useCallback(() => {
    setIsRunning(true);
    setIsEditing(false);
    const scroll = () => {
      if (textRef.current) {
        textRef.current.scrollTop += scrollSpeed * 0.5;
        // Update word index based on scroll position
        const scrollPercent = textRef.current.scrollTop / (textRef.current.scrollHeight - textRef.current.clientHeight);
        setCurrentWordIndex(Math.floor(scrollPercent * words.length));
      }
      scrollRef.current = requestAnimationFrame(scroll);
    };
    scrollRef.current = requestAnimationFrame(scroll);
  }, [scrollSpeed, words.length]);

  const stopScrolling = useCallback(() => {
    setIsRunning(false);
    if (scrollRef.current) {
      cancelAnimationFrame(scrollRef.current);
      scrollRef.current = null;
    }
  }, []);

  const resetTeleprompter = () => {
    stopScrolling();
    setCurrentWordIndex(0);
    if (textRef.current) textRef.current.scrollTop = 0;
  };

  useEffect(() => {
    return () => {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
    };
  }, []);

  const loadTemplate = (name: string) => {
    setScript(SAMPLE_SCRIPTS[name]);
    onScriptChange?.(SAMPLE_SCRIPTS[name]);
    resetTeleprompter();
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Smart Teleprompter</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{words.length} words</span>
          <span>•</span>
          <span>{progress}% complete</span>
        </div>
      </div>

      {/* Template Selector */}
      {isEditing && (
        <div className="px-4 py-2 border-b border-border flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Templates:</span>
          {Object.keys(SAMPLE_SCRIPTS).map(name => (
            <Button key={name} variant="outline" size="sm" className="text-xs h-7" onClick={() => loadTemplate(name)}>
              {name}
            </Button>
          ))}
        </div>
      )}

      {/* Script Input / Display */}
      {isEditing ? (
        <textarea
          value={script}
          onChange={(e) => { setScript(e.target.value); onScriptChange?.(e.target.value); }}
          placeholder="Paste or type your speech script here..."
          className="w-full h-64 p-4 bg-background text-foreground resize-none focus:outline-none text-base leading-relaxed"
        />
      ) : (
        <div
          ref={textRef}
          className="h-64 overflow-y-auto px-8 py-6"
          style={{
            background: "hsl(var(--background))",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <p className="text-xl leading-[2.5] text-foreground font-medium tracking-wide whitespace-pre-wrap">
            {words.map((word, i) => (
              <span
                key={i}
                className={`transition-colors duration-200 ${
                  i < currentWordIndex
                    ? "text-muted-foreground/40"
                    : i === currentWordIndex
                    ? "text-primary font-bold text-2xl"
                    : "text-foreground"
                }`}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 py-3 border-t border-border flex flex-wrap items-center gap-3">
        <Button
          variant={isRunning ? "destructive" : "default"}
          size="sm"
          className="gap-1.5"
          onClick={() => isRunning ? stopScrolling() : startScrolling()}
          disabled={words.length === 0}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause" : "Start"}
        </Button>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={resetTeleprompter}>
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>

        <Button
          variant={isEditing ? "secondary" : "outline"}
          size="sm"
          onClick={() => { setIsEditing(!isEditing); if (!isEditing) stopScrolling(); }}
        >
          {isEditing ? "Preview" : "Edit"}
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <Slider
            value={[scrollSpeed]}
            onValueChange={([v]) => setScrollSpeed(v)}
            min={0.5}
            max={8}
            step={0.5}
            className="w-24"
          />
          <span className="text-xs font-mono text-foreground w-6">{scrollSpeed}x</span>
        </div>

        <Button
          variant={autoFollow ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setAutoFollow(!autoFollow)}
        >
          {autoFollow ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          Auto-Follow
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
