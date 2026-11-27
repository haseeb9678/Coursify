"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonPlaybackControls, { toggleLessonFullscreen } from "./LessonPlaybackControls";
import YouTubeLessonVideo from "./YouTubeLessonVideo";

const localRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

function videoEmbed(source: string): { provider: "youtube" | "vimeo"; href: string } | null {
  const url = new URL(source);
  const youtubeHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"];
  if (url.hostname === "youtu.be" || youtubeHosts.includes(url.hostname)) {
    const id = url.hostname === "youtu.be" ? url.pathname.split("/")[1]
      : url.searchParams.get("v") || /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? { provider: "youtube", href: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
    const match = /^\/(?:video\/)?(\d+)(?:\/([a-z\d]+))?\/?$/i.exec(url.pathname);
    if (!match) return null;
    const token = url.searchParams.get("h") ?? match[2];
    return { provider: "vimeo", href: `https://player.vimeo.com/video/${match[1]}${token ? `?h=${encodeURIComponent(token)}` : ""}` };
  }
  return null;
}

export default function LessonVideoPlayer({ source, title }: { source: string; title: string }) {
  const embed = videoEmbed(source);
  return (
    <div className="space-y-3">
      {embed?.provider === "youtube" && <YouTubeLessonVideo embed={embed.href} title={title} />}
      {embed?.provider === "vimeo" && <iframe src={embed.href} title={title}
        className="aspect-video w-full rounded-2xl border border-brand-border bg-black"
        allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
      {!embed && <VideoControls source={source} title={title} />}
      <Button variant="outline" nativeButton={false} render={<a href={source} target="_blank" rel="noreferrer" />}>
        Open original video <ArrowUpRight aria-hidden="true" />
      </Button>
    </div>
  );
}

function VideoControls({ source, title }: { source: string; title: string }) {
  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState(false);

  function togglePlayback() {
    if (!video.current) return;
    if (video.current.paused) void video.current.play().catch(() => setError(true));
    else video.current.pause();
  }

  return (
    <div ref={player} className="overflow-hidden rounded-2xl border border-brand-border bg-black text-white fullscreen:flex fullscreen:flex-col fullscreen:justify-center">
      <div className="relative min-w-0">
        <video ref={video} src={source} preload="metadata" playsInline aria-label={title}
          className="aspect-video w-full object-contain in-fullscreen:max-h-[calc(100dvh-6rem)]"
          onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
          onPlay={() => { setPlaying(true); setError(false); }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => { setPlaying(false); setError(true); }}
          onVolumeChange={(event) => { setMuted(event.currentTarget.muted); setVolume(event.currentTarget.volume); }}
          onRateChange={(event) => setSpeed(event.currentTarget.playbackRate)}
        />
        {!playing && !error && (
          <button type="button" aria-label="Play video" onClick={togglePlayback}
            className="absolute inset-0 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
            <span className="grid size-14 place-items-center rounded-full border border-white/30 bg-black/55 text-white sm:size-18">
              <Play className="ml-0.5 size-6 fill-current sm:size-7" aria-hidden="true" />
            </span>
          </button>
        )}
        {error && <div className="absolute inset-0 grid place-content-center gap-2 bg-black/80 p-4 text-center">
          <p role="alert" className="text-sm">This video could not play here.</p>
          <Button variant="ghost" className="text-white hover:bg-white/15 hover:text-white" onClick={() => {
            video.current?.load();
            setPosition(0);
            setError(false);
          }}>Try again</Button>
        </div>}
      </div>
      <LessonPlaybackControls
        playback={{ position, duration, playing, volume, muted, speed }} rates={localRates}
        onToggle={togglePlayback}
        onSeek={(time) => { if (video.current) video.current.currentTime = time; }}
        onMute={() => {
          if (!video.current) return;
          const silent = video.current.muted || video.current.volume === 0;
          if (silent && video.current.volume === 0) video.current.volume = 0.5;
          video.current.muted = !silent;
        }}
        onVolume={(level) => {
          if (!video.current) return;
          video.current.volume = level;
          video.current.muted = false;
        }}
        onSpeed={(rate) => { if (video.current) video.current.playbackRate = rate; }}
        onFullscreen={() => void toggleLessonFullscreen(player.current, video.current)}
      />
    </div>
  );
}
