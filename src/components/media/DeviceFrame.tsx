import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { MediaImage } from './MediaImage';

export type DeviceFrameKind = 'browser' | 'phone' | 'tablet';

export interface DeviceFrameProps {
  src: string;
  alt: string;
  device?: DeviceFrameKind;
  url?: string;
  caption?: ReactNode;
  blurDataURL?: string;
  className?: string;
}

/** Theme-matched, responsive device chrome for product screenshots. */
export function DeviceFrame({
  src,
  alt,
  device = 'browser',
  url = 'app.example.dz',
  caption,
  blurDataURL,
  className,
}: DeviceFrameProps) {
  const figureLabel = caption ?? alt;

  if (device === 'phone') {
    return (
      <figure className={cn('mx-auto w-full max-w-[17rem]', className)} aria-label={typeof figureLabel === 'string' ? figureLabel : alt}>
        <div className="relative overflow-hidden rounded-[2.55rem] border-[7px] border-slate-700 bg-slate-900 p-1.5 shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-950 ring-1 ring-white/5" />
          <MediaImage
            src={src}
            alt={alt}
            blurDataURL={blurDataURL}
            aspectRatio="9/19.5"
            className="rounded-[2rem]"
            imageClassName="rounded-[2rem]"
          />
        </div>
        {caption && <figcaption className="mt-3 text-center text-sm text-slate-300">{caption}</figcaption>}
      </figure>
    );
  }

  if (device === 'tablet') {
    return (
      <figure className={cn('mx-auto w-full max-w-3xl', className)} aria-label={typeof figureLabel === 'string' ? figureLabel : alt}>
        <div className="relative rounded-[2rem] border-[9px] border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <span aria-hidden="true" className="absolute -end-2 top-1/2 h-12 w-1 rounded-full bg-slate-600" />
          <MediaImage
            src={src}
            alt={alt}
            blurDataURL={blurDataURL}
            aspectRatio="4/3"
            className="rounded-[1.15rem]"
            imageClassName="rounded-[1.15rem]"
          />
        </div>
        {caption && <figcaption className="mt-3 text-center text-sm text-slate-300">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className={cn('w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30', className)} aria-label={typeof figureLabel === 'string' ? figureLabel : alt}>
      <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-slate-800/90 px-4" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
        <span dir="ltr" className="ms-3 flex h-6 min-w-0 flex-1 items-center justify-center truncate rounded-md border border-white/5 bg-slate-950/70 px-3 text-[11px] text-slate-400">
          {url}
        </span>
      </div>
      <MediaImage
        src={src}
        alt={alt}
        blurDataURL={blurDataURL}
        aspectRatio="16/9"
        className="rounded-b-2xl"
        imageClassName="rounded-b-2xl"
      />
      {caption && <figcaption className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">{caption}</figcaption>}
    </figure>
  );
}
