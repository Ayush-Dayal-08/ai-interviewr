import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface MicrophoneLevelProps {
  isActive?: boolean;
}

export function MicrophoneLevel({ isActive = true }: MicrophoneLevelProps) {
  const [level, setLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(true);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const smoothedLevelRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setLevel(0);
      return;
    }

    let cancelled = false;

    const startMicMonitor = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(dataArray);

          // Calculate RMS (root mean square) for a meaningful level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);

          // Normalize to 0-100 with a noise gate
          // Values below threshold (ambient noise) are clamped to 0
          const NOISE_GATE = 12; // ignore ambient noise below this RMS
          const gated = rms > NOISE_GATE ? rms - NOISE_GATE : 0;
          const normalized = Math.min(100, (gated / 80) * 100);

          // Smooth the value to prevent jitter
          const smoothing = normalized > smoothedLevelRef.current ? 0.4 : 0.15;
          smoothedLevelRef.current += (normalized - smoothedLevelRef.current) * smoothing;

          setLevel(Math.round(smoothedLevelRef.current));
          animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);
      } catch {
        setHasPermission(false);
      }
    };

    startMicMonitor();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
      smoothedLevelRef.current = 0;
    };
  }, [isActive]);

  const getBarColor = () => {
    if (level > 80) return "bg-destructive";
    if (level > 50) return "bg-warning";
    if (level > 5) return "bg-success";
    return "bg-muted-foreground/30";
  };

  const statusText = () => {
    if (!isActive) return "Inactive";
    if (!hasPermission) return "No Permission";
    if (level > 5) return "Active";
    return "Listening...";
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
        {isActive && hasPermission ? (
          <Mic className={`w-5 h-5 ${level > 5 ? "text-success" : "text-muted-foreground"}`} />
        ) : (
          <MicOff className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Microphone</span>
          <span className="text-xs text-muted-foreground">
            {statusText()}
          </span>
        </div>
        <div className="meter-bar">
          <div 
            className={`meter-fill ${getBarColor()} transition-all duration-150 ease-out`}
            style={{ width: isActive ? `${level}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}
