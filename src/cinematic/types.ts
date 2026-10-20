/**
 * أنواع مشتركة لحزمة العرض السينمائي ثلاثي الأبعاد
 * 3D Website Flyover & Cinematic Showreel
 */

export interface CaptureViewport {
  /** العرض المثبت لضمان سلاسة الحركة */
  width: number;
  height: number;
  deviceScaleFactor: number;
}

export const DEFAULT_VIEWPORT: CaptureViewport = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 2,
};

export type LayerKind = 'background' | 'hero' | 'card' | 'image' | 'logo' | 'text' | 'overlay';

export interface CapturedLayer {
  id: string;
  kind: LayerKind;
  /** مسار الصورة الملتقطة */
  src: string;
  /** موضع الطبقة الأصلي في الصفحة */
  bounds: { x: number; y: number; width: number; height: number };
  /** العمق المقترح في المشهد ثلاثي الأبعاد (0 = أبعد، 1 = أقرب) */
  depth: number;
  /** هل تُرفع عن المستوى (بطاقات/صور/شعارات) */
  elevatable: boolean;
  /** نص بديل / وصف */
  alt?: string;
}

export interface CaptureManifest {
  viewport: CaptureViewport;
  url: string;
  capturedAt: string;
  /** صورة الصفحة الكاملة */
  fullPage?: string;
  layers: CapturedLayer[];
}

export interface CameraKeyframe {
  /** الزمن بالثواني (0..duration) */
  t: number;
  /** موضع الكاميرا */
  position: [number, number, number];
  /** نقطة النظر */
  target: [number, number, number];
  /** زاوية الميل (roll) بالدرجات */
  roll?: number;
  /** البعد البؤري (fov) */
  fov?: number;
}

export interface FlyoverConfig {
  /** مدة العرض بالثواني */
  duration: number;
  /** مسار الكاميرا: نقاط تحكم */
  path: CameraKeyframe[];
  /** سرعة عامة (1 = طبيعي، 0.5 = بطيء، 2 = سريع) */
  speed: number;
  /** شدة العمق/البارالاكس (0..1) */
  depthIntensity: number;
  /** فتحة العدسة للـ Depth of Field (كلما صغرت زاد العزل) */
  aperture: number;
  /** مستوى التركيز (المسافة البؤرية) */
  focusDistance: number;
  /** هل الإضاءة والظلال الناعمة مفعلة */
  softShadows: boolean;
  /** أبعاد الصفحة المثبتة */
  viewport: CaptureViewport;
  /** بطاقة الختام */
  finale: {
    brand: string;
    tagline: string;
    duration: number;
  };
}

export const DEFAULT_FLYOVER_CONFIG: FlyoverConfig = {
  duration: 18,
  speed: 1,
  depthIntensity: 0.85,
  aperture: 0.045,
  focusDistance: 4.5,
  softShadows: true,
  viewport: DEFAULT_VIEWPORT,
  finale: {
    brand: 'قالب العرض التقديمي',
    tagline: 'حكاية تُروى بحركةٍ سينمائية',
    duration: 3.5,
  },
  path: [
    { t: 0, position: [0, 2.5, 8], target: [0, 0, 0], roll: 0, fov: 42 },
    { t: 3, position: [1.2, 1.5, 6], target: [0, -0.5, -2], roll: -2, fov: 45 },
    { t: 6, position: [-1.0, 1.0, 4.5], target: [0, -0.8, -4], roll: 1.5, fov: 48 },
    { t: 9, position: [0.6, 0.6, 2.8], target: [0, -1.0, -6], roll: -1, fov: 52 },
    { t: 12, position: [-0.4, 0.3, 1.2], target: [0, -0.3, -8], roll: 0, fov: 50 },
    { t: 15, position: [0, 0.2, 0.2], target: [0, 0, -10], roll: 0, fov: 38 },
    { t: 18, position: [0, 0, -1], target: [0, 0, -12], roll: 0, fov: 35 },
  ],
};

export interface FramePreview {
  time: number;
  label?: string;
}
