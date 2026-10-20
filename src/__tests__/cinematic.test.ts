import { describe, expect, it } from 'vitest';
import { EASINGS, evaluateCamera, generatePresetPath, computeLayerDepth, resolvePhase, phaseProgress } from '@/cinematic/camera';
import {
  boundsToScene,
  clamp01,
  computeLetterbox,
  formatTime,
  hexToRgb,
  mat4Identity,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
  mat4Scale,
  mat4Translate,
  normalize,
} from '@/cinematic/utils';
import { DEFAULT_FLYOVER_CONFIG, DEFAULT_PAGE_DIMENSIONS } from '@/cinematic/types';
import { generateMockLayers, DEFAULT_LAYER_SELECTORS } from '@/cinematic/capture';
import { fixedAspectStyle } from '@/cinematic/renderer';

describe('مسار الكاميرا السينمائي', () => {
  it('كل مسار جاهز يبدأ عند t=0 وينتهي عند t=1', () => {
    for (const preset of ['flyover', 'orbit', 'dolly', 'crane', 'lateral'] as const) {
      const path = generatePresetPath(preset);
      expect(path.keyframes.length).toBeGreaterThanOrEqual(3);
      expect(path.keyframes[0].t).toBe(0);
      expect(path.keyframes.at(-1)?.t).toBe(1);
      for (const k of path.keyframes) {
        expect(k.position).toHaveLength(3);
        expect(k.target).toHaveLength(3);
        expect(k.t).toBeGreaterThanOrEqual(0);
        expect(k.t).toBeLessThanOrEqual(1);
      }
    }
  });

  it('تقييم الكاميرا يطابق أول نقطة وآخر نقطة عند الطرفين', () => {
    const path = generatePresetPath('flyover');
    const first = path.keyframes[0];
    const last = path.keyframes[path.keyframes.length - 1];
    const atStart = evaluateCamera(path, 0);
    const atEnd = evaluateCamera(path, 1);
    expect(atStart.position[0]).toBeCloseTo(first.position[0], 5);
    expect(atStart.position[2]).toBeCloseTo(first.position[2], 5);
    expect(atEnd.position[1]).toBeCloseTo(last.position[1], 5);
    expect(atEnd.position[2]).toBeCloseTo(last.position[2], 5);
    expect(atEnd.fov).toBeCloseTo(last.fov ?? 40, 5);
  });

  it('يقصّ الزمن خارج [0,1] بلا انفجار', () => {
    const path = generatePresetPath('dolly');
    expect(evaluateCamera(path, -3).position).toEqual(evaluateCamera(path, 0).position);
    expect(evaluateCamera(path, 9).position).toEqual(evaluateCamera(path, 1).position);
  });

  it('منحنى cinematic رتيب تماماً (لا قفزات في الحركة)', () => {
    const fn = EASINGS.cinematic;
    let prev = fn(0);
    expect(prev).toBeCloseTo(0, 6);
    for (let i = 1; i <= 200; i++) {
      const v = fn(i / 200);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = v;
    }
    expect(prev).toBeCloseTo(1, 6);
  });

  it('كل دوال التخفيف تبدأ من 0 وتنتهي عند 1', () => {
    for (const [name, fn] of Object.entries(EASINGS)) {
      expect(fn(0), name).toBeCloseTo(0, 6);
      expect(fn(1), name).toBeCloseTo(1, 6);
    }
  });

  it('التذبذب المحمول يغيّر الموضع قليلاً دون تشويه المسار', () => {
    const base = generatePresetPath('orbit');
    const handheld = generatePresetPath('orbit', { handheld: { amount: 0.02, frequency: 1.5 } });
    const a = evaluateCamera(base, 0.4).position;
    const b = evaluateCamera(handheld, 0.4).position;
    const delta = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    expect(delta).toBeGreaterThan(0);
    expect(delta).toBeLessThan(0.1);
  });

  it('مراحل المشهد: طيران ← انتقال ← ختام', () => {
    expect(resolvePhase(0)).toBe('flyover');
    expect(resolvePhase(0.5)).toBe('flyover');
    expect(resolvePhase(0.84)).toBe('transition');
    expect(resolvePhase(0.99)).toBe('transition');
    expect(resolvePhase(1)).toBe('final');
    expect(phaseProgress(0.42)).toBeCloseTo(0.5, 5);
    expect(phaseProgress(0.92)).toBeCloseTo(0.5, 5);
  });

  it('حساب عمق الطبقة يعيد قيماً متعاكسة بين الخلفية والمقدمة', () => {
    const back = computeLayerDepth(0.1, 3, 1, 0.6);
    const front = computeLayerDepth(0.9, 3, 1, 0.6);
    expect(back.z).toBeLessThan(front.z);
    expect(back.parallax).toBeLessThan(0);
    expect(front.parallax).toBeGreaterThan(0);
  });
});

describe('أبعاد الصفحة المثبتة والتحويل إلى مشهد', () => {
  it('letterbox يحفظ النسبة داخل حاوية أعرض', () => {
    const r = computeLetterbox(2000, 800, 1440, 900);
    expect(r.aspect).toBeCloseTo(1.6, 5);
    expect(r.height).toBe(800);
    expect(r.width).toBeCloseTo(1280, 5);
    expect(r.x).toBeCloseTo((2000 - 1280) / 2, 5);
    expect(r.y).toBe(0);
  });

  it('letterbox يحفظ النسبة داخل حاوية أطول', () => {
    const r = computeLetterbox(800, 1200, 1440, 900);
    expect(r.width).toBe(800);
    expect(r.height).toBeCloseTo(500, 5);
    expect(r.y).toBeCloseTo((1200 - 500) / 2, 5);
  });

  it('مركز الصفحة يقع في مركز المشهد', () => {
    const center = boundsToScene({ x: 0, y: 0, width: 1440, height: 900 }, 1440, 900);
    expect(center.x).toBeCloseTo(0, 5);
    expect(center.y).toBeCloseTo(0, 5);
    expect(center.w).toBeCloseTo(2 * (1440 / 900), 5);
    expect(center.h).toBeCloseTo(2, 5);
  });

  it('أعلى الصفحة موجب وأسفلها سالب (Y مقلوب)', () => {
    const top = boundsToScene({ x: 0, y: 0, width: 1440, height: 100 }, 1440, 900);
    const bottom = boundsToScene({ x: 0, y: 800, width: 1440, height: 100 }, 1440, 900);
    expect(top.y).toBeGreaterThan(0);
    expect(bottom.y).toBeLessThan(0);
  });

  it('نسبة العرض المثبتة تُشتق من الإعدادات', () => {
    expect(fixedAspectStyle(DEFAULT_FLYOVER_CONFIG)).toEqual({ aspectRatio: '1440 / 900' });
    expect(DEFAULT_PAGE_DIMENSIONS.devicePixelRatio).toBe(1);
  });
});

describe('رياضيات المصفوفات والألوان والزمن', () => {
  it('المنظور يعكس النقطة عند المسافة الصحيحة', () => {
    const proj = mat4Perspective(90, 1, 0.1, 100);
    // نقطة على المحور Z أمام الكاميرا
    const out = [0, 0, 0, 0];
    const v = [0, 0, -1, 1];
    for (let r = 0; r < 4; r++) out[r] = proj[r] * v[0] + proj[4 + r] * v[1] + proj[8 + r] * v[2] + proj[12 + r] * v[3];
    const ndcZ = out[2] / out[3];
    expect(ndcZ).toBeGreaterThan(-1);
    expect(ndcZ).toBeLessThan(1);
  });

  it('LookAt يضع الكاميرا في نقطة النظر', () => {
    const view = mat4LookAt([0, 0, 5], [0, 0, 0]);
    const p = [0, 0, 5, 1];
    const out = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) out[r] = view[r] * p[0] + view[4 + r] * p[1] + view[8 + r] * p[2] + view[12 + r] * p[3];
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[1]).toBeCloseTo(0, 5);
    expect(out[2]).toBeCloseTo(0, 5);
  });

  it('التحريك والقياس يبقيان قابلين للتركيب', () => {
    const m = mat4Scale(mat4Translate(mat4Identity(), [1, 2, 3]), [2, 2, 2]);
    expect(m[12]).toBe(1);
    expect(m[13]).toBe(2);
    expect(m[14]).toBe(3);
    expect(m[0]).toBe(2);
    expect(mat4Multiply(mat4Identity(), m)).toEqual(m);
  });

  it('تطبيع المتجهات صحيح والحالات الحدّية آمنة', () => {
    const n = normalize([0, 3, 4]);
    expect(Math.hypot(...n)).toBeCloseTo(1, 6);
    expect(normalize([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it('hexToRgb يفهم 3 و6 خانات ويرفض غير الصالح', () => {
    expect(hexToRgb('#fff')).toEqual([1, 1, 1]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    const [r, g, b] = hexToRgb('#f5b544');
    expect(r).toBeCloseTo(245 / 255, 5);
    expect(g).toBeCloseTo(181 / 255, 5);
    expect(b).toBeCloseTo(68 / 255, 5);
    expect(hexToRgb('nope')).toEqual([1, 1, 1]);
  });

  it('clamp01 وformatTime', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(formatTime(0)).toBe('0.0s');
    expect(formatTime(9.4)).toBe('9.4s');
    expect(formatTime(75.2)).toBe('1:15.2');
  });
});

describe('الطبقات والالتقاط', () => {
  it('المحددات الافتراضية تغطي البطل والبطاقات والصور والشعارات', () => {
    const kinds = DEFAULT_LAYER_SELECTORS.map((s) => s.kind);
    expect(kinds).toContain('hero');
    expect(kinds).toContain('card');
    expect(kinds).toContain('image');
    expect(kinds).toContain('logo');
  });

  it('الطبقات التجريبية مرتّبة تصاعدياً بالعمق وفيها بطاقات قابلة للرفع', () => {
    const layers = generateMockLayers(DEFAULT_PAGE_DIMENSIONS);
    expect(layers.length).toBeGreaterThanOrEqual(8);
    const depths = layers.map((l) => l.depth);
    expect([...depths].sort((a, b) => a - b)).toEqual(depths);
    expect(layers.some((l) => l.liftable && l.kind === 'card')).toBe(true);
    expect(layers.some((l) => l.kind === 'logo')).toBe(true);
    for (const l of layers) {
      expect(l.depth).toBeGreaterThanOrEqual(0);
      expect(l.depth).toBeLessThanOrEqual(1);
      expect(l.bounds.width).toBeGreaterThan(0);
      expect(l.bounds.height).toBeGreaterThan(0);
    }
  });

  it('إعدادات العرض الافتراضية متّسقة', () => {
    expect(DEFAULT_FLYOVER_CONFIG.dimensions.width).toBe(1440);
    expect(DEFAULT_FLYOVER_CONFIG.camera.keyframes.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_FLYOVER_CONFIG.dof.enabled).toBe(true);
    expect(DEFAULT_FLYOVER_CONFIG.lighting.softShadows).toBe(true);
    expect(DEFAULT_FLYOVER_CONFIG.finalCard.brand.length).toBeGreaterThan(0);
    expect(DEFAULT_FLYOVER_CONFIG.speed.duration).toBeGreaterThan(5);
    expect(DEFAULT_FLYOVER_CONFIG.autoplay).toBe(true);
  });
});
