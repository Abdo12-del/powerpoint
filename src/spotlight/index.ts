/**
 * حزمة التكبير والتركيز — Zoom & Spotlight
 * نموذج إضافة RevealZoom المدمجة مع reveal.js (MIT) على نظام العروض الحالي
 */

export { useSpotlight } from './useSpotlight';
export type { SpotlightController } from './useSpotlight';
export { SpotlightOverlay } from './SpotlightOverlay';
export {
  zoomTo,
  zoomCenter,
  zoomCss,
  panTowards,
  clampScale,
  clamp,
  spotlightBackground,
  LaserTrail,
} from './engine';
export {
  ZOOM_DEFAULT_SCALE,
  ZOOM_MIN_SCALE,
  ZOOM_MAX_SCALE,
  ZOOM_RESET,
  ZOOM_TRANSITION_S,
  PAN_MARGIN,
  PAN_SPEED,
  SPOTLIGHT_DEFAULT_RADIUS,
  SPOTLIGHT_MIN_RADIUS,
  SPOTLIGHT_MAX_RADIUS,
  SPOTLIGHT_DIM,
  LASER_COLOR,
  LASER_TTL,
  isZoomed,
} from './types';
export type { ZoomState } from './types';
export { SpotlightLab } from './lab/SpotlightLab';
