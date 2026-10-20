/**
 * إدارة طبقات المشهد ثلاثي الأبعاد — تحويل لقطات الصفحة إلى مستويات بعمق مختلف
 */

import type { CapturedLayer } from './legacy-types';

export interface SceneLayer {
  id: string;
  kind: CapturedLayer['kind'];
  depth: number; // 0..1 (0 بعيد، 1 قريب)
  elevation: number; // ارتفاع عن المستوى (للبطاقات والصور والشعارات)
  textureKey: string;
  bounds: CapturedLayer['bounds'];
  color: string; // لون احتياطي إن لم تتوفر صورة
  // موضع في المشهد (مركز المستوى)
  position: [number, number, number];
  scale: [number, number];
  rotation: number; // ميل طفيف
}

export interface LayerPreset {
  depth: number;
  elevation: number;
  tint: string;
}

/**
 * توزيع العمق حسب نوع الطبقة — الخلفية أبعد، الشعارات أقرب
 */
export const LAYER_DEPTH_PRESETS: Record<string, LayerPreset> = {
  background: { depth: 0.05, elevation: 0, tint: '#0f172a' },
  hero: { depth: 0.55, elevation: 0.08, tint: '#fbbf24' },
  card: { depth: 0.72, elevation: 0.16, tint: '#38bdf8' },
  image: { depth: 0.78, elevation: 0.14, tint: '#a78bfa' },
  logo: { depth: 0.92, elevation: 0.22, tint: '#fb7185' },
  text: { depth: 0.65, elevation: 0.04, tint: '#f8fafc' },
  overlay: { depth: 0.88, elevation: 0.1, tint: '#facc15' },
};

/**
 * يحوّل CapturedLayer[] (من Playwright) إلى SceneLayer[] للمشهد
 */
export function buildSceneLayers(captured: CapturedLayer[], depthIntensity = 0.85): SceneLayer[] {
  if (captured.length === 0) {
    // طبقات تجريبية افتراضية — تحاكي صفحة هبوط حقيقية
    return buildDemoLayers(depthIntensity);
  }

  return captured.map((c, idx) => {
    const preset = LAYER_DEPTH_PRESETS[c.kind] ?? { depth: c.depth, elevation: c.elevatable ? 0.12 : 0, tint: '#94a3b8' };
    const depth = preset.depth * depthIntensity + (1 - depthIntensity) * 0.5;

    // تحويل إحداثيات الشاشة (0..1920, 0..1080) إلى إحداثيات مشهد (-4..4, -2.5..2.5)
    const nx = (c.bounds.x + c.bounds.width / 2 - 960) / 480; // -2..2
    const ny = -(c.bounds.y + c.bounds.height / 2 - 540) / 480; // مقلوب Y
    const nz = -depth * 8; // العمق على محور Z (أبعد = أكثر سلبية)

    return {
      id: c.id,
      kind: c.kind,
      depth,
      elevation: c.elevatable ? preset.elevation : 0,
      textureKey: c.src,
      bounds: c.bounds,
      color: preset.tint,
      position: [nx, ny, nz] as [number, number, number],
      scale: [c.bounds.width / 520, c.bounds.height / 520] as [number, number],
      rotation: (idx % 3 === 1 ? 1 : idx % 3 === 2 ? -1 : 0) * 0.8,
    };
  });
}

/**
 * طبقات تجريبية جميلة — تستعمل عند عدم توفر لقطات حقيقية
 */
export function buildDemoLayers(depthIntensity = 0.85): SceneLayer[] {
  const d = (base: number) => base * depthIntensity + (1 - depthIntensity) * 0.5;

  return [
    {
      id: 'bg',
      kind: 'background',
      depth: d(0.05),
      elevation: 0,
      textureKey: '__gradient_bg__',
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      color: '#020617',
      position: [0, 0, -d(0.05) * 8],
      scale: [6, 4.2],
      rotation: 0,
    },
    {
      id: 'hero',
      kind: 'hero',
      depth: d(0.55),
      elevation: 0.08,
      textureKey: '__card_hero__',
      bounds: { x: 320, y: 120, width: 1280, height: 320 },
      color: '#fbbf24',
      position: [0, 0.9, -d(0.55) * 8],
      scale: [3.2, 0.85],
      rotation: 0,
    },
    {
      id: 'card-1',
      kind: 'card',
      depth: d(0.72),
      elevation: 0.18,
      textureKey: '__card_1__',
      bounds: { x: 120, y: 520, width: 520, height: 280 },
      color: '#38bdf8',
      position: [-1.6, -0.15, -d(0.72) * 8],
      scale: [1.35, 0.72],
      rotation: 1.2,
    },
    {
      id: 'card-2',
      kind: 'card',
      depth: d(0.74),
      elevation: 0.16,
      textureKey: '__card_2__',
      bounds: { x: 700, y: 520, width: 520, height: 280 },
      color: '#a78bfa',
      position: [0, -0.2, -d(0.74) * 8],
      scale: [1.35, 0.72],
      rotation: -0.8,
    },
    {
      id: 'card-3',
      kind: 'card',
      depth: d(0.71),
      elevation: 0.14,
      textureKey: '__card_3__',
      bounds: { x: 1280, y: 520, width: 520, height: 280 },
      color: '#34d399',
      position: [1.65, -0.12, -d(0.71) * 8],
      scale: [1.35, 0.72],
      rotation: 0.6,
    },
    {
      id: 'image-1',
      kind: 'image',
      depth: d(0.78),
      elevation: 0.15,
      textureKey: '__image_1__',
      bounds: { x: 180, y: 860, width: 760, height: 180 },
      color: '#fb7185',
      position: [-1.0, -1.05, -d(0.78) * 8],
      scale: [1.9, 0.48],
      rotation: -0.5,
    },
    {
      id: 'logos',
      kind: 'logo',
      depth: d(0.92),
      elevation: 0.22,
      textureKey: '__logos__',
      bounds: { x: 1020, y: 860, width: 720, height: 180 },
      color: '#f8fafc',
      position: [1.1, -1.08, -d(0.92) * 8],
      scale: [1.75, 0.46],
      rotation: 0.4,
    },
  ];
}
