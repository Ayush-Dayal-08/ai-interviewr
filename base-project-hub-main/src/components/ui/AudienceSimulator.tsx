import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Play, Square, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudienceMember {
  id: number;
  emoji: string;
  mood: string;
  attention: number;
  x: number;
  y: number;
}

type Difficulty = "easy" | "medium" | "hard" | "nightmare";

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; eventInterval: number; label: string }> = {
  easy: { size: 8, eventInterval: 30000, label: "🌱 Easy (8 people)" },
  medium: { size: 20, eventInterval: 15000, label: "🎯 Medium (20 people)" },
  hard: { size: 40, eventInterval: 8000, label: "🔥 Hard (40 people)" },
  nightmare: { size: 60, eventInterval: 5000, label: "👑 Nightmare (60 people)" },
};

const EVENTS: Array<{ name: string; description: string; difficulty: Difficulty[]; effect: (audience: AudienceMember[]) => AudienceMember[] }> = [
  { name: "Phone Ring", description: "📱 Someone's phone is ringing!", difficulty: ["medium", "hard", "nightmare"],
    effect: (a) => { const i = Math.floor(Math.random() * a.length); a[i] = { ...a[i], emoji: "📱", mood: "distracted", attention: a[i].attention * 0.8 }; return [...a]; }},
  { name: "Yawning", description: "🥱 Multiple people are yawning!", difficulty: ["medium", "hard", "nightmare"],
    effect: (a) => { for (let j = 0; j < 3; j++) { const i = Math.floor(Math.random() * a.length); a[i] = { ...a[i], emoji: "🥱", mood: "bored", attention: a[i].attention * 0.85 }; } return [...a]; }},
  { name: "Whispering", description: "🗣️ Two people are whispering!", difficulty: ["hard", "nightmare"],
    effect: (a) => { const i = Math.floor(Math.random() * a.length); const j = (i + 1) % a.length; a[i] = { ...a[i], emoji: "🗣️", mood: "distracted" }; a[j] = { ...a[j], emoji: "👂", mood: "distracted" }; return [...a]; }},
  { name: "Nodding", description: "👍 People are nodding in agreement!", difficulty: ["easy", "medium", "hard"],
    effect: (a) => { for (let j = 0; j < 4; j++) { const i = Math.floor(Math.random() * a.length); a[i] = { ...a[i], emoji: "👍", mood: "interested", attention: Math.min(1, a[i].attention + 0.05) }; } return [...a]; }},
  { name: "Applause", description: "👏 The audience is applauding!", difficulty: ["easy", "medium", "hard", "nightmare"],
    effect: (a) => a.map(p => ({ ...p, emoji: "👏", mood: "happy", attention: Math.min(1, p.attention + 0.1) })) },
  { name: "Confused", description: "😕 Several people look confused", difficulty: ["medium", "hard", "nightmare"],
    effect: (a) => { for (let j = 0; j < 3; j++) { const i = Math.floor(Math.random() * a.length); a[i] = { ...a[i], emoji: "😕", mood: "confused", attention: a[i].attention * 0.9 }; } return [...a]; }},
  { name: "Laptop", description: "💻 Someone opened their laptop!", difficulty: ["hard", "nightmare"],
    effect: (a) => { const i = Math.floor(Math.random() * a.length); a[i] = { ...a[i], emoji: "💻", mood: "distracted", attention: a[i].attention * 0.5 }; return [...a]; }},
  { name: "Leaving", description: "🚶 Someone is leaving!", difficulty: ["nightmare"],
    effect: (a) => { const i = Math.floor(Math.random() * a.length); a[i] = { ...a[i], emoji: "🚶", mood: "leaving", attention: 0 }; return [...a]; }},
];

function createAudience(size: number): AudienceMember[] {
  const members: AudienceMember[] = [];
  const cols = Math.min(10, Math.ceil(Math.sqrt(size * 2)));
  const rows = Math.ceil(size / cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (members.length >= size) break;
      members.push({
        id: members.length,
        emoji: "😐",
        mood: "neutral",
        attention: 0.7 + Math.random() * 0.3,
        x: c, y: r,
      });
    }
  }
  return members;
}

export function AudienceSimulator() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isActive, setIsActive] = useState(false);
  const [audience, setAudience] = useState<AudienceMember[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const eventTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const avgAttention = audience.length > 0
    ? audience.reduce((s, p) => s + p.attention, 0) / audience.length
    : 0;

  const start = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const members = createAudience(config.size);
    setAudience(members);
    setIsActive(true);
    setEventLog([]);

    eventTimerRef.current = setInterval(() => {
      const eligible = EVENTS.filter(e => e.difficulty.includes(difficulty));
      if (eligible.length > 0) {
        const event = eligible[Math.floor(Math.random() * eligible.length)];
        setAudience(prev => event.effect([...prev]));
        setEventLog(prev => [...prev, event.description]);
        setNotification(event.description);
        setTimeout(() => setNotification(null), 3000);
      }
    }, config.eventInterval);

    // Natural attention decay
    decayTimerRef.current = setInterval(() => {
      setAudience(prev => prev.map(p => ({
        ...p,
        attention: Math.max(0.1, p.attention * 0.997),
        // Reset moods naturally
        ...(Math.random() > 0.95 && p.mood !== "happy" ? { emoji: "😐", mood: "neutral" } : {}),
      })));
    }, 2000);
  };

  const stop = () => {
    setIsActive(false);
    if (eventTimerRef.current) clearInterval(eventTimerRef.current);
    if (decayTimerRef.current) clearInterval(decayTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);
    };
  }, []);

  const engagementColor = avgAttention > 0.7 ? "text-success" : avgAttention > 0.4 ? "text-warning" : "text-destructive";
  const engagementLabel = avgAttention > 0.8 ? "Captivated" : avgAttention > 0.6 ? "Engaged" : avgAttention > 0.4 ? "Losing Interest" : "Disengaged";

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Virtual Audience Simulator</h3>
        </div>
        {isActive && (
          <div className="text-right">
            <span className={`text-sm font-bold ${engagementColor}`}>{(avgAttention * 100).toFixed(0)}% Engaged</span>
            <p className={`text-xs ${engagementColor}`}>{engagementLabel}</p>
          </div>
        )}
      </div>

      {/* Difficulty Selector */}
      {!isActive && (
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                difficulty === key ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/50"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      )}

      {/* Audience Grid */}
      {isActive && (
        <div className="relative bg-background rounded-lg p-4 min-h-[200px]">
          {/* Event notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-lg text-sm font-medium z-10 shadow-lg"
              >
                {notification}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Engagement bar */}
          <div className="mb-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${avgAttention > 0.7 ? "bg-success" : avgAttention > 0.4 ? "bg-warning" : "bg-destructive"}`}
                animate={{ width: `${avgAttention * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Audience members */}
          <div className="flex flex-wrap justify-center gap-1">
            {audience.map(person => (
              <motion.div
                key={person.id}
                animate={{ y: [0, -2, 0], opacity: person.mood === "leaving" ? 0.3 : 1 }}
                transition={{ y: { duration: 2, repeat: Infinity, delay: person.id * 0.1 } }}
                className="relative"
                title={`Attention: ${(person.attention * 100).toFixed(0)}%`}
              >
                <span className="text-xl sm:text-2xl cursor-default">{person.emoji}</span>
                <div className="w-5 h-0.5 mx-auto mt-0.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${person.attention > 0.7 ? "bg-success" : person.attention > 0.4 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${person.attention * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stage indicator */}
          <div className="mt-4 text-center text-xs text-muted-foreground bg-primary/5 rounded py-1">🎤 STAGE</div>
        </div>
      )}

      {/* Event Log */}
      {eventLog.length > 0 && (
        <div className="max-h-24 overflow-y-auto space-y-1">
          {eventLog.slice(-5).map((e, i) => (
            <p key={i} className="text-xs text-muted-foreground">{e}</p>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isActive ? (
          <Button className="gap-1.5" onClick={start}>
            <Play className="w-4 h-4" /> Start Simulation
          </Button>
        ) : (
          <Button variant="destructive" className="gap-1.5" onClick={stop}>
            <Square className="w-4 h-4" /> Stop
          </Button>
        )}
      </div>
    </div>
  );
}
