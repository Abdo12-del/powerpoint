import { describe, expect, it } from 'vitest';
import {
  LaserTrail,
  clamp,
  clampScale,
  panTowards,
  spotlightBackground,
  zoomCenter,
  zoomCss,
  zoomTo,
} from '@/spotlight/engine';
import {
  PAN_MARGIN,
  PAN_SPEED,
  SPOTLIGHT_DIM,
  ZOOM_MAX_SCALE,
  ZOOM_MIN_SCALE,
  ZOOM_RESET,
  isZoomed,
} from '@/spotlight/types';

const rect = { left: 0, top: 0, width: 1280, height: 720 };

describe('محرّك التكبير — نموذج RevealZoom', () => {
  it('zoomTo يحوّل نقطة النقر إلى أصل التكبير (تحت أعلى-يسار كما في الإضافة الأصلية)', () => {
    const z = zoomTo(320, 180, rect, 2);
    expect(z).toEqual({ scale: 2, ox: 320, oy: 180 });
    const css = zoomCss(z, 0.25);
    expect(css.transform).toBe('scale(2) translate(-320px, -180px)');
    expect(css.transformOrigin).toBe('0 0');
    // النقطة المطلوبة بعد التحويل = 0 (أعلى-يسار)
    // out = scale*(p - origin_of_transform...) — مع منشأ 0: out = (p - o)*s = 0
  });

  it('نقاط خارج المسرح تُقيَّد إلى حدوده', () => {
    const z = zoomTo(-50, 4000, rect, 2);
    expect(z.ox).toBe(0);
    expect(z.oy).toBe(720);
  });

  it('zoomCss في الحالة الاعتيادية = scale(1) بلا إزاحة', () => {
    const css = zoomCss(ZOOM_RESET, 0.25);
    expect(css.transform).toBe('scale(1)');
    expect(isZoomed(ZOOM_RESET)).toBe(false);
    expect(isZoomed({ scale: 2, ox: 1, oy: 1 })).toBe(true);
  });

  it('تكبير نحو المركز يستخدم منتصف المسرح', () => {
    const z = zoomCenter(rect, 3);
    expect(z.ox).toBe(640);
    expect(z.oy).toBe(360);
    expect(z.scale).toBe(3);
  });

  it('مستوى التكبير يُقيَّد بالحدود', () => {
    expect(clampScale(1)).toBe(ZOOM_MIN_SCALE);
    expect(clampScale(99)).toBe(ZOOM_MAX_SCALE);
    expect(clampScale(2.5)).toBe(2.5);
    expect(clamp(5, 0, 3)).toBe(3);
  });

  it('panTowards لا يحرّك شيئاً والمؤشر في المنتصف', () => {
    const z = { scale: 2, ox: 100, oy: 100 };
    const same = panTowards(z, { x: rect.width / 2, y: rect.height / 2 }, rect, 1 / 60);
    expect(same).toBe(z); // نفس المرجع — بلا إعادة رسم
  });

  it('المؤشر قرب الحافة اليسرى يدفع العرض لاستكشاف أعمق (اتجاه سالب) وفق هامش وسرعة reveal.js', () => {
    const z = { scale: 2, ox: 300, oy: 360 };
    const margin = rect.width * PAN_MARGIN; // 153.6
    const speed = (PAN_SPEED / 2) * (1 / 60) * 60; // 7 px لكل إطار
    const next = panTowards(z, { x: 0, y: rect.height / 2 }, rect, 1 / 60);
    expect(next.ox).toBeCloseTo(300 - speed, 5);
    expect(next.oy).toBe(360);
    expect(margin).toBeGreaterThan(0);
  });

  it('الالتفاف يلتصق بحدود المسرح ولا يتجاوزها', () => {
    const z = { scale: 2, ox: 1, oy: 1 };
    const next = panTowards(z, { x: 0, y: 0 }, rect, 1);
    expect(next.ox).toBe(0);
    expect(next.oy).toBe(0);
    const z2 = { scale: 2, ox: 1279, oy: 719 };
    const next2 = panTowards(z2, { x: rect.width, y: rect.height }, rect, 1);
    expect(next2.ox).toBe(rect.width);
    expect(next2.oy).toBe(rect.height);
  });

  it('غير مكبَّر: الالتفاف معطّل تماماً', () => {
    const z = ZOOM_RESET;
    expect(panTowards(z, { x: 0, y: 0 }, rect, 1)).toBe(z);
  });
});

describe('هندسة تسليط الضوء', () => {
  it('التدرّج الشعاعي يحمل الموضع ونصف القطر والعتمة', () => {
    const bg = spotlightBackground(300, 200, 140, SPOTLIGHT_DIM);
    expect(bg).toContain('radial-gradient');
    expect(bg).toContain('300px 200px');
    expect(bg).toContain('140px');
    expect(bg).toContain(SPOTLIGHT_DIM.toString());
    // الحافة المتدرجة: 140 + 140×0.35 = 189
    expect(bg).toContain('189px');
  });

  it('نصف قطر غير منطقي يُقيَّد', () => {
    expect(spotlightBackground(0, 0, -5)).toContain('10px');
    expect(spotlightBackground(0, 0, 99999)).toContain('2000px');
  });
});

describe('مسار مؤشر الليزر', () => {
  it('التسجيل والتقادم: النقاط تموت بعد العمر', () => {
    const trail = new LaserTrail('#ff3b30', 0.5);
    trail.push(10, 10);
    trail.push(20, 10);
    expect(trail.size).toBe(2);
    trail.decay(0.3);
    expect(trail.size).toBe(2);
    trail.decay(0.25);
    expect(trail.size).toBe(0); // 0.55 > 0.5
  });

  it('الاهتزاز الصغير لا يضيف نقاطاً والسقف يُقصّ الذيل', () => {
    const trail = new LaserTrail('#ff3b30', 1, 5);
    trail.push(0, 0);
    trail.push(0.5, 0); // < 1.5px — مرفوضة
    expect(trail.size).toBe(1);
    for (let i = 0; i < 20; i++) trail.push(i * 10, 0);
    expect(trail.size).toBe(5);
  });

  it('الشفافية تتناقص خطياً مع العمر', () => {
    const trail = new LaserTrail('#ff3b30', 1);
    trail.push(0, 0);
    trail.decay(0.25);
    const pts = (trail as unknown as { points: Array<{ age: number }> })['points'];
    expect(trail.alphaAt({ x: 0, y: 0, age: 0 })).toBe(1);
    expect(trail.alphaAt({ x: 0, y: 0, age: 0.5 })).toBeCloseTo(0.5, 5);
    expect(trail.alphaAt({ x: 0, y: 0, age: 2 })).toBe(0);
    void pts;
  });

  it('الرسم صامت بلا سياق ومع سياق وهمي يرسم الرأس والذيل', () => {
    const trail = new LaserTrail('#ff3b30', 1);
    trail.draw(null); // لا يرمي
    trail.push(10, 10);
    trail.push(40, 20);
    const calls: Array<[string, unknown[]]> = [];
    const record = (name: string) => (...args: unknown[]) => {
      calls.push([name, args]);
    };
    const ctx = {
      save: record('save'),
      restore: record('restore'),
      beginPath: record('beginPath'),
      arc: record('arc'),
      fill: record('fill'),
      canvas: { width: 800, height: 450 },
      globalCompositeOperation: 'source-over',
      globalAlpha: 1,
      fillStyle: '',
      shadowColor: '',
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D;
    trail.draw(ctx);
    const names = calls.map((c) => c[0]);
    expect(names).toContain('save');
    expect(names.filter((n) => n === 'arc').length).toBe(3); // نقطتا ذيل + رأس
    expect(names).toContain('restore');
  });

  it('clear يفرّغ المسار', () => {
    const trail = new LaserTrail();
    trail.push(1, 1);
    trail.clear();
    expect(trail.size).toBe(0);
  });
});
