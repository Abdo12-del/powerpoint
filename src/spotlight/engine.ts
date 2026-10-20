/**
 * محرّك التكبير والتركيز — منطق نقي بلا React (اختبارات حتمية)
 * المنطق المزروع من إضافة RevealZoom المدمجة مع reveal.js (MIT):
 *  - التكبير نحو نقطة النقر: translate ثم scale بمنشأ 0 0 → النقطة تهبط أعلى-يسار العرض
 *  - الالتفاف (Pan) عند اقتراب المؤشر من الأطراف بهامش 12% وسرعة 14/scale (نفس ثابتي reveal.js)
 *  - Esc يُخرج من التكبير
 * إضافة إلى: هندسة تسليط الضوء ومسار مؤشر الليزر المتلاشي.
 */

import {
  LASER_MAX_POINTS,
  LASER_TTL,
  PAN_MARGIN,
  PAN_SPEED,
  SPOTLIGHT_DIM,
  SPOTLIGHT_FEATHER_RATIO,
  ZOOM_MAX_SCALE,
  ZOOM_MIN_SCALE,
} from './types';
import type { ZoomState } from './types';

/** تقييد قيمة بين حدين */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** تقييد مستوى التكبير ضمن الحدود */
export function clampScale(scale: number): number {
  return clamp(scale, ZOOM_MIN_SCALE, ZOOM_MAX_SCALE);
}

/**
 * تكبير نحو نقطة الشرح — تُرجع الحالة الجديدة
 * (clientX/clientY بإحداثيات النافذة، rect أبعاد المسرح المطلقة)
 */
export function zoomTo(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  scale: number,
): ZoomState {
  const ox = clamp(clientX - rect.left, 0, rect.width);
  const oy = clamp(clientY - rect.top, 0, rect.height);
  return { scale: clampScale(scale), ox, oy };
}

/** تكبير نحو مركز المسرح */
export function zoomCenter(
  rect: { width: number; height: number },
  scale: number,
): ZoomState {
  return { scale: clampScale(scale), ox: rect.width / 2, oy: rect.height / 2 };
}

/** أنماط CSS للمسرح المكبَّر — scale ثم translate (تُطبَّق يميناً لليسار: إزاحة أولاً ثم تكبير) */
export function zoomCss(
  z: ZoomState,
  transitionS: number,
): React.CSSProperties {
  const zoomed = z.scale > 1.001;
  return {
    transform: zoomed
      ? `scale(${z.scale}) translate(${-z.ox}px, ${-z.oy}px)`
      : 'scale(1)',
    transformOrigin: '0 0',
    transition: `transform ${transitionS}s ease-out`,
    willChange: 'transform',
  };
}

/**
 * التفاف نحو المؤشر عند الأطراف — يُستدعى من حلقة rAF أثناء التكبير
 * منطق reveal.js: هامش 12% من البُعد، والسرعة تتصاعد كلما اقترب المؤشر من الحافة
 * يُرجع نفس الحالة إن لم يلزم أي إزاحة (لتفادي إعادة الرسم)
 */
export function panTowards(
  z: ZoomState,
  mouse: { x: number; y: number },
  rect: { width: number; height: number },
  dt: number,
): ZoomState {
  if (z.scale <= 1.001) return z;
  const mx = rect.width * PAN_MARGIN;
  const my = rect.height * PAN_MARGIN;
  const speed = (PAN_SPEED / z.scale) * (dt * 60);

  let dx = 0;
  let dy = 0;
  // الأطراف المطلوبة تكشف محتوى أعمق — السحب عكس جهة الحافة (كما في reveal.js)
  if (mouse.x < mx) dx = -(1 - mouse.x / mx) * speed;
  else if (mouse.x > rect.width - mx) dx = (1 - (rect.width - mouse.x) / mx) * speed;
  if (mouse.y < my) dy = -(1 - mouse.y / my) * speed;
  else if (mouse.y > rect.height - my) dy = (1 - (rect.height - mouse.y) / my) * speed;

  if (dx === 0 && dy === 0) return z;
  return {
    scale: z.scale,
    ox: clamp(z.ox + dx, 0, rect.width),
    oy: clamp(z.oy + dy, 0, rect.height),
  };
}

/**
 * خلفية تسليط الضوء — تدرّج شعاعي: شفاف داخل الدائرة، عتمة خارجها بحد متدرّج
 */
export function spotlightBackground(
  x: number,
  y: number,
  radius: number,
  dim = SPOTLIGHT_DIM,
): string {
  const r = clamp(radius, 10, 2000);
  const feather = Math.max(1, r * SPOTLIGHT_FEATHER_RATIO);
  return `radial-gradient(circle ${Math.round(r + feather)}px at ${Math.round(x)}px ${Math.round(y)}px, rgba(2,6,23,0) ${Math.round(r)}px, rgba(2,6,23,${dim}) ${Math.round(r + feather)}px)`;
}

/** نقطة في مسار الليزر */
export interface LaserPoint {
  x: number;
  y: number;
  /** العمر بالثواني */
  age: number;
}

/**
 * مسار مؤشر الليزر — نقاط تتلاشى مع الزمن (رأس متوهّج + ذيل باهت)
 */
export class LaserTrail {
  readonly color: string;
  readonly ttl: number;
  readonly maxPoints: number;
  private points: LaserPoint[] = [];

  constructor(color = '#ff3b30', ttl = LASER_TTL, maxPoints = LASER_MAX_POINTS) {
    this.color = color;
    this.ttl = ttl;
    this.maxPoints = maxPoints;
  }

  /** تسجيل موضع جديد (يُستدعى من pointermove) */
  push(x: number, y: number): void {
    const last = this.points[this.points.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < 1.5) return; // تجاهل الاهتزاز
    this.points.push({ x, y, age: 0 });
    if (this.points.length > this.maxPoints) this.points.shift();
  }

  /** تقادم النقاط — يُستدعى من حلقة الرسم */
  decay(dt: number): void {
    for (const p of this.points) p.age += dt;
    this.points = this.points.filter((p) => p.age < this.ttl);
  }

  get size(): number {
    return this.points.length;
  }

  /** شفافية نقطة 1→0 حسب عمرها */
  alphaAt(p: LaserPoint): number {
    return Math.max(0, 1 - p.age / this.ttl);
  }

  /**
   * الرسم على Canvas2D — صامت عند غياب السياق (jsdom/بيئات بلا رسم)
   */
  draw(ctx: CanvasRenderingContext2D | null): void {
    if (!ctx || this.points.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // الذيل: نقاط متناقصة الحجم والشفافية
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const a = this.alphaAt(p);
      if (a <= 0) continue;
      const radius = 2 + a * 3;
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = a * 0.35;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // الرأس: نقطة متوهجة أكبر
    const head = this.points[this.points.length - 1];
    ctx.globalAlpha = 1;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  clear(): void {
    this.points = [];
  }
}
