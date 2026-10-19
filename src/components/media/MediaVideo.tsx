import { Suspense, lazy } from 'react';
import type { ReactPlayerProps } from 'react-player/types';
import { cn } from '@/lib/cn';
import { resolveMediaUrl } from '@/lib/media-url';
import { useSlideMediaActive } from './slideActivity';

const MediaVideoCanvas = lazy(() => import('./MediaVideoCanvas'));

type NativeVideoProps = Omit<
  ReactPlayerProps,
  'src' | 'playing' | 'width' | 'height' | 'autoPlay' | 'controls' | 'muted' | 'loop' | 'poster' | 'playsInline' | 'preload' | 'className' | 'style'
>;

export interface MediaVideoProps extends NativeVideoProps {
  /** Local `/media/...` path or YouTube URL. */
  src: string;
  /** Automatically starts only while this slide is active. Defaults to true. */
  autoPlay?: boolean;
  /** Explicit override for standalone embeds; presentation activity is the default. */
  active?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  aspectRatio?: number | string;
  label?: string;
  className?: string;
}

/**
 * Slide-scoped local/YouTube player. Exiting slides are paused immediately by
 * Presentation's active-slide context, even while AnimatePresence keeps them mounted.
 */
export function MediaVideo({
  src,
  autoPlay = true,
  active,
  muted = true,
  controls = true,
  loop = false,
  playsInline = true,
  preload = 'metadata',
  poster,
  aspectRatio = '16/9',
  label = 'مشغل فيديو',
  className,
  ...playerProps
}: MediaVideoProps) {
  const isActive = useSlideMediaActive(active);
  const resolvedSource = resolveMediaUrl(src);
  const frameStyle = { aspectRatio };

  if (!src.trim()) {
    return (
      <div role="status" className={cn('flex w-full items-center justify-center rounded-2xl bg-slate-900 p-8 text-sm text-slate-400', className)} style={frameStyle}>
        أضف رابط فيديو أو مساراً من مجلد الوسائط.
      </div>
    );
  }

  return (
    <div role="region" aria-label={label} className={cn('relative w-full overflow-hidden rounded-2xl bg-black', className)} style={frameStyle}>
      <Suspense fallback={<div role="status" aria-label="جارٍ تحميل مشغل الفيديو" className="absolute inset-0 animate-pulse bg-slate-900" />}>
        <MediaVideoCanvas
          src={resolvedSource!}
          autoPlay={autoPlay}
          active={isActive}
          muted={muted}
          controls={controls}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          poster={poster}
          {...playerProps}
        />
      </Suspense>
    </div>
  );
}
