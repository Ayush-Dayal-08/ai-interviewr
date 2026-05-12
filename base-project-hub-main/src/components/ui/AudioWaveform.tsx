import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  isActive: boolean;
  className?: string;
}

export function AudioWaveform({ isActive, className = "" }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let ctx: AudioContext;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        draw();
      } catch {
        // draw idle waveform
        drawIdle();
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const c = canvas.getContext("2d");
      if (!c) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const render = () => {
        animationRef.current = requestAnimationFrame(render);
        analyser.getByteTimeDomainData(dataArray);

        const w = canvas.width;
        const h = canvas.height;
        c.clearRect(0, 0, w, h);

        c.lineWidth = 2;
        c.strokeStyle = "hsl(217, 91%, 60%)";
        c.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
          x += sliceWidth;
        }

        c.lineTo(w, h / 2);
        c.stroke();
      };

      render();
    };

    const drawIdle = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const c = canvas.getContext("2d");
      if (!c) return;

      const render = () => {
        animationRef.current = requestAnimationFrame(render);
        const w = canvas.width;
        const h = canvas.height;
        c.clearRect(0, 0, w, h);
        c.lineWidth = 2;
        c.strokeStyle = "hsl(215, 16%, 35%)";
        c.beginPath();
        const t = Date.now() / 1000;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.05 + t * 2) * 4;
          if (x === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
      };
      render();
    };

    start();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className={`w-full h-[60px] rounded-lg bg-card border border-border ${className}`}
    />
  );
}
