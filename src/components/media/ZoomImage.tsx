import { Suspense, lazy } from 'react';
import { MediaImage, type MediaImageProps } from './MediaImage';

const ZoomImageCanvas = lazy(() => import('./ZoomImageCanvas'));

export interface ZoomImageProps extends MediaImageProps {
  /** Optional full-resolution asset opened in the zoom dialog. */
  zoomSrc?: string;
  zoomMargin?: number;
}

/** Accessible click-to-zoom image; the dialog runtime and its CSS load on demand. */
export function ZoomImage(props: ZoomImageProps) {
  const { zoomSrc, zoomMargin, ...imageProps } = props;
  return (
    <Suspense fallback={<MediaImage {...imageProps} />}>
      <ZoomImageCanvas {...imageProps} zoomSrc={zoomSrc} zoomMargin={zoomMargin} />
    </Suspense>
  );
}
