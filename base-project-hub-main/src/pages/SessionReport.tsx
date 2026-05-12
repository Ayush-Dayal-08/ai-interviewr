import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Award,
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  RefreshCcw,
  CheckCircle,
  Target,
  Download,
  Share2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { QuestionResult } from "@/hooks/useInterviewEngine";

interface InterviewResults {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  avgKeywordCoverage: number;
  avgFluency: number;
  totalFillers: number;
  category: "hr" | "technical";
  totalDuration: number;
  results: QuestionResult[];
  questionCount: number;
  answeredCount: number;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent!", color: "text-success" };
  if (score >= 60) return { label: "Good Job!", color: "text-primary" };
  if (score >= 40) return { label: "Keep Practicing", color: "text-warning" };
  return { label: "Needs Work", color: "text-destructive" };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/10 border-green-500/30";
  if (score >= 60) return "bg-blue-500/10 border-blue-500/30";
  if (score >= 40) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}

export default function SessionReport() {
  const [data, setData] = useState<InterviewResults | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("interviewResults");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse results:", e);
      }
    }
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const downloadAsText = () => {
    if (!data) return;
    const text = `INTERVIEW SESSION REPORT
Generated: ${currentDate}
Type: ${data.category === "hr" ? "HR Interview" : "Technical Interview"}
Duration: ${formatDuration(data.totalDuration)}
Questions Answered: ${data.answeredCount}/${data.questionCount}

═══════════════════════════════════════
OVERALL SCORE: ${data.overallScore}/100 — ${getScoreLabel(data.overallScore).label}
═══════════════════════════════════════

STRENGTHS:
${data.strengths.map((s) => `• ${s}`).join("\n")}

AREAS FOR IMPROVEMENT:
${data.improvements.map((i) => `• ${i}`).join("\n")}

PER-QUESTION BREAKDOWN:
${data.results
  .map(
    (r, i) => `
Q${i + 1}: ${r.question.question}
   Score: ${r.score.total}/100
   Your Answer: ${r.userAnswer || "(no answer)"}
   Model Answer: ${r.question.modelAnswer}
   Matched: ${r.score.matchedKeywords.join(", ") || "none"}
   Missed: ${r.score.missedKeywords.join(", ") || "none"}
   Time: ${r.timeSpent}s | WPM: ${r.wpm} | Fillers: ${r.fillerCount}
`,
  )
  .join("\n")}

Practice makes perfect! Keep up the great work.
`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const downloadAsPDF = () => {
    if (!data) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Interview Report</title>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
  h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
  h2 { color: #333; margin-top: 30px; }
  .score { font-size: 48px; color: ${data.overallScore >= 60 ? "#22c55e" : "#f59e0b"}; font-weight: bold; text-align: center; margin: 20px 0; }
  .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
  .q-card { border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; }
  .score-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 14px; font-weight: bold; }
  .good { background: #dcfce7; color: #16a34a; }
  .ok { background: #fef3c7; color: #d97706; }
  .bad { background: #fee2e2; color: #dc2626; }
  .keyword { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin: 2px; }
  .matched { background: #dcfce7; color: #16a34a; }
  .missed { background: #fee2e2; color: #dc2626; }
  @media print { body { padding: 20px; } }
</style></head><body>
<h1>🎯 ${data.category === "hr" ? "HR" : "Technical"} Interview Report</h1>
<p><strong>Date:</strong> ${currentDate} | <strong>Duration:</strong> ${formatDuration(data.totalDuration)} | <strong>Questions:</strong> ${data.answeredCount}/${data.questionCount}</p>
<div class="score">${data.overallScore}/100</div>
<p style="text-align:center;font-size:20px;color:${data.overallScore >= 60 ? "#22c55e" : "#f59e0b"}">${getScoreLabel(data.overallScore).label}</p>

<h2>✅ Strengths</h2><div class="section"><ul>${data.strengths.map((s) => `<li>${s}</li>`).join("")}</ul></div>
<h2>⚠️ Improvements</h2><div class="section"><ul>${data.improvements.map((i) => `<li>${i}</li>`).join("")}</ul></div>

<h2>📋 Per-Question Breakdown</h2>
${data.results
  .map(
    (r, i) => `
<div class="q-card">
  <p><strong>Q${i + 1}:</strong> ${r.question.question}</p>
  <span class="score-badge ${r.score.total >= 70 ? "good" : r.score.total >= 40 ? "ok" : "bad"}">${r.score.total}/100</span>
  <p><strong>Your answer:</strong> ${r.userAnswer || "<em>(no answer)</em>"}</p>
  <p><strong>Model answer:</strong> ${r.question.modelAnswer}</p>
  <p>Matched: ${r.score.matchedKeywords.map((k) => `<span class="keyword matched">✓ ${k}</span>`).join(" ") || "none"}</p>
  <p>Missed: ${r.score.missedKeywords.map((k) => `<span class="keyword missed">✗ ${k}</span>`).join(" ") || "none"}</p>
</div>`,
  )
  .join("")}
<p style="text-align:center;margin-top:40px;color:#666">Practice makes perfect! 🚀</p>
</body></html>`);
      printWindow.document.close();
      printWindow.print();
      toast.success("Print dialog opened — Save as PDF!");
    }
  };

  // Loading / No data states
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Session Data</h2>
            <p className="text-muted-foreground">
              Complete an interview session first to see your performance report.
            </p>
          </div>
          <Link to="/">
            <Button className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Start Interview
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(data.overallScore);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground">Session Report</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {data.category === "hr" ? "HR" : "Technical"}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadAsPDF} className="gap-2 cursor-pointer">
                  <Download className="w-4 h-4" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadAsText} className="gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Download as Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/">
              <Button size="sm" className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Practice Again
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {data.category === "hr" ? "HR" : "Technical"} Interview Report
          </h1>
          <p className="text-muted-foreground text-sm">{currentDate}</p>
        </motion.div>

        {/* Score Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6 sm:p-8 text-center"
        >
          <Award className="w-10 h-10 text-primary mx-auto mb-4" />
          <div className="flex items-center justify-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-muted" strokeWidth="3" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={data.overallScore >= 60 ? "stroke-success" : "stroke-warning"}
                  strokeWidth="3" strokeLinecap="round" fill="none"
                  strokeDasharray={`${data.overallScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${scoreInfo.color}`}>{data.overallScore}</span>
              </div>
            </div>
            <div className="text-left">
              <p className={`text-2xl font-bold ${scoreInfo.color}`}>{scoreInfo.label}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {data.answeredCount}/{data.questionCount} questions · {formatDuration(data.totalDuration)}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{data.avgKeywordCoverage}%</p>
              <p className="text-xs text-muted-foreground">Key Concepts</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{data.avgFluency}%</p>
              <p className="text-xs text-muted-foreground">Fluency</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{data.totalFillers}</p>
              <p className="text-xs text-muted-foreground">Filler Words</p>
            </div>
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {data.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-foreground">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {data.improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Per-Question Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Question-by-Question Breakdown</h3>
          </div>
          <div className="space-y-3">
            {data.results.map((r, i) => (
              <div key={r.question.id} className={`rounded-xl border ${getScoreBg(r.score.total)} overflow-hidden`}>
                {/* Question Header — always visible */}
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-lg font-bold ${getScoreColor(r.score.total)} flex-shrink-0`}>
                      {r.score.total}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        Q{i + 1}: {r.question.question}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{r.timeSpent}s</span>
                        <span>{r.wpm} WPM</span>
                        <span>{r.score.matchedKeywords.length}/{r.score.matchedKeywords.length + r.score.missedKeywords.length} key points</span>
                      </div>
                    </div>
                  </div>
                  {expandedQ === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Expanded Details */}
                {expandedQ === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border/30 p-4 space-y-4"
                  >
                    {/* Score Breakdown */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Keywords", value: r.score.keywordScore, weight: "40%" },
                        { label: "Depth", value: r.score.depthScore, weight: "20%" },
                        { label: "Structure", value: r.score.structureScore, weight: "20%" },
                        { label: "Fluency", value: r.score.fluencyScore, weight: "20%" },
                      ].map((m) => (
                        <div key={m.label} className="text-center p-2 rounded-lg bg-background/50">
                          <p className={`text-lg font-bold ${getScoreColor(m.value)}`}>{m.value}</p>
                          <p className="text-xs text-muted-foreground">{m.label} ({m.weight})</p>
                        </div>
                      ))}
                    </div>

                    {/* Keywords */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Points</p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.score.matchedKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">✓ {kw}</span>
                        ))}
                        {r.score.missedKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">✗ {kw}</span>
                        ))}
                      </div>
                    </div>

                    {/* User's Answer */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your Answer</p>
                      <p className="text-sm text-foreground bg-background/50 rounded-lg p-3">
                        {r.userAnswer || <em className="text-muted-foreground">No answer recorded</em>}
                      </p>
                    </div>

                    {/* Feedback */}
                    <p className="text-sm text-muted-foreground italic">{r.score.feedback}</p>

                    {/* Model Answer Toggle */}
                    <button
                      onClick={() => setShowModelAnswer(showModelAnswer === i ? null : i)}
                      className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showModelAnswer === i ? "Hide" : "Show"} Model Answer
                    </button>
                    {showModelAnswer === i && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-sm text-secondary-foreground bg-primary/5 border border-primary/20 rounded-lg p-3"
                      >
                        <p className="font-medium text-primary text-xs mb-1">Model Answer</p>
                        {r.question.modelAnswer}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Practice Again CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <Link to="/">
            <Button size="lg" className="gap-2 glow-effect">
              <RefreshCcw className="w-5 h-5" />
              Practice Again
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
