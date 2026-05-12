import { useCallback, useRef, useState, useEffect } from "react";

export function useBrowserTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speechSynthesis is available
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    try {
      if (!text.trim() || !isSupported || typeof window === "undefined" || !window.speechSynthesis) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to get a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith("en"));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } catch (err) {
      console.error("TTS stop error:", err);
    }
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}
