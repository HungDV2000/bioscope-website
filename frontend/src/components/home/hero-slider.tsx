"use client";

import { useRef, useState, useCallback } from "react";
import { Pause, Play } from "lucide-react";

const VIDEOS = [
  "/videos/video1.mp4",
  "/videos/video2.mp4",
  "/videos/video3.mp4",
] as const;

export function HeroVideoSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(false);

  const handleEnded = useCallback(() => {
    if (!pausedRef.current) {
      setCurrent((p) => (p + 1) % VIDEOS.length);
    }
  }, []);

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      pausedRef.current = false;
      setPaused(false);
    } else {
      v.pause();
      pausedRef.current = true;
      setPaused(true);
    }
  };

  const goTo = (i: number) => {
    pausedRef.current = false;
    setPaused(false);
    setCurrent(i);
  };

  return (
    <>
      {/* Video background — key remounts element on slide change triggering autoPlay */}
      <video
        key={current}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-right-center"
      >
        <source src={VIDEOS[current]} type="video/mp4" />
      </video>

      {/* Gradient trái → phải + xanh bottom-left (#C7E0D1) */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: [
            "linear-gradient(to top right, #C7E0D1 0%, rgba(199,224,209,.72) 28%, rgba(199,224,209,.22) 50%, transparent 68%)",
            "linear-gradient(90deg, #fdfdfb 0%, #fdfdfb 18%, rgba(253,253,251,.85) 34%, rgba(253,253,251,.35) 52%, rgba(253,253,251,.05) 66%, rgba(253,253,251,0) 78%)",
          ].join(", "),
        }}
        aria-hidden
      />

      {/* Slide dots — centered, always visible above the band */}
      <div className="absolute bottom-[58px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-[7px] rounded-[5px] shadow-sm transition-all duration-300 ${
              i === current
                ? "w-[18px] bg-primary"
                : "w-[7px] bg-primary/35 hover:bg-primary/60"
            }`}
          />
        ))}
      </div>

      {/* Pause / Play button — always visible */}
      <button
        type="button"
        onClick={togglePause}
        aria-label={paused ? "Play" : "Pause"}
        className="absolute bottom-[50px] right-8 z-20 inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
      >
        {paused ? (
          <Play className="h-3.5 w-3.5 translate-x-0.5" />
        ) : (
          <Pause className="h-3.5 w-3.5" />
        )}
      </button>
    </>
  );
}
