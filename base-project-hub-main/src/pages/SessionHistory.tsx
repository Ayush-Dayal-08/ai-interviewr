import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  History, 
  Calendar, 
  Clock, 
  Award, 
  ChevronRight, 
  RefreshCcw,
  Loader2,
  LogIn,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProgressDashboard } from "@/components/ui/ProgressDashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionSummary {
  id: string;
  createdAt: string;
  duration: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

type SortOption = "date" | "score" | "duration";

export default function SessionHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date");

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch sessions:", error);
      } else if (data) {
        setSessions(data.map(s => ({
          id: s.id,
          createdAt: s.created_at,
          duration: s.duration || 0,
          overallScore: s.overall_score || 0,
          strengths: s.strengths || [],
          improvements: s.improvements || [],
        })));
      }
      
      setIsLoading(false);
    };

    fetchSessions();
  }, []);

  const sortedSessions = [...sessions].sort((a, b) => {
    switch (sortBy) {
      case "score": return b.overallScore - a.overallScore;
      case "duration": return b.duration - a.duration;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading session history...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <LogIn className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to view your session history.
            </p>
          </div>
          <Link to="/">
            <Button className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <History className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Session History</span>
          </div>
          <Link to="/">
            <Button className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              New Session
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Progress Dashboard */}
        <ProgressDashboard sessions={sessions} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Your Practice Sessions</h1>
            
            {sessions.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort: {sortBy === "date" ? "Date" : sortBy === "score" ? "Score" : "Duration"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("date")} className="cursor-pointer">
                    By Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("score")} className="cursor-pointer">
                    By Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("duration")} className="cursor-pointer">
                    By Duration
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first practice session to see your history here.
              </p>
              <Link to="/">
                <Button className="gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  Start Practice
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link to={`/report?session=${session.id}`}>
                    <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Score Circle */}
                          <div className="relative w-14 h-14 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="stroke-muted"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={session.overallScore >= 60 ? "stroke-success" : "stroke-warning"}
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={`${session.overallScore}, 100`}
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-sm font-bold ${getScoreColor(session.overallScore)}`}>
                                {session.overallScore}
                              </span>
                            </div>
                          </div>

                          {/* Session Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${getScoreColor(session.overallScore)}`}>
                                {getScoreLabel(session.overallScore)}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(session.duration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Calendar className="w-3 h-3" />
                              {formatDate(session.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                      {/* Highlights */}
                      {(session.strengths.length > 0 || session.improvements.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {session.strengths.length > 0 && (
                            <div>
                              <p className="text-xs text-success font-medium mb-1">Strengths</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {session.strengths[0]}
                              </p>
                            </div>
                          )}
                          {session.improvements.length > 0 && (
                            <div>
                              <p className="text-xs text-warning font-medium mb-1">To Improve</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {session.improvements[0]}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
