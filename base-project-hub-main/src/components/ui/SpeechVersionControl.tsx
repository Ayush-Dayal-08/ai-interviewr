import { useState, useEffect } from "react";
import { GitCompare, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SpeechVersion {
  id: string;
  speechId: string;
  version: number;
  timestamp: number;
  date: string;
  transcript: string;
  scores: { overall: number; clarity?: number; pace?: number; confidence?: number };
  wpm: number;
  fillerCount: number;
  duration: number;
  notes: string;
}

const STORAGE_KEY = "speech_versions";

function getVersions(speechId: string): SpeechVersion[] {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return all[speechId] || [];
}

function saveVersion(speechId: string, data: Omit<SpeechVersion, "id" | "speechId" | "version" | "timestamp" | "date">) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const versions = all[speechId] || [];
  const newVersion: SpeechVersion = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    speechId,
    version: versions.length + 1,
    timestamp: Date.now(),
    date: new Date().toISOString(),
  };
  versions.push(newVersion);
  all[speechId] = versions;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newVersion;
}

function getAllSpeeches(): string[] {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return Object.keys(all);
}

export function SpeechVersionControl() {
  const [speeches, setSpeeches] = useState<string[]>([]);
  const [selectedSpeech, setSelectedSpeech] = useState<string>("");
  const [versions, setVersions] = useState<SpeechVersion[]>([]);
  const [compareA, setCompareA] = useState<number | null>(null);
  const [compareB, setCompareB] = useState<number | null>(null);
  const [newSpeechName, setNewSpeechName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setSpeeches(getAllSpeeches());
  }, []);

  useEffect(() => {
    if (selectedSpeech) {
      setVersions(getVersions(selectedSpeech));
      setCompareA(null);
      setCompareB(null);
    }
  }, [selectedSpeech]);

  const handleAddSpeech = () => {
    if (!newSpeechName.trim()) return;
    saveVersion(newSpeechName.trim(), {
      transcript: "",
      scores: { overall: 0 },
      wpm: 0,
      fillerCount: 0,
      duration: 0,
      notes: "Initial version",
    });
    setSpeeches(getAllSpeeches());
    setSelectedSpeech(newSpeechName.trim());
    setNewSpeechName("");
    setShowAddForm(false);
    toast.success("Speech created!");
  };

  const versionA = compareA !== null ? versions.find(v => v.version === compareA) : null;
  const versionB = compareB !== null ? versions.find(v => v.version === compareB) : null;

  const renderChange = (label: string, valA: number, valB: number, higherBetter = true) => {
    const diff = valB - valA;
    const improved = higherBetter ? diff > 0 : diff < 0;
    const icon = diff === 0 ? <Minus className="w-3.5 h-3.5 text-muted-foreground" /> :
      improved ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{valA}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-sm font-mono">{valB}</span>
          {icon}
          <span className={`text-xs font-medium ${improved ? "text-success" : diff === 0 ? "text-muted-foreground" : "text-destructive"}`}>
            {diff > 0 ? "+" : ""}{diff}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Speech Version Control</h3>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4" /> New Speech
        </Button>
      </div>

      {showAddForm && (
        <div className="flex gap-2">
          <input
            value={newSpeechName}
            onChange={(e) => setNewSpeechName(e.target.value)}
            placeholder="Speech name..."
            className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAddSpeech()}
          />
          <Button size="sm" onClick={handleAddSpeech}>Create</Button>
        </div>
      )}

      {speeches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {speeches.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpeech(s)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedSpeech === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {versions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{versions.length} version(s) — select two to compare</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {versions.map(v => (
              <button
                key={v.id}
                onClick={() => {
                  if (compareA === v.version) setCompareA(null);
                  else if (compareB === v.version) setCompareB(null);
                  else if (compareA === null) setCompareA(v.version);
                  else if (compareB === null) setCompareB(v.version);
                  else { setCompareA(compareB); setCompareB(v.version); }
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all ${
                  compareA === v.version ? "border-primary bg-primary/10 ring-1 ring-primary" :
                  compareB === v.version ? "border-accent bg-accent/10 ring-1 ring-accent" :
                  "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-semibold">V{v.version}</span>
                <p className="text-muted-foreground mt-0.5">{new Date(v.date).toLocaleDateString()}</p>
                <p className="text-foreground font-medium">Score: {v.scores.overall}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison */}
      {versionA && versionB && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">V{versionA.version} vs V{versionB.version}</h4>
          {renderChange("Overall Score", versionA.scores.overall, versionB.scores.overall)}
          {renderChange("WPM", versionA.wpm, versionB.wpm)}
          {renderChange("Filler Words", versionA.fillerCount, versionB.fillerCount, false)}
          {renderChange("Duration (s)", versionA.duration, versionB.duration)}
        </div>
      )}

      {speeches.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground text-center py-4">No speeches yet. Create one to start tracking versions.</p>
      )}
    </div>
  );
}
