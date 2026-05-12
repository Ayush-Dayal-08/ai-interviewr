import { useState, useCallback } from "react";
import { useAIProvider } from "./useAIProvider";
import { PersonaType, getPersonaInstruction } from "@/components/ui/PersonaSelector";

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FeedbackItem {
  id: number;
  message: string;
  type: "tip" | "positive" | "warning";
  timestamp: Date;
}

export interface CoachResponse {
  coach_message: string;
  metrics: {
    confidence_score: number;
    pacing_wpm: string;
    filler_words_detected: string[];
    eye_contact_rating: "Good" | "Fair" | "Poor";
    accent_tips: string[];
    clarity_score: number;
    tone: "confident" | "nervous" | "enthusiastic" | "monotone" | "neutral";
    energy_level: number;
    pitch_variation: "low" | "moderate" | "dynamic";
  };
  live_tip: string;
  content_suggestion?: string;
}

const BASE_SYSTEM_INSTRUCTION = `Role: You are the "Live Mirror AI Coach," a high-performance career coach specializing in mock interviews. Your goal is to conduct a professional mock interview while providing real-time feedback.

CRITICAL RULES:
1. You are the INTERVIEWER. You must ASK QUESTIONS and EVALUATE ANSWERS.
2. Start by greeting the user and asking what role they're preparing for.
3. After they respond, ask ONE challenging behavioral interview question at a time.
4. After each answer, give brief feedback then ask the NEXT question.
5. Keep the interview flowing naturally — don't lecture, ask questions!

Analyze their speech for:
- Pacing (speaking too fast/slow)
- Clarity and structure (STAR method usage)
- Filler words (um, uh, like, you know)
- Confidence level

Output Formatting (CRITICAL): You must ALWAYS respond with a valid JSON object. Every response must follow this exact format:

{
  "coach_message": "Your spoken response — feedback on their answer + your next interview question.",
  "metrics": {
    "confidence_score": 50,
    "pacing_wpm": "120",
    "filler_words_detected": [],
    "eye_contact_rating": "Good",
    "accent_tips": [],
    "clarity_score": 70,
    "tone": "neutral",
    "energy_level": 50,
    "pitch_variation": "moderate"
  },
  "live_tip": "Short 5-word coaching tip",
  "content_suggestion": "Optional vocabulary or structure improvement"
}

IMPORTANT: The "coach_message" field is what gets spoken aloud to the user. Make it conversational and natural — as if you're sitting across from them in an interview. Always end with a question to keep the interview moving.`;

export function buildSystemInstruction(persona: PersonaType): string {
  const personaInstruction = getPersonaInstruction(persona);
  return `${BASE_SYSTEM_INSTRUCTION}\n\n${personaInstruction}`;
}

export function useGeminiCoach(persona: PersonaType = "friendly") {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemInstruction, setSystemInstruction] = useState(() => buildSystemInstruction(persona));
  const [metrics, setMetrics] = useState<CoachResponse["metrics"] | null>(null);
  const [latestResponse, setLatestResponse] = useState<CoachResponse | null>(null);

  const aiProvider = useAIProvider();

  const connect = useCallback(async () => {
    if (!aiProvider.isConfigured) {
      setError("No API key configured. Please add your API key in Settings (⚙️ icon).");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Direct browser → AI call (no Supabase needed)
      const response = await aiProvider.callAI([
        { role: "system", content: systemInstruction },
        { role: "user", content: "Hello, I'm ready to start my mock interview practice session. Please introduce yourself and let's begin." },
      ]);

      setIsConnected(true);
      
      // Parse JSON response
      const parsedResponse = parseCoachResponse(response);
      if (parsedResponse) {
        setLatestResponse(parsedResponse);
        setMetrics(parsedResponse.metrics);
        
        const initialFeedback: FeedbackItem = {
          id: Date.now(),
          message: parsedResponse.live_tip || "Session connected! AI Coach is ready.",
          type: "positive",
          timestamp: new Date(),
        };
        setFeedback([initialFeedback]);
        
        setMessages([
          { role: "user", content: "Hello, I'm ready to start my mock interview practice session." },
          { role: "assistant", content: parsedResponse.coach_message },
        ]);
      } else {
        // Fallback for non-JSON response — still usable
        const initialFeedback: FeedbackItem = {
          id: Date.now(),
          message: "Session connected! AI Coach is ready.",
          type: "positive",
          timestamp: new Date(),
        };
        setFeedback([initialFeedback]);
        
        setMessages([
          { role: "user", content: "Hello, I'm ready to start my mock interview practice session." },
          { role: "assistant", content: response },
        ]);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to AI";
      setError(errorMessage);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [systemInstruction, aiProvider]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!isConnected) {
      setError("Not connected. Please start a session first.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    const newUserMessage: CoachMessage = { role: "user", content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      // Keep only last 8 messages to avoid huge payloads (faster responses)
      const recentMessages = updatedMessages.slice(-8);
      const aiMessages = [
        { role: "system" as const, content: systemInstruction },
        ...recentMessages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const response = await aiProvider.callAI(aiMessages);

      // Parse JSON response
      const parsedResponse = parseCoachResponse(response);
      
      if (parsedResponse) {
        setLatestResponse(parsedResponse);
        setMetrics(parsedResponse.metrics);
        
        const assistantMessage: CoachMessage = {
          role: "assistant",
          content: parsedResponse.coach_message,
        };
        setMessages([...updatedMessages, assistantMessage]);

        // Add live tip as feedback
        const newFeedback: FeedbackItem = {
          id: Date.now(),
          message: parsedResponse.live_tip,
          type: determineFeedbackType(parsedResponse.coach_message),
          timestamp: new Date(),
        };
        setFeedback((prev) => [newFeedback, ...prev].slice(0, 15));

        return parsedResponse;
      } else {
        // Fallback for non-JSON response
        const assistantMessage: CoachMessage = {
          role: "assistant",
          content: response,
        };
        setMessages([...updatedMessages, assistantMessage]);

        const newFeedback: FeedbackItem = {
          id: Date.now(),
          message: response.split(".")[0] + ".",
          type: determineFeedbackType(response),
          timestamp: new Date(),
        };
        setFeedback((prev) => [newFeedback, ...prev].slice(0, 15));

        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, messages, systemInstruction, aiProvider]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setMessages([]);
    setFeedback([]);
    setError(null);
    setMetrics(null);
    setLatestResponse(null);
  }, []);

  const updateSystemInstruction = useCallback((instruction: string) => {
    setSystemInstruction(instruction);
  }, []);

  return {
    messages,
    feedback,
    isLoading,
    isConnected,
    error,
    systemInstruction,
    metrics,
    latestResponse,
    connect,
    sendMessage,
    disconnect,
    updateSystemInstruction,
    aiProvider, // expose so UI can check config status
  };
}

function parseCoachResponse(content: string): CoachResponse | null {
  try {
    let jsonStr = content;
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate the structure
    if (parsed.coach_message && parsed.metrics) {
      return {
        coach_message: parsed.coach_message,
        metrics: {
          confidence_score: Math.min(100, Math.max(0, Number(parsed.metrics.confidence_score) || 50)),
          pacing_wpm: String(parsed.metrics.pacing_wpm || "120"),
          filler_words_detected: Array.isArray(parsed.metrics.filler_words_detected) 
            ? parsed.metrics.filler_words_detected 
            : [],
          eye_contact_rating: parsed.metrics.eye_contact_rating || "Fair",
          accent_tips: Array.isArray(parsed.metrics.accent_tips)
            ? parsed.metrics.accent_tips
            : [],
          clarity_score: Math.min(100, Math.max(0, Number(parsed.metrics.clarity_score) || 70)),
          tone: parsed.metrics.tone || "neutral",
          energy_level: Math.min(100, Math.max(0, Number(parsed.metrics.energy_level) || 50)),
          pitch_variation: parsed.metrics.pitch_variation || "moderate",
        },
        live_tip: parsed.live_tip || "Keep going!",
        content_suggestion: parsed.content_suggestion,
      };
    }
    return null;
  } catch {
    console.log("Failed to parse coach response as JSON, using as plain text");
    return null;
  }
}

function determineFeedbackType(content: string): "tip" | "positive" | "warning" {
  const lowerContent = content.toLowerCase();
  
  if (
    lowerContent.includes("great") ||
    lowerContent.includes("excellent") ||
    lowerContent.includes("good") ||
    lowerContent.includes("well done") ||
    lowerContent.includes("nice") ||
    lowerContent.includes("impressive")
  ) {
    return "positive";
  }
  
  if (
    lowerContent.includes("avoid") ||
    lowerContent.includes("try to") ||
    lowerContent.includes("careful") ||
    lowerContent.includes("filler") ||
    lowerContent.includes("slow down") ||
    lowerContent.includes("improve")
  ) {
    return "warning";
  }
  
  return "tip";
}

export const DEFAULT_SYSTEM_INSTRUCTION_TEXT = BASE_SYSTEM_INSTRUCTION;
