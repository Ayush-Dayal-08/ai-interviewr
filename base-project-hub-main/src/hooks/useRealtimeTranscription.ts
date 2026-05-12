import { useState, useCallback, useRef, useEffect } from "react";

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number; // Seconds from session start
  isPartial: boolean;
  isFiller?: boolean;
}

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", 
  "literally", "sort of", "kind of", "i mean", "right", "so yeah",
  "well", "er", "umm", "uhh", "so"
];

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useRealtimeTranscription() {
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [partialText, setPartialText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  
  const sessionStartTime = useRef<number>(Date.now());
  const wordCountRef = useRef(0);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStoppingRef = useRef(false);

  const calculateWPM = useCallback(() => {
    const elapsedMinutes = (Date.now() - sessionStartTime.current) / 60000;
    if (elapsedMinutes > 0.1) {
      const currentWPM = Math.round(wordCountRef.current / elapsedMinutes);
      setWpm(currentWPM);
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    isStoppingRef.current = false;
    
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return false;
    }

    try {
      // Reset state for new session
      sessionStartTime.current = Date.now();
      wordCountRef.current = 0;
      setTranscripts([]);
      setFillerCount(0);
      setWpm(0);
      setPartialText("");

      // Create recognition instance
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsConnected(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            const timestamp = Math.floor((Date.now() - sessionStartTime.current) / 1000);
            
            // Check for filler words
            const textLower = transcript.toLowerCase();
            const foundFillers = FILLER_WORDS.filter(filler => 
              textLower.includes(filler)
            );
            
            if (foundFillers.length > 0) {
              setFillerCount(prev => prev + foundFillers.length);
            }

            // Update word count for WPM calculation
            const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
            wordCountRef.current += wordCount;

            const segment: TranscriptSegment = {
              id: `${Date.now()}-${Math.random()}`,
              text: transcript.trim(),
              timestamp,
              isPartial: false,
              isFiller: foundFillers.length > 0,
            };

            setTranscripts(prev => [...prev, segment]);
            setPartialText("");
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (interimTranscript) {
          setPartialText(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        // no-speech is normal during silence - don't log as error
        if (event.error === "no-speech") {
          // Silent - will auto-restart via onend
          return;
        }
        
        console.error("Speech recognition error:", event.error);
        
        if (event.error === "not-allowed") {
          setError("Microphone permission denied. Please allow access and refresh.");
          isStoppingRef.current = true;
        } else if (event.error === "aborted") {
          // User or system aborted - don't show error
          return;
        } else if (event.error === "network") {
          setError("Network error. Please check your connection.");
        } else if (event.error === "audio-capture") {
          setError("No microphone detected. Please connect a microphone.");
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if not intentionally stopped
        if (!isStoppingRef.current && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.log("Could not restart recognition:", e);
          }
        } else {
          setIsConnected(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Start WPM calculation interval
      wpmIntervalRef.current = setInterval(calculateWPM, 3000);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start speech recognition";
      setError(errorMessage);
      console.error("Speech recognition error:", err);
      return false;
    }
  }, [calculateWPM]);

  const disconnect = useCallback(() => {
    isStoppingRef.current = true;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsConnected(false);
    
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }
    };
  }, []);

  const getFullTranscript = useCallback(() => {
    return transcripts
      .filter(t => !t.isPartial)
      .map(t => `[${formatTimestamp(t.timestamp)}] ${t.text}`)
      .join("\n\n");
  }, [transcripts]);

  return {
    transcripts,
    partialText,
    isConnected,
    error,
    fillerCount,
    wpm,
    connect,
    disconnect,
    getFullTranscript,
    scribeStatus: isConnected ? "connected" : "disconnected",
  };
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
