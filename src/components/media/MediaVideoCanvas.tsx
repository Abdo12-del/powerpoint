import { lazy, useEffect, useRef, useState, type ComponentType } from 'react';
import HtmlPlayer from 'react-player/HtmlPlayer';
import { createReactPlayer } from 'react-player/ReactPlayer';
import { canPlay } from 'react-player/patterns';
import type { PlayerEntry } from 'react-player/players';
import type { VideoElementProps } from 'react-player/types';
import { TriangleAlert } from 'lucide-react';
import type { MediaVideoProps } from './MediaVideo';
import { resolveMediaUrl } from '@/lib/media-url';
import { getMediaVideoPlaying } from './videoPlayback';

type MediaVideoCanvasProps = Omit<MediaVideoProps, 'active' | 'className' | 'aspectRatio' | 'label'> & { active: boolean };

// Keep only the providers this toolkit promises; the default ReactPlayer entry also bundles
// HLS, DASH, Mux, Vimeo, Twitch, TikTok, Spotify, and Wistia provider chunks.
const YouTubePlayer = lazy(() =>
  import('youtube-video-element/react').then(({ default: Player }) => ({
    default: Player as unknown as ComponentType<VideoElementProps>,
  })),
);
const supportedPlayers: PlayerEntry[] = [
  { key: 'youtube', name: 'YouTube', canPlay: canPlay.youtube, player: YouTubePlayer },
  { key: 'html', name: 'html', canPlay: canPlay.html, player: HtmlPlayer },
];
const ReactPlayer = createReactPlayer(supportedPlayers, supportedPlayers[1]!);

export default function MediaVideoCanvas({
  src,
  active,
  autoPlay = true,
  muted = true,
  controls = true,
  loop = false,
  playsInline = true,
  preload = 'metadata',
  poster,
  onPlay,
  onPause,
  onError,
  ...playerProps
}: MediaVideoCanvasProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setUserPaused(false);
  }, [src]);

  useEffect(() => {
    if (!active) {
      playerRef.current?.pause();
      setUserPaused(false);
    }
  }, [active]);

  const handlePlay: NonNullable<MediaVideoProps['onPlay']> = (event) => {
    setUserPaused(false);
    onPlay?.(event);
  };
  const handlePause: NonNullable<MediaVideoProps['onPause']> = (event) => {
    if (active && autoPlay) setUserPaused(true);
    onPause?.(event);
  };
  const handleError: NonNullable<MediaVideoProps['onError']> = (event) => {
    setHasError(true);
    onError?.(event);
  };

  const playing = getMediaVideoPlaying(active, autoPlay, userPaused);

  return (
    <div className="absolute inset-0">
      <ReactPlayer
        {...playerProps}
        ref={playerRef}
        src={src}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        controls={controls}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        poster={resolveMediaUrl(poster)}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {hasError && (
        <div role="alert" className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl border border-rose-300/20 bg-slate-950/95 px-3 py-2 text-xs leading-5 text-rose-100">
          <TriangleAlert size={15} aria-hidden className="shrink-0 text-rose-300" />
          تعذّر تشغيل الفيديو. تحقّق من الرابط وصيغة الملف وإمكانية الوصول إليه.
        </div>
      )}
    </div>
  );
}
