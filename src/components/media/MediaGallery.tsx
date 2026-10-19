import { Suspense, lazy } from 'react';
import { cn } from '@/lib/cn';

const MediaGalleryCanvas = lazy(() => import('./MediaGalleryCanvas'));

export interface MediaGalleryItem {
  src: string;
  alt: string;
  caption?: string;
  /** Optional high-resolution image for the zoom dialog. */
  zoomSrc?: string;
  blurDataURL?: string;
  aspectRatio?: number | string;
}

export interface MediaGalleryProps {
  items: MediaGalleryItem[];
  initialIndex?: number;
  loop?: boolean;
  direction?: 'rtl' | 'ltr';
  zoomable?: boolean;
  className?: string;
}

/** RTL-aware Embla carousel with accessible navigation and lazy image slides. */
export function MediaGallery(props: MediaGalleryProps) {
  const firstRatio = props.items[0]?.aspectRatio ?? '16/9';
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="جارٍ تحميل معرض الصور"
          className={cn('animate-pulse rounded-2xl border border-white/10 bg-slate-900/70', props.className)}
          style={{ aspectRatio: firstRatio }}
        />
      }
    >
      <MediaGalleryCanvas {...props} />
    </Suspense>
  );
}
