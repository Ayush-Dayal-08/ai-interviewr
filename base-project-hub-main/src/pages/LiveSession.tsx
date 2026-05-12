import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, SkipForward, Volume2, CheckCircle2, XCircle, Clock, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoFeed } from "@/components/ui/VideoFeed";
import { PerformanceMeters, SessionTimer } from "@/components/ui/PerformanceMeters";
import { LiveTranscript } from "@/components/ui/LiveTranscript";
import { useInterviewEngine } from "@/hooks/useInterviewEngine";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import type { InterviewCategory } from "@/data/interviewQuestions";
import { toast } from "sonner";

export default function LiveSession() {
  const navigate = useNavigate();
  const { isRecording, recordedUrl, startRecording, stopRecording } = useVideoRecorder();
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const category: InterviewCategory =
    (sessionStorage.getItem("interviewCategory") as InterviewCategory) || "hr";

  const engine = useInterviewEngine();

  // Timer
  useEffect(() => {
    if (!engine.isActive) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [engine.isActive]);

  const formattedTime = `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, "0")}`;

  // Start the session on mount
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        if (mounted) await engine.startSession(category);
      } catch (err) {
        console.error("Session init error:", err);
        if (mounted) toast.error("Failed to start session.");
      }
    };
    init();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to report when session completes
  useEffect(() => {
    if (engine.isComplete && engine.session) {
      // Store results in sessionStorage for the report page
      const summary = engine.getSessionSummary();
      if (summary) {
        sessionStorage.setItem("interviewResults", JSON.stringify(summary));
      }
      setTimeout(() => navigate("/report"), 2000);
    }
  }, [engine.isComplete, engine.session, engine.getSessionSummary, navigate]);

  const handleEndSession = () => {
    stopRecording();
    if (recordedUrl) {
      sessionStorage.setItem("recordedVideoUrl", recordedUrl);
    }
    engine.endSession();
    const summary = engine.getSessionSummary();
    if (summary) {
      sessionStorage.setItem("interviewResults", JSON.stringify(summary));
    }
    navigate("/report");
  };

  const handleStreamReady = (stream: MediaStream) => {
    if (!isVideoRecording) {
      startRecording(stream);
      setIsVideoRecording(true);
    }
  };

  const handleNextQuestion = useCallback(() => {
    engine.submitAnswer();
  }, [engine]);

  const progressPercent = engine.totalQuestions > 0
    ? Math.round(((engine.currentQuestionNumber - 1) / engine.totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground text-sm sm:text-base">
              {category === "hr" ? "HR" : "Technical"} Interview
            </span>
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                Q{engine.currentQuestionNumber}/{engine.totalQuestions}
              </span>
              <span className={`w-2 h-2 rounded-full ${engine.isTranscriptionConnected ? 'bg-success' : 'bg-warning animate-pulse'}`} />
              <span className="text-xs text-muted-foreground">
                {engine.isTranscriptionConnected ? 'STT Active' : 'Starting STT...'}
              </span>
              {engine.isSpeaking && (
                <span className="flex items-center gap-1 ml-2">
                  <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-xs text-primary">Speaking</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <SessionTimer time={formattedTime} />
            <Button variant="destructive" size="sm" className="gap-1 sm:gap-2" onClick={handleEndSession}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">End Session</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Mobile status */}
      <div className="flex sm:hidden items-center justify-center gap-4 py-2 border-b border-border">
        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
          Q{engine.currentQuestionNumber}/{engine.totalQuestions}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${engine.isTranscriptionConnected ? 'bg-success' : 'bg-warning animate-pulse'}`} />
          <span className="text-xs text-muted-foreground">{engine.isTranscriptionConnected ? 'STT' : '...'}</span>
        </div>
        {engine.isSpeaking && (
          <div className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs text-primary">Speaking</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
        {/* Left Side — Video + Question + Metrics */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-shrink-0"
          >
            <VideoFeed label="Live Video Feed" isLive className="w-full aspect-video" onStreamReady={handleStreamReady} />
          </motion.div>

          {/* Current Question Card */}
          <AnimatePresence mode="wait">
            {engine.currentQuestion && !engine.showingScore && (
              <motion.div
                key={`q-${engine.currentQuestionNumber}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                    Q{engine.currentQuestionNumber}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {category === "hr" ? "Behavioral" : "Technical"}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                  {engine.currentQuestion.question}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mic className="w-3.5 h-3.5 text-green-400" />
                    <span>Listening for your answer...</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleNextQuestion}
                    disabled={engine.isSpeaking}
                    className="gap-1.5"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    {engine.currentQuestionNumber === engine.totalQuestions ? "Finish" : "Next Question"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score Overlay */}
          <AnimatePresence>
            {engine.showingScore && engine.lastScore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-5 rounded-xl border-2 shadow-lg"
                style={{
                  borderColor: engine.lastScore.total >= 70 ? "hsl(var(--success))" : engine.lastScore.total >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                  backgroundColor: engine.lastScore.total >= 70 ? "hsl(var(--success) / 0.1)" : engine.lastScore.total >= 40 ? "hsl(var(--warning) / 0.1)" : "hsl(var(--destructive) / 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-foreground">
                    Score: {engine.lastScore.total}/100
                  </span>
                  {engine.lastScore.total >= 70 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-orange-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{engine.lastScore.feedback}</p>
                {engine.lastScore.matchedKeywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {engine.lastScore.matchedKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                )}
                {engine.lastScore.missedKeywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {engine.lastScore.missedKeywords.slice(0, 4).map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                        ✗ {kw}
                      </span>
                    ))}
                  </div>
                )}
                {!engine.isComplete && (
                  <p className="mt-3 text-xs text-primary animate-pulse">Next question in a moment...</p>
                )}
                {engine.isComplete && (
                  <p className="mt-3 text-sm font-medium text-primary">
                    🎉 Interview complete! Generating report...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Meters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <PerformanceMeters
              confidence={engine.lastScore?.total ?? 50}
              wpm={engine.wpm}
              fillerWords={engine.fillerCount}
              confidenceHistory={engine.session?.results.map(r => r.score.total) ?? []}
              wpmHistory={engine.session?.results.map(r => r.wpm) ?? []}
            />
          </motion.div>
        </div>

        {/* Right Sidebar — Transcript + Question List */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3">
          {/* Question Progress List */}
          <div className="bg-card border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Questions
            </p>
            <div className="space-y-1.5">
              {engine.session?.questions.map((q, i) => {
                const result = engine.session?.results[i];
                const isCurrent = i === (engine.currentQuestionNumber - 1) && !engine.isComplete;
                return (
                  <div
                    key={q.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                      isCurrent
                        ? "bg-primary/20 text-primary font-medium"
                        : result
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    <span className="w-5 text-center flex-shrink-0">
                      {result ? (
                        result.score.total >= 70 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 inline" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-orange-400 inline" />
                        )
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
                      ) : (
                        <span className="text-muted-foreground/30">{i + 1}</span>
                      )}
                    </span>
                    <span className="truncate flex-1">
                      {q.question.slice(0, 50)}...
                    </span>
                    {result && (
                      <span className={`font-mono font-bold ${
                        result.score.total >= 70 ? "text-green-400" : "text-orange-400"
                      }`}>
                        {result.score.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Transcript */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex-1 min-h-0 h-48 sm:h-56 lg:h-auto"
          >
            <LiveTranscript
              transcripts={engine.transcripts}
              partialText={engine.partialTranscript}
              isConnected={engine.isTranscriptionConnected}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
