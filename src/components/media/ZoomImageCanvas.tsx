import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { MediaImage } from './MediaImage';
import { resolveMediaUrl } from '@/lib/media-url';
import type { ZoomImageProps } from './ZoomImage';
import './media.css';

/** Medium-style accessible dialog zoom (BSD-3-Clause dependency). */
export default function ZoomImageCanvas({ zoomSrc, zoomMargin = 16, ...imageProps }: ZoomImageProps) {
  return (
    <Zoom
      classDialog="media-zoom-dialog"
      zoomMargin={zoomMargin}
      zoomImg={zoomSrc ? { src: resolveMediaUrl(zoomSrc) } : undefined}
      a11yNameButtonZoom="تكبير الصورة"
      a11yNameButtonUnzoom="إغلاق الصورة المكبرة"
    >
      <MediaImage {...imageProps} />
    </Zoom>
  );
}
