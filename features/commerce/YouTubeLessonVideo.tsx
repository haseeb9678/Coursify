"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import LessonPlaybackControls, { initialPlayback, toggleLessonFullscreen } from "./LessonPlaybackControls";

interface YouTubePlayer {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVolume: () => number;
  isMuted: () => boolean;
  getPlaybackRate: () => number;
  getAvailablePlaybackRates: () => number[];
}

type PlayerEvent = { target: YouTubePlayer; data: number };
type YouTubeApi = {
  Player: new (iframe: HTMLIFrameElement, options: { events: {
    onReady: (event: PlayerEvent) => void;
    onStateChange: (event: PlayerEvent) => void;
    onPlaybackRateChange: (event: PlayerEvent) => void;
    onError: () => void;
  } }) => YouTubePlayer;
};

const frameClass = "block aspect-video min-h-50 w-full in-fullscreen:max-h-[calc(100dvh-6rem)]";
const youtubePermissions = "autoplay; encrypted-media; picture-in-picture; fullscreen";
let apiRequest: Promise<YouTubeApi> | undefined;

function loadYouTubeApi(): Promise<YouTubeApi> {
  const scope = window as Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
  if (scope.YT?.Player) return Promise.resolve(scope.YT);
  apiRequest ??= new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement("script");
    const previousCallback = scope.onYouTubeIframeAPIReady;
    const ready = () => {
      scope.onYouTubeIframeAPIReady = previousCallback;
      if (scope.YT?.Player) resolve(scope.YT);
      else reject(new Error("YouTube player API is unavailable."));
      previousCallback?.();
    };
    scope.onYouTubeIframeAPIReady = ready;
    script.async = true;
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      if (scope.onYouTubeIframeAPIReady === ready) scope.onYouTubeIframeAPIReady = previousCallback;
      script.remove();
      reject(new Error("YouTube player API could not load."));
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    apiRequest = undefined;
    throw error;
  });
  return apiRequest;
}

export default function YouTubeLessonVideo({ embed, title }: { embed: string; title: string }) {
  const [useProviderControls, setUseProviderControls] = useState(false);
  const useYouTubeControls = useCallback(() => setUseProviderControls(true), []);
  if (useProviderControls) {
    return <iframe src={embed} title={title} className={`${frameClass} rounded-2xl border border-brand-border bg-black`}
      allow={youtubePermissions} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
  }
  return <YouTubeCustomControls embed={embed} title={title} onFallback={useYouTubeControls} />;
}

function YouTubeCustomControls({ embed, title, onFallback }: { embed: string; title: string; onFallback: () => void }) {
  const surface = useRef<HTMLDivElement>(null);
  const frameHost = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer>(null);
  const [ready, setReady] = useState(false);
  const [playback, setPlayback] = useState(initialPlayback);
  const [rates, setRates] = useState<number[]>([1]);

  useEffect(() => {
    const host = frameHost.current;
    if (!host) return;

    const frame = document.createElement("iframe");
    const url = new URL(embed);
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("controls", "0");
    url.searchParams.set("origin", window.location.origin);
    frame.src = url.href;
    frame.title = title;
    frame.className = frameClass;
    frame.allow = youtubePermissions;
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";

    let active = true;
    let progressTimer: number | undefined;
    const readyTimer = window.setTimeout(onFallback, 12000);
    const update = (target: YouTubePlayer) => {
      if (!active) return;
      setPlayback({
        position: target.getCurrentTime() || 0,
        duration: target.getDuration() || 0,
        playing: target.getPlayerState() === 1,
        muted: target.isMuted(),
        volume: target.getVolume() / 100,
        speed: target.getPlaybackRate() || 1,
      });
    };

    host.append(frame);
    void loadYouTubeApi().then((api) => {
      if (!active) return;
      player.current = new api.Player(frame, { events: {
        onReady: ({ target }) => {
          if (!active) return;
          window.clearTimeout(readyTimer);
          setReady(true);
          setRates(target.getAvailablePlaybackRates());
          update(target);
        },
        onStateChange: ({ target, data }) => {
          if (!active) return;
          window.clearInterval(progressTimer);
          update(target);
          if (data === 1) {
            setRates(target.getAvailablePlaybackRates());
            progressTimer = window.setInterval(() => update(target), 350);
          }
        },
        onPlaybackRateChange: ({ target }) => update(target),
        onError: () => { if (active) onFallback(); },
      } });
    }).catch(() => { if (active) onFallback(); });

    return () => {
      active = false;
      window.clearTimeout(readyTimer);
      window.clearInterval(progressTimer);
      player.current?.destroy();
      player.current = null;
      frame.remove();
    };
  }, [embed, onFallback, title]);

  return (
    <div className="space-y-2">
      <div ref={surface} className="overflow-hidden rounded-2xl border border-brand-border bg-black text-white fullscreen:flex fullscreen:flex-col fullscreen:justify-center">
        <div ref={frameHost} className="aspect-video min-h-50 w-full in-fullscreen:max-h-[calc(100dvh-6rem)]" />
        <LessonPlaybackControls
          playback={playback} rates={rates} disabled={!ready}
          onToggle={() => {
            if (playback.playing) player.current?.pauseVideo();
            else player.current?.playVideo();
          }}
          onSeek={(position) => {
            player.current?.seekTo(position, true);
            setPlayback((previous) => ({ ...previous, position }));
          }}
          onMute={() => {
            const muted = !playback.muted && playback.volume > 0;
            const volume = !muted && playback.volume === 0 ? 0.5 : playback.volume;
            player.current?.setVolume(volume * 100);
            if (muted) player.current?.mute();
            else player.current?.unMute();
            setPlayback((previous) => ({ ...previous, muted, volume }));
          }}
          onVolume={(volume) => {
            player.current?.setVolume(volume * 100);
            player.current?.unMute();
            setPlayback((previous) => ({ ...previous, volume, muted: false }));
          }}
          onSpeed={(rate) => player.current?.setPlaybackRate(rate)}
          onFullscreen={() => void toggleLessonFullscreen(surface.current)}
        />
      </div>
      <Button variant="link" onClick={onFallback}>Use YouTube controls</Button>
    </div>
  );
}
