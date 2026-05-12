/**
 * useInterviewEngine — Fully offline interview engine.
 *
 * Manages question flow, TTS for speaking questions, STT for capturing answers,
 * and local scoring via answerScorer.
 */

import { useState, useCallback, useRef } from "react";
import {
  InterviewCategory,
  InterviewQuestion,
  getShuffledQuestions,
} from "@/data/interviewQuestions";
import { scoreAnswer, AnswerScore, generateSessionSummary } from "@/lib/answerScorer";
import { useBrowserTTS } from "./useBrowserTTS";
import { useRealtimeTranscription } from "./useRealtimeTranscription";

export interface QuestionResult {
  question: InterviewQuestion;
  userAnswer: string;
  score: AnswerScore;
  timeSpent: number; // seconds
  wpm: number;
  fillerCount: number;
}

export interface InterviewSession {
  category: InterviewCategory;
  questions: InterviewQuestion[];
  results: QuestionResult[];
  currentIndex: number;
  isActive: boolean;
  isComplete: boolean;
  startTime: number;
  totalDuration: number; // seconds
}

export function useInterviewEngine() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [lastScore, setLastScore] = useState<AnswerScore | null>(null);
  const [showingScore, setShowingScore] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const accumulatedAnswerRef = useRef<string>("");

  const tts = useBrowserTTS();
  const transcription = useRealtimeTranscription();

  /**
   * Start a new interview session.
   */
  const startSession = useCallback(
    async (category: InterviewCategory) => {
      setIsLoading(true);

      const questions = getShuffledQuestions(category);

      const newSession: InterviewSession = {
        category,
        questions,
        results: [],
        currentIndex: 0,
        isActive: true,
        isComplete: false,
        startTime: Date.now(),
        totalDuration: 0,
      };

      setSession(newSession);
      setLastScore(null);
      setShowingScore(false);
      setCurrentAnswer("");
      accumulatedAnswerRef.current = "";

      // Start STT
      await transcription.connect();

      // Speak the first question after a brief pause
      setTimeout(() => {
        tts.speak(
          `Question 1. ${questions[0].question}`,
        );
        questionStartTimeRef.current = Date.now();
        setIsLoading(false);
      }, 500);
    },
    [tts, transcription],
  );

  /**
   * Submit the current answer and move to the next question (or finish).
   */
  const submitAnswer = useCallback(() => {
    if (!session || session.isComplete) return;

    const timeSpent = Math.round(
      (Date.now() - questionStartTimeRef.current) / 1000,
    );

    // Collect all transcripts since question start
    const allText = transcription.transcripts
      .filter((t) => !t.isPartial)
      .map((t) => t.text)
      .join(" ")
      .trim();

    // Use accumulated answer if transcripts are empty
    const finalAnswer = allText || accumulatedAnswerRef.current || currentAnswer;

    const currentQ = session.questions[session.currentIndex];

    // Score the answer
    const score = scoreAnswer(finalAnswer, currentQ.modelAnswer, currentQ.keyPoints);

    const result: QuestionResult = {
      question: currentQ,
      userAnswer: finalAnswer,
      score,
      timeSpent,
      wpm: transcription.wpm,
      fillerCount: transcription.fillerCount,
    };

    setLastScore(score);
    setShowingScore(true);

    // Speak brief feedback
    const feedbackSnippet =
      score.total >= 70
        ? `Score: ${score.total} out of 100. Good job!`
        : `Score: ${score.total} out of 100. ${score.missedKeywords.length > 0 ? `Try to mention: ${score.missedKeywords.slice(0, 2).join(" and ")}` : ""}`;

    tts.speak(feedbackSnippet);

    const nextIndex = session.currentIndex + 1;
    const isComplete = nextIndex >= session.questions.length;

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        results: [...prev.results, result],
        currentIndex: nextIndex,
        isComplete,
        totalDuration: Math.round((Date.now() - prev.startTime) / 1000),
      };
    });

    setCurrentAnswer("");
    accumulatedAnswerRef.current = "";

    // If not complete, advance to next question after showing score
    if (!isComplete) {
      setTimeout(() => {
        setShowingScore(false);
        setLastScore(null);

        // Reset transcription for next question
        // (transcription continues running, we just track from new segments)

        const nextQ = session.questions[nextIndex];
        tts.speak(`Question ${nextIndex + 1}. ${nextQ.question}`);
        questionStartTimeRef.current = Date.now();
      }, 4000); // Show score for 4 seconds
    } else {
      // Session complete — stop STT
      transcription.disconnect();
    }
  }, [session, transcription, currentAnswer, tts]);

  /**
   * End the session early.
   */
  const endSession = useCallback(() => {
    tts.stop();
    transcription.disconnect();

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isActive: false,
        isComplete: true,
        totalDuration: Math.round((Date.now() - prev.startTime) / 1000),
      };
    });
  }, [tts, transcription]);

  /**
   * Get the current question.
   */
  const currentQuestion =
    session && !session.isComplete
      ? session.questions[session.currentIndex]
      : null;

  /**
   * Generate session summary from all results.
   */
  const getSessionSummary = useCallback(() => {
    if (!session) return null;
    const scores = session.results.map((r) => r.score);
    return {
      ...generateSessionSummary(scores),
      category: session.category,
      totalDuration: session.totalDuration,
      results: session.results,
      questionCount: session.questions.length,
      answeredCount: session.results.length,
    };
  }, [session]);

  return {
    // Session state
    session,
    isLoading,
    currentQuestion,
    currentQuestionNumber: session ? session.currentIndex + 1 : 0,
    totalQuestions: session?.questions.length ?? 10,
    isComplete: session?.isComplete ?? false,
    isActive: session?.isActive ?? false,

    // Answer state
    currentAnswer,
    setCurrentAnswer,
    lastScore,
    showingScore,

    // Transcription
    transcripts: transcription.transcripts,
    partialTranscript: transcription.partialText,
    isTranscriptionConnected: transcription.isConnected,
    wpm: transcription.wpm,
    fillerCount: transcription.fillerCount,

    // TTS
    isSpeaking: tts.isSpeaking,

    // Actions
    startSession,
    submitAnswer,
    endSession,
    getSessionSummary,
  };
}
