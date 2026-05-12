import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  duration: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  createdAt: string;
  endedAt: string | null;
}

interface FeedbackEvent {
  id: string;
  timestampSeconds: number;
  eventType: string;
  eventMessage: string;
  recommendation: string | null;
}

interface TranscriptEntry {
  id: string;
  speakerLabel: string;
  timestampSeconds: number;
  text: string;
  isFillerWord: boolean;
}

export function useSessionReport(sessionId?: string) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [feedbackEvents, setFeedbackEvents] = useState<FeedbackEvent[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not authenticated - use fallback data
          setIsLoading(false);
          return;
        }

        // If no sessionId provided, get the most recent session
        let targetSessionId = sessionId;
        
        if (!targetSessionId) {
          const { data: recentSession, error: recentError } = await supabase
            .from("sessions")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (recentError || !recentSession) {
            // No sessions found - use fallback data
            setIsLoading(false);
            return;
          }

          targetSessionId = recentSession.id;
        }

        // Fetch session data
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", targetSessionId)
          .single();

        if (sessionError) {
          throw new Error(`Failed to fetch session: ${sessionError.message}`);
        }

        setSession({
          id: sessionData.id,
          duration: sessionData.duration || 0,
          overallScore: sessionData.overall_score || 0,
          strengths: sessionData.strengths || [],
          improvements: sessionData.improvements || [],
          createdAt: sessionData.created_at,
          endedAt: sessionData.ended_at,
        });

        // Fetch feedback events
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback_events")
          .select("*")
          .eq("session_id", targetSessionId)
          .order("timestamp_seconds", { ascending: true });

        if (!feedbackError && feedbackData) {
          setFeedbackEvents(feedbackData.map(f => ({
            id: f.id,
            timestampSeconds: f.timestamp_seconds,
            eventType: f.event_type,
            eventMessage: f.event_message,
            recommendation: f.recommendation,
          })));
        }

        // Fetch transcripts
        const { data: transcriptData, error: transcriptError } = await supabase
          .from("transcripts")
          .select("*")
          .eq("session_id", targetSessionId)
          .order("timestamp_seconds", { ascending: true });

        if (!transcriptError && transcriptData) {
          setTranscripts(transcriptData.map(t => ({
            id: t.id,
            speakerLabel: t.speaker_label,
            timestampSeconds: t.timestamp_seconds,
            text: t.text,
            isFillerWord: t.is_filler_word || false,
          })));
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load session data";
        setError(errorMessage);
        console.error("Session report error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Format transcript for display
  const formattedTranscript = transcripts
    .map(t => `[${formatTime(t.timestampSeconds)}] ${t.speakerLabel === 'user' ? 'You' : 'Interviewer'}: "${t.text}"`)
    .join("\n\n");

  return {
    session,
    feedbackEvents,
    transcripts,
    formattedTranscript,
    isLoading,
    error,
    hasRealData: session !== null,
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
