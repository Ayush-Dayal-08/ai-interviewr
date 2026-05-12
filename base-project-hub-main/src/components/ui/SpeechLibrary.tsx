import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, Search, Plus, Star, StarOff, Trash2, Tag, Calendar, BarChart3, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SpeechEntry {
  id: string;
  title: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versions: Array<{
    version: number;
    transcript: string;
    scores: { overall: number };
    wpm: number;
    duration: number;
    date: string;
  }>;
  status: "draft" | "practicing" | "ready" | "delivered";
  targetEvent: string | null;
  targetDate: string | null;
  notes: string;
  practiceCount: number;
  bestScore: number;
  isFavorite: boolean;
}

const STORAGE_KEY = "speech_library";
const CATEGORIES = ["general", "business", "motivational", "educational", "personal", "wedding", "eulogy"];
const STATUSES = ["draft", "practicing", "ready", "delivered"] as const;

function getLibrary(): SpeechEntry[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveLibrary(library: SpeechEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function SpeechLibrary() {
  const [library, setLibrary] = useState<SpeechEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpeech, setSelectedSpeech] = useState<SpeechEntry | null>(null);
  const [newSpeech, setNewSpeech] = useState({ title: "", category: "general", tags: "", notes: "", transcript: "" });

  useEffect(() => {
    setLibrary(getLibrary());
  }, []);

  const filteredLibrary = library.filter(s => {
    const matchesSearch = searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || s.category === filterCategory;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAdd = () => {
    if (!newSpeech.title.trim()) { toast.error("Title is required"); return; }
    const entry: SpeechEntry = {
      id: generateId(),
      title: newSpeech.title,
      category: newSpeech.category,
      tags: newSpeech.tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: newSpeech.transcript ? [{
        version: 1, transcript: newSpeech.transcript, scores: { overall: 0 }, wpm: 0, duration: 0, date: new Date().toISOString(),
      }] : [],
      status: "draft",
      targetEvent: null,
      targetDate: null,
      notes: newSpeech.notes,
      practiceCount: 0,
      bestScore: 0,
      isFavorite: false,
    };
    const updated = [...library, entry];
    setLibrary(updated);
    saveLibrary(updated);
    setShowAddForm(false);
    setNewSpeech({ title: "", category: "general", tags: "", notes: "", transcript: "" });
    toast.success("Speech added!");
  };

  const toggleFavorite = (id: string) => {
    const updated = library.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
    setLibrary(updated);
    saveLibrary(updated);
  };

  const updateStatus = (id: string, status: SpeechEntry["status"]) => {
    const updated = library.map(s => s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s);
    setLibrary(updated);
    saveLibrary(updated);
  };

  const deleteSpeech = (id: string) => {
    const updated = library.filter(s => s.id !== id);
    setLibrary(updated);
    saveLibrary(updated);
    if (selectedSpeech?.id === id) setSelectedSpeech(null);
    toast.success("Speech deleted");
  };

  const exportSpeech = (speech: SpeechEntry) => {
    const blob = new Blob([JSON.stringify(speech, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${speech.title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Speech exported!");
  };

  const stats = {
    total: library.length,
    totalPractice: library.reduce((s, r) => s + r.practiceCount, 0),
    avgBestScore: library.length > 0 ? Math.round(library.reduce((s, r) => s + r.bestScore, 0) / library.length) : 0,
    draft: library.filter(s => s.status === "draft").length,
    practicing: library.filter(s => s.status === "practicing").length,
    ready: library.filter(s => s.status === "ready").length,
    delivered: library.filter(s => s.status === "delivered").length,
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    practicing: "bg-warning/10 text-warning",
    ready: "bg-success/10 text-success",
    delivered: "bg-primary/10 text-primary",
  };

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Speeches", value: stats.total, icon: "📝" },
          { label: "Practice Runs", value: stats.totalPractice, icon: "🏋️" },
          { label: "Avg Best Score", value: stats.avgBestScore, icon: "🏆" },
          { label: "Ready to Deliver", value: stats.ready, icon: "✅" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-3 text-center">
            <span className="text-lg">{s.icon}</span>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Speech Library</h3>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4" /> Add Speech
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search speeches..."
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-sm text-foreground"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1.5 text-sm text-foreground">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1.5 text-sm text-foreground">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
              <input value={newSpeech.title} onChange={(e) => setNewSpeech(p => ({ ...p, title: e.target.value }))}
                placeholder="Speech title..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newSpeech.category} onChange={(e) => setNewSpeech(p => ({ ...p, category: e.target.value }))}
                  className="bg-background border border-border rounded-md px-2 py-1.5 text-sm text-foreground">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input value={newSpeech.tags} onChange={(e) => setNewSpeech(p => ({ ...p, tags: e.target.value }))}
                  placeholder="Tags (comma-separated)" className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground" />
              </div>
              <textarea value={newSpeech.transcript} onChange={(e) => setNewSpeech(p => ({ ...p, transcript: e.target.value }))}
                placeholder="Paste your speech transcript (optional)..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground h-24 resize-none" />
              <textarea value={newSpeech.notes} onChange={(e) => setNewSpeech(p => ({ ...p, notes: e.target.value }))}
                placeholder="Notes..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground h-16 resize-none" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>Save Speech</Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Library List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredLibrary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {library.length === 0 ? "No speeches yet. Add one to get started!" : "No speeches match your filters."}
            </p>
          ) : filteredLibrary.map(speech => (
            <motion.div key={speech.id} layout
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                selectedSpeech?.id === speech.id ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => setSelectedSpeech(selectedSpeech?.id === speech.id ? null : speech)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-foreground">{speech.title}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[speech.status]}`}>
                      {speech.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{speech.category}</span>
                    <span>•</span>
                    <span>{speech.versions.length} version(s)</span>
                    <span>•</span>
                    <span>Best: {speech.bestScore}</span>
                    <span>•</span>
                    <span>{speech.practiceCount} runs</span>
                  </div>
                  {speech.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {speech.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(speech.id); }}
                    className="p-1 hover:bg-muted rounded">
                    {speech.isFavorite ? <Star className="w-4 h-4 text-warning fill-warning" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); exportSpeech(speech); }}
                    className="p-1 hover:bg-muted rounded">
                    <FileDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteSpeech(speech.id); }}
                    className="p-1 hover:bg-muted rounded">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedSpeech?.id === speech.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border space-y-3">
                  {speech.notes && <p className="text-sm text-muted-foreground">{speech.notes}</p>}
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Change status:</span>
                    {STATUSES.map(s => (
                      <button key={s} onClick={(e) => { e.stopPropagation(); updateStatus(speech.id, s); }}
                        className={`px-2 py-0.5 rounded text-xs transition-colors ${speech.status === s ? statusColors[s] + " font-semibold" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {speech.versions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Version History:</p>
                      {speech.versions.map(v => (
                        <div key={v.version} className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono">V{v.version}</span>
                          <span>{new Date(v.date).toLocaleDateString()}</span>
                          <span>Score: {v.scores.overall}</span>
                          <span>{v.wpm} WPM</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
