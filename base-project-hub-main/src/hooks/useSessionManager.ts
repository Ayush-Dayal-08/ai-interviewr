import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGeminiCoach } from "./useGeminiCoach";
import { useRealtimeTranscription } from "./useRealtimeTranscription";
import { useBrowserTTS } from "./useBrowserTTS";
import { PersonaType } from "@/components/ui/PersonaSelector";

export interface SessionData {
  id: string;
  duration: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", 
  "literally", "sort of", "kind of", "i mean", "right", "so yeah",
  "well", "er", "umm", "uhh", "so"
];

export function useSessionManager(persona: PersonaType = "friendly") {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const [localMetrics, setLocalMetrics] = useState({ confidence: 50, wpm: 0, fillerWords: 0 });
  const [metricsHistory, setMetricsHistory] = useState<Array<{ confidence: number; wpm: number; fillerWords: number; timestamp: number }>>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyticsRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const lastFeedbackIndexRef = useRef(0);
  const isActiveRef = useRef(false);
  const isSendingFeedbackRef = useRef(false);

  const geminiCoach = useGeminiCoach(persona);
  const transcription = useRealtimeTranscription();
  const tts = useBrowserTTS();

  // Check for authenticated user (optional — works without auth)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch {
        // Supabase not configured or auth not available — that's fine
        setUserId(null);
      }
    };
    checkUser();
  }, []);

  // --- Speak AI responses aloud ---
  useEffect(() => {
    if (geminiCoach.latestResponse?.coach_message && isActiveRef.current) {
      tts.speak(geminiCoach.latestResponse.coach_message);
    }
  }, [geminiCoach.latestResponse, tts]);

  // --- Merge AI metrics with local metrics ---
  useEffect(() => {
    if (geminiCoach.metrics) {
      setLocalMetrics(prev => ({
        confidence: Math.round(
          (prev.confidence * 0.4) + (geminiCoach.metrics!.confidence_score * 0.6)
        ),
        wpm: prev.wpm, // keep local WPM calculation (more accurate)
        fillerWords: prev.fillerWords, // keep local filler count (more accurate)
      }));
    }
  }, [geminiCoach.metrics]);

  // --- Analytics engine: recalculate every 3 seconds from transcript ---
  const recalculateMetrics = useCallback(() => {
    const segments = transcription.transcripts.filter(t => !t.isPartial);
    const allText = segments.map(s => s.text).join(" ");
    const words = allText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;

    // WPM
    const elapsedMinutes = (Date.now() - sessionStartTimeRef.current) / 60000;
    const wpm = elapsedMinutes > 0.1 ? Math.round(totalWords / elapsedMinutes) : 0;

    // Filler words
    const textLower = allText.toLowerCase();
    let fillerCount = 0;
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = textLower.match(regex);
      if (matches) fillerCount += matches.length;
    }

    // Confidence: composite of speech continuity + filler density + pacing
    const fillerDensity = totalWords > 0 ? fillerCount / totalWords : 0;
    const fillerScore = Math.max(0, 100 - fillerDensity * 400);
    const pacingScore = wpm >= 80 && wpm <= 170 ? 100 : wpm > 0 ? Math.max(30, 100 - Math.abs(wpm - 125) * 1.5) : 0;
    const continuityScore = segments.length > 0 ? Math.min(100, segments.length * 4) : 0;
    const durationScore = Math.min(100, elapsedMinutes * 15);

    // If AI has provided metrics, blend them in
    const aiConfidence = geminiCoach.metrics?.confidence_score ?? null;
    
    let confidence: number;
    if (aiConfidence !== null) {
      // Blend local analysis (40%) with AI assessment (60%)
      const localConfidence = Math.round(
        fillerScore * 0.3 + pacingScore * 0.3 + continuityScore * 0.2 + durationScore * 0.2
      );
      confidence = Math.round(localConfidence * 0.4 + aiConfidence * 0.6);
    } else {
      confidence = Math.round(
        fillerScore * 0.3 + pacingScore * 0.3 + continuityScore * 0.2 + durationScore * 0.2
      );
    }

    const newMetrics = { 
      confidence: Math.min(100, Math.max(0, confidence)), 
      wpm, 
      fillerWords: fillerCount 
    };
    setLocalMetrics(newMetrics);
    setMetricsHistory(prev => [
      ...prev, 
      { ...newMetrics, timestamp: Math.round((Date.now() - sessionStartTimeRef.current) / 1000) }
    ].slice(-120));

    // Save to Supabase if available (optional)
    if (sessionId) {
      const elapsedSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
      supabase.from("performance_metrics").insert({
        session_id: sessionId,
        timestamp_seconds: elapsedSeconds,
        confidence: newMetrics.confidence,
        wpm: newMetrics.wpm,
        filler_count: newMetrics.fillerWords,
      }).then(({ error }) => {
        if (error) console.debug("Metrics save skipped:", error.message);
      });
    }
  }, [transcription.transcripts, sessionId, geminiCoach.metrics]);

  // --- Feedback loop: send transcript to AI for interview continuation ---
  const sendFeedback = useCallback(async () => {
    if (!isActiveRef.current || !geminiCoach.isConnected || isSendingFeedbackRef.current) return;
    // Don't send if TTS is speaking (AI is talking, wait for it to finish)
    if (tts.isSpeaking) return;

    const segments = transcription.transcripts.filter(t => !t.isPartial);
    if (segments.length === 0 || segments.length <= lastFeedbackIndexRef.current) return;

    // Get new segments since last feedback
    const newSegments = segments.slice(lastFeedbackIndexRef.current);
    lastFeedbackIndexRef.current = segments.length;

    const recentText = newSegments.map(s => s.text).join(" ").trim();
    if (!recentText || recentText.length < 10) return; // Need meaningful speech

    isSendingFeedbackRef.current = true;
    try {
      await geminiCoach.sendMessage(
        `The interviewee just said:\n\n"${recentText}"\n\nRespond to their answer with brief feedback. Then ask your next interview question. Keep the interview flowing naturally. Remember to output valid JSON.`
      );
    } catch (err) {
      console.error("Feedback loop error:", err);
    } finally {
      isSendingFeedbackRef.current = false;
    }
  }, [geminiCoach, transcription.transcripts, tts.isSpeaking]);

  const startSession = useCallback(async () => {
    try {
      sessionStorage.removeItem("lastSessionData");
      sessionStartTimeRef.current = Date.now();
      lastFeedbackIndexRef.current = 0;
      isActiveRef.current = true;
      isSendingFeedbackRef.current = false;

      // Create session in database if user is authenticated (optional)
      if (userId) {
        try {
          const { data, error } = await supabase
            .from("sessions")
            .insert({
              user_id: userId,
              duration: 0,
              overall_score: 0,
              strengths: [],
              improvements: [],
            })
            .select()
            .single();

          if (!error && data) {
            setSessionId(data.id);
          }
        } catch {
          // Database not available — that's fine, continue without persistence
          console.debug("Session DB save skipped (Supabase not configured)");
        }
      }

      // Start timer
      setSessionTime(0);
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);

      // Connect to transcription first (user-facing, most important)
      try {
        await transcription.connect();
      } catch (err) {
        console.error("Transcription connection error:", err);
      }

      // Connect to AI coach (direct browser → AI call)
      try {
        await geminiCoach.connect();
      } catch (err) {
        console.error("Coach connection error:", err);
      }

      // Start analytics recalculation every 3 seconds (was 5, now faster for responsive metrics)
      analyticsRef.current = setInterval(() => {
        recalculateMetrics();
      }, 3000);

      // Start feedback loop every 12 seconds (enough time for user to answer)
      feedbackRef.current = setInterval(() => {
        sendFeedback();
      }, 12000);

      setIsSessionActive(true);
    } catch (err) {
      console.error("Start session error:", err);
      throw err;
    }
  }, [userId, geminiCoach, transcription, recalculateMetrics, sendFeedback]);

  const endSession = useCallback(async () => {
    isActiveRef.current = false;
    setIsSessionActive(false);

    // Stop TTS if speaking
    tts.stop();

    // Clear all intervals
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (analyticsRef.current) { clearInterval(analyticsRef.current); analyticsRef.current = null; }
    if (feedbackRef.current) { clearInterval(feedbackRef.current); feedbackRef.current = null; }

    // Disconnect from services
    geminiCoach.disconnect();
    transcription.disconnect();

    // Final metrics recalc
    const segments = transcription.transcripts.filter(t => !t.isPartial);
    const allText = segments.map(s => s.text).join(" ");
    const totalWords = allText.split(/\s+/).filter(w => w.length > 0).length;
    const elapsedMinutes = sessionTime / 60;
    const finalWpm = elapsedMinutes > 0.1 ? Math.round(totalWords / elapsedMinutes) : 0;

    const finalScore = Math.min(100, Math.max(0,
      Math.round((localMetrics.confidence * 0.5) +
      (finalWpm >= 100 && finalWpm <= 150 ? 30 : 15) +
      (Math.max(0, 20 - localMetrics.fillerWords * 2)))
    ));

    const strengths = geminiCoach.feedback
      .filter(f => f.type === "positive")
      .map(f => f.message)
      .slice(0, 4);

    const improvements = geminiCoach.feedback
      .filter(f => f.type === "warning" || f.type === "tip")
      .map(f => f.message)
      .slice(0, 4);

    const fullTranscript = transcription.transcripts
      .filter(t => !t.isPartial)
      .map(t => `[${formatTime(t.timestamp)}] ${t.text}`)
      .join("\n\n");

    const sessionData = {
      duration: sessionTime,
      overallScore: finalScore,
      strengths,
      improvements,
      transcript: fullTranscript,
      metrics: {
        confidence: localMetrics.confidence,
        wpm: finalWpm,
        fillerWords: localMetrics.fillerWords,
      },
      feedback: geminiCoach.feedback.map(f => ({
        time: formatTime(Math.floor(f.timestamp.getTime() / 1000) % 3600),
        event: f.message,
        type: f.type,
      })),
    };
    sessionStorage.setItem("lastSessionData", JSON.stringify(sessionData));

    // Save to database if authenticated (optional)
    if (sessionId && userId) {
      try {
        await supabase
          .from("sessions")
          .update({
            duration: sessionTime,
            overall_score: finalScore,
            strengths,
            improvements,
            ended_at: new Date().toISOString(),
          })
          .eq("id", sessionId);

        const transcriptInserts = transcription.transcripts
          .filter(t => !t.isPartial)
          .map(t => ({
            session_id: sessionId,
            speaker_label: "user",
            timestamp_seconds: t.timestamp,
            text: t.text,
            is_filler_word: t.isFiller || false,
          }));

        if (transcriptInserts.length > 0) {
          await supabase.from("transcripts").insert(transcriptInserts);
        }

        const feedbackInserts = geminiCoach.feedback.map((f, index) => ({
          session_id: sessionId,
          timestamp_seconds: Math.floor(index * 12),
          event_type: f.type,
          event_message: f.message,
          recommendation: f.message,
        }));

        if (feedbackInserts.length > 0) {
          await supabase.from("feedback_events").insert(feedbackInserts);
        }
      } catch {
        console.debug("Session save skipped (Supabase not configured)");
      }
    }

    return sessionData;
  }, [sessionId, userId, sessionTime, localMetrics, geminiCoach, transcription, tts]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    sessionId,
    isSessionActive,
    sessionTime,
    formattedTime: formatTime(sessionTime),
    metrics: localMetrics,
    metricsHistory,
    feedback: geminiCoach.feedback,
    messages: geminiCoach.messages,
    latestResponse: geminiCoach.latestResponse,
    transcripts: transcription.transcripts,
    partialTranscript: transcription.partialText,
    isLoading: geminiCoach.isLoading,
    error: geminiCoach.error || transcription.error,
    isCoachConnected: geminiCoach.isConnected,
    isTranscriptionConnected: transcription.isConnected,
    isSpeaking: tts.isSpeaking,
    aiProvider: geminiCoach.aiProvider,
    startSession,
    endSession,
    sendFeedbackNow: sendFeedback,
  };
}
