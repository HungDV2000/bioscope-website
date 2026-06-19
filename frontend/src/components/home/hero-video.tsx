"use client";

import { useEffect, useRef } from "react";

/** Video nền hero: loop, mute, phát chậm 1/3 tốc độ */
export function HeroVideo({ poster }: { poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const slow = () => {
      v.playbackRate = 1 / 3;
    };
    slow();
    v.addEventListener("loadedmetadata", slow);
    v.addEventListener("play", slow);
    return () => {
      v.removeEventListener("loadedmetadata", slow);
      v.removeEventListener("play", slow);
    };
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover object-right-center"
    >
      <source src="/video_bg.mp4" type="video/mp4" />
    </video>
  );
}
