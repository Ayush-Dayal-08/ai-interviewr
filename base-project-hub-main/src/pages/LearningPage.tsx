import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Home, History, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningModules } from "@/components/ui/LearningModules";

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Learning</span>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Micro-Learning Modules</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Master public speaking skills through interactive lessons and quizzes</p>
        </motion.div>

        <LearningModules />
      </main>
    </div>
  );
}
