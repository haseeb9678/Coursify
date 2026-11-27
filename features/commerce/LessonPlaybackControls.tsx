"use client";

import { useEffect, useState, type KeyboardEvent, type RefObject } from "react";
import { Gauge, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Settings2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const controlClass = "size-9 shrink-0 rounded-lg text-white hover:bg-white/12 hover:text-white focus-visible:ring-white/70 dark:hover:bg-white/12 sm:size-10";
const sliderThumb = "appearance-none cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-default [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white";

export const initialPlayback = { duration: 0, position: 0, playing: false, volume: 1, muted: false, speed: 1 };
export type LessonPlayback = typeof initialPlayback;

function playbackTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const remainder = String(total % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}

export async function toggleLessonFullscreen(player: HTMLDivElement | null, media?: HTMLVideoElement | null) {
  if (document.fullscreenElement === player && player) {
    await document.exitFullscreen().catch(() => undefined);
    return;
  }
  if (player?.requestFullscreen) {
    try {
      await player.requestFullscreen();
      return;
    } catch {
      // Mobile browsers with video-only fullscreen can open the media element.
    }
  }
  (media as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null)?.webkitEnterFullscreen?.();
}

interface PlaybackControlsProps {
  playback: LessonPlayback;
  buffered?: number;
  rates: readonly number[];
  container: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
  quality?: number;
  originalHeight?: number;
  qualities?: readonly number[];
  changingQuality?: boolean;
  onQuality?: (height?: number) => void;
  onProviderControls: () => void;
  provider?: "YouTube";
  onSeek: (position: number) => void;
  onToggle: () => void;
  onMute: () => void;
  onVolume: (volume: number) => void;
  onSpeed: (rate: number) => void;
  onFullscreen: () => void;
}

export default function LessonPlaybackControls({
  playback, buffered = 0, rates, container, disabled, quality, originalHeight, qualities = [], changingQuality,
  onQuality, onProviderControls, provider, onSeek, onToggle, onMute, onVolume, onSpeed, onFullscreen,
}: PlaybackControlsProps) {
  const { position, duration, playing, volume, muted, speed } = playback;
  const [fullscreen, setFullscreen] = useState(false);
  const [scrubTime, setScrubTime] = useState<number>();
  const silent = muted || volume === 0;
  const seekEnabled = !disabled && duration > 0;
  const current = Math.min(position, duration || 0);
  const percent = (value: number) => duration > 0 ? Math.max(0, Math.min(100, 100 * value / duration)) : 0;
  const resolution = quality ?? originalHeight;
  const original = originalHeight ? `Original (${originalHeight}p)` : "Original";

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(Boolean(container.current && document.fullscreenElement === container.current));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, [container]);

  function skip(seconds: number) {
    if (seekEnabled) onSeek(Math.max(0, Math.min(duration, current + seconds)));
  }

  function handleShortcuts(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || disabled || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === " " || key === "k") onToggle();
    else if (key === "arrowleft" || key === "j") skip(-10);
    else if (key === "arrowright" || key === "l") skip(10);
    else if (key === "m") onMute();
    else if (key === "f") onFullscreen();
    else return;
    event.preventDefault();
  }

  return (
    <div role="group" aria-label="Video controls" tabIndex={0} onKeyDown={handleShortcuts}
      className="space-y-0.5 rounded-b-2xl border-t border-white/10 bg-zinc-950 px-2.5 pb-2 pt-1 text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/70 sm:px-4">
      <div className="relative h-6" onPointerLeave={() => setScrubTime(undefined)}>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/17" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 bg-white/24" style={{ width: `${percent(buffered)}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-blue-500" style={{ width: `${percent(current)}%` }} />
        </div>
        {scrubTime != null && seekEnabled && (
          <span className="pointer-events-none absolute bottom-7 z-10 -translate-x-1/2 rounded-md border border-white/15 bg-zinc-950 px-2 py-1 text-xs tabular-nums shadow-md"
            style={{ left: `clamp(20px, ${percent(scrubTime)}%, calc(100% - 20px))` }} aria-hidden="true">{playbackTime(scrubTime)}</span>
        )}
        <input type="range" aria-label="Video position" aria-valuetext={`${playbackTime(current)} of ${playbackTime(duration)}`}
          className={`relative m-0 h-6 w-full rounded-md ${sliderThumb}`}
          min={0} max={duration || 1} step={0.1} value={current} disabled={!seekEnabled}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setScrubTime(duration * Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
          }}
          onChange={(event) => onSeek(Number(event.target.value))} />
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-1">
        <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          <Button type="button" size="icon" variant="ghost" className={`${controlClass} bg-white/8`} disabled={disabled} onClick={onToggle}
            aria-label={playing ? "Pause video" : "Play video"} title={playing ? "Pause (K)" : "Play (K)"}>
            {playing ? <Pause className="size-4 fill-current" aria-hidden="true" /> : <Play className="size-4 fill-current" aria-hidden="true" />}
          </Button>
          <Button type="button" size="icon" variant="ghost" className={controlClass} disabled={!seekEnabled} aria-label="Back 10 seconds" title="Back 10 seconds"
            onClick={() => skip(-10)}><RotateCcw className="size-4" aria-hidden="true" /></Button>
          <Button type="button" size="icon" variant="ghost" className={controlClass} disabled={!seekEnabled} aria-label="Forward 10 seconds" title="Forward 10 seconds"
            onClick={() => skip(10)}><RotateCw className="size-4" aria-hidden="true" /></Button>
          <span className="ml-1 whitespace-nowrap text-[11px] tabular-nums text-white sm:ml-2 sm:text-xs">
            {playbackTime(current)} <span className="text-white/60">/ {playbackTime(duration)}</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Button type="button" size="icon" variant="ghost" className={controlClass} disabled={disabled} aria-label={silent ? "Unmute video" : "Mute video"}
            title={silent ? "Unmute (M)" : "Mute (M)"} onClick={onMute}>
            {silent ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </Button>
          <input type="range" aria-label="Video volume" aria-valuetext={`${Math.round((silent ? 0 : volume) * 100)} percent`}
            className={`hidden h-5 w-14 accent-white focus-visible:outline-2 focus-visible:outline-white sm:block`}
            min={0} max={1} step={0.05} value={silent ? 0 : volume} disabled={disabled}
            onChange={(event) => onVolume(Number(event.target.value))} />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger render={<Button type="button" variant="ghost" className={`${controlClass} w-auto min-w-9 gap-1.5 px-2 sm:w-auto`}
              aria-label="Video settings" title="Video settings" />}>
              <Settings2 className="size-4.5" aria-hidden="true" />
              {resolution ? <span className="hidden text-[11px] font-medium tabular-nums text-white/85 sm:inline">{resolution}p</span> : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" sideOffset={8} portalContainer={container}
              className="w-52 rounded-xl border border-white/15 bg-zinc-950 p-1.5 text-white shadow-xl [&_[data-highlighted]]:bg-white/15 [&_[data-highlighted]]:text-white">
              <DropdownMenuRadioGroup value={String(speed)} onValueChange={(value) => onSpeed(Number(value))}>
                <DropdownMenuLabel className="flex items-center gap-2 px-2 text-white/65"><Gauge className="size-3.5" aria-hidden="true" /> Playback speed</DropdownMenuLabel>
                {rates.map((rate) => <DropdownMenuRadioItem key={rate} value={String(rate)} disabled={disabled || rates.length < 2}
                  className="min-h-8 px-2">{rate === 1 ? "Normal" : `${rate}×`}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator className="bg-white/12" />
              {qualities.length && !provider ? (
                <DropdownMenuRadioGroup value={quality?.toString() ?? "original"} onValueChange={(value) => onQuality?.(value === "original" ? undefined : Number(value))}>
                  <DropdownMenuLabel className="px-2 text-white/65">Quality</DropdownMenuLabel>
                  <DropdownMenuRadioItem className="min-h-8 px-2" value="original" disabled={changingQuality}>{original}</DropdownMenuRadioItem>
                  {qualities.map((height) => <DropdownMenuRadioItem key={height} value={String(height)} className="min-h-8 px-2" disabled={changingQuality}>
                    {height}p
                  </DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 text-white/65">Quality</DropdownMenuLabel>
                  {provider ? (
                    <DropdownMenuItem className="min-h-9 px-2" onClick={onProviderControls}>Open YouTube quality controls</DropdownMenuItem>
                  ) : <p className="px-2 py-1 text-xs text-white">{original} available</p>}
                </DropdownMenuGroup>
              )}
              {!provider && <>
                <DropdownMenuSeparator className="bg-white/12" />
                <DropdownMenuItem className="min-h-9 px-2" onClick={onProviderControls}>Use browser controls</DropdownMenuItem>
              </>}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" size="icon" variant="ghost" className={controlClass} aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"} onClick={onFullscreen}>
            {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
