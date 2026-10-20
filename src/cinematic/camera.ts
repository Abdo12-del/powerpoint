/**
 * مسار الكاميرا — حسابات الحركة السينمائية
 * Camera path — cinematic motion math
 */

import type { CameraKeyframe, CameraPathConfig } from './types';

// ─── تخفيف (easing) ──────────────────────────────────────────
export type EasingFn = (t: number) => number;

export const EASINGS: Record<CameraPathConfig['easing'], EasingFn> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  cinematic: (t) => {
    // منحنى سينمائي: بداية ناعمة، تسارع في الوسط، ثم هبوط هادئ نحو الختام.
    // مزيج من easeInOutCubic مع حدّ خطي صغير يمنع التوقف التام في المنتصف.
    const cubic = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return cubic * 0.86 + t * 0.14;
  },
};

// ─── استيفاء خطي متجه ثلاثي ──────────────────────────────────
type Vec3 = [number, number, number];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Catmull-Rom spline (ناعم يمر بالنقاط) ──────────────────────
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}
function catmullRomVec3(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  return [
    catmullRom(p0[0], p1[0], p2[0], p3[0], t),
    catmullRom(p0[1], p1[1], p2[1], p3[1], t),
    catmullRom(p0[2], p1[2], p2[2], p3[2], t),
  ];
}

// ─── تقييم الكاميرا عند زمن معيّر ─────────────────────────────
export interface EvaluatedCamera {
  position: Vec3;
  target: Vec3;
  fov: number;
  roll: number;
}

/**
 * يقيّم مسار الكاميرا عند الزمن المعيّر t (0..1).
 * يستخدم Catmull-Rom للمواضع (حركة ناعمة) و lerp للـ fov/roll.
 */
export function evaluateCamera(path: CameraPathConfig, tRaw: number): EvaluatedCamera {
  const t = Math.max(0, Math.min(1, tRaw));
  const eased = EASINGS[path.easing](t);
  const frames = path.keyframes;
  if (frames.length === 0) return { position: [0, 1, 5], target: [0, 0, 0], fov: 40, roll: 0 };
  if (frames.length === 1)
    return {
      position: [...frames[0].position],
      target: [...frames[0].target],
      fov: frames[0].fov ?? 40,
      roll: frames[0].roll ?? 0,
    };

  // ابحث عن المقطع المناسب
  // نُعيّر eased إلى الزمن الخطي عبر keyframes.t
  let idx = 0;
  for (let i = 0; i < frames.length - 1; i++) {
    if (eased >= frames[i].t && eased <= frames[i + 1].t) {
      idx = i;
      break;
    }
    if (eased > frames[i + 1].t) idx = i + 1;
  }
  if (idx >= frames.length - 1) idx = frames.length - 2;

  const a = frames[idx];
  const b = frames[idx + 1];
  const span = b.t - a.t || 1;
  const localT = Math.max(0, Math.min(1, (eased - a.t) / span));

  // نقاط مجاورة للـ spline
  const p0 = frames[Math.max(0, idx - 1)];
  const p3 = frames[Math.min(frames.length - 1, idx + 2)];

  const pos = catmullRomVec3(p0.position, a.position, b.position, p3.position, localT);
  const tgt = catmullRomVec3(p0.target, a.target, b.target, p3.target, localT);

  // handheld jitter (اختياري)
  if (path.handheld && path.handheld.amount > 0) {
    const { amount, frequency } = path.handheld;
    const jitter = (phase: number) => Math.sin(eased * Math.PI * 2 * frequency + phase) * amount;
    pos[0] += jitter(0);
    pos[1] += jitter(1.3);
    // slight roll wobble
    const rollJitter = jitter(2.1) * 0.6;
    const fovBase = lerp(a.fov ?? 40, b.fov ?? 40, localT);
    const rollBase = lerp(a.roll ?? 0, b.roll ?? 0, localT);
    return { position: pos, target: tgt, fov: fovBase, roll: rollBase + rollJitter };
  }

  const fov = lerp(a.fov ?? 40, b.fov ?? 40, localT);
  const roll = lerp(a.roll ?? 0, b.roll ?? 0, localT);
  return { position: pos, target: tgt, fov, roll };
}

// ─── توليد مسارات جاهزة ───────────────────────────────────────
export function generatePresetPath(
  preset: CameraPathConfig['preset'],
  overrides?: Partial<CameraPathConfig>,
): CameraPathConfig {
  const base: Record<CameraPathConfig['preset'], CameraKeyframe[]> = {
    flyover: [
      { t: 0, position: [0, 1.08, 3.75], target: [0, 0, 0], fov: 42 },
      { t: 0.18, position: [0.45, 0.98, 3.55], target: [0, -0.04, 0], fov: 41 },
      { t: 0.38, position: [-0.4, 0.78, 3.35], target: [0, -0.12, 0], fov: 41 },
      { t: 0.62, position: [0.34, 0.82, 3.5], target: [0, -0.16, 0], fov: 41 },
      { t: 0.82, position: [-0.18, 0.66, 3.25], target: [0, -0.24, 0], fov: 40 },
      { t: 1, position: [0, 0.5, 3.05], target: [0, -0.3, 0], fov: 40 },
    ],
    orbit: [
      { t: 0, position: [-1.9, 0.55, 3.5], target: [0, -0.05, 0], fov: 40 },
      { t: 0.25, position: [-1.0, 0.45, 3.9], target: [0, -0.08, 0], fov: 40 },
      { t: 0.5, position: [0, 0.35, 4.05], target: [0, -0.12, 0], fov: 40 },
      { t: 0.75, position: [1.0, 0.45, 3.9], target: [0, -0.08, 0], fov: 40 },
      { t: 1, position: [1.9, 0.55, 3.5], target: [0, -0.05, 0], fov: 40 },
    ],
    dolly: [
      { t: 0, position: [0, 0.95, 4.2], target: [0, -0.02, 0], fov: 43 },
      { t: 0.5, position: [0, 0.55, 3.2], target: [0, -0.16, 0], fov: 41 },
      { t: 1, position: [0, 0.22, 2.4], target: [0, -0.34, 0], fov: 39 },
    ],
    crane: [
      { t: 0, position: [0, 3.0, 2.9], target: [0, 0.5, 0], fov: 44 },
      { t: 0.5, position: [0, 1.5, 3.1], target: [0, 0.0, 0], fov: 42 },
      { t: 1, position: [0, 0.3, 3.0], target: [0, -0.35, 0], fov: 40 },
    ],
    lateral: [
      { t: 0, position: [-1.9, 0.6, 3.6], target: [0, -0.08, 0], fov: 40 },
      { t: 0.5, position: [0, 0.5, 3.4], target: [0, -0.16, 0], fov: 40 },
      { t: 1, position: [1.9, 0.6, 3.6], target: [0, -0.08, 0], fov: 40 },
    ],
    custom: [],
  };

  const keyframes = base[preset] ?? base.flyover;
  return {
    preset,
    easing: 'cinematic',
    continuous: true,
    keyframes: overrides?.keyframes ?? keyframes,
    ...overrides,
  };
}

// ─── حساب العمق والـ parallax للطبقة ──────────────────────────
export function computeLayerDepth(
  layerDepth: number, // 0..1 من CaptureLayer
  cameraZ: number,
  depthScale: number,
  parallaxStrength: number,
): { z: number; parallax: number } {
  // الخلفية أبعد (z سالب)، المقدمة أقرب (z موجب)
  const z = (layerDepth - 0.5) * depthScale * 2.5;
  // parallax: الطبقات القريبة تتحرك أسرع مع الكاميرا
  const parallax = (layerDepth - 0.5) * parallaxStrength;
  void cameraZ; // محجوز للاستعمالات المستقبلية (مثل تكييف الضبابية بحسب المسافة)
  return { z, parallax };
}

// ─── تحديد مرحلة المشهد السينمائي ─────────────────────────────
export function resolvePhase(t: number, transitionStart = 0.84): 'flyover' | 'transition' | 'final' {
  if (t >= 1) return 'final';
  if (t >= transitionStart) return 'transition';
  return 'flyover';
}

export function phaseProgress(t: number, transitionStart = 0.84): number {
  if (t < transitionStart) return t / transitionStart;
  return (t - transitionStart) / (1 - transitionStart);
}
