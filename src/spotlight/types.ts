/**
 * أنواع حزمة التكبير والتركيز — Zoom & Spotlight
 * نموذج إضافة RevealZoom المدمجة مع reveal.js (MIT):
 * Alt+Click تكبير نحو نقطة الشرح، تحريك (Pan) عند أطراف الشاشة،
 * Esc للخروج، zoomLevel قابل للضبط — ومؤشر ليزر وتسليط ضوء لموضع الشرح.
 */

/** مستوى التكبير الافتراضي — zoomLevel في إضافة reveal.js */
export const ZOOM_DEFAULT_SCALE = 2;
/** حدود مستوى التكبير (عجلة الفأرة عند التكبير) */
export const ZOOM_MIN_SCALE = 1.5;
export const ZOOM_MAX_SCALE = 6;

/** هامش الالتفاف عند الأطراف — نفس ثابت reveal.js (12% من البُعد) */
export const PAN_MARGIN = 0.12;
/** سرعة الالتفاف أساساً — نفس ثابت reveal.js (14/scale بكسل لكل إطار @60fps) */
export const PAN_SPEED = 14;

/** نصف قطر تسليط الضوء الافتراضي (بكسل) وحدوده */
export const SPOTLIGHT_DEFAULT_RADIUS = 140;
export const SPOTLIGHT_MIN_RADIUS = 60;
export const SPOTLIGHT_MAX_RADIUS = 420;
/** عتمة ما حول الدائرة 0..1 واتساع الحافة كنسبة من نصف القطر */
export const SPOTLIGHT_DIM = 0.86;
export const SPOTLIGHT_FEATHER_RATIO = 0.35;

/** لون مؤشر الليزر وعمر أثره (ثوانٍ) وسقف نقاطه */
export const LASER_COLOR = '#ff3b30';
export const LASER_TTL = 0.55;
export const LASER_MAX_POINTS = 48;

/** زمن انتقال التكبير (ثانية) — reveal.js يستعمل 0.8s على body */
export const ZOOM_TRANSITION_S = 0.25;

/**
 * حالة التكبير: مستوى المقياس + نقطة الأصل (بإحداثيات المسرح)
 * CSS: scale(s) translate(-ox,-oy) بمنشأ 0 0 — النقطة (ox,oy) تهبط أعلى-يسار
 * العرض (سلوك RevealZoom بالضبط مع تمرير صفري)
 */
export interface ZoomState {
  scale: number;
  ox: number;
  oy: number;
}

export const ZOOM_RESET: ZoomState = { scale: 1, ox: 0, oy: 0 };

export function isZoomed(z: ZoomState): boolean {
  return z.scale > 1.001;
}
