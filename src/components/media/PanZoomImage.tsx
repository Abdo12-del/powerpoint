import { Suspense, lazy } from 'react';
import { MediaImage, type MediaImageProps } from './MediaImage';

const PanZoomImageCanvas = lazy(() => import('./PanZoomImageCanvas'));

export interface PanZoomImageProps extends MediaImageProps {
  viewerHeight?: number | string;
  minScale?: number;
  maxScale?: number;
}

/** Touch-friendly image pan/zoom; the interaction library is split into its own chunk. */
export function PanZoomImage(props: PanZoomImageProps) {
  const { viewerHeight, minScale, maxScale, ...imageProps } = props;
  return (
    <Suspense fallback={<MediaImage {...imageProps} />}>
      <PanZoomImageCanvas {...imageProps} viewerHeight={viewerHeight} minScale={minScale} maxScale={maxScale} />
    </Suspense>
  );
}
