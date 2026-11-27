"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonPlaybackControls, { toggleLessonFullscreen } from "./LessonPlaybackControls";
import YouTubeLessonVideo from "./YouTubeLessonVideo";
import type { MediaRead } from "@/features/storage/storage.api";

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

interface VideoProps {
  source: string; title: string; expiresAt?: string | null;
  qualities?: number[];
  renew?: (height?: number) => Promise<MediaRead>;
}

export default function LessonVideoPlayer({ source, title, expiresAt, qualities, renew }: VideoProps) {
  const embed = renew ? null : videoEmbed(source);
  return (
    <div className="space-y-3">
      {embed?.provider === "youtube" && <YouTubeLessonVideo embed={embed.href} title={title} />}
      {embed?.provider === "vimeo" && <iframe src={embed.href} title={title}
        className="aspect-video w-full rounded-2xl border border-brand-border bg-black"
        allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
      {!embed && <VideoControls source={source} title={title} expiresAt={expiresAt} qualities={qualities} renew={renew} />}
      {!renew && <Button variant="outline" nativeButton={false} render={<a href={source} target="_blank" rel="noreferrer" />}>
        Open original video <ArrowUpRight aria-hidden="true" />
      </Button>}
    </div>
  );
}

function VideoControls({ source, title, expiresAt, qualities, renew }: VideoProps) {
  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [native, setNative] = useState(false);
  const [rotated, setRotated] = useState<MediaRead>();
  const [originalHeight, setOriginalHeight] = useState<number>();
  const [quality, setQuality] = useState<number>();
  const [changingQuality, setChangingQuality] = useState(false);
  const [qualityError, setQualityError] = useState("");
  const refreshing = useRef(false);
  const resume = useRef<{ time: number; play: boolean }>(undefined);
  const previousQuality = useRef<{ media?: MediaRead; height?: number; time: number; play: boolean }>(undefined);
  const recoveredError = useRef(false);
  const unmounted = useRef(false);
  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);
  const newSource = rotated?.url ?? source;
  const expiry = rotated?.expiresAt ?? expiresAt;

  const refresh = useCallback(async (resumePlayback = false) => {
    const element = video.current;
    if (!renew || refreshing.current || !element) return;
    refreshing.current = true;
    const previous = { time: element.currentTime, play: !element.paused };
    try {
      const fresh = await renew(quality);
      if (unmounted.current) return;
      if (!fresh.expiresAt || Date.parse(fresh.expiresAt) <= Date.now() + 10_000 || fresh.url === newSource) throw new Error("Expired playback URL");
      resume.current = { time: element.currentTime || previous.time, play: resumePlayback || !element.paused || previous.play };
      setRotated(fresh);
      setError(false);
    } catch {
      if (!unmounted.current) setError(true);
    } finally {
      refreshing.current = false;
    }
  }, [newSource, quality, renew]);

  async function changeQuality(height?: number) {
    const element = video.current;
    if (!renew || refreshing.current || previousQuality.current || !element || height === quality) return;
    refreshing.current = true;
    setChangingQuality(true);
    setQualityError("");
    try {
      const fresh = await renew(height);
      if (unmounted.current) return;
      if (fresh.url === newSource) throw new Error("Quality source must differ");
      const saved = { time: element.currentTime, play: !element.paused };
      previousQuality.current = { media: rotated, height: quality, ...saved };
      resume.current = saved;
      setBuffered(0);
      setQuality(height);
      setRotated(fresh);
      setError(false);
    } catch {
      if (!unmounted.current) {
        setChangingQuality(false);
        setQualityError("That quality is temporarily unavailable.");
      }
    } finally {
      refreshing.current = false;
    }
  }

  useEffect(() => {
    if (!expiry || !renew || !playing || changingQuality) return;
    const untilRenewal = Date.parse(expiry) - Date.now() - 20_000;
    const timer = window.setTimeout(() => void refresh(), Math.max(0, untilRenewal));
    return () => window.clearTimeout(timer);
  }, [changingQuality, expiry, playing, refresh, renew]);

  function togglePlayback() {
    if (!video.current) return;
    if (video.current.paused && expiry && Date.parse(expiry) < Date.now() + 15_000) {
      void refresh(true);
      return;
    }
    if (video.current.paused) void video.current.play().catch(() => setError(true));
    else video.current.pause();
  }

  return (
    <div ref={player} className="relative rounded-2xl border border-brand-border bg-black text-white shadow-sm fullscreen:flex fullscreen:flex-col fullscreen:justify-center">
      <div className="relative min-w-0 overflow-hidden rounded-t-2xl">
        <video ref={video} src={newSource} preload="metadata" playsInline controls={native} aria-label={title}
          className="aspect-video w-full object-contain in-fullscreen:max-h-[calc(100dvh-6rem)]"
          onLoadedMetadata={(event) => {
            const media = event.currentTarget;
            if (quality == null && media.videoHeight > 0) setOriginalHeight(media.videoHeight);
            const saved = resume.current;
            if (!saved) return;
            resume.current = undefined;
            media.currentTime = Math.min(saved.time, Number.isFinite(media.duration) ? media.duration : saved.time);
            if (saved.play) void media.play().catch(() => undefined);
          }}
          onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
          onProgress={(event) => {
            const { buffered, currentTime } = event.currentTarget;
            for (let i = 0; i < buffered.length; i++) {
              if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
                setBuffered(buffered.end(i));
                return;
              }
            }
            setBuffered(0);
          }}
          onPlay={() => { setPlaying(true); setError(false); }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => { setBuffering(false); recoveredError.current = false; }}
          onCanPlay={() => {
            setBuffering(false);
            if (previousQuality.current) {
              previousQuality.current = undefined;
              setChangingQuality(false);
            }
          }}
          onError={() => {
            setPlaying(false);
            setBuffering(false);
            const previous = previousQuality.current;
            if (previous) {
              previousQuality.current = undefined;
              resume.current = { time: previous.time, play: previous.play };
              setQuality(previous.height);
              setRotated(previous.media);
              setChangingQuality(false);
              setQualityError("That version could not play. The previous quality was restored.");
            } else if (renew && !recoveredError.current) {
              recoveredError.current = true;
              void refresh();
            } else setError(true);
          }}
          onVolumeChange={(event) => { setMuted(event.currentTarget.muted); setVolume(event.currentTarget.volume); }}
          onRateChange={(event) => setSpeed(event.currentTarget.playbackRate)}
        />
        {!native && !error && !changingQuality && (
          <button type="button" aria-label={playing ? "Pause playback" : "Play lesson"} tabIndex={-1} onClick={togglePlayback}
            className="absolute inset-0 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
            {!playing && <span className="grid size-14 place-items-center rounded-full border border-white/35 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-transform motion-safe:hover:scale-105 sm:size-18">
              <Play className="ml-0.5 size-6 fill-current sm:size-7" aria-hidden="true" />
            </span>}
          </button>
        )}
        {(changingQuality || (buffering && playing)) && (
          <p role="status" className="pointer-events-none absolute inset-x-0 top-3 mx-auto flex w-fit items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs">
            <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
            {changingQuality ? "Switching quality" : "Buffering video"}
          </p>
        )}
        {error && <div className="absolute inset-0 grid place-content-center gap-2 bg-black/80 p-4 text-center">
          <p role="alert" className="text-sm">This video could not play here. Check your access or video format.</p>
          <Button variant="ghost" className="text-white hover:bg-white/15 hover:text-white" onClick={() => {
            if (renew) void refresh();
            else {
              video.current?.load();
              setPosition(0);
              setError(false);
            }
          }}>Try again</Button>
        </div>}
      </div>
      {!native && <LessonPlaybackControls
        playback={{ position, duration, playing, volume, muted, speed }} rates={localRates}
        container={player} buffered={buffered} disabled={Boolean(error)}
        quality={quality} qualities={rotated?.availableQualities ?? qualities} originalHeight={originalHeight}
        changingQuality={changingQuality} onQuality={(height) => void changeQuality(height)}
        onProviderControls={() => setNative(true)}
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
      />}
      {native && <Button variant="ghost" className="m-1 text-xs text-white hover:bg-white/15 hover:text-white"
        onClick={() => setNative(false)}>Use custom controls</Button>}
      {qualityError && <p role="status" className="px-3 pb-2 text-xs text-white/80">{qualityError}</p>}
    </div>
  );
}
