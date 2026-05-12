import { useRef, useState } from "react";
import { Play, Pause, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlaybackProps {
  videoUrl: string;
}

export function VideoPlayback({ videoUrl }: VideoPlaybackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Session Recording</h3>
      </div>
      <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onEnded={() => setIsPlaying(false)}
          controls
        />
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" className="gap-2" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Play Recording"}
        </Button>
      </div>
    </div>
  );
}
