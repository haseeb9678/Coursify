import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const controlClass = "size-9 text-white hover:bg-white/15 hover:text-white dark:hover:bg-white/15";

export const initialPlayback = { duration: 0, position: 0, playing: false, volume: 1, muted: false, speed: 1 };
export type LessonPlayback = typeof initialPlayback;

function playbackTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const remainder = String(total % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}

export async function toggleLessonFullscreen(
  player: HTMLDivElement | null,
  media?: HTMLVideoElement | null,
): Promise<void> {
  if (document.fullscreenElement && document.fullscreenElement === player) {
    await document.exitFullscreen().catch(() => undefined);
    return;
  }
  if (player?.requestFullscreen) {
    try {
      await player.requestFullscreen();
      return;
    } catch {
      // Browsers with video-only fullscreen can use the media element.
    }
  }
  (media as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null)?.webkitEnterFullscreen?.();
}

export default function LessonPlaybackControls({ playback, rates, disabled, onSeek, onToggle, onMute, onVolume, onSpeed, onFullscreen }: {
  playback: LessonPlayback;
  rates: readonly number[];
  disabled?: boolean;
  onSeek: (position: number) => void;
  onToggle: () => void;
  onMute: () => void;
  onVolume: (volume: number) => void;
  onSpeed: (rate: number) => void;
  onFullscreen: () => void;
}) {
  const { position, duration, playing, volume, muted, speed } = playback;
  const silent = muted || volume === 0;
  return (
    <div className="space-y-1 border-t border-white/10 px-3 py-2 sm:px-4">
      <input type="range" aria-label="Video position" aria-valuetext={`${playbackTime(position)} of ${playbackTime(duration)}`}
        className="block h-4 w-full accent-primary focus-visible:outline-2 focus-visible:outline-white"
        min={0} max={duration || 1} step="any" value={position} disabled={disabled || !duration}
        onChange={(event) => onSeek(Number(event.target.value))} />
      <div className="flex flex-wrap items-center gap-x-1.5">
        <Button size="icon" variant="ghost" className={controlClass} disabled={disabled} onClick={onToggle} aria-label={playing ? "Pause video" : "Play video"}>
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
        <span className="text-xs tabular-nums text-white/85">{playbackTime(position)} / {playbackTime(duration)}</span>
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon" variant="ghost" className={controlClass} disabled={disabled} aria-label={silent ? "Unmute video" : "Mute video"} onClick={onMute}>
            {silent ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </Button>
          <input type="range" aria-label="Video volume" className="hidden w-14 accent-primary focus-visible:outline-2 focus-visible:outline-white sm:block"
            min={0} max={1} step={0.05} value={muted ? 0 : volume} disabled={disabled}
            onChange={(event) => onVolume(Number(event.target.value))} />
          <select aria-label="Playback speed" value={speed} disabled={disabled || rates.length < 2}
            className="h-8 rounded-md bg-black px-1 text-xs text-white focus-visible:outline-2 focus-visible:outline-white"
            onChange={(event) => onSpeed(Number(event.target.value))}>
            {rates.map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
          </select>
          <Button size="icon" variant="ghost" className={controlClass} aria-label="Toggle fullscreen" onClick={onFullscreen}>
            <Maximize aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
