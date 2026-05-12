import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Home, History, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudienceSimulator } from "@/components/ui/AudienceSimulator";
import { AnxietyTrainer } from "@/components/ui/AnxietyTrainer";

export default function StressTraining() {
  const [activeSection, setActiveSection] = useState<"audience" | "anxiety">("audience");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Stress Training</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/practice"><Button variant="ghost" size="sm" className="gap-1.5"><Mic className="w-4 h-4" /><span className="hidden sm:inline">Practice</span></Button></Link>
            <Link to="/history"><Button variant="ghost" size="sm" className="gap-1.5"><History className="w-4 h-4" /><span className="hidden sm:inline">History</span></Button></Link>
            <Link to="/"><Button variant="outline" size="sm" className="gap-1.5"><Home className="w-4 h-4" /><span className="hidden sm:inline">Home</span></Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Audience Simulation & Stress Training</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Build resilience and confidence under pressure</p>
        </motion.div>

        {/* Section Tabs */}
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          <button onClick={() => setActiveSection("audience")}
            className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition-colors ${activeSection === "audience" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            👥 Audience Simulator
          </button>
          <button onClick={() => setActiveSection("anxiety")}
            className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition-colors ${activeSection === "anxiety" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            🧘 Anxiety Training
          </button>
        </div>

        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeSection === "audience" && <AudienceSimulator />}
          {activeSection === "anxiety" && <AnxietyTrainer />}
        </motion.div>
      </main>
    </div>
  );
}
