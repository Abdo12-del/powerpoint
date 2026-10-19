import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MediaImage } from './MediaImage';
import { ZoomImage } from './ZoomImage';
import type { MediaGalleryProps } from './MediaGallery';

export default function MediaGalleryCanvas({
  items,
  initialIndex = 0,
  loop = false,
  direction = 'rtl',
  zoomable = true,
  className,
}: MediaGalleryProps) {
  const reducedMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, Math.min(initialIndex, items.length - 1)));
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    direction,
    duration: reducedMotion ? 1 : 25,
    loop: loop && items.length > 1,
  });

  const syncSelected = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const nextIndex = Math.max(0, Math.min(initialIndex, items.length - 1));
    emblaApi.scrollTo(nextIndex, true);
    syncSelected();
    emblaApi.on('select', syncSelected);
    emblaApi.on('reInit', syncSelected);
    return () => {
      emblaApi.off('select', syncSelected);
      emblaApi.off('reInit', syncSelected);
    };
  }, [emblaApi, initialIndex, items.length, syncSelected]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const hasMultiple = items.length > 1;

  if (items.length === 0) return null;

  return (
    <section
      dir={direction}
      aria-roledescription="معرض صور"
      aria-label="معرض الصور"
      className={cn('media-gallery w-full', className)}
    >
      <div className="overflow-hidden rounded-2xl" ref={viewportRef}>
        <div className="flex touch-pan-y">
          {items.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              role="group"
              aria-roledescription="شريحة"
              aria-label={`${index + 1} من ${items.length}`}
              className="min-w-0 flex-[0_0_100%]"
            >
              <figure className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                {zoomable ? (
                  <ZoomImage
                    src={item.src}
                    zoomSrc={item.zoomSrc}
                    alt={item.alt}
                    blurDataURL={item.blurDataURL}
                    aspectRatio={item.aspectRatio ?? '16/9'}
                    className="rounded-2xl"
                    imageClassName="rounded-2xl"
                  />
                ) : (
                  <MediaImage
                    src={item.src}
                    alt={item.alt}
                    blurDataURL={item.blurDataURL}
                    aspectRatio={item.aspectRatio ?? '16/9'}
                    className="rounded-2xl"
                    imageClassName="rounded-2xl"
                  />
                )}
                {item.caption && (
                  <figcaption className="border-t border-white/10 px-4 py-3 text-sm leading-6 text-slate-300">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="الصورة السابقة"
              disabled={!loop && !emblaApi?.canScrollPrev()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              {direction === 'rtl' ? <ArrowRight size={18} aria-hidden /> : <ArrowLeft size={18} aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="الصورة التالية"
              disabled={!loop && !emblaApi?.canScrollNext()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              {direction === 'rtl' ? <ArrowLeft size={18} aria-hidden /> : <ArrowRight size={18} aria-hidden />}
            </button>
          </div>

          <p className="min-w-16 text-center text-xs tabular-nums text-slate-400" aria-live="polite">
            {selectedIndex + 1} / {items.length}
          </p>

          <div className="flex items-center gap-1.5" role="group" aria-label="اختر صورة">
            {items.map((item, index) => (
              <button
                key={`${item.src}-dot-${index}`}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`الانتقال إلى الصورة ${index + 1}`}
                aria-current={selectedIndex === index ? 'true' : undefined}
                className={cn(
                  'h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300',
                  selectedIndex === index ? 'w-6 bg-amber-300' : 'w-2.5 bg-slate-600 hover:bg-slate-400',
                  reducedMotion && 'transition-none',
                )}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
