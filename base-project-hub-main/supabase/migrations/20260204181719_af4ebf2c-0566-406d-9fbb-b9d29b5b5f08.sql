-- Create sessions table to store coaching session data
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER DEFAULT 0, -- Duration in seconds
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create feedback_events table for timestamped feedback during session
CREATE TABLE public.feedback_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL, -- Seconds from session start
  event_type TEXT NOT NULL, -- e.g., 'filler_word', 'speaking_fast', 'good_example'
  event_message TEXT NOT NULL,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transcripts table for storing speech-to-text results
CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  speaker_label TEXT NOT NULL DEFAULT 'user', -- 'user' or 'interviewer'
  timestamp_seconds INTEGER NOT NULL, -- Seconds from session start
  text TEXT NOT NULL,
  is_filler_word BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_metrics table for real-time metrics snapshots
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  wpm INTEGER DEFAULT 0,
  filler_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns a session
CREATE OR REPLACE FUNCTION public.is_session_owner(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions
    WHERE id = p_session_id AND user_id = auth.uid()
  )
$$;

-- RLS Policies for sessions table
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON public.sessions FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for feedback_events table
CREATE POLICY "Users can view own session feedback"
  ON public.feedback_events FOR SELECT
  USING (public.is_session_owner(session_id));

CREATE POLICY "Users can create feedback for own sessions"
  ON public.feedback_events FOR INSERT
  WITH CHECK (public.is_session_owner(session_id));

CREATE POLICY "Users can update own session feedback"
  ON public.feedback_events FOR UPDATE
  USING (public.is_session_owner(session_id));

CREATE POLICY "Users can delete own session feedback"
  ON public.feedback_events FOR DELETE
  USING (public.is_session_owner(session_id));

-- RLS Policies for transcripts table
CREATE POLICY "Users can view own session transcripts"
  ON public.transcripts FOR SELECT
  USING (public.is_session_owner(session_id));

CREATE POLICY "Users can create transcripts for own sessions"
  ON public.transcripts FOR INSERT
  WITH CHECK (public.is_session_owner(session_id));

CREATE POLICY "Users can update own session transcripts"
  ON public.transcripts FOR UPDATE
  USING (public.is_session_owner(session_id));

CREATE POLICY "Users can delete own session transcripts"
  ON public.transcripts FOR DELETE
  USING (public.is_session_owner(session_id));

-- RLS Policies for performance_metrics table
CREATE POLICY "Users can view own session metrics"
  ON public.performance_metrics FOR SELECT
  USING (public.is_session_owner(session_id));

CREATE POLICY "Users can create metrics for own sessions"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (public.is_session_owner(session_id));

CREATE POLICY "Users can update own session metrics"
  ON public.performance_metrics FOR UPDATE
  USING (public.is_session_owner(session_id));

CREATE POLICY "Users can delete own session metrics"
  ON public.performance_metrics FOR DELETE
  USING (public.is_session_owner(session_id));

-- Create indexes for better query performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_feedback_events_session_id ON public.feedback_events(session_id);
CREATE INDEX idx_transcripts_session_id ON public.transcripts(session_id);
CREATE INDEX idx_performance_metrics_session_id ON public.performance_metrics(session_id);