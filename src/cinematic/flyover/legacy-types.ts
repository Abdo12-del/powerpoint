/**
 * أنواع مشتركة لحزمة العرض السينمائي ثلاثي الأبعاد — نسخة FlyoverCanvas المستقلة
 * (محفوظة للتوافق مع المختبر الثانوي ?lab=flyover)
 */

export interface CaptureViewport {
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
  src: string;
  bounds: { x: number; y: number; width: number; height: number };
  depth: number;
  elevatable: boolean;
  alt?: string;
}

export interface CaptureManifest {
  viewport: CaptureViewport;
  url: string;
  capturedAt: string;
  fullPage?: string;
  layers: CapturedLayer[];
}

export interface CameraKeyframe {
  t: number;
  position: [number, number, number];
  target: [number, number, number];
  roll?: number;
  fov?: number;
}

export interface FlyoverConfig {
  duration: number;
  path: CameraKeyframe[];
  speed: number;
  depthIntensity: number;
  aperture: number;
  focusDistance: number;
  softShadows: boolean;
  viewport: CaptureViewport;
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
