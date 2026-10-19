import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { resolveMediaUrl } from '@/lib/media-url';

export type MediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'decoding'> & {
  src: string;
  alt: string;
  /** Tiny blurred preview, preferably a data URL under 1 KB. */
  blurDataURL?: string;
  /** Reserves the frame before the full image loads; use width/height when known. */
  aspectRatio?: number | string;
  /** Extra styles for the reserved outer frame (the standard `style` prop stays on the img). */
  frameStyle?: CSSProperties;
  fit?: 'cover' | 'contain';
  loading?: 'eager' | 'lazy';
  className?: string;
  imageClassName?: string;
};

/** Lazy native image with layout reservation and an optional blurred preview. */
export function MediaImage({
  src,
  alt,
  blurDataURL,
  aspectRatio,
  width,
  height,
  fit = 'cover',
  loading = 'lazy',
  className,
  imageClassName,
  onLoad,
  onError,
  style: imageStyle,
  frameStyle: extraFrameStyle,
  ...imgProps
}: MediaImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imageSrc = resolveMediaUrl(src)!;
  const placeholderSrc = resolveMediaUrl(blurDataURL);
  const loaded = loadedSrc === imageSrc;
  const reservedRatio = aspectRatio ?? (width && height ? `${width}/${height}` : undefined);
  const frameStyle: CSSProperties = {
    ...(reservedRatio ? { aspectRatio: reservedRatio } : {}),
    ...extraFrameStyle,
  };

  return (
    <div className={cn('media-image-frame relative isolate overflow-hidden bg-slate-900', className)} style={frameStyle}>
      {blurDataURL ? (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={cn('pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-300 motion-reduce:transition-none', loaded && 'opacity-0')}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-700/70 via-slate-800 to-slate-950 transition-opacity duration-300 motion-reduce:transition-none', loaded && 'opacity-0')}
        />
      )}
      <img
        {...imgProps}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        style={imageStyle}
        loading={loading}
        decoding="async"
        onLoad={(event) => {
          setLoadedSrc(imageSrc);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoadedSrc(null);
          onError?.(event);
        }}
        className={cn(
          'block w-full transition-opacity duration-300 motion-reduce:transition-none',
          reservedRatio ? 'absolute inset-0 h-full' : 'h-auto',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          !loaded && 'opacity-0',
          imageClassName,
        )}
      />
    </div>
  );
}
