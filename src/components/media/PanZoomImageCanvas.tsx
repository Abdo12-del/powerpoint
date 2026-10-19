import { useControls, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MediaImage } from './MediaImage';
import type { PanZoomImageProps } from './PanZoomImage';

export default function PanZoomImageCanvas({
  viewerHeight = 420,
  minScale = 0.75,
  maxScale = 4,
  className,
  aspectRatio = '16/9',
  ...imageProps
}: PanZoomImageProps) {
  return (
    <div
      dir="ltr"
      role="group"
      aria-label={`تكبير وتحريك الصورة: ${imageProps.alt}`}
      className={cn('relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950', className)}
      style={{ height: viewerHeight }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={minScale}
        maxScale={maxScale}
        centerOnInit
        fitOnInit="contain"
        limitToBounds
        wheel={{ step: 0.15 }}
        doubleClick={{ mode: 'toggle', step: 1.5, animationTime: 180 }}
        panning={{ allowLeftClickPan: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ minWidth: '100%', minHeight: '100%' }}
        >
          <MediaImage
            {...imageProps}
            aspectRatio={aspectRatio}
            className="w-full"
            imageClassName="select-none"
            draggable={false}
          />
        </TransformComponent>
        <ZoomControls />
      </TransformWrapper>
    </div>
  );
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const buttonClass = 'flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/90 text-slate-100 shadow-lg transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300';
  return (
    <div className="absolute bottom-3 end-3 z-10 flex gap-1.5">
      <button type="button" onClick={() => void zoomIn()} className={buttonClass} aria-label="تكبير">
        <Plus size={16} aria-hidden />
      </button>
      <button type="button" onClick={() => void zoomOut()} className={buttonClass} aria-label="تصغير">
        <Minus size={16} aria-hidden />
      </button>
      <button type="button" onClick={() => void resetTransform()} className={buttonClass} aria-label="إعادة ضبط التكبير">
        <RotateCcw size={15} aria-hidden />
      </button>
    </div>
  );
}
