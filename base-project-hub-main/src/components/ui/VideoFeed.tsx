import { useEffect, useRef, useState, useCallback } from "react";
import { Video, VideoOff, AlertCircle, RefreshCw } from "lucide-react";

interface VideoFeedProps {
  label?: string;
  isLive?: boolean;
  className?: string;
  onStreamReady?: (stream: MediaStream) => void;
}

export function VideoFeed({ label = "Camera Feed", isLive = false, className = "", onStreamReady }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const startCamera = useCallback(async () => {
    try {
      setIsReconnecting(reconnectAttempts.current > 0);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      setError(null);
      setIsReconnecting(false);
      reconnectAttempts.current = 0;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      if (onStreamReady) {
        onStreamReady(mediaStream);
      }

      mediaStream.getVideoTracks().forEach(track => {
        track.onended = () => {
          console.log("Video track ended, attempting reconnect...");
          handleTrackLost();
        };
      });

    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setIsReconnecting(false);
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera and microphone access denied. Please allow access in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setError("No camera or microphone found. Please connect a device.");
        } else {
          setError(`Media access error: ${err.message}`);
        }
      }
    }
  }, [onStreamReady]);

  const handleTrackLost = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1;
      setIsReconnecting(true);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setTimeout(() => {
        startCamera();
      }, 2000);
    } else {
      setError("Camera connection lost. Please refresh the page to try again.");
      setIsReconnecting(false);
    }
  }, [stream, startCamera]);

  useEffect(() => {
    if (!isLive) return;

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLive]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-secondary rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Video element - NO object-cover to prevent zoom/crop glitch */}
      {isLive && hasPermission && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
        />
      )}

      {/* Placeholder content */}
      {(!isLive || hasPermission === null) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 aspect-video">
          {isLive ? (
            <>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground text-sm font-medium">Requesting camera access...</span>
            </>
          ) : (
            <>
              <VideoOff className="w-12 h-12 text-muted-foreground" />
              <span className="text-muted-foreground text-sm font-medium">{label}</span>
            </>
          )}
        </div>
      )}

      {/* Reconnecting state */}
      {isReconnecting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-secondary/90 camera-reconnecting">
          <RefreshCw className="w-12 h-12 text-warning animate-spin" />
          <span className="text-warning text-lg font-semibold">Camera Lost - Reconnecting...</span>
          <span className="text-muted-foreground text-sm">Attempt {reconnectAttempts.current} of {maxReconnectAttempts}</span>
        </div>
      )}

      {/* Error state */}
      {error && !isReconnecting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <span className="text-destructive text-sm font-medium">{error}</span>
        </div>
      )}
      
      {/* Live indicator */}
      {isLive && hasPermission && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-destructive/90 rounded-full">
          <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse-glow" />
          <span className="text-xs font-semibold text-destructive-foreground">LIVE</span>
        </div>
      )}
    </div>
  );
}
